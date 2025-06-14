import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  type?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required = false,
  type = 'text',
  className = '',
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  
  const baseClasses = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const classes = `${baseClasses} ${errorClasses} ${className}`;

  const InputElement = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <InputElement 
        id={inputId}
        className={classes} 
        type={type === 'textarea' ? undefined : type}
        {...props} 
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};