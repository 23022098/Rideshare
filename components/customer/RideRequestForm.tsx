
import React, { useState, useCallback, useEffect } from 'react';
import { useAppState } from '../../contexts/AppContext';
import { firestoreDB } from '../../services/firebaseService';
import { getFareEstimate } from '../../services/geminiService';
import { PaymentMethod, Trip } from '../../types';
import Button from '../common/Button';
import LocationSelectionScreen, { LOCATIONS } from './LocationSelectionScreen';

const RideRequestForm: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [pickup, setPickup] = useState('Univen Main Gate');
  const [dropoff, setDropoff] = useState('Thavhani Mall');
  const [editingLocationFor, setEditingLocationFor] = useState<'pickup' | 'dropoff' | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [fareReasoning, setFareReasoning] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // When ride details change, reset the fare to force a new estimation.
    // This prevents submitting a ride request with a stale fare.
    setEstimatedFare(null);
    setFareReasoning('');
  }, [pickup, dropoff, isShared]);


  const handleEstimateFare = useCallback(async () => {
    if (!pickup || !dropoff) return;
    setIsEstimating(true);
    setFareReasoning('');
    const fareData = await getFareEstimate(pickup, dropoff, isShared);
    setEstimatedFare(fareData.estimatedFare);
    setFareReasoning(fareData.reasoning);
    setIsEstimating(false);
  }, [pickup, dropoff, isShared]);
  
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Successfully got coordinates.
        // In a real app, you would use a reverse geocoding service here.
        // For this mock, we'll simulate it by picking a random nearby location.
        console.log("Geolocation success:", position.coords);
        setTimeout(() => {
          const randomLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
          setPickup(randomLocation);
          setIsLocating(false);
        }, 1200); // Simulate API call
      },
      (error) => {
        let errorMessage = "Could not determine your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location access was denied. Please enable it in your browser settings to use this feature.";
        }
        console.error("Geolocation error:", error.message);
        alert(errorMessage);
        setIsLocating(false);
      }
    );
  };

  const handleRequestRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.isOffline) {
        alert("You are offline. Please connect to the internet to request a ride.");
        return;
    }
    if (!state.user || estimatedFare === null) {
      dispatch({ type: 'SET_ERROR', payload: "Please estimate fare before requesting." });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    const tripData: Omit<Trip, 'id' | 'status' | 'createdAt'> = {
      customerId: state.user.id,
      customerName: state.user.name,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      isShared,
      paymentMethod,
      fare: estimatedFare,
    };

    try {
      const newTrip = await firestoreDB.requestTrip(tripData);
      dispatch({ type: 'SET_TRIP', payload: newTrip });
    } catch (error) {
        const err = error as Error;
        dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleLocationSelect = (location: string) => {
    if (editingLocationFor === 'pickup') {
      setPickup(location);
    } else {
      setDropoff(location);
    }
    setEditingLocationFor(null);
  };

  return (
    <>
      {editingLocationFor && (
        <LocationSelectionScreen
          type={editingLocationFor}
          onSelect={handleLocationSelect}
          onClose={() => setEditingLocationFor(null)}
        />
      )}
      <form className="flex flex-col h-full" onSubmit={handleRequestRide}>
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Request a Ride</h2>
        <div className="space-y-4 flex-grow">
          
          {/* Updated Location Selection UI */}
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-center self-stretch">
              <div className="w-3 h-3 bg-slate-700 rounded-full mt-2.5"></div>
              <div className="w-px flex-grow bg-slate-300 border-l border-dashed"></div>
              <div className="w-3 h-3 bg-slate-700"></div>
            </div>
            <div className="flex-grow space-y-2">
              <div className="flex items-center gap-2">
                <button type="button" className="w-full text-left p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors" onClick={() => setEditingLocationFor('pickup')}>
                  <span className="text-sm font-semibold text-slate-800 truncate">{pickup || 'Select pickup location'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="flex-shrink-0 p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:bg-slate-200/80 disabled:cursor-wait transition-colors"
                  title="Use my current location"
                >
                  {isLocating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  ) : (
                    <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C.458 4.737 4.737.458 10 .458c5.263 0 9.542 4.279 9.542 9.542s-4.279 9.542-9.542 9.542C4.737 19.542.458 15.263.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              <button type="button" className="w-full text-left p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors" onClick={() => setEditingLocationFor('dropoff')}>
                <span className="text-sm font-semibold text-slate-800 truncate">{dropoff || 'Select dropoff location'}</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-purple-100/50 p-3 rounded-lg border border-purple-200/80">
              <span className="font-medium text-purple-800">Share Ride & Save 15%</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isShared} onChange={() => setIsShared(!isShared)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
          </div>

          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentMethod(PaymentMethod.CARD)} className={`p-3 rounded-lg border-2 text-center transition-colors ${paymentMethod === PaymentMethod.CARD ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold' : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Card</button>
                  <button type="button" onClick={() => setPaymentMethod(PaymentMethod.CASH)} className={`p-3 rounded-lg border-2 text-center transition-colors ${paymentMethod === PaymentMethod.CASH ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold' : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cash</button>
              </div>
          </div>
        </div>
        
        <div className="mt-6">
          {estimatedFare !== null && (
              <div className="text-center bg-slate-100 p-4 rounded-lg mb-4">
                  <p className="text-sm text-slate-600">Estimated Fare</p>
                  <p className="text-3xl font-bold text-slate-900">ZAR {estimatedFare}</p>
                  <p className="text-xs text-slate-500 mt-1">{fareReasoning}</p>
              </div>
          )}
          <Button type="button" variant="secondary" onClick={handleEstimateFare} isLoading={isEstimating} disabled={isEstimating || !pickup || !dropoff || state.isOffline}>
              Estimate Fare
          </Button>
          <Button 
            type="submit" 
            className="mt-2" 
            isLoading={state.loading} 
            disabled={estimatedFare === null || state.isOffline}
            title={state.isOffline ? "Cannot request ride while offline" : ""}
          >
              Request Ride
          </Button>
        </div>
      </form>
    </>
  );
};

export default RideRequestForm;
