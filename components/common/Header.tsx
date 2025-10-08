
import React from 'react';
import { useAppState } from '../../contexts/AppContext';
import { firebaseAuth } from '../../services/firebaseService';

interface HeaderProps {
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick }) => {
  const { state, dispatch } = useAppState();

  const handleLogout = () => {
    firebaseAuth.signOut();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 rounded-b-2xl border-b border-slate-200/50">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
          Univen Rideshare
        </h1>
        {state.user && (
          <div className="flex items-center gap-4">
            <button
              onClick={onProfileClick}
              className="flex items-center gap-4 text-right cursor-pointer group disabled:cursor-default"
              disabled={!onProfileClick}
            >
              <div className="hidden sm:block">
                <p className="font-semibold text-sm text-slate-800 group-hover:text-purple-600 transition-colors">{state.user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{state.user.role}</p>
              </div>
              <img
                className="h-10 w-10 rounded-full group-hover:ring-2 group-hover:ring-purple-500 transition-all"
                src={state.user.profilePictureUrl}
                alt="Profile"
              />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
