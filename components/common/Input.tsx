import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          className="appearance-none block w-full px-4 py-3 border border-slate-200 bg-slate-100 rounded-lg shadow-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:bg-white sm:text-sm transition-colors"
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;