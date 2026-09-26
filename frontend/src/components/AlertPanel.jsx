import React from 'react';
import StatusBadge from './StatusBadge';

const AlertPanel = ({ alerts = [], onSelectAlert }) => {
  return (
    <div className="divide-y divide-slate-100 text-xs">
      {alerts.length === 0 ? (
        <p className="p-4 text-slate-400 italic text-center">No active alerts</p>
      ) : (
        alerts.slice(0, 5).map((a) => (
          <div key={a._id} className="p-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer" onClick={() => onSelectAlert && onSelectAlert(a)}>
            <div>
              <p className="font-bold text-slate-900">{a.message}</p>
              <p className="text-[11px] text-slate-500">{new Date(a.createdAt).toLocaleTimeString()}</p>
            </div>
            <StatusBadge status={a.severity} />
          </div>
        ))
      )}
    </div>
  );
};

export default AlertPanel;
