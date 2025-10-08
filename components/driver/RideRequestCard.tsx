import React from 'react';
import { Trip } from '../../types';
import Button from '../common/Button';

interface RideRequestCardProps {
  trip: Trip;
  onAccept: (trip: Trip) => void;
}

const RideRequestCard: React.FC<RideRequestCardProps> = ({ trip, onAccept }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-transform hover:scale-[1.01]">
      <div className="flex-grow">
        <div className="flex items-center gap-4 mb-3">
            <div className="flex-shrink-0">
                <img className="h-12 w-12 rounded-full" src={`https://picsum.photos/seed/${trip.customerId}/100`} alt="Customer" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">{trip.customerName}</h3>
                <div className="flex items-center text-sm text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    {trip.pickupLocation} to {trip.dropoffLocation}
                </div>
            </div>
        </div>
        <div className="flex space-x-2 mt-2">
            {trip.isShared && <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full">Shared Ride</span>}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${trip.paymentMethod === 'card' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                {trip.paymentMethod.toUpperCase()}
            </span>
        </div>
      </div>
      <div className="flex flex-col items-stretch md:items-end gap-2 md:w-48 text-right mt-4 md:mt-0">
        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-1">ZAR {trip.fare}</p>
        <Button onClick={() => onAccept(trip)} className="w-full md:w-auto !py-2">Accept</Button>
      </div>
    </div>
  );
};

export default RideRequestCard;