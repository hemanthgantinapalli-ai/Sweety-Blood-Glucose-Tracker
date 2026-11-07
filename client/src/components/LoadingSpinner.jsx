import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-pink-200 border-t-pink-500 animate-spin`}
      />
      {message && <p className="text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;

