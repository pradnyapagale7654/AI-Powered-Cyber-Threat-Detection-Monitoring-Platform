import React from 'react';
import { Settings as SettingsIcon, User, Bell, Bot, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-600" />
          System & Analyst Configuration
        </h2>
        <p className="text-xs text-slate-500">Manage user profile, monitoring parameters, and AI integration status</p>
      </div>

      {/* Profile Section */}
      <div className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          Analyst Profile Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 border rounded-xl">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Full Name</span>
            <span className="font-extrabold text-slate-900 text-sm">{user?.name || 'Security Analyst'}</span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-xl">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Email Address</span>
            <span className="font-semibold text-slate-800">{user?.email || 'analyst@cybershield.ai'}</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-emerald-700 block text-[10px] uppercase font-bold">Assigned Role</span>
            <span className="font-extrabold text-emerald-800 uppercase">{user?.role || 'Analyst'}</span>
          </div>
        </div>
      </div>

      {/* Monitoring Preferences */}
      <div className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          Monitoring & Telemetry Settings
        </h3>

        <div className="space-y-3 text-xs font-semibold text-slate-700">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-900">Real-Time Socket Stream</p>
              <p className="text-[11px] text-slate-500 font-normal">Push live network events directly to active dashboard</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 rounded" />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-900">High Severity Sound Alerts</p>
              <p className="text-[11px] text-slate-500 font-normal">Audible notifications for Critical security incidents</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 rounded" />
          </div>
        </div>
      </div>

      {/* AI Provider Configuration Status */}
      <div className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bot className="w-4 h-4 text-violet-600" />
          AI Security Analyst Configuration Status
        </h3>

        <div className="p-4 bg-slate-50 border rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">LLM Provider:</span>
            <span className="font-bold text-slate-900">Google Gemini API (gemini-1.5-flash)</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-700">API Key Status:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Fallback Heuristic Engine Active (Set GEMINI_API_KEY in backend .env to activate Google LLM)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
