import React, { useState } from 'react';
import { useAppState } from '../../contexts/AppContext';
import { TripStatus as TripStatusEnum } from '../../types';
import { firestoreDB } from '../../services/firebaseService';
import Button from '../common/Button';
import ChatModal from '../common/ChatModal';

const CurrentTrip: React.FC = () => {
  const { state, dispatch } = useAppState();
  const trip = state.currentTrip;
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!trip) return null;

  const handleUpdateStatus = async (status: TripStatusEnum) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await firestoreDB.updateTripStatus(trip.id, status);
      if (status === TripStatusEnum.COMPLETED) {
        dispatch({ type: 'SET_TRIP', payload: null }); // Clear trip for driver on completion
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const renderActionButtons = () => {
    switch (trip.status) {
      case TripStatusEnum.ACCEPTED:
        return <Button onClick={() => handleUpdateStatus(TripStatusEnum.IN_PROGRESS)}>Start Trip</Button>;
      case TripStatusEnum.IN_PROGRESS:
        return <Button onClick={() => handleUpdateStatus(TripStatusEnum.COMPLETED)}>Complete Trip</Button>;
      default:
        return null;
    }
  };

  return (
    <>
      {state.user && <ChatModal trip={trip} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
      <div className="flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Current Trip</h2>
        <div className="flex-grow space-y-4 overflow-y-auto">
          {trip.isShared && trip.passengers && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-600 mb-3">Passengers</h3>
                <div className="space-y-3">
                  {trip.passengers.map(passenger => (
                    <div key={passenger.id} className="flex items-center gap-3">
                        <img src={passenger.profilePictureUrl} alt={passenger.name} className="w-10 h-10 rounded-full" />
                        <span className="font-medium text-slate-800">{passenger.name}</span>
                    </div>
                  ))}
                </div>
            </div>
          )}
          {!trip.isShared && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">Customer</p>
                  <p className="font-semibold text-slate-800">{trip.customerName}</p>
                </div>
                <Button
                  onClick={() => setIsChatOpen(true)}
                  className="!w-auto !py-2 !px-4 flex items-center gap-2"
                  variant="secondary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                  </svg>
                  Chat
                </Button>
              </div>
            </div>
          )}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">From</p>
            <p className="font-semibold text-slate-800">{trip.pickupLocation}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">To</p>
            <p className="font-semibold text-slate-800">{trip.dropoffLocation}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
              <p className="text-sm text-slate-600">Fare</p>
              <p className="text-3xl font-bold text-slate-900">ZAR {trip.fare}</p>
          </div>
        </div>
        <div className="mt-6">
          {renderActionButtons()}
        </div>
      </div>
    </>
  );
};

export default CurrentTrip;