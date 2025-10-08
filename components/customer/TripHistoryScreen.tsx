import React, { useState } from 'react';
import { Trip, TripStatus } from '../../types';
import Header from '../common/Header';
import Button from '../common/Button';
import RatingForm from './RatingForm';
import { firestoreDB } from '../../services/firebaseService';

interface TripHistoryScreenProps {
  onBack: () => void;
  trips: Trip[];
}

interface TripHistoryCardProps {
  trip: Trip;
  onRate: () => void;
}

const TripHistoryCard: React.FC<TripHistoryCardProps> = ({ trip, onRate }) => {
  const statusColors: { [key: string]: string } = {
    completed: 'text-green-700 bg-green-100',
    cancelled: 'text-red-700 bg-red-100',
  };
  const statusColor = statusColors[trip.status] || 'text-slate-700 bg-slate-100';

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200/50">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-slate-800">{new Date(trip.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-sm text-slate-500">Driver: {trip.driverName || 'N/A'}</p>
        </div>
        <div className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${statusColor}`}>
          {trip.status}
        </div>
      </div>
      <div className="mt-4 border-t border-slate-200 pt-4 space-y-3">
        <div className="flex items-center text-sm">
          <span className="w-24 font-semibold text-slate-500">From:</span>
          <span className="text-slate-800">{trip.pickupLocation}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="w-24 font-semibold text-slate-500">To:</span>
          <span className="text-slate-800">{trip.dropoffLocation}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="w-24 font-semibold text-slate-500">Fare:</span>
          <span className="font-bold text-slate-800">ZAR {trip.fare.toFixed(2)}</span>
        </div>
        {trip.rating ? (
            <div className="flex items-center text-sm">
                <span className="w-24 font-semibold text-slate-500">You rated:</span>
                <div className="flex items-center gap-1">
                     <span className="font-bold text-amber-500">{trip.rating}</span>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
            </div>
        ) : (
          trip.status === TripStatus.COMPLETED && (
            <div className="flex items-center text-sm pt-2">
                <span className="w-24 font-semibold text-slate-500">Rating:</span>
                <Button 
                    variant="secondary" 
                    onClick={onRate}
                    className="!w-auto !py-1.5 !px-4 !text-xs"
                >
                    Rate Trip
                </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

interface RatingModalProps {
    trip: Trip;
    onClose: () => void;
    onSubmit: (rating: number) => void;
    isLoading: boolean;
}

const RatingModal: React.FC<RatingModalProps> = ({ trip, onClose, onSubmit, isLoading }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform" onClick={e => e.stopPropagation()}>
            <RatingForm trip={trip} onSubmitRating={onSubmit} isLoading={isLoading} />
        </div>
    </div>
);


const TripHistoryScreen: React.FC<TripHistoryScreenProps> = ({ onBack, trips }) => {
  const [tripHistory, setTripHistory] = useState<Trip[]>(trips);
  const [ratingTrip, setRatingTrip] = useState<Trip | null>(null);
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  const handleRatingSubmit = async (rating: number) => {
    if (!ratingTrip || !ratingTrip.driverId) return;

    setIsRatingLoading(true);
    try {
        await firestoreDB.rateDriver(ratingTrip.id, ratingTrip.driverId, rating);
        setTripHistory(prevTrips =>
            prevTrips.map(t =>
                t.id === ratingTrip.id ? { ...t, rating: rating } : t
            )
        );
        setRatingTrip(null);
    } catch (error) {
        console.error("Failed to submit rating", error);
        alert("Could not submit rating. Please try again.");
    } finally {
        setIsRatingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-purple-600 mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Your Trip History</h2>
          
          {tripHistory.length > 0 ? (
            <div className="space-y-4">
              {tripHistory.map(trip => <TripHistoryCard key={trip.id} trip={trip} onRate={() => setRatingTrip(trip)} />)}
            </div>
          ) : (
            <div className="text-center bg-white p-8 rounded-2xl shadow-md border border-slate-200/50">
                <h3 className="text-xl font-bold text-slate-700">No Past Trips</h3>
                <p className="text-slate-500 mt-2">You haven't completed any trips yet. Request a ride to get started!</p>
            </div>
          )}
        </div>
      </main>
      {ratingTrip && (
          <RatingModal
            trip={ratingTrip}
            onClose={() => setRatingTrip(null)}
            onSubmit={handleRatingSubmit}
            isLoading={isRatingLoading}
          />
      )}
    </div>
  );
};

export default TripHistoryScreen;