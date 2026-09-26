import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Play, Cpu, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

const NetworkAnalysis = () => {
  const [activeTab, setActiveTab] = useState('csv'); // 'csv' or 'manual'
  const [file, setFile] = useState(null);
  const [csvResult, setCsvResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Manual single event form state
  const [manualForm, setManualForm] = useState({
    duration: 0.15,
    protocol: 'TCP',
    source_bytes: 450,
    destination_bytes: 120,
    packet_count: 12,
    source_port: 54321,
    destination_port: 22,
    failed_attempts: 6,
    connection_count: 45,
    request_rate: 85.0,
    sourceIP: '198.51.100.99',
    destinationIP: '10.0.0.5'
  });
  const [singleResult, setSingleResult] = useState(null);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setCsvResult(null);
      setError('');
    }
  };

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      return setError('Please select a CSV file first.');
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/network/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCsvResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'CSV upload processing failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSingleResult(null);

    try {
      const res = await api.post('/network/analyze', manualForm);
      setSingleResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-card rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            Network Traffic Analyzer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Upload network log files (CSV) or input raw packet parameters for ML threat evaluation</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'csv' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CSV Batch Upload
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'manual' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manual Event Input
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CSV Batch Upload Tab */}
      {activeTab === 'csv' && (
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-8 border border-slate-200/80 shadow-xs text-center border-dashed border-2 border-slate-300 hover:border-emerald-500 transition-colors">
            <UploadCloud className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Select or Drag CSV Traffic Log</h3>
            <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
              Supports standard column headers: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">duration</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">protocol</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">source_bytes</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">packet_count</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">request_rate</code>.
            </p>

            <form onSubmit={handleCSVUpload} className="flex flex-col items-center gap-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className="cursor-pointer px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                {file ? file.name : 'Choose CSV File'}
              </label>

              {file && (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Run ML Anomaly Predictions <Play className="w-3.5 h-3.5 fill-current" /></>}
                </button>
              )}
            </form>
          </div>

          {/* CSV Results Breakdown */}
          {csvResult && (
            <div className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    CSV Analysis Complete
                  </h3>
                  <p className="text-xs text-slate-500">{csvResult.message}</p>
                </div>
                <div className="flex gap-4 text-xs font-bold">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-500 block text-[10px] uppercase">Total Records</span>
                    <span className="text-base font-extrabold text-slate-900">{csvResult.totalRecords}</span>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <span className="text-rose-600 block text-[10px] uppercase">Anomalies Detected</span>
                    <span className="text-base font-extrabold text-rose-700">{csvResult.anomaliesDetected}</span>
                  </div>
                </div>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Flagged Security Anomalies Preview</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-3">Source IP</th>
                      <th className="p-3">Destination IP</th>
                      <th className="p-3">Protocol</th>
                      <th className="p-3">Threat Category</th>
                      <th className="p-3">Anomaly Score</th>
                      <th className="p-3">Risk Score</th>
                      <th className="p-3">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {csvResult.anomalies.map((anom, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{anom.sourceIP}</td>
                        <td className="p-3 font-mono text-slate-600">{anom.destinationIP}:{anom.destinationPort}</td>
                        <td className="p-3 font-bold text-teal-600">{anom.protocol}</td>
                        <td className="p-3 font-semibold text-slate-800">{anom.threatType}</td>
                        <td className="p-3 font-mono">{Number(anom.anomalyScore).toFixed(2)}</td>
                        <td className="p-3 font-extrabold text-slate-900">{anom.riskScore}%</td>
                        <td className="p-3"><StatusBadge status={anom.severity} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Input Tab */}
      {activeTab === 'manual' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleManualAnalyze} className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Event Feature Parameters
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Source IP</label>
                <input
                  type="text"
                  value={manualForm.sourceIP}
                  onChange={(e) => setManualForm({ ...manualForm, sourceIP: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Destination IP</label>
                <input
                  type="text"
                  value={manualForm.destinationIP}
                  onChange={(e) => setManualForm({ ...manualForm, destinationIP: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Protocol</label>
                <select
                  value={manualForm.protocol}
                  onChange={(e) => setManualForm({ ...manualForm, protocol: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ICMP">ICMP</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Target Port</label>
                <input
                  type="number"
                  value={manualForm.destination_port}
                  onChange={(e) => setManualForm({ ...manualForm, destination_port: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Duration (sec)</label>
                <input
                  type="number"
                  step="0.01"
                  value={manualForm.duration}
                  onChange={(e) => setManualForm({ ...manualForm, duration: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Request Rate (req/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={manualForm.request_rate}
                  onChange={(e) => setManualForm({ ...manualForm, request_rate: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Failed Attempts</label>
                <input
                  type="number"
                  value={manualForm.failed_attempts}
                  onChange={(e) => setManualForm({ ...manualForm, failed_attempts: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Connection Count</label>
                <input
                  type="number"
                  value={manualForm.connection_count}
                  onChange={(e) => setManualForm({ ...manualForm, connection_count: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Run ML Prediction <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Prediction Result Display */}
          <div className="glass-card rounded-xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">ML Prediction Results</h3>

            {singleResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-bold block uppercase">Prediction Result</span>
                    <span className="text-lg font-extrabold text-slate-900 capitalize">{singleResult.mlResult?.prediction}</span>
                  </div>
                  <StatusBadge status={singleResult.mlResult?.severity} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border rounded-lg">
                    <span className="text-slate-500 block">Threat Classification</span>
                    <span className="font-extrabold text-slate-900">{singleResult.mlResult?.threat_type}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-lg">
                    <span className="text-slate-500 block">Risk Score</span>
                    <span className="font-extrabold text-slate-900 text-base">{singleResult.mlResult?.risk_score}/100</span>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-lg">
                    <span className="text-slate-500 block">Anomaly Index</span>
                    <span className="font-mono font-bold text-slate-900">{singleResult.mlResult?.anomaly_score}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-lg">
                    <span className="text-slate-500 block">Confidence Score</span>
                    <span className="font-mono font-bold text-slate-900">{singleResult.mlResult?.confidence}</span>
                  </div>
                </div>

                {singleResult.mlResult?.contributing_factors && (
                  <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                    <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">Risk Factors</span>
                    <ul className="list-disc list-inside text-xs text-amber-900 space-y-0.5">
                      {singleResult.mlResult.contributing_factors.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Cpu className="w-12 h-12 mb-2 text-slate-300" />
                <p className="text-xs font-semibold">Submit feature parameters to view live ML output</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkAnalysis;
