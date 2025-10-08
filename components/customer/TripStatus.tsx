import React, { useEffect, useState } from 'react';
import { useAppState } from '../../contexts/AppContext';
import { TripStatus as TripStatusEnum } from '../../types';
import Button from '../common/Button';
import { firestoreDB } from '../../services/firebaseService';
import RatingForm from './RatingForm';
import ChatModal from '../common/ChatModal';

const statusInfo = {
  [TripStatusEnum.REQUESTED]: { text: 'Finding a driver...', color: 'text-yellow-600' },
  [TripStatusEnum.ACCEPTED]: { text: 'Driver is on the way!', color: 'text-indigo-600' },
  [TripStatusEnum.IN_PROGRESS]: { text: 'You are on your way!', color: 'text-green-600' },
  [TripStatusEnum.COMPLETED]: { text: 'Trip Completed!', color: 'text-slate-600' },
  [TripStatusEnum.CANCELLED]: { text: 'Trip Cancelled.', color: 'text-red-600' },
};

const TripStatus: React.FC = () => {
  const { state, dispatch } = useAppState();
  const trip = state.currentTrip;
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!trip) return null;
  
  const handleCancelTrip = async () => {
    if (window.confirm("Are you sure you want to cancel this trip?")) {
        dispatch({type: 'SET_LOADING', payload: true});
        try {
            await firestoreDB.updateTripStatus(trip.id, TripStatusEnum.CANCELLED);
            // The listener in CustomerDashboard will automatically receive the null trip update
            // and clear the UI, so we don't need to dispatch here. This ensures
            // we're always reacting to the source of truth from the 'database'.
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        } finally {
            // The loading state will be turned off. If successful, the component will unmount
            // as state.currentTrip becomes null. If it fails, we still want to stop loading.
            dispatch({type: 'SET_LOADING', payload: false});
        }
    }
  }

  const handleRatingSubmit = async (rating: number) => {
    if (!trip.driverId) return;
    dispatch({type: 'SET_LOADING', payload: true});
    try {
        await firestoreDB.rateDriver(trip.id, trip.driverId, rating);
        dispatch({ type: 'SET_TRIP', payload: null });
    } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message});
    } finally {
        dispatch({type: 'SET_LOADING', payload: false});
    }
  }
  
  const otherPassengersCount = trip.isShared && trip.passengers ? trip.passengers.length - 1 : 0;

  if (trip.status === TripStatusEnum.COMPLETED) {
      return <RatingForm trip={trip} onSubmitRating={handleRatingSubmit} isLoading={state.loading} />
  }

  return (
    <>
      {state.user && <ChatModal trip={trip} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
      <div className="flex flex-col h-full items-center justify-center text-center">
        <div className="flex-grow flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Trip Status</h2>
          <div className={`text-xl font-semibold ${statusInfo[trip.status].color} mb-4`}>
            {statusInfo[trip.status].text}
          </div>
          
          {trip.status === TripStatusEnum.REQUESTED && (
            <div className="animate-pulse my-4">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          )}

          {(trip.status === TripStatusEnum.ACCEPTED || trip.status === TripStatusEnum.IN_PROGRESS) && trip.driverName && (
            <div className="bg-slate-100 p-4 rounded-lg w-full my-4">
               <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-600 text-left">Your driver is</p>
                  <p className="text-xl font-bold text-slate-900 text-left">{trip.driverName}</p>
                </div>
                <Button
                  onClick={() => setIsChatOpen(true)}
                  className="!w-auto !py-2 !px-4 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                  </svg>
                  Chat
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-left w-full bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-500">From: <span className="font-semibold text-slate-700">{trip.pickupLocation}</span></p>
              <p className="text-sm text-slate-500">To: <span className="font-semibold text-slate-700">{trip.dropoffLocation}</span></p>
              {otherPassengersCount > 0 && (
                <div className="flex items-center text-sm mt-2 text-teal-700 bg-teal-100/70 p-2 rounded-md">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015.537 4.097A6.97 6.97 0 008 16a6.97 6.97 0 00-1.5-4.33A5 5 0 016 11z" />
                  </svg>
                  <span>Shared ride with {otherPassengersCount} other{otherPassengersCount > 1 ? 's' : ''}.</span>
                </div>
              )}
              <p className="text-lg font-bold text-slate-800 mt-2">ZAR {trip.fare}</p>
          </div>
        </div>
        
        {(trip.status === TripStatusEnum.REQUESTED || trip.status === TripStatusEnum.ACCEPTED) && (
          <Button variant="danger" className="w-full mt-4" onClick={handleCancelTrip} isLoading={state.loading}>
            Cancel Trip
          </Button>
        )}

      </div>
    </>
  );
};

export default TripStatus;