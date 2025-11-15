
import React from 'react';
import { Spinner } from '@telegram-apps/telegram-ui'; // Re-add Spinner import

interface LoadingSpinnerProps {
  text: string;
  fullScreen?: boolean; // New prop
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text, fullScreen }) => {
  const containerClasses = `flex flex-col justify-center items-center text-center text-purple-300 ${
    fullScreen ? 'h-screen w-screen' : 'py-20' // Conditional classes
  }`;
  return (
    <div className={containerClasses}>
      <Spinner size="l" className="text-purple-500" />
      <p className="mt-4 text-lg">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
