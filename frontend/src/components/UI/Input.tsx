import React, { useId, useMemo } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  type?: string;
}

const BASE_CLASSES = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';
const ERROR_CLASSES = 'border-red-500 focus:ring-red-500 focus:border-red-500';

export const Input = React.memo<InputProps>(({
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
  
  const classes = useMemo(() => {
    const errorClasses = error ? ERROR_CLASSES : '';
    return `${BASE_CLASSES} ${errorClasses} ${className}`.trim();
  }, [error, className]);

  const InputElement = type === 'textarea' ? 'textarea' : 'input';
  const inputType = type === 'textarea' ? undefined : type;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="必須">*</span>}
        </label>
      )}
      <InputElement 
        id={inputId}
        className={classes} 
        type={inputType}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props} 
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';