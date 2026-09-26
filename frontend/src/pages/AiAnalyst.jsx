import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, Send, Sparkles, AlertCircle, Shield, Loader2 } from 'lucide-react';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

const AiAnalyst = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('incidentId');

  const [incidents, setIncidents] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(preselectedId || '');
  const [queryText, setQueryText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await api.get('/incidents?limit=25');
        setIncidents(res.data.incidents || []);
        if (preselectedId) {
          setSelectedIncidentId(preselectedId);
        } else if (res.data.incidents?.length > 0) {
          setSelectedIncidentId(res.data.incidents[0]._id);
        }
      } catch (err) {
        console.error('Error fetching incidents list:', err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchIncidents();
  }, [preselectedId]);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setAnalysisResult(null);

    try {
      const res = await api.post('/ai/analyze-incident', {
        incidentId: selectedIncidentId,
        customQuery: queryText || 'Explain this security incident and outline defensive remediation.'
      });
      setAnalysisResult(res.data);
    } catch (err) {
      setAnalysisResult({
        aiAvailable: false,
        analysisText: `Error executing AI analysis: ${err.response?.data?.error || err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <LoadingSkeleton count={3} height="h-32" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-xl shadow-md shadow-violet-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              AI Security Analyst Assistant
            </h2>
            <p className="text-xs text-slate-500">LLM-powered threat explanation, signal breakdown & defensive triage</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Selector Panel */}
        <div className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Select Target Incident</h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Anomaly</label>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-violet-500"
            >
              {incidents.map((inc) => (
                <option key={inc._id} value={inc._id}>
                  [{inc.severity}] {inc.threatType} - {inc.sourceIP} ({inc.riskScore}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Custom Analyst Query (Optional)</label>
            <textarea
              rows={3}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="e.g. Why did this port scan trigger a critical score?"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
            ></textarea>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Generate AI Security Analysis <Sparkles className="w-4 h-4" /></>}
          </button>
        </div>

        {/* AI Output Window (2 Cols) */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                Analyst Report Output
              </h3>
              {analysisResult && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  analysisResult.aiAvailable 
                    ? 'bg-violet-50 text-violet-700 border-violet-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  Provider: {analysisResult.provider || 'AI Engine'}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-500">Synthesizing security telemetry & generating defensive recommendations...</p>
              </div>
            ) : analysisResult ? (
              <div className="prose prose-slate prose-sm max-w-none text-slate-800 space-y-3 text-xs leading-relaxed overflow-y-auto max-h-[500px] p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="whitespace-pre-wrap font-sans">{analysisResult.analysisText}</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Bot className="w-12 h-12 mb-2 text-slate-300" />
                <p className="text-xs font-semibold">Select an incident and click "Generate AI Security Analysis"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAnalyst;
