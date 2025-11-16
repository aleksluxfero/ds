import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Загрузка...", fullScreen = false }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50"
    : "flex flex-col items-center justify-center h-full flex-grow";

  return (
    <div className={containerClasses}>
      <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      {text && <p className="mt-4 text-sm text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
