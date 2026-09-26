const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const predictThreat = async (eventFeatures) => {
  try {
    const payload = Array.isArray(eventFeatures) ? eventFeatures : [eventFeatures];
    const formattedPayload = payload.map(f => ({
      duration: Number(f.duration || 0.1),
      protocol: String(f.protocol || 'TCP').toUpperCase(),
      source_bytes: Number(f.source_bytes || f.sourceBytes || 100),
      destination_bytes: Number(f.destination_bytes || f.destinationBytes || 100),
      packet_count: Number(f.packet_count || f.packetCount || 10),
      source_port: Number(f.source_port || f.sourcePort || 40000),
      destination_port: Number(f.destination_port || f.destinationPort || 80),
      failed_attempts: Number(f.failed_attempts || f.failedAttempts || 0),
      connection_count: Number(f.connection_count || f.connectionCount || 5),
      request_rate: Number(f.request_rate || f.requestRate || 10.0)
    }));

    const response = await axios.post(`${ML_SERVICE_URL}/predict`, formattedPayload, { timeout: 4000 });
    return Array.isArray(eventFeatures) ? response.data : response.data[0];
  } catch (err) {
    console.warn(`ML Service unavailable at ${ML_SERVICE_URL} (${err.message}). Using fallback heuristic detection...`);
    return Array.isArray(eventFeatures) 
      ? eventFeatures.map(f => fallbackPrediction(f)) 
      : fallbackPrediction(eventFeatures);
  }
};

const fallbackPrediction = (f) => {
  const duration = Number(f.duration || 0.1);
  const failedAttempts = Number(f.failed_attempts || f.failedAttempts || 0);
  const connCount = Number(f.connection_count || f.connectionCount || 1);
  const reqRate = Number(f.request_rate || f.requestRate || 5.0);
  const dstPort = Number(f.destination_port || f.destinationPort || 80);

  let threatType = 'Normal';
  let isAnomaly = false;
  let anomalyScore = 0.12;

  if (failedAttempts >= 5) {
    threatType = 'Brute Force';
    isAnomaly = true;
    anomalyScore = 0.88;
  } else if (reqRate > 300 || connCount > 200) {
    threatType = 'DoS';
    isAnomaly = true;
    anomalyScore = 0.94;
  } else if (connCount > 35 && duration < 0.5) {
    threatType = 'Port Scan';
    isAnomaly = true;
    anomalyScore = 0.79;
  } else if (reqRate > 50 && [80, 443, 8080].includes(dstPort)) {
    threatType = 'Bot Activity';
    isAnomaly = true;
    anomalyScore = 0.72;
  } else if (failedAttempts > 0 || reqRate > 80) {
    threatType = 'Suspicious Traffic';
    isAnomaly = true;
    anomalyScore = 0.65;
  }

  let riskScore = 15;
  let severity = 'Low';

  if (isAnomaly) {
    if (threatType === 'DoS' || threatType === 'Brute Force') {
      riskScore = Math.min(98, Math.floor(anomalyScore * 100 + failedAttempts * 2));
    } else {
      riskScore = Math.min(85, Math.floor(anomalyScore * 90));
    }
  }

  if (riskScore >= 75) severity = 'Critical';
  else if (riskScore >= 50) severity = 'High';
  else if (riskScore >= 25) severity = 'Medium';
  else severity = 'Low';

  return {
    prediction: isAnomaly ? 'anomaly' : 'normal',
    anomaly_score: anomalyScore,
    threat_type: threatType,
    confidence: 0.85,
    risk_score: riskScore,
    severity: severity,
    contributing_factors: isAnomaly 
      ? [`Pattern rule matched: ${threatType}`, `Risk Score ${riskScore}`] 
      : ['Baseline operational traffic']
  };
};

module.exports = { predictThreat };
