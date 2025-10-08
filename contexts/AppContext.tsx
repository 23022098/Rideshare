
import React, { createContext, useContext, useReducer, Dispatch, useEffect } from 'react';
import { User, Trip } from '../types';

// Cache keys for offline support
const USER_CACHE_KEY = 'rideshare_user_cache';
const TRIP_CACHE_KEY = 'rideshare_trip_cache';

interface State {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  currentTrip: Trip | null;
  isOffline: boolean;
  justReconnected: boolean;
}

type Action =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRIP'; payload: Trip | null }
  | { type: 'UPDATE_USER_DETAILS'; payload: Partial<User> }
  | { type: 'SET_OFFLINE_STATUS'; payload: { isOffline: boolean; justReconnected?: boolean } };

const getInitialState = (): State => {
    try {
        const cachedUser = localStorage.getItem(USER_CACHE_KEY);
        const cachedTrip = localStorage.getItem(TRIP_CACHE_KEY);

        const user = cachedUser ? JSON.parse(cachedUser) : null;
        const currentTrip = cachedTrip ? JSON.parse(cachedTrip) : null;

        return {
            isAuthenticated: !!user,
            user,
            currentTrip,
            loading: false,
            error: null,
            isOffline: !navigator.onLine,
            justReconnected: false,
        };
    } catch (e) {
        console.error("Failed to load state from cache", e);
        return {
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
            currentTrip: null,
            isOffline: !navigator.onLine,
            justReconnected: false,
        };
    }
};

const initialState = getInitialState();

const appReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'LOGOUT':
      // On logout, clear session cache
      localStorage.removeItem(USER_CACHE_KEY);
      localStorage.removeItem(TRIP_CACHE_KEY);
      return {
        ...initialState,
        isAuthenticated: false,
        user: null,
        currentTrip: null,
        isOffline: state.isOffline, // Preserve current network status
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'SET_TRIP':
      return {
        ...state,
        currentTrip: action.payload,
      };
    case 'UPDATE_USER_DETAILS':
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'SET_OFFLINE_STATUS':
      return {
        ...state,
        isOffline: action.payload.isOffline,
        justReconnected: action.payload.justReconnected ?? state.justReconnected,
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Effect to cache user and trip state to localStorage
  useEffect(() => {
    try {
      if (state.user) {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(state.user));
      } else {
        localStorage.removeItem(USER_CACHE_KEY);
      }
      if (state.currentTrip) {
        localStorage.setItem(TRIP_CACHE_KEY, JSON.stringify(state.currentTrip));
      } else {
        localStorage.removeItem(TRIP_CACHE_KEY);
      }
    } catch (e) {
      console.error("Failed to save state to cache", e);
    }
  }, [state.user, state.currentTrip]);

  // Effect to manage online/offline status listeners
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_OFFLINE_STATUS', payload: { isOffline: false, justReconnected: true } });
      // Remove "reconnected" message after a few seconds
      setTimeout(() => {
        dispatch({ type: 'SET_OFFLINE_STATUS', payload: { isOffline: false, justReconnected: false } });
      }, 3000);
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_OFFLINE_STATUS', payload: { isOffline: true, justReconnected: false } });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
