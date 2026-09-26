import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-2 text-slate-500 text-xs font-semibold">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      <span>{text}</span>
    </div>
  );
};

export default LoadingSpinner;
