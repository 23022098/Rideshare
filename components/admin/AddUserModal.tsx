import React, { useState } from 'react';
import { UserRole } from '../../types';
import { firebaseAuth } from '../../services/firebaseService';
import Button from '../common/Button';
import Input from '../common/Input';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('1234567');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('1234567');
    setRole(UserRole.CUSTOMER);
    setError(null);
  }

  const handleClose = () => {
    clearForm();
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // FIX: The 'password' property does not exist on the User type and should not be passed to the register function.
      await firebaseAuth.register({ name, email, role });
      onUserAdded();
      handleClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Add New User</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Full Name" id="add-name" type="text" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="Email Address" id="add-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Default Password" id="add-password" type="text" value={password} onChange={e => setPassword(e.target.value)} required readOnly className="bg-slate-100 cursor-not-allowed" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
            <div className="flex w-full p-1 bg-slate-100 rounded-full border border-slate-200/80">
              <button type="button" onClick={() => setRole(UserRole.CUSTOMER)} className={`w-1/2 p-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${role === UserRole.CUSTOMER ? 'bg-white shadow text-purple-700' : 'bg-transparent text-slate-500'}`}>Customer</button>
              <button type="button" onClick={() => setRole(UserRole.DRIVER)} className={`w-1/2 p-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${role === UserRole.DRIVER ? 'bg-white shadow text-purple-700' : 'bg-transparent text-slate-500'}`}>Driver</button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Create User</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;