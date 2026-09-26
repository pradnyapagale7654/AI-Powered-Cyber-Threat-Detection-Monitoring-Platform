import React, { useState } from 'react';
import { Play, Pause, Radio } from 'lucide-react';
import StatusBadge from './StatusBadge';

const LiveStreamTicker = ({ events = [] }) => {
  const [isPaused, setIsPaused] = useState(false);

  const displayEvents = isPaused ? events : events;

  return (
    <div className="glass-card rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Live SOC Telemetry Stream</h3>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
          {isPaused ? 'Resume Stream' : 'Pause Stream'}
        </button>
      </div>

      <div className="bg-slate-950 font-mono text-xs p-4 max-h-64 overflow-y-auto space-y-2 text-slate-300">
        {displayEvents.length === 0 ? (
          <p className="text-slate-500 italic text-center py-4">Waiting for real-time socket events...</p>
        ) : (
          displayEvents.slice(0, 15).map((ev, idx) => {
            const timeStr = new Date(ev.timestamp || Date.now()).toTimeString().split(' ')[0];
            const isAnomaly = ev.prediction === 'anomaly';
            return (
              <div
                key={ev._id || idx}
                className={`flex items-center justify-between p-2 rounded-md border transition-all ${
                  isAnomaly 
                    ? 'bg-rose-950/40 border-rose-800/40 text-rose-200' 
                    : 'bg-slate-900/60 border-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-semibold">{timeStr}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    isAnomaly ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {isAnomaly ? (ev.severity || 'ANOMALY') : 'NORMAL'}
                  </span>
                  <span className="text-teal-400 font-bold">{ev.protocol || 'TCP'}</span>
                  <span className="text-slate-200">{ev.sourceIP} &rarr; {ev.destinationIP}:{ev.destinationPort}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{ev.threatType || 'Normal'}</span>
                  <span className={`text-[11px] font-bold ${ev.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    Risk: {ev.riskScore || 0}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LiveStreamTicker;
