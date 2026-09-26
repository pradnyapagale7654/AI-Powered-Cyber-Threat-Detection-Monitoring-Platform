import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [severity, setSeverity] = useState('All');
  const [threatType, setThreatType] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        severity,
        threatType,
        status,
        search
      });

      const res = await api.get(`/incidents?${params.toString()}`);
      setIncidents(res.data.incidents);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [page, severity, threatType, status, search]);

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-600" />
              Incident Management Queue
            </h2>
            <p className="text-xs text-slate-500">Total {total} security anomalies flagged by ML models</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search IP, threat type..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Severity</label>
            <select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Threat Category</label>
            <select
              value={threatType}
              onChange={(e) => { setThreatType(e.target.value); setPage(1); }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
            >
              <option value="All">All Threat Types</option>
              <option value="Port Scan">Port Scan</option>
              <option value="Brute Force">Brute Force</option>
              <option value="DoS">DoS</option>
              <option value="Bot Activity">Bot Activity</option>
              <option value="Suspicious Traffic">Suspicious Traffic</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
              <option value="False Positive">False Positive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Data Table */}
      <div className="glass-card rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={5} height="h-12" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-3.5">Incident ID</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Source IP</th>
                  <th className="p-3.5">Destination IP</th>
                  <th className="p-3.5">Threat Type</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Risk Score</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-slate-400 italic">
                      No security incidents match your filters.
                    </td>
                  </tr>
                ) : (
                  incidents.map((inc) => (
                    <tr key={inc._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono text-slate-500 font-semibold">{inc._id.substring(inc._id.length - 8).toUpperCase()}</td>
                      <td className="p-3.5 text-slate-500">{new Date(inc.createdAt).toLocaleString()}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">{inc.sourceIP}</td>
                      <td className="p-3.5 font-mono text-slate-600">{inc.destinationIP}:{inc.destinationPort}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{inc.threatType}</td>
                      <td className="p-3.5"><StatusBadge status={inc.severity} /></td>
                      <td className="p-3.5 font-extrabold text-slate-900">{inc.riskScore}/100</td>
                      <td className="p-3.5"><StatusBadge status={inc.status} type="incident_status" /></td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => navigate(`/incidents/${inc._id}`)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg border border-slate-200 font-bold flex items-center gap-1.5 ml-auto transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Investigate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Incidents;
