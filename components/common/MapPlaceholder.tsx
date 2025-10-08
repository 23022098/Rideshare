// components/common/MapPlaceholder.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Location } from '../../types';
import { LOCATIONS_COORDS } from '../../services/firebaseService';

interface MapPlaceholderProps {
  driverLocation?: Location;
  pickupLocation?: string;
  dropoffLocation?: string;
}

// Define the geographic boundaries of our mock map area
const MAP_BOUNDS = {
  minLat: -22.99,
  maxLat: -22.94,
  minLng: 30.45,
  maxLng: 30.51,
};

// Helper to convert lat/lng to a percentage-based top/left for CSS
const convertCoordsToPercent = (loc: Location): { top: string; left: string } => {
  const latRange = MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat;
  const lngRange = MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng;

  const topPercent = ((MAP_BOUNDS.maxLat - loc.lat) / latRange) * 100;
  const leftPercent = ((loc.lng - MAP_BOUNDS.minLng) / lngRange) * 100;

  return {
    top: `${topPercent}%`,
    left: `${leftPercent}%`,
  };
};

const SimulatedMap: React.FC = () => {
    const Road: React.FC<{ from: string; to: string }> = ({ from, to }) => {
        const p1 = LOCATIONS_COORDS[from];
        const p2 = LOCATIONS_COORDS[to];
        if (!p1 || !p2) return null;

        const p1Percent = convertCoordsToPercent(p1);
        const p2Percent = convertCoordsToPercent(p2);

        const x1 = parseFloat(p1Percent.left);
        const y1 = parseFloat(p1Percent.top);
        const x2 = parseFloat(p2Percent.left);
        const y2 = parseFloat(p2Percent.top);

        const dx = x2 - x1;
        const dy = y2 - y1;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const style = {
            position: 'absolute' as 'absolute',
            left: `${midX}%`,
            top: `${midY}%`,
            width: `${distance}%`,
            height: '5px',
            backgroundColor: '#a0aec0', // slate-400
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
            transformOrigin: 'center',
            borderRadius: '2px',
        };
        return <div style={style}></div>;
    };

    const Landmark: React.FC<{ name: string; color: string; size: string; shape?: 'circle' | 'square' }> = ({ name, color, size, shape = 'square' }) => {
        const loc = LOCATIONS_COORDS[name];
        if (!loc) return null;

        const position = convertCoordsToPercent(loc);
        const style = {
            position: 'absolute' as 'absolute',
            left: position.left,
            top: position.top,
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: shape === 'circle' ? '50%' : '12px',
            transform: 'translate(-50%, -50%)',
            opacity: 0.8,
        };
        return <div style={style} title={name}></div>;
    }

    return (
        <div className="absolute inset-0">
            {/* Landmarks / Zones */}
            <Landmark name="University of Venda Main Gate" color="#dcfce7" size="25%" shape="circle" />
            <Landmark name="Thavhani Mall" color="#e0e7ff" size="15%" />
            <Landmark name="Sibasa Shopping Centre" color="#e0e7ff" size="12%" />

            {/* Roads */}
            <Road from="University of Venda Main Gate" to="Thavhani Mall" />
            <Road from="Thavhani Mall" to="Sibasa Shopping Centre" />
            <Road from="Sibasa Shopping Centre" to="Makwarela" />
            <Road from="Thavhani Mall" to="Khoroni Hotel & Casino" />
            <Road from="Khoroni Hotel & Casino" to="Sibasa Shopping Centre" />
            <Road from="University of Venda Main Gate" to="Univen Library" />
            <Road from="Univen Library" to="University of Venda Sports Hall" />
            <Road from="University of Venda Sports Hall" to="Bernard Ncube Residence" />
            <Road from="Bernard Ncube Residence" to="Riverside Residence" />
            <Road from="University of Venda Main Gate" to="Golgotta" />
            <Road from="Golgotta" to="Thavhani Mall" />
            <Road from="Shayandima" to="Thavhani Mall" />
        </div>
    );
};

const MapAnimations = () => (
  <style>{`
    @keyframes dropIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-drop-in {
      animation: dropIn 0.4s ease-out forwards;
    }

    @keyframes gentlePulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    .animate-gentle-pulse {
      animation: gentlePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `}</style>
);

const MapPin: React.FC<{ loc: Location, type: 'pickup' | 'dropoff', delay?: string }> = ({ loc, type, delay = '0s' }) => {
  const position = convertCoordsToPercent(loc);
  const isPickup = type === 'pickup';
  return (
    <div className="absolute -translate-x-1/2 -translate-y-full" style={position} title={type}>
      <div className="animate-drop-in" style={{ animationDelay: delay, opacity: 0 }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
          className={`w-8 h-8 drop-shadow-lg ${isPickup ? 'text-green-600' : 'text-red-600'}`}>
          <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.42-.25.692-.455.272-.204.603-.478.935-.762a14.64 14.64 0 002.344-2.522 15.131 15.131 0 001.37-2.655C15.93 8.352 16 8.022 16 7.5a6 6 0 00-12 0c0 .522.07 1.052.22 1.555.44 1.256 1.043 2.34 1.37 2.655a14.64 14.64 0 002.344 2.522c.332.284.663.558.935.762.272.205.506.355.692.455.09.052.183.1.281.14l.018.008.006.003zM10 8.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  )
};

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ driverLocation, pickupLocation, dropoffLocation }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const driverPosition = driverLocation ? convertCoordsToPercent(driverLocation) : null;
  const pickupCoords = pickupLocation ? LOCATIONS_COORDS[pickupLocation] : null;
  const dropoffCoords = dropoffLocation ? LOCATIONS_COORDS[dropoffLocation] : null;

  useEffect(() => {
    if (!driverLocation) {
        setIsTooltipVisible(false);
    }
  }, [driverLocation]);
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    const clampedZoom = Math.max(0.5, Math.min(newZoom, 4));
    setZoom(clampedZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    setStartPanPoint({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    setPan({
        x: e.clientX - startPanPoint.x,
        y: e.clientY - startPanPoint.y
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleDriverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTooltipVisible(prev => !prev);
  }

  const calculateETA = useCallback((): string => {
    if (!driverLocation || !pickupLocation) return '';
    const pickup = LOCATIONS_COORDS[pickupLocation];
    if (!pickup) return '';

    const AVERAGE_SPEED_KMH = 40;
    const SIMULATED_KM_PER_DEGREE = 100;

    const latDiff = pickup.lat - driverLocation.lat;
    const lngDiff = pickup.lng - driverLocation.lng;
    const distanceDegrees = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    const distanceKm = distanceDegrees * SIMULATED_KM_PER_DEGREE;
    const timeMinutes = Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60);
    
    if (timeMinutes < 1) return "Arriving now";
    return `ETA: ~${timeMinutes} min${timeMinutes > 1 ? 's' : ''}`;
  }, [driverLocation, pickupLocation]);

  return (
    <div 
        className={`relative w-full h-full bg-emerald-100/50 rounded-2xl overflow-hidden shadow-inner border border-slate-200 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
      <MapAnimations />
      <div 
        className="relative w-full h-full transition-transform duration-75 ease-out"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <SimulatedMap />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" title="Your Location">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 border-2 border-white"></span>
          </span>
        </div>
        
        {pickupCoords && <MapPin loc={pickupCoords} type="pickup" />}
        {dropoffCoords && <MapPin loc={dropoffCoords} type="dropoff" delay="0.2s" />}

        {driverPosition && (
          <div className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 linear" style={driverPosition}>
            <div className="relative" onClick={handleDriverClick}>
              {isTooltipVisible && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-10">
                      {calculateETA()}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-slate-800"></div>
                  </div>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-slate-800 drop-shadow-lg -rotate-45 animate-gentle-pulse cursor-pointer">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {!driverLocation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
            <p className="text-slate-700 font-semibold">Map View</p>
            <p className="text-xs text-slate-500">(Driver location will appear here)</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default MapPlaceholder;