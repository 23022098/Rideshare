import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  isLoading = false,
  ...props
}) => {
  const baseStyles = 'w-full inline-flex justify-center items-center rounded-full border px-6 py-3 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent hover:opacity-90 focus:ring-indigo-500 disabled:from-slate-400 disabled:to-slate-400',
    secondary: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400',
    danger: 'bg-red-600 text-white border-transparent hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

export default Button;