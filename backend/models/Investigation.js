const mongoose = require('mongoose');

const investigationSchema = new mongoose.Schema({
  incident: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  analyst: { type: String, default: 'Pradn (Admin)' },
  userName: { type: String, default: 'Pradn (Admin)' },
  notes: { type: String, required: true },
  actions: [String],
  action: { type: String, default: 'Note Added' },
  status: { type: String, default: 'Investigating' },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Investigation', investigationSchema);
