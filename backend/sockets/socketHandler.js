const NetworkEvent = require('../models/NetworkEvent');
const Incident = require('../models/Incident');
const Alert = require('../models/Alert');
const { predictThreat } = require('../services/mlService');

let ioInstance = null;
let simulationInterval = null;

const initSocketIO = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Client connected to CyberShield Socket.IO stream: ${socket.id}`);

    socket.emit('connection-status', { connected: true, socketId: socket.id });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Start background simulation engine if not already running
  startBackgroundSimulator();
};

const broadcastEvent = (eventName, data) => {
  if (ioInstance) {
    ioInstance.emit(eventName, data);
  }
};

const startBackgroundSimulator = () => {
  if (simulationInterval) return;

  const sampleIPs = ['192.168.1.102', '10.0.8.44', '172.16.4.19', '185.220.101.8', '203.0.113.195'];
  const protocols = ['TCP', 'UDP', 'ICMP'];
  const dstPorts = [80, 443, 22, 21, 3389, 8080];

  simulationInterval = setInterval(async () => {
    try {
      if (!ioInstance || ioInstance.sockets.sockets.size === 0) return;

      const srcIP = sampleIPs[Math.floor(Math.random() * sampleIPs.length)];
      const dstIP = '10.0.0.' + Math.floor(Math.random() * 10 + 1);
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];
      const dstPort = dstPorts[Math.floor(Math.random() * dstPorts.length)];

      const isSimulatedAnomaly = Math.random() < 0.25;

      const features = {
        duration: Number((Math.random() * (isSimulatedAnomaly ? 0.2 : 4.0) + 0.05).toFixed(2)),
        sourceBytes: isSimulatedAnomaly ? Math.floor(Math.random() * 50 + 20) : Math.floor(Math.random() * 2000 + 500),
        destinationBytes: isSimulatedAnomaly ? Math.floor(Math.random() * 40) : Math.floor(Math.random() * 8000 + 1000),
        packetCount: isSimulatedAnomaly ? Math.floor(Math.random() * 150 + 20) : Math.floor(Math.random() * 30 + 5),
        failedAttempts: isSimulatedAnomaly ? Math.floor(Math.random() * 8) : 0,
        connectionCount: isSimulatedAnomaly ? Math.floor(Math.random() * 80 + 10) : Math.floor(Math.random() * 8 + 1),
        requestRate: isSimulatedAnomaly ? Number((Math.random() * 250 + 30).toFixed(1)) : Number((Math.random() * 15 + 1).toFixed(1)),
        sourcePort: Math.floor(Math.random() * 40000 + 10000),
        destinationPort: dstPort,
        protocol
      };

      const mlRes = await predictThreat(features);

      const newEvent = await NetworkEvent.create({
        timestamp: new Date(),
        sourceIP: srcIP,
        destinationIP: dstIP,
        sourcePort: features.sourcePort,
        destinationPort: features.destinationPort,
        protocol,
        features,
        prediction: mlRes.prediction,
        anomalyScore: mlRes.anomaly_score || mlRes.anomalyScore,
        threatType: mlRes.threat_type || mlRes.threatType,
        riskScore: mlRes.risk_score || mlRes.riskScore,
        severity: mlRes.severity
      });

      broadcastEvent('live-event', newEvent);

      if (newEvent.prediction === 'anomaly') {
        const incident = await Incident.create({
          eventId: newEvent._id,
          threatType: newEvent.threatType,
          severity: newEvent.severity,
          riskScore: newEvent.riskScore,
          status: 'New',
          priority: newEvent.severity === 'Critical' ? 'P1' : (newEvent.severity === 'High' ? 'P2' : 'P3'),
          sourceIP: newEvent.sourceIP,
          destinationIP: newEvent.destinationIP,
          sourcePort: newEvent.sourcePort,
          destinationPort: newEvent.destinationPort,
          protocol: newEvent.protocol,
          anomalyScore: newEvent.anomalyScore,
          features: newEvent.features,
          notes: `Real-time stream flagged ${newEvent.threatType} telemetry from ${newEvent.sourceIP}`
        });

        broadcastEvent('new-incident', incident);

        if (newEvent.severity === 'High' || newEvent.severity === 'Critical') {
          const alert = await Alert.create({
            incidentId: incident._id,
            message: `Real-time Alert: ${newEvent.severity} ${newEvent.threatType} from ${newEvent.sourceIP}`,
            threatType: newEvent.threatType,
            severity: newEvent.severity,
            riskScore: newEvent.riskScore,
            status: 'Active'
          });

          broadcastEvent('new-alert', alert);
        }
      }
    } catch (err) {
      // Quiet background exception log
    }
  }, 6000);
};

module.exports = { initSocketIO, broadcastEvent };
