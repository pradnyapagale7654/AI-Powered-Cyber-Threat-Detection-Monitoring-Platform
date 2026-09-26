const mongoose = require('mongoose');

const networkEventSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  sourceIP: { type: String, required: true },
  destinationIP: { type: String, required: true },
  sourcePort: { type: Number, default: 80 },
  destinationPort: { type: Number, default: 80 },
  protocol: { type: String, default: 'TCP' },
  packetCount: { type: Number, default: 10 },
  packetSize: { type: Number, default: 512 },
  flowDuration: { type: Number, default: 0.1 },
  bytesTransferred: { type: Number, default: 1024 },
  packetsPerSecond: { type: Number, default: 10 },
  bytesPerSecond: { type: Number, default: 1024 },
  prediction: { type: String, enum: ['normal', 'anomaly'], default: 'normal' },
  isAnomaly: { type: Boolean, default: false },
  anomalyScore: { type: Number, default: 0.0 },
  threatType: { type: String, default: 'Normal' },
  confidence: { type: Number, default: 0.85 },
  riskScore: { type: Number, default: 0 },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  status: { type: String, default: 'processed' },
  contributingFactors: [String],
  features: Object
});

module.exports = mongoose.model('NetworkEvent', networkEventSchema);
