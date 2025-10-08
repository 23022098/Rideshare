
import React from 'react';
import { Trip, TripStatus } from '../../types';

interface TripTableProps {
  trips: Trip[];
  isLoading: boolean;
}

const statusStyles: { [key in TripStatus]: string } = {
  [TripStatus.REQUESTED]: 'bg-yellow-100 text-yellow-800',
  [TripStatus.ACCEPTED]: 'bg-blue-100 text-blue-800',
  [TripStatus.IN_PROGRESS]: 'bg-indigo-100 text-indigo-800',
  [TripStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [TripStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

const TripTable: React.FC<TripTableProps> = ({ trips, isLoading }) => {
    if (isLoading) {
        return <div className="text-center p-8 text-slate-500">Loading trip history...</div>;
    }
    
    if (trips.length === 0) {
        return <div className="text-center p-8 text-slate-500 bg-slate-50/50 rounded-b-2xl">No trips have been recorded yet.</div>;
    }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Participants</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Route</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fare</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {trips.map((trip) => (
            <tr key={trip.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-900">{trip.customerName}</div>
                <div className="text-sm text-slate-500">{trip.driverName || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900">{trip.pickupLocation}</div>
                <div className="text-sm text-slate-500">to {trip.dropoffLocation}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">ZAR {trip.fare.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {new Date(trip.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[trip.status]}`}>
                  {trip.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TripTable;
