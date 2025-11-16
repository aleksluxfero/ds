import React from 'react';
import './SkeletonCard.css';

const SkeletonCard: React.FC = () => {
  return (
    <div className="skeleton-card rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-5 h-52">
      <div className="skeleton-line h-6 w-3/4 mb-4"></div>
      <div className="skeleton-line h-4 w-full mb-2"></div>
      <div className="skeleton-line h-4 w-5/6 mb-4"></div>
      <div className="flex gap-2 mb-4">
        <div className="skeleton-tag h-6 w-20 rounded-full"></div>
        <div className="skeleton-tag h-6 w-24 rounded-full"></div>
      </div>
      <div className="flex-grow"></div>
      <div className="skeleton-line h-px w-full mb-3"></div>
      <div className="flex justify-between items-center">
        <div className="skeleton-line h-4 w-1/3"></div>
        <div className="flex items-center space-x-2">
          <div className="skeleton-icon w-7 h-7 rounded-full"></div>
          <div className="skeleton-icon w-7 h-7 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
