
import React from 'react';

interface LoadingSpinnerProps {
  text: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col justify-center items-center text-center h-screen w-screen text-purple-300">
      <p className="mt-4 text-lg">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
