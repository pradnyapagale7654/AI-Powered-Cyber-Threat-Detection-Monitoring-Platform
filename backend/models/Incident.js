const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: String,
  description: String,
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'NetworkEvent' },
  threatType: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  riskScore: { type: Number, required: true },
  status: { type: String, enum: ['New', 'Investigating', 'Resolved', 'False Positive', 'open', 'investigating', 'resolved', 'closed'], default: 'New' },
  priority: { type: String, enum: ['P1', 'P2', 'P3', 'P4'], default: 'P2' },
  sourceIP: String,
  destinationIP: String,
  sourcePort: Number,
  destinationPort: Number,
  protocol: String,
  assignedTo: { type: String, default: 'Unassigned' },
  detectedAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  anomalyScore: Number,
  features: Object,
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

incidentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (!this.title) {
    this.title = `${this.severity || 'Security'} Flag: ${this.threatType || 'Threat'} from ${this.sourceIP || 'Host'}`;
  }
  next();
});

module.exports = mongoose.model('Incident', incidentSchema);
