import React, { useState, useEffect } from 'react';
import { Network, ShieldAlert, Eye, X } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Sources = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState(null);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const res = await api.get('/sources');
        setSources(res.data);
      } catch (err) {
        console.error('Error loading source IPs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);

  if (loading) {
    return <LoadingSkeleton count={4} height="h-20" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-600" />
            Source IP Threat Intelligence & Profiling
          </h2>
          <p className="text-xs text-slate-500">Aggregated source host telemetry, anomaly counts, and risk distribution</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-3.5">Source IP Address</th>
                <th className="p-3.5">Total Packets</th>
                <th className="p-3.5">Flagged Anomalies</th>
                <th className="p-3.5">Highest Severity</th>
                <th className="p-3.5">Avg Risk Score</th>
                <th className="p-3.5">Linked Incidents</th>
                <th className="p-3.5">Last Active</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {sources.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400 italic">No source host records found.</td>
                </tr>
              ) : (
                sources.map((src) => (
                  <tr key={src.ip} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{src.ip}</td>
                    <td className="p-3.5 font-mono">{src.totalEvents}</td>
                    <td className="p-3.5 font-bold text-rose-600">{src.anomaliesCount}</td>
                    <td className="p-3.5"><StatusBadge status={src.maxSeverity} /></td>
                    <td className="p-3.5 font-extrabold text-slate-900">{src.avgRiskScore}/100</td>
                    <td className="p-3.5 font-bold text-slate-800">{src.incidentCount}</td>
                    <td className="p-3.5 text-slate-500">{new Date(src.lastSeen).toLocaleString()}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedSource(src)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg border font-bold flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source Profile Modal */}
      {selectedSource && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedSource(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <Network className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-mono">{selectedSource.ip}</h3>
                <p className="text-xs text-slate-500 font-medium">Source Host Telemetry Profile</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 block">Total Requests</span>
                <span className="font-extrabold text-slate-900 text-base">{selectedSource.totalEvents}</span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <span className="text-rose-600 block">Anomalies Detected</span>
                <span className="font-extrabold text-rose-700 text-base">{selectedSource.anomaliesCount}</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 block">Avg Risk Score</span>
                <span className="font-extrabold text-slate-900 text-base">{selectedSource.avgRiskScore}%</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 block">Peak Severity</span>
                <StatusBadge status={selectedSource.maxSeverity} />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border rounded-lg text-xs text-slate-600">
              <p className="font-semibold mb-1">Defensive Note:</p>
              <p className="text-[11px] leading-relaxed">
                Source IP addresses flag suspicious patterns based on learned statistical baselines. Do not automatically block hosts without validating internal authorization.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sources;
