
import React, { useState, useEffect } from 'react';
import { useAppState } from '../../contexts/AppContext';
import { firebaseAuth } from '../../services/firebaseService';
import Button from './Button';
import Input from './Input';

interface ProfileScreenProps {
  onBack: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { state, dispatch } = useAppState();
  const user = state.user!;
  const isOffline = state.isOffline;

  // State for user details form
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsMessage, setDetailsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // State for password change form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOffline) {
      setDetailsMessage({ type: 'error', text: 'You are offline. Cannot update details.' });
      return;
    }
    setIsDetailsLoading(true);
    setDetailsMessage(null);
    try {
      const updatedUser = await firebaseAuth.updateUser(user.id, { name, email });
      dispatch({ type: 'UPDATE_USER_DETAILS', payload: updatedUser });
      setDetailsMessage({ type: 'success', text: 'Details updated successfully!' });
    } catch (error) {
      setDetailsMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOffline) {
      setPasswordMessage({ type: 'error', text: 'You are offline. Cannot change password.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setIsPasswordLoading(true);
    setPasswordMessage(null);
    try {
      await firebaseAuth.changePassword(user.email, oldPassword, newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
       <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 rounded-b-2xl border-b border-slate-200/50">
            <div className="container mx-auto flex items-center">
                 <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back
                </button>
                <h1 className="text-xl font-bold text-slate-800 mx-auto">
                    My Profile
                </h1>
                <div className="w-20"></div> {/* Spacer */}
            </div>
       </header>
       <main className="container mx-auto p-4 md:p-6">
         <div className="max-w-2xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg border border-slate-200/50">
                <img
                    src={user.profilePictureUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full ring-4 ring-purple-200"
                />
                <h2 className="mt-4 text-2xl font-bold text-slate-900">{user.name}</h2>
                <p className="text-slate-500">{user.email}</p>
                <p className="mt-1 text-sm font-semibold capitalize bg-slate-100 text-slate-700 px-3 py-1 rounded-full">{user.role}</p>
            </div>
            
            {/* Update Details Form */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200/50">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Update Your Details</h3>
                <form onSubmit={handleUpdateDetails} className="space-y-4">
                    <Input id="profile-name" label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} />
                    <Input id="profile-email" label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    {detailsMessage && (
                        <p className={`text-sm p-3 rounded-md text-center ${detailsMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {detailsMessage.text}
                        </p>
                    )}
                    <Button type="submit" isLoading={isDetailsLoading} disabled={isOffline}>Save Changes</Button>
                </form>
            </div>

            {/* Change Password Form */}
             <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200/50">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <Input id="old-password" label="Current Password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                    <Input id="new-password" label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    <Input id="confirm-password" label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    {passwordMessage && (
                        <p className={`text-sm p-3 rounded-md text-center ${passwordMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {passwordMessage.text}
                        </p>
                    )}
                    <Button type="submit" variant="secondary" isLoading={isPasswordLoading} disabled={isOffline}>Change Password</Button>
                </form>
            </div>
         </div>
       </main>
    </div>
  );
};

export default ProfileScreen;
