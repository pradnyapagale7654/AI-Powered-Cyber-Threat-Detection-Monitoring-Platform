import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, Network, Cpu, FileText, ArrowLeft, Bot, 
  Send, CheckCircle2, Clock, User
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status & note form
  const [status, setStatus] = useState('New');
  const [priority, setPriority] = useState('P2');
  const [notes, setNotes] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/incidents/${id}`);
      setIncident(res.data.incident);
      setInvestigations(res.data.investigations || []);
      setStatus(res.data.incident.status);
      setPriority(res.data.incident.priority || 'P2');
      setNotes(res.data.incident.notes || '');
    } catch (err) {
      console.error('Error loading incident details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpdateIncident = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.patch(`/incidents/${id}`, { status, priority, notes });
      setIncident(res.data.incident);
      fetchDetail(); // Refresh investigation timeline
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    try {
      await api.post(`/incidents/${id}/investigations`, {
        notes: newNoteText,
        action: 'Analyst Note'
      });
      setNewNoteText('');
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add note');
    }
  };

  if (loading) {
    return <LoadingSkeleton count={4} height="h-32" />;
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Incident record not found.</p>
        <button onClick={() => navigate('/incidents')} className="mt-4 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl">
          Back to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/incidents')}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </button>

        <button
          onClick={() => navigate(`/ai-analyst?incidentId=${incident._id}`)}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <Bot className="w-4 h-4 text-violet-200" />
          Analyze with AI Security Analyst
        </button>
      </div>

      {/* Grid of Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Overview & Network & ML) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Overview Card */}
          <div className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Incident #{incident._id}</span>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{incident.threatType} Flag</h2>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={incident.severity} />
                <StatusBadge status={incident.status} type="incident_status" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 block text-[10px] uppercase">Risk Score</span>
                <span className="text-lg font-extrabold text-slate-900">{incident.riskScore}/100</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 block text-[10px] uppercase">Anomaly Score</span>
                <span className="text-base font-mono font-bold text-slate-900">{incident.anomalyScore || 0.85}</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 block text-[10px] uppercase">Priority</span>
                <span className="text-base font-bold text-slate-900">{incident.priority || 'P2'}</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 block text-[10px] uppercase">Detected</span>
                <span className="text-xs font-semibold text-slate-700">{new Date(incident.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Network Telemetry Card */}
          <div className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-600" />
              Network Telemetry Data
            </h3>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 text-[10px] block font-sans uppercase">Source IP</span>
                <span className="font-extrabold text-slate-900 text-sm">{incident.sourceIP}</span>
                <span className="text-[11px] text-slate-500 block">Port: {incident.sourcePort}</span>
              </div>

              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-slate-500 text-[10px] block font-sans uppercase">Destination Target</span>
                <span className="font-extrabold text-slate-900 text-sm">{incident.destinationIP}</span>
                <span className="text-[11px] text-slate-500 block">Port: {incident.destinationPort} ({incident.protocol})</span>
              </div>
            </div>
          </div>

          {/* ML Features Breakdown */}
          <div className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Machine Learning Feature Extraction
            </h3>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              {Object.entries(incident.features || {}).map(([key, val]) => (
                <div key={key} className="p-2.5 bg-slate-50 border rounded-lg">
                  <span className="text-[10px] font-sans text-slate-500 capitalize block">{key}</span>
                  <span className="font-bold text-slate-900">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Investigation Controls & Logs) */}
        <div className="space-y-6">
          {/* Status Update Form */}
          <form onSubmit={handleUpdateIncident} className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Incident Triage & Status</h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Lifecycle Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
              >
                <option value="New">New</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
                <option value="False Positive">False Positive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Priority Rating</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
              >
                <option value="P1">P1 - Critical Escalation</option>
                <option value="P2">P2 - High Alert</option>
                <option value="P3">P3 - Moderate</option>
                <option value="P4">P4 - Low Concern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Investigation Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                placeholder="Enter triage notes..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {updating ? 'Saving...' : 'Save Triage Changes'}
            </button>
          </form>

          {/* Investigation Log History */}
          <div className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Investigation Activity Log</h3>

            <form onSubmit={handleAddNote} className="flex items-center gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add investigation step..."
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <button type="submit" className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="space-y-3 max-h-64 overflow-y-auto pt-2">
              {investigations.map((inv, idx) => (
                <div key={inv._id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-slate-700">{inv.userName || 'Analyst'}</span>
                    <span>{new Date(inv.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-800 font-medium">{inv.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
