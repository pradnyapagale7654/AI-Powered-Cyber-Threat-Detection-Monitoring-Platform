import React from 'react';
import { ShieldAlert } from 'lucide-react';

const EmptyState = ({ title = 'No records found', message = 'No data matches your current criteria.' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
      <ShieldAlert className="w-10 h-10 text-slate-300" />
      <h4 className="text-xs font-bold text-slate-700">{title}</h4>
      <p className="text-xs text-slate-500">{message}</p>
    </div>
  );
};

export default EmptyState;
