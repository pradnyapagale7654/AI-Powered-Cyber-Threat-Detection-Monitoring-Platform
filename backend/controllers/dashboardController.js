const NetworkEvent = require('../models/NetworkEvent');
const Incident = require('../models/Incident');

exports.getSummary = async (req, res) => {
  try {
    const totalRequests = await NetworkEvent.countDocuments();
    const activeThreats = await Incident.countDocuments({ status: { $in: ['New', 'Investigating'] } });
    const anomaliesDetected = await NetworkEvent.countDocuments({ prediction: 'anomaly' });
    const criticalIncidents = await Incident.countDocuments({ severity: 'Critical' });

    const avgRiskResult = await NetworkEvent.aggregate([
      { $group: { _id: null, avgRisk: { $avg: '$riskScore' } } }
    ]);

    const averageRiskScore = avgRiskResult.length > 0 ? Math.round(avgRiskResult[0].avgRisk) : 0;

    return res.json({
      totalRequests,
      activeThreats,
      anomaliesDetected,
      criticalIncidents,
      averageRiskScore
    });
  } catch (err) {
    return res.status(500).json({ error: `Error fetching dashboard summary: ${err.message}` });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '24h';
    let dateLimit = new Date();

    if (timeframe === '7d') {
      dateLimit.setDate(dateLimit.getDate() - 7);
    } else if (timeframe === '30d') {
      dateLimit.setDate(dateLimit.getDate() - 30);
    } else {
      dateLimit.setHours(dateLimit.getHours() - 24);
    }

    const events = await NetworkEvent.find({ timestamp: { $gte: dateLimit } })
      .sort({ timestamp: 1 });

    // Group events into bucket intervals
    const buckets = {};
    events.forEach(ev => {
      let key;
      const d = new Date(ev.timestamp);
      if (timeframe === '24h') {
        key = `${String(d.getHours()).padStart(2, '0')}:00`;
      } else {
        key = `${d.getMonth() + 1}/${d.getDate()}`;
      }

      if (!buckets[key]) {
        buckets[key] = { time: key, normal: 0, suspicious: 0, critical: 0 };
      }

      if (ev.severity === 'Critical') {
        buckets[key].critical++;
      } else if (ev.prediction === 'anomaly') {
        buckets[key].suspicious++;
      } else {
        buckets[key].normal++;
      }
    });

    const trendData = Object.values(buckets);

    return res.json({ timeframe, trendData });
  } catch (err) {
    return res.status(500).json({ error: `Error fetching trends: ${err.message}` });
  }
};

exports.getThreatDistribution = async (req, res) => {
  try {
    const distribution = await NetworkEvent.aggregate([
      { $group: { _id: '$threatType', count: { $sum: 1 } } }
    ]);

    const formatted = distribution.map(item => ({
      name: item._id || 'Unknown',
      count: item.count
    }));

    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: `Error fetching threat distribution: ${err.message}` });
  }
};
