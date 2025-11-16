import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Загрузка...", fullScreen = false }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50"
    : "flex flex-col items-center justify-center py-10";

  return (
    <div className={containerClasses}>
      <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      {text && <p className="mt-4 text-lg text-gray-300">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
