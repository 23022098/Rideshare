
import React from 'react';
import { useAppState } from '../../contexts/AppContext';

const OfflineIndicator: React.FC = () => {
    const { state } = useAppState();
    const { isOffline, justReconnected } = state;

    if (!isOffline && !justReconnected) {
        return null;
    }

    const message = isOffline
        ? "You are currently offline. Data may be outdated."
        : "You're back online! Syncing data...";

    const bgColor = isOffline ? 'bg-amber-500' : 'bg-green-500';
    const isVisible = isOffline || justReconnected;

    return (
        <div 
          className={`fixed bottom-0 left-0 right-0 p-3 text-center text-white text-sm font-semibold z-50 transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'} ${bgColor}`}
          aria-live="polite"
        >
            {message}
        </div>
    );
};

export default OfflineIndicator;
