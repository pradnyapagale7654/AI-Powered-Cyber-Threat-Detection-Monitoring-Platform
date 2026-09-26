const NetworkEvent = require('../models/NetworkEvent');
const Incident = require('../models/Incident');

const getThreatSummary = async () => {
  const totalEvents = await NetworkEvent.countDocuments();
  const threatsDetected = await NetworkEvent.countDocuments({ prediction: 'anomaly' });
  const activeIncidents = await Incident.countDocuments({ status: { $in: ['New', 'Investigating', 'open', 'investigating'] } });
  const criticalAlerts = await Incident.countDocuments({ severity: 'Critical' });

  const avgRiskResult = await NetworkEvent.aggregate([
    { $group: { _id: null, avgRisk: { $avg: '$riskScore' } } }
  ]);
  const averageRiskScore = avgRiskResult.length > 0 ? Math.round(avgRiskResult[0].avgRisk) : 0;

  return {
    totalEvents,
    threatsDetected,
    activeIncidents,
    criticalAlerts,
    anomaliesDetected: threatsDetected,
    averageRiskScore
  };
};

module.exports = { getThreatSummary };
