export const getSeverityClass = (severity) => {
  switch (String(severity || '').toLowerCase()) {
    case 'critical': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
    default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
};
