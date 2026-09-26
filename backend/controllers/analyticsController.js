const NetworkEvent = require('../models/NetworkEvent');

exports.getAnalytics = async (req, res) => {
  try {
    // 1. Threat count by day
    const threatsByDay = await NetworkEvent.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          total: { $sum: 1 },
          anomalies: {
            $sum: { $cond: [{ $eq: ["$prediction", "anomaly"] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Threat type distribution
    const threatTypes = await NetworkEvent.aggregate([
      { $group: { _id: "$threatType", count: { $sum: 1 } } }
    ]);

    // 3. Severity distribution
    const severities = await NetworkEvent.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } }
    ]);

    // 4. Top source IPs
    const topSourceIPs = await NetworkEvent.aggregate([
      { $group: { _id: "$sourceIP", count: { $sum: 1 }, avgRisk: { $avg: "$riskScore" } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 5. Top destination ports
    const topPorts = await NetworkEvent.aggregate([
      { $group: { _id: "$destinationPort", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // 6. Protocol distribution
    const protocols = await NetworkEvent.aggregate([
      { $group: { _id: "$protocol", count: { $sum: 1 } } }
    ]);

    // 7. Averages
    const averages = await NetworkEvent.aggregate([
      {
        $group: {
          _id: null,
          avgAnomalyScore: { $avg: "$anomalyScore" },
          avgRiskScore: { $avg: "$riskScore" }
        }
      }
    ]);

    return res.json({
      threatsByDay: threatsByDay.map(d => ({ date: d._id, total: d.total, anomalies: d.anomalies })),
      threatTypes: threatTypes.map(t => ({ name: t._id || 'Unknown', count: t.count })),
      severities: severities.map(s => ({ name: s._id || 'Low', count: s.count })),
      topSourceIPs: topSourceIPs.map(ip => ({ ip: ip._id, count: ip.count, avgRisk: Math.round(ip.avgRisk || 0) })),
      topPorts: topPorts.map(p => ({ port: `Port ${p._id}`, count: p.count })),
      protocols: protocols.map(pr => ({ name: pr._id || 'TCP', count: pr.count })),
      averages: averages.length > 0 ? {
        avgAnomalyScore: Number((averages[0].avgAnomalyScore || 0).toFixed(3)),
        avgRiskScore: Math.round(averages[0].avgRiskScore || 0)
      } : { avgAnomalyScore: 0, avgRiskScore: 0 }
    });
  } catch (err) {
    return res.status(500).json({ error: `Analytics error: ${err.message}` });
  }
};
