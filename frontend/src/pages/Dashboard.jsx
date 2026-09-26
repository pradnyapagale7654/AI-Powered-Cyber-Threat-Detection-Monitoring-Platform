import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldAlert, Cpu, AlertTriangle, Gauge, 
  RefreshCw, ChevronRight, PieChart as PieIcon, LineChart as LineIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar 
} from 'recharts';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import MetricCard from '../components/MetricCard';
import LiveStreamTicker from '../components/LiveStreamTicker';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';

const THREAT_COLORS = {
  'Normal': '#10b981',
  'Port Scan': '#f59e0b',
  'Brute Force': '#f97316',
  'DoS': '#f43f5e',
  'Bot Activity': '#8b5cf6',
  'Suspicious Traffic': '#06b6d4',
  'Other Anomaly': '#64748b'
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [timeframe, setTimeframe] = useState('24h');
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  const { liveEvents, isConnected } = useSocket();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [sumRes, trendRes, distRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get(`/dashboard/trends?timeframe=${timeframe}`),
        api.get('/dashboard/threat-distribution')
      ]);

      setSummary(sumRes.data);
      setTrends(trendRes.data.trendData);
      setDistribution(distRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  if (loading) {
    return <LoadingSkeleton count={4} height="h-32" />;
  }

  return (
    <div className="space-y-6">
      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Requests"
          value={summary?.totalRequests?.toLocaleString() || '0'}
          subtext="Processed Network Packets"
          icon={Activity}
          color="emerald"
        />
        <MetricCard
          title="Active Threats"
          value={summary?.activeThreats || 0}
          subtext="Unresolved SOC Incidents"
          icon={ShieldAlert}
          color="amber"
        />
        <MetricCard
          title="Anomalies Detected"
          value={summary?.anomaliesDetected || 0}
          subtext="Flagged ML Outliers"
          icon={Cpu}
          color="sky"
        />
        <MetricCard
          title="Critical Incidents"
          value={summary?.criticalIncidents || 0}
          subtext="High Priority Escalations"
          icon={AlertTriangle}
          color="rose"
        />
        <MetricCard
          title="Average Risk Score"
          value={`${summary?.averageRiskScore || 0}%`}
          subtext="Network Health Severity"
          icon={Gauge}
          color={summary?.averageRiskScore > 50 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Overview Area Chart (2 Cols) */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <LineIcon className="w-4 h-4 text-emerald-600" />
                Threat Activity Timeline
              </h3>
              <p className="text-xs text-slate-500">Normal vs Suspicious vs Critical security events over time</p>
            </div>
            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              {['24h', '7d', '30d'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-md font-bold uppercase transition-all ${
                    timeframe === tf ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="normal" name="Normal Events" stroke="#10b981" fillOpacity={1} fill="url(#colorNormal)" strokeWidth={2} />
                <Area type="monotone" dataKey="suspicious" name="Suspicious" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSuspicious)" strokeWidth={2} />
                <Area type="monotone" dataKey="critical" name="Critical Threats" stroke="#f43f5e" fillOpacity={1} fill="url(#colorCritical)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Distribution Pie Chart (1 Col) */}
        <div className="glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              Threat Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-2">Categorized ML Classification breakdown</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={THREAT_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
            {distribution.slice(0, 6).map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: THREAT_COLORS[d.name] || '#64748b' }}></span>
                <span className="truncate">{d.name}:</span>
                <span className="font-extrabold text-slate-900">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Socket Event Stream */}
      <LiveStreamTicker events={liveEvents} />

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/network-analysis')}
          className="glass-card p-4 rounded-xl border border-slate-200 hover:border-emerald-400 flex items-center justify-between text-left group transition-all"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">Network Traffic Analyzer</h4>
            <p className="text-xs text-slate-500">Upload CSV logs for batch ML threat detection</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => navigate('/incidents')}
          className="glass-card p-4 rounded-xl border border-slate-200 hover:border-emerald-400 flex items-center justify-between text-left group transition-all"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">SOC Incident Queue</h4>
            <p className="text-xs text-slate-500">Investigate, prioritize and resolve active threats</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => navigate('/ai-analyst')}
          className="glass-card p-4 rounded-xl border border-slate-200 hover:border-emerald-400 flex items-center justify-between text-left group transition-all"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">AI Security Analyst</h4>
            <p className="text-xs text-slate-500">Generative explanation of security anomalies</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
