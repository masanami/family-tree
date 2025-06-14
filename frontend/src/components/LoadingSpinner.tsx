import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerClasses = {
    small: 'p-2',
    medium: 'p-4',
    large: 'p-8'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

// Specific loading components for different contexts
export const PageLoadingSpinner: React.FC = () => (
  <LoadingSpinner
    size="large"
    message="ページを読み込んでいます..."
    className="min-h-screen"
  />
);

export const ComponentLoadingSpinner: React.FC = () => (
  <LoadingSpinner
    size="medium"
    message="コンポーネントを読み込んでいます..."
    className="min-h-64"
  />
);

export const InlineLoadingSpinner: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingSpinner
    size="small"
    message={message}
    className="inline-flex"
  />
);

LoadingSpinner.displayName = 'LoadingSpinner';
PageLoadingSpinner.displayName = 'PageLoadingSpinner';
ComponentLoadingSpinner.displayName = 'ComponentLoadingSpinner';
InlineLoadingSpinner.displayName = 'InlineLoadingSpinner';