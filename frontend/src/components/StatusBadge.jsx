import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle, Info } from 'lucide-react';

const StatusBadge = ({ status, type = 'severity', showIcon = true }) => {
  const value = String(status || '').trim();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let IconComponent = Info;

  if (type === 'severity' || type === 'threat') {
    switch (value.toLowerCase()) {
      case 'critical':
      case 'dos':
      case 'brute force':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
        IconComponent = ShieldAlert;
        break;
      case 'high':
      case 'port scan':
      case 'bot activity':
        colorClasses = 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20';
        IconComponent = AlertTriangle;
        break;
      case 'medium':
      case 'suspicious':
      case 'suspicious traffic':
      case 'other anomaly':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
        IconComponent = AlertTriangle;
        break;
      case 'low':
      case 'normal':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
        IconComponent = ShieldCheck;
        break;
      default:
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    }
  } else if (type === 'incident_status') {
    switch (value.toLowerCase()) {
      case 'new':
        colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
        IconComponent = AlertTriangle;
        break;
      case 'investigating':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        IconComponent = Info;
        break;
      case 'resolved':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        IconComponent = CheckCircle;
        break;
      case 'false positive':
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-300';
        IconComponent = ShieldCheck;
        break;
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-sm ${colorClasses}`}>
      {showIcon && <IconComponent className="w-3.5 h-3.5" />}
      {value}
    </span>
  );
};

export default StatusBadge;
