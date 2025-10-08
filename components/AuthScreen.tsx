import React, { useState } from 'react';
import { useAppState } from '../contexts/AppContext';
import { firebaseAuth } from '../services/firebaseService';
import { UserRole } from '../types';
import Button from './common/Button';
import Input from './common/Input';

type AuthView = 'roleSelection' | 'login' | 'register' | 'forgotPassword';

// --- RoleSelection Component ---
interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
  switchView: (view: AuthView) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole, switchView }) => (
  <div className="space-y-4">
    <h3 className="text-center text-lg font-medium text-slate-700 pb-2">Choose your role to sign in</h3>
    <Button onClick={() => onSelectRole(UserRole.CUSTOMER)}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
      <span>Sign in as Customer</span>
    </Button>
    <Button onClick={() => onSelectRole(UserRole.DRIVER)} variant="secondary">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.228 1.482A3.75 3.75 0 0 0 3 4.5v11.25A3.75 3.75 0 0 0 6.75 19.5h10.5A3.75 3.75 0 0 0 21 15.75V7.5a3.75 3.75 0 0 0-3.75-3.75h-4.972a.75.75 0 0 1-.6-.316L10.32 1.782a.75.75 0 0 0-.6-.3H5.228ZM6.75 18a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
        <path d="M14.25 7.5a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" />
      </svg>
      <span>Sign in as Driver</span>
    </Button>
    <Button onClick={() => onSelectRole(UserRole.ADMIN)} variant="secondary" className="!bg-slate-800 !text-white hover:!bg-slate-900 focus:!ring-slate-700">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <span>Sign in as Admin</span>
    </Button>
    <div className="text-sm text-center pt-4">
       <button onClick={() => switchView('register')} className="font-medium text-purple-600 hover:text-purple-500">
        Don't have an account? Register
      </button>
    </div>
  </div>
);


// --- LoginForm Component ---
interface LoginFormProps {
  role: UserRole;
  email: string; setEmail: (value: string) => void;
  password: string; setPassword: (value: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  isLoading: boolean;
  switchView: (view: AuthView) => void;
  onBack: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ role, email, setEmail, password, setPassword, handleLogin, isLoading, switchView, onBack }) => (
  <form className="space-y-6" onSubmit={handleLogin}>
    <div className="flex items-center gap-2 -ml-2">
         <button type="button" onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Go back to role selection">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
         </button>
        <h3 className="text-lg font-medium text-slate-700 capitalize">Sign in as {role}</h3>
    </div>
    <Input label="Email Address" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" autoFocus/>
    <Input label="Password" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
    <Button type="submit" isLoading={isLoading}>Sign In</Button>
    <div className="text-sm text-center pt-2">
        <button type="button" onClick={() => switchView('forgotPassword')} className="font-medium text-purple-600 hover:text-purple-500">
            Forgot password?
        </button>
    </div>
  </form>
);


// --- RegisterForm Component ---
interface RegisterFormProps {
  name: string; setName: (value: string) => void;
  email: string; setEmail: (value: string) => void;
  password: string; setPassword: (value: string) => void;
  confirmPassword: string; setConfirmPassword: (value: string) => void;
  role: UserRole; setRole: (role: UserRole) => void;
  handleRegister: (e: React.FormEvent) => void;
  isLoading: boolean;
  switchView: (view: AuthView) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  name, setName, email, setEmail, password, setPassword,
  confirmPassword, setConfirmPassword, role, setRole,
  handleRegister, isLoading, switchView
}) => (
  <form className="space-y-6" onSubmit={handleRegister}>
    <Input label="Full Name" id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
    <Input label="Email Address" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
    <Input label="Password" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
    <Input label="Confirm Password" id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
      <div className="flex w-full p-1 bg-slate-100 rounded-full border border-slate-200/80">
        <button type="button" onClick={() => setRole(UserRole.CUSTOMER)} className={`w-1/2 p-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${ role === UserRole.CUSTOMER ? 'bg-white shadow text-purple-700' : 'bg-transparent text-slate-500' }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
          Customer
        </button>
        <button type="button" onClick={() => setRole(UserRole.DRIVER)} className={`w-1/2 p-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${ role === UserRole.DRIVER ? 'bg-white shadow text-purple-700' : 'bg-transparent text-slate-500' }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5.228 1.482A3.75 3.75 0 0 0 3 4.5v11.25A3.75 3.75 0 0 0 6.75 19.5h10.5A3.75 3.75 0 0 0 21 15.75V7.5a3.75 3.75 0 0 0-3.75-3.75h-4.972a.75.75 0 0 1-.6-.316L10.32 1.782a.75.75 0 0 0-.6-.3H5.228ZM6.75 18a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" /><path d="M14.25 7.5a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" /></svg>
          Driver
        </button>
      </div>
    </div>
    <Button type="submit" isLoading={isLoading}>Create Account</Button>
    <div className="text-sm text-center pt-2">
      <button onClick={() => switchView('login')} className="font-medium text-purple-600 hover:text-purple-500">
        Already have an account? Sign in
      </button>
    </div>
  </form>
);

// --- ForgotPasswordForm Component ---
interface ForgotPasswordFormProps {
  email: string; setEmail: (value: string) => void;
  handleForgotPassword: (e: React.FormEvent) => void;
  isLoading: boolean;
  switchView: (view: AuthView) => void;
}
const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ email, setEmail, handleForgotPassword, isLoading, switchView }) => (
    <form className="space-y-6" onSubmit={handleForgotPassword}>
      <Input label="Email Address" id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus/>
      <Button type="submit" isLoading={isLoading}>Send Reset Link</Button>
      <div className="text-sm text-center pt-2">
        <button onClick={() => switchView('login')} className="font-medium text-purple-600 hover:text-purple-500">
          Back to Sign In
        </button>
      </div>
    </form>
);


// --- AuthScreen Container Component ---
const AuthScreen: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [view, setView] = useState<AuthView>('roleSelection');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>(UserRole.CUSTOMER);

  // View toggler
  const switchView = (newView: AuthView) => {
    setNotification(null);
    dispatch({ type: 'SET_ERROR', payload: null });
    // If returning to login, but no role was selected, go to role selection
    if (newView === 'login' && !selectedRole) {
      setView('roleSelection');
    } else {
      setView(newView);
    }
  };

  // Role selection handler
  const handleSelectRole = (role: UserRole) => {
      setSelectedRole(role);
      setView('login');
  };

  // Back to role selection handler
  const handleBackToRoleSelection = () => {
      setSelectedRole(null);
      setView('roleSelection');
      setEmail('');
      setPassword('');
      setNotification(null);
      dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_LOADING', payload: true });
    setNotification(null);
    try {
      const user = await firebaseAuth.signIn(email, password);
      if (user.role !== selectedRole) {
          throw new Error(`This account is not a '${selectedRole}' account. Please sign in with the correct role.`);
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      const err = error as Error;
      setNotification({ type: 'error', text: err.message });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Registration Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setNotification({ type: 'error', text: "Passwords do not match." });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    setNotification(null);
    try {
      const newUser = await firebaseAuth.register({ name: regName, email: regEmail, role: regRole });
      dispatch({ type: 'LOGIN_SUCCESS', payload: newUser });
    } catch (error) {
      const err = error as Error;
      setNotification({ type: 'error', text: err.message });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_LOADING', payload: true });
    setNotification(null);
    try {
      await firebaseAuth.sendPasswordResetEmail(email);
      setNotification({ type: 'success', text: 'If an account exists for this email, a reset link has been sent.' });
    } catch (error) {
      const err = error as Error;
      setNotification({ type: 'error', text: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const titles = {
    roleSelection: (
      <>
        Welcome to{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
          Rideshare
        </span>
      </>
    ),
    login: 'Sign In',
    register: 'Create an Account',
    forgotPassword: 'Reset Your Password'
  };
  
  const subtitles = {
    roleSelection: 'The student-led e-hailing service for Univen',
    login: null,
    register: 'Join the Rideshare community',
    forgotPassword: 'Enter your email to receive a reset link.'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
           <h2 className="mt-6 text-center text-4xl font-extrabold text-slate-900">
            {titles[view]}
          </h2>
          {subtitles[view] && (
            <p className="mt-2 text-center text-sm text-slate-600">
              {subtitles[view]}
            </p>
          )}
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200/50">
          {view === 'roleSelection' && (
            <RoleSelection
              onSelectRole={handleSelectRole}
              switchView={switchView}
            />
          )}
          {view === 'login' && selectedRole && (
            <LoginForm
              role={selectedRole}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              handleLogin={handleLogin}
              isLoading={state.loading}
              switchView={switchView}
              onBack={handleBackToRoleSelection}
            />
          )}
          {view === 'register' && (
            <RegisterForm
              name={regName} setName={setRegName}
              email={regEmail} setEmail={setRegEmail}
              password={regPassword} setPassword={setRegPassword}
              confirmPassword={regConfirmPassword} setConfirmPassword={setRegConfirmPassword}
              role={regRole} setRole={setRegRole}
              handleRegister={handleRegister}
              isLoading={state.loading}
              switchView={switchView}
            />
          )}
          {view === 'forgotPassword' && (
            <ForgotPasswordForm 
              email={email} setEmail={setEmail}
              handleForgotPassword={handleForgotPassword}
              isLoading={state.loading}
              switchView={switchView}
            />
          )}
          {notification && (
            <p className={`text-sm p-3 rounded-md mt-4 text-center ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {notification.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;