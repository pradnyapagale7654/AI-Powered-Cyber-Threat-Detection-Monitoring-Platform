import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Network, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';

const SourceDetails = () => {
  const { ip } = useParams();
  const navigate = useNavigate();
  const [sourceData, setSourceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSourceDetails = async () => {
      try {
        const res = await api.get('/sources');
        const match = (res.data || []).find(s => s.ip === ip);
        setSourceData(match || { ip, totalEvents: 0, anomaliesCount: 0, maxSeverity: 'Low', avgRiskScore: 0 });
      } catch (err) {
        console.error('Error fetching source details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSourceDetails();
  }, [ip]);

  if (loading) return <LoadingSkeleton count={3} height="h-24" />;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/sources')} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back to Source IPs
      </button>

      <div className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 font-mono">{ip}</h2>
            <p className="text-xs text-slate-500">Source Host Activity Profile</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border rounded-lg">
            <span className="text-slate-500 block">Total Requests</span>
            <span className="font-extrabold text-slate-900 text-base">{sourceData?.totalEvents || 0}</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <span className="text-rose-600 block">Anomalies</span>
            <span className="font-extrabold text-rose-700 text-base">{sourceData?.anomaliesCount || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-lg">
            <span className="text-slate-500 block">Avg Risk Score</span>
            <span className="font-extrabold text-slate-900 text-base">{sourceData?.avgRiskScore || 0}%</span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-lg">
            <span className="text-slate-500 block">Peak Severity</span>
            <StatusBadge status={sourceData?.maxSeverity || 'Low'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceDetails;
