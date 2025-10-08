
// components/customer/CustomerDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useAppState } from '../../contexts/AppContext';
import { firestoreDB } from '../../services/firebaseService';
import { Trip, TripStatus as TripStatusEnum } from '../../types';
import Header from '../common/Header';
import MapPlaceholder from '../common/MapPlaceholder';
import RideRequestForm from './RideRequestForm';
import TripStatus from './TripStatus';
import ProfileScreen from '../common/ProfileScreen';
import TripHistoryScreen from './TripHistoryScreen';
import Button from '../common/Button';

const CustomerDashboard: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [view, setView] = useState<'dashboard' | 'profile' | 'history'>('dashboard');
  const [tripHistory, setTripHistory] = useState<Trip[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const HISTORY_CACHE_KEY = state.user ? `rideshare_history_cache_${state.user.id}` : null;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    // Only listen for real-time trip updates when online
    if (state.currentTrip && !state.isOffline) {
      unsubscribe = firestoreDB.listenForTripUpdates(state.currentTrip.id, (updatedTrip) => {
        dispatch({ type: 'SET_TRIP', payload: updatedTrip });
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [state.currentTrip?.id, state.isOffline, dispatch]);

  // Handles initial load and re-syncing when coming online
  useEffect(() => {
    if (!state.user || !HISTORY_CACHE_KEY) return;
    
    setIsLoadingHistory(true);
    
    // Always try to load from cache first for a fast UI response
    try {
      const cachedHistory = localStorage.getItem(HISTORY_CACHE_KEY);
      if (cachedHistory) {
        setTripHistory(JSON.parse(cachedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from cache", e);
    }
    
    // If we're online, fetch fresh data to update cache and state
    if (!state.isOffline) {
      const fetchFreshHistory = async () => {
        try {
          const allTrips = await firestoreDB.getAllTrips();
          const userTrips = allTrips
            .filter(trip => trip.customerId === state.user?.id && (trip.status === TripStatusEnum.COMPLETED || trip.status === TripStatusEnum.CANCELLED))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTripHistory(userTrips);
          localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(userTrips));
        } catch (error) {
          console.error("Failed to fetch fresh history:", error);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchFreshHistory();
    } else {
      // If offline, we're done, so stop loading indicator
      setIsLoadingHistory(false);
    }
  }, [state.user, state.isOffline, HISTORY_CACHE_KEY]);


  if (view === 'profile') {
    return <ProfileScreen onBack={() => setView('dashboard')} />;
  }

  if (view === 'history') {
    return <TripHistoryScreen onBack={() => setView('dashboard')} trips={tripHistory} />;
  }

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
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200/50">
          {state.currentTrip ? <TripStatus /> : (
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <RideRequestForm />
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4">
                 <Button variant="secondary" onClick={() => setView('history')} isLoading={isLoadingHistory}>View Trip History</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
