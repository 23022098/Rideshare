
import React from 'react';
import { AppProvider, useAppState } from './contexts/AppContext';
import AuthScreen from './components/AuthScreen';
import CustomerDashboard from './components/customer/CustomerDashboard';
import DriverDashboard from './components/driver/DriverDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { UserRole } from './types';
import OfflineIndicator from './components/common/OfflineIndicator';

const AppContent: React.FC = () => {
  const { state } = useAppState();

  if (!state.isAuthenticated || !state.user) {
    return <AuthScreen />;
  }

  const renderDashboard = () => {
    switch (state.user?.role) {
      case UserRole.CUSTOMER:
        return <CustomerDashboard />;
      case UserRole.DRIVER:
        return <DriverDashboard />;
      case UserRole.ADMIN:
        return <AdminDashboard />;
      default:
        return <AuthScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {renderDashboard()}
      <OfflineIndicator />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
