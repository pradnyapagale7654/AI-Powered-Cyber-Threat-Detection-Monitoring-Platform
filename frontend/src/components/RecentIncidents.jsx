import React from 'react';
import StatusBadge from './StatusBadge';
import { useNavigate } from 'react-router-dom';

const RecentIncidents = ({ incidents = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="divide-y divide-slate-100 text-xs">
      {incidents.length === 0 ? (
        <p className="p-4 text-slate-400 italic text-center">No recent incidents</p>
      ) : (
        incidents.slice(0, 5).map((inc) => (
          <div key={inc._id} className="p-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer" onClick={() => navigate(`/incidents/${inc._id}`)}>
            <div>
              <p className="font-bold text-slate-900">{inc.threatType} from {inc.sourceIP}</p>
              <p className="text-[11px] text-slate-500">Risk Score: {inc.riskScore}/100</p>
            </div>
            <StatusBadge status={inc.severity} />
          </div>
        ))
      )}
    </div>
  );
};

export default RecentIncidents;
