
import React, { useState, useEffect, useCallback } from 'react';
import { User, Trip } from '../../types';
import { firebaseAuth, firestoreDB } from '../../services/firebaseService';
import Header from '../common/Header';
import UserTable from './UserTable';
import AddUserModal from './AddUserModal';
import TripTable from './TripTable';
import Button from '../common/Button';
import ProfileScreen from '../common/ProfileScreen';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'dashboard' | 'profile'>('dashboard');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userList, tripList] = await Promise.all([
        firebaseAuth.getAllUsers(),
        firestoreDB.getAllTrips(),
      ]);
      setUsers(userList);
      setTrips(tripList);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemoveUser = async (email: string) => {
    try {
      await firebaseAuth.removeUser(email);
      fetchData(); // Refresh data
    } catch (error) {
      alert((error as Error).message);
    }
  };
  
  const totalRevenue = trips.reduce((acc, trip) => acc + trip.fare, 0);

  if (view === 'profile') {
      return <ProfileScreen onBack={() => setView('dashboard')} />
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <Header onProfileClick={() => setView('profile')} />
        <main className="container mx-auto p-4 md:p-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Admin Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/50">
              <h3 className="text-slate-500 font-semibold">Total Users</h3>
              <p className="text-4xl font-bold text-purple-600">{users.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/50">
              <h3 className="text-slate-500 font-semibold">Total Trips</h3>
              <p className="text-4xl font-bold text-indigo-600">{trips.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/50">
              <h3 className="text-slate-500 font-semibold">Total Revenue</h3>
              <p className="text-4xl font-bold text-emerald-600">ZAR {totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50">
            <div className="p-6 flex justify-between items-center border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">User Management</h3>
                <Button onClick={() => setIsModalOpen(true)} className="!w-auto !py-2">Add User</Button>
            </div>
            <UserTable users={users} onRemoveUser={handleRemoveUser} isLoading={isLoading} />
          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200/50">
            <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">Platform Trip History</h3>
            </div>
            <TripTable trips={[...trips].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())} isLoading={isLoading} />
          </div>

        </main>
      </div>
      <AddUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserAdded={fetchData}
      />
    </>
  );
};

export default AdminDashboard;