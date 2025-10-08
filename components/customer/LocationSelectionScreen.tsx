
import React, { useState, useEffect } from 'react';

export const LOCATIONS = [
  // Existing General Locations
  "University of Venda Main Gate",
  "Thavhani Mall",
  "Khoroni Hotel & Casino",
  "Phunda Maria Gate (Kruger National Park)",
  "Sibasa Shopping Centre",
  "University of Venda Sports Hall",
  "Thohoyandou Botanical Garden",
  "Tshilidzini Hospital",
  "Univen Library",
  "Golgotta",
  "Makwarela",
  "Manamani",
  "Shayandima",
  "Mphephu Resort",
  "Post Office (Thohoyandou)",
  "Thohoyandou Indoor Sports Centre",
  "Univen Gate 2",
  "Tusk Venda",

  // On-Campus Residences
  "Bernard Ncube Residence",
  "Carousel Residence",
  "F4 Residence",
  "F5 Residence",
  "F6 Residence",
  "F7 Residence",
  "F8 Residence",
  "F9 Residence",
  "Lost City Boys Residence",
  "Lost City Girls Residence",
  "Mango Groove Residence",
  "Riverside Residence",

  // Off-Campus Residences
  "Campus View Accommodation",
  "E-Kaya Accommodation",
  "Gateway Accommodation",
  "J-Jireh Accommodation",
  "ObriSTAR Accommodation",
  "Porche-Villa Accommodation",
  "Thavhani Student Accommodation",
  "The Digs Accommodation",
  "The Heights Accommodation",
  "Unilofts Student Accommodation",
].sort();

interface LocationSelectionScreenProps {
  type: 'pickup' | 'dropoff';
  onSelect: (location: string) => void;
  onClose: () => void;
}

const LocationSelectionScreen: React.FC<LocationSelectionScreenProps> = ({ type, onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<string[]>(LOCATIONS);

  useEffect(() => {
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      setFilteredLocations(
        LOCATIONS.filter(location => location.toLowerCase().includes(lowerCaseQuery))
      );
    } else {
      setFilteredLocations(LOCATIONS);
    }
  }, [query]);

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col animate-fade-in">
      <header className="flex-shrink-0 flex items-center p-4 border-b border-slate-200">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-slate-800 ml-4 capitalize">
          Set {type} Location
        </h2>
      </header>

      <div className="p-4 border-b border-slate-200 flex-shrink-0">
        <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search for a location"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-200 bg-slate-100 rounded-full shadow-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white sm:text-sm transition-colors"
              autoFocus
            />
        </div>
      </div>

      <main className="flex-grow overflow-y-auto">
        <ul>
          {filteredLocations.map((location) => (
            <li key={location} className="border-b border-slate-100">
              <button
                type="button"
                className="w-full text-left flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors"
                onClick={() => onSelect(location)}
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="text-sm font-medium text-slate-700">{location}</span>
              </button>
            </li>
          ))}
           {filteredLocations.length === 0 && (
            <p className="text-center text-slate-500 p-8">No locations found.</p>
           )}
        </ul>
      </main>
    </div>
  );
};

export default LocationSelectionScreen;
