import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({ title, value, subtext, icon: Icon, color = 'emerald', trend }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100'
  };

  return (
    <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.emerald}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      {(subtext || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtext}</span>
          {trend && (
            <span className={`inline-flex items-center gap-1 font-semibold ${
              trend > 0 ? 'text-rose-600' : trend < 0 ? 'text-emerald-600' : 'text-slate-500'
            }`}>
              {trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : trend < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
