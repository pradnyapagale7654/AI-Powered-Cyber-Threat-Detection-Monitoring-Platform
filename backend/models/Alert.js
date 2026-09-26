const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: String,
  message: { type: String, required: true },
  threatType: { type: String, default: 'Anomaly' },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  type: { type: String, default: 'Security Alert' },
  sourceIP: String,
  riskScore: { type: Number, default: 50 },
  read: { type: Boolean, default: false },
  status: { type: String, default: 'Active' },
  relatedIncident: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
  metadata: Object,
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
