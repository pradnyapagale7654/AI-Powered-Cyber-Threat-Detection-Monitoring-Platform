const bcrypt = require('bcryptjs');
const User = require('../models/User');
const NetworkEvent = require('../models/NetworkEvent');
const Incident = require('../models/Incident');
const Alert = require('../models/Alert');

const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    // Check if Pradnya Pagale admin user exists
    const adminUser = await User.findOne({ email: 'pradnyapagale7654@gmail.com' });

    if (!adminUser) {
      console.log('Seeding Pradnya Pagale admin user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await User.create([
        { name: 'Pradnya Pagale (Admin)', email: 'pradnyapagale7654@gmail.com', password: hashedPassword, role: 'Admin' },
        { name: 'SOC Administrator', email: 'admin@cybershield.ai', password: hashedPassword, role: 'Admin' },
        { name: 'Lead Security Analyst', email: 'analyst@cybershield.ai', password: hashedPassword, role: 'Analyst' },
        { name: 'Security Viewer', email: 'viewer@cybershield.ai', password: hashedPassword, role: 'Viewer' }
      ]);
      console.log('Admin user created successfully (pradnyapagale7654@gmail.com / password123).');
    }

    const eventCount = await NetworkEvent.countDocuments();
    if (eventCount < 10) {
      console.log('Seeding initial synthetic SOC network events and incidents...');
      
      const sampleIPs = [
        '192.168.1.105', '10.0.4.18', '172.16.0.45', '198.51.100.14',
        '203.0.113.88', '192.168.2.220', '10.0.12.90', '185.220.101.5'
      ];

      const threatTypes = ['Normal', 'Port Scan', 'Brute Force', 'DoS', 'Bot Activity', 'Suspicious Traffic'];
      const protocols = ['TCP', 'UDP', 'ICMP'];

      const eventsToCreate = [];
      const now = Date.now();

      for (let i = 0; i < 40; i++) {
        const threat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
        const isAnomaly = threat !== 'Normal';
        const srcIP = sampleIPs[Math.floor(Math.random() * sampleIPs.length)];
        const dstIP = '10.0.0.' + Math.floor(Math.random() * 20 + 1);
        const protocol = protocols[Math.floor(Math.random() * protocols.length)];
        
        let anomalyScore = isAnomaly ? Number((0.65 + Math.random() * 0.3).toFixed(2)) : 0.15;
        let riskScore = isAnomaly ? Math.floor(anomalyScore * 90 + Math.random() * 10) : Math.floor(Math.random() * 20);
        
        let severity = 'Low';
        if (riskScore >= 75) severity = 'Critical';
        else if (riskScore >= 50) severity = 'High';
        else if (riskScore >= 25) severity = 'Medium';

        const timeOffset = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
        const timestamp = new Date(now - timeOffset);

        eventsToCreate.push({
          timestamp,
          sourceIP: srcIP,
          destinationIP: dstIP,
          sourcePort: Math.floor(Math.random() * 50000 + 1025),
          destinationPort: [80, 443, 22, 21, 3389, 8080][Math.floor(Math.random() * 6)],
          protocol,
          features: {
            duration: Number((Math.random() * 5).toFixed(2)),
            sourceBytes: Math.floor(Math.random() * 5000 + 100),
            destinationBytes: Math.floor(Math.random() * 15000 + 100),
            packetCount: Math.floor(Math.random() * 100 + 5),
            failedAttempts: threat === 'Brute Force' ? Math.floor(Math.random() * 15 + 5) : 0,
            connectionCount: threat === 'DoS' || threat === 'Port Scan' ? Math.floor(Math.random() * 150 + 30) : 5,
            requestRate: threat === 'DoS' ? Math.floor(Math.random() * 1000 + 200) : Number((Math.random() * 20 + 1).toFixed(1))
          },
          prediction: isAnomaly ? 'anomaly' : 'normal',
          anomalyScore,
          threatType: threat,
          riskScore,
          severity
        });
      }

      const createdEvents = await NetworkEvent.insertMany(eventsToCreate);

      const anomalousEvents = createdEvents.filter(e => e.prediction === 'anomaly');
      for (const ev of anomalousEvents) {
        const statuses = ['New', 'Investigating', 'Resolved', 'False Positive'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const incident = await Incident.create({
          eventId: ev._id,
          threatType: ev.threatType,
          severity: ev.severity,
          riskScore: ev.riskScore,
          status,
          priority: ev.severity === 'Critical' ? 'P1' : (ev.severity === 'High' ? 'P2' : 'P3'),
          sourceIP: ev.sourceIP,
          destinationIP: ev.destinationIP,
          sourcePort: ev.sourcePort,
          destinationPort: ev.destinationPort,
          protocol: ev.protocol,
          anomalyScore: ev.anomalyScore,
          features: ev.features,
          notes: `Auto-generated incident for ${ev.threatType} telemetry from ${ev.sourceIP}`,
          createdAt: ev.timestamp
        });

        if (ev.severity === 'High' || ev.severity === 'Critical') {
          await Alert.create({
            incidentId: incident._id,
            message: `High risk ${ev.threatType} signature detected from ${ev.sourceIP}`,
            threatType: ev.threatType,
            severity: ev.severity,
            riskScore: ev.riskScore,
            read: Math.random() > 0.5,
            status: status === 'Resolved' ? 'Resolved' : 'Active',
            createdAt: ev.timestamp
          });
        }
      }
      console.log(`Seeded ${createdEvents.length} network events and ${anomalousEvents.length} incidents.`);
    }
  } catch (err) {
    console.error('Error seeding initial data:', err.message);
  }
};

module.exports = { seedInitialData };
