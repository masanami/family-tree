import React, { useMemo } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const BASE_CLASSES = 'font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
const DISABLED_CLASSES = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current';

const VARIANT_CLASSES = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
} as const;

const SIZE_CLASSES = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
} as const;

export const Button = React.memo<ButtonProps>(({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const classes = useMemo(() => {
    return `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${DISABLED_CLASSES} ${className}`.trim();
  }, [variant, size, className]);
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';