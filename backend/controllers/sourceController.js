const NetworkEvent = require('../models/NetworkEvent');
const Incident = require('../models/Incident');

exports.getSources = async (req, res) => {
  try {
    const sources = await NetworkEvent.aggregate([
      {
        $group: {
          _id: "$sourceIP",
          totalEvents: { $sum: 1 },
          anomaliesCount: {
            $sum: { $cond: [{ $eq: ["$prediction", "anomaly"] }, 1, 0] }
          },
          avgRiskScore: { $avg: "$riskScore" },
          maxRiskScore: { $max: "$riskScore" },
          lastSeen: { $max: "$timestamp" }
        }
      },
      { $sort: { anomaliesCount: -1, totalEvents: -1 } }
    ]);

    const formattedSources = await Promise.all(
      sources.map(async s => {
        let maxSeverity = 'Low';
        if (s.maxRiskScore >= 75) maxSeverity = 'Critical';
        else if (s.maxRiskScore >= 50) maxSeverity = 'High';
        else if (s.maxRiskScore >= 25) maxSeverity = 'Medium';

        const incidentCount = await Incident.countDocuments({ sourceIP: s._id });

        return {
          ip: s._id,
          totalEvents: s.totalEvents,
          anomaliesCount: s.anomaliesCount,
          maxSeverity,
          avgRiskScore: Math.round(s.avgRiskScore || 0),
          lastSeen: s.lastSeen,
          incidentCount
        };
      })
    );

    return res.json(formattedSources);
  } catch (err) {
    return res.status(500).json({ error: `Source IP Analysis error: ${err.message}` });
  }
};
