const Incident = require('../models/Incident');
const { analyzeIncidentWithAI } = require('../services/aiAnalystService');

exports.analyzeIncident = async (req, res) => {
  try {
    const { incidentId, customQuery } = req.body;

    let incidentData = null;
    if (incidentId) {
      incidentData = await Incident.findById(incidentId);
    }

    if (!incidentData) {
      // Provide demo incident template if no ID was supplied
      incidentData = {
        _id: 'DEMO-INC-101',
        threatType: req.body.threatType || 'Port Scan',
        severity: req.body.severity || 'High',
        riskScore: req.body.riskScore || 78,
        anomalyScore: req.body.anomalyScore || 0.89,
        sourceIP: req.body.sourceIP || '198.51.100.42',
        destinationIP: req.body.destinationIP || '10.0.0.15',
        sourcePort: req.body.sourcePort || 51420,
        destinationPort: req.body.destinationPort || 22,
        protocol: req.body.protocol || 'TCP',
        features: req.body.features || { duration: 0.12, requestRate: 140.0, failedAttempts: 4 }
      };
    }

    const result = await analyzeIncidentWithAI(incidentData, customQuery);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: `AI Analysis service error: ${err.message}` });
  }
};
