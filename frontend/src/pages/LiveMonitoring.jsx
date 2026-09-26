import React, { useState } from 'react';
import { Activity, Radio, Filter, Play, Pause, AlertTriangle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';

const LiveMonitoring = () => {
  const { liveEvents, isConnected } = useSocket();
  const [filterType, setFilterType] = useState('ALL');
  const [isPaused, setIsPaused] = useState(false);

  const filteredEvents = liveEvents.filter((ev) => {
    if (filterType === 'ANOMALY') return ev.prediction === 'anomaly';
    if (filterType === 'CRITICAL') return ev.severity === 'Critical';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className={`w-5 h-5 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-rose-500'}`} />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Real-Time SOC Event Stream</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Socket.IO real-time telemetry stream processed via Isolation Forest & Random Forest</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {['ALL', 'ANOMALY', 'CRITICAL'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded-md font-bold uppercase transition-all ${
                  filterType === f ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            {isPaused ? 'Resume Stream' : 'Pause Stream'}
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-card rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Source IP</th>
                <th className="p-3.5">Destination IP</th>
                <th className="p-3.5">Protocol</th>
                <th className="p-3.5">Threat Type</th>
                <th className="p-3.5">Anomaly Score</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400 italic">
                    Waiting for real-time events stream...
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev, idx) => (
                  <tr
                    key={ev._id || idx}
                    className={`hover:bg-slate-50 transition-colors ${
                      ev.prediction === 'anomaly' ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="p-3.5 font-mono text-slate-500">
                      {new Date(ev.timestamp || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-slate-900">{ev.sourceIP}</td>
                    <td className="p-3.5 font-mono text-slate-600">{ev.destinationIP}:{ev.destinationPort}</td>
                    <td className="p-3.5 font-bold text-teal-700">{ev.protocol}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{ev.threatType || 'Normal'}</td>
                    <td className="p-3.5 font-mono">{Number(ev.anomalyScore || 0).toFixed(2)}</td>
                    <td className="p-3.5 font-extrabold text-slate-900">{ev.riskScore || 0}%</td>
                    <td className="p-3.5">
                      <StatusBadge status={ev.severity || (ev.prediction === 'anomaly' ? 'High' : 'Low')} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;
