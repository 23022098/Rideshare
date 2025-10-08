// components/driver/DriverDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAppState } from '../../contexts/AppContext';
import { firestoreDB } from '../../services/firebaseService';
import { Trip, TripStatus } from '../../types';
import Header from '../common/Header';
import MapPlaceholder from '../common/MapPlaceholder';
import CurrentTrip from './CurrentTrip';
import RideRequestCard from './RideRequestCard';
import ProfileScreen from '../common/ProfileScreen';

const DriverDashboard: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [rideRequests, setRideRequests] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'profile'>('dashboard');

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = firestoreDB.listenForRideRequests((trips) => {
      setRideRequests(trips);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (state.currentTrip) {
      unsubscribe = firestoreDB.listenForTripUpdates(state.currentTrip.id, (updatedTrip) => {
        if (updatedTrip?.status === TripStatus.CANCELLED) {
             dispatch({ type: 'SET_TRIP', payload: null });
        } else {
             dispatch({ type: 'SET_TRIP', payload: updatedTrip });
        }
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [state.currentTrip?.id, dispatch]);

  const handleAcceptTrip = async (trip: Trip) => {
    if (!state.user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const acceptedTrip = await firestoreDB.acceptTrip(trip, state.user);
      dispatch({ type: 'SET_TRIP', payload: acceptedTrip });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  if (view === 'profile') {
    return <ProfileScreen onBack={() => setView('dashboard')} />;
  }

  const renderContent = () => {
    if (state.currentTrip) {
      return <CurrentTrip />;
    }

    if (isLoading) {
      return <div className="text-center p-8 text-slate-500">Searching for requests...</div>;
    }

    if (rideRequests.length === 0) {
      return (
        <div className="text-center p-8">
          <h3 className="text-xl font-bold text-slate-800">No available ride requests</h3>
          <p className="text-slate-500 mt-2">You'll be notified when a new request comes in.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 px-2">Ride Requests</h2>
        {rideRequests.map((trip) => (
          <RideRequestCard key={trip.id} trip={trip} onAccept={handleAcceptTrip} />
        ))}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header onProfileClick={() => setView('profile')} />
      <main className="flex-grow container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 lg:h-full">
           <MapPlaceholder 
            driverLocation={state.currentTrip?.driverLocation}
            pickupLocation={state.currentTrip?.pickupLocation}
            dropoffLocation={state.currentTrip?.dropoffLocation}
          />
        </div>
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200/50 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;
