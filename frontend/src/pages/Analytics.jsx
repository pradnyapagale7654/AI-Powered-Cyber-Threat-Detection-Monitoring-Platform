import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Cpu, Network, Gauge } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

const COLOR_SERIES = ['#10b981', '#f59e0b', '#f97316', '#f43f5e', '#8b5cf6', '#06b6d4', '#64748b'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSkeleton count={4} height="h-40" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Security Analytics & Telemetry Metrics
          </h2>
          <p className="text-xs text-slate-500">In-depth statistical aggregation of network anomalies and severity distributions</p>
        </div>

        <div className="flex gap-4 text-xs font-bold">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
            Avg Anomaly Score: <span className="font-mono text-sm font-extrabold">{data?.averages?.avgAnomalyScore}</span>
          </div>
          <div className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
            Avg Risk Index: <span className="font-mono text-sm font-extrabold">{data?.averages?.avgRiskScore}%</span>
          </div>
        </div>
      </div>

      {/* Grid 1: Daily Threat Trends & Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Threat Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">Daily Telemetry & Anomaly Volumetrics</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.threatsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="total" name="Total Events" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="anomalies" name="Flagged Anomalies" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Pie (1 Col) */}
        <div className="glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-2">Severity Breakdown</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.severities} cx="50%" cy="50%" outerRadius={75} dataKey="count">
                  {data?.severities?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLOR_SERIES[index % COLOR_SERIES.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
            {data?.severities?.map((s, idx) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_SERIES[idx % COLOR_SERIES.length] }}></span>
                <span>{s.name}:</span>
                <span className="font-extrabold text-slate-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid 2: Top Source IPs & Top Destination Ports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Source IPs */}
        <div className="glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">Top Originating Source IPs</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data?.topSourceIPs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="ip" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Destination Port Distribution */}
        <div className="glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">Targeted Destination Ports</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topPorts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="port" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
