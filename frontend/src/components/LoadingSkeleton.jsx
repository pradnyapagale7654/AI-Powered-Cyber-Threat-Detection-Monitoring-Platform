import React from 'react';

const LoadingSkeleton = ({ count = 3, height = 'h-24' }) => {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-slate-200/80 rounded-xl ${height} w-full`}></div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
