import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Загрузка...", fullScreen = false }) => {
  const backgroundClass = fullScreen ? "bg-black bg-opacity-50" : "";
  const containerClasses = `fixed inset-0 flex flex-col items-center justify-center z-50 ${backgroundClass}`;

  return (
    <div className={containerClasses}>
      <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      {text && <p className="mt-4 text-sm text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
