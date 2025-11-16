import React from 'react';
import '../SkeletonCard.css'; // Reusing the pulse animation

const SkeletonStatCard: React.FC = () => (
  <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
    <div className="skeleton-line h-8 w-1/2 mx-auto mb-2"></div>
    <div className="skeleton-line h-4 w-3/4 mx-auto"></div>
  </div>
);

const SkeletonTagStat: React.FC = () => (
  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
    <div className="flex justify-between items-center mb-2">
      <div className="skeleton-line h-5 w-1/3"></div>
      <div className="skeleton-line h-4 w-1/6"></div>
    </div>
    <div className="w-full bg-black/20 rounded-full h-1.5">
      <div
        className="skeleton-line h-1.5 rounded-full"
        style={{ width: `${Math.random() * 50 + 20}%` }} // Random width for visual variety
      ></div>
    </div>
  </div>
);

const SkeletonStatisticsPage: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonStatCard key={index} />
        ))}
      </div>
      <div>
        <div className="skeleton-line h-7 w-1/2 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonTagStat key={index} />
          ))}
        </div>
      </div>
    </>
  );
};

export default SkeletonStatisticsPage;
