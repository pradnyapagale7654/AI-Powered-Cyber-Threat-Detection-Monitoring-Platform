const multer = require('multer');
const csv = require('csv-parser');
const stream = require('stream');
const NetworkEvent = require('../models/NetworkEvent');
const Incident = require('../models/Incident');
const Alert = require('../models/Alert');
const { predictThreat } = require('../services/mlService');
const { broadcastEvent } = require('../sockets/socketHandler');

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB CSV limit

exports.uploadMiddleware = upload.single('file');

exports.analyzeSingle = async (req, res) => {
  try {
    const rawData = req.body;

    const features = {
      duration: Number(rawData.duration || 0.1),
      protocol: String(rawData.protocol || 'TCP').toUpperCase(),
      sourceBytes: Number(rawData.source_bytes || rawData.sourceBytes || 100),
      destinationBytes: Number(rawData.destination_bytes || rawData.destinationBytes || 100),
      packetCount: Number(rawData.packet_count || rawData.packetCount || 10),
      sourcePort: Number(rawData.source_port || rawData.sourcePort || 44332),
      destinationPort: Number(rawData.destination_port || rawData.destinationPort || 80),
      failedAttempts: Number(rawData.failed_attempts || rawData.failedAttempts || 0),
      connectionCount: Number(rawData.connection_count || rawData.connectionCount || 5),
      requestRate: Number(rawData.request_rate || rawData.requestRate || 10.0)
    };

    const mlResult = await predictThreat(features);

    const srcIP = rawData.sourceIP || rawData.source_ip || '192.168.1.' + Math.floor(Math.random() * 200 + 10);
    const dstIP = rawData.destinationIP || rawData.destination_ip || '10.0.0.5';

    const newEvent = await NetworkEvent.create({
      timestamp: new Date(),
      sourceIP: srcIP,
      destinationIP: dstIP,
      sourcePort: features.sourcePort,
      destinationPort: features.destinationPort,
      protocol: features.protocol,
      features,
      prediction: mlResult.prediction,
      anomalyScore: mlResult.anomaly_score || mlResult.anomalyScore,
      threatType: mlResult.threat_type || mlResult.threatType,
      riskScore: mlResult.risk_score || mlResult.riskScore,
      severity: mlResult.severity
    });

    broadcastEvent('live-event', newEvent);

    let incident = null;
    if (newEvent.prediction === 'anomaly') {
      incident = await Incident.create({
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
        notes: `Analyzed event flagged ${newEvent.threatType}`
      });

      broadcastEvent('new-incident', incident);

      if (newEvent.severity === 'High' || newEvent.severity === 'Critical') {
        const alert = await Alert.create({
          incidentId: incident._id,
          message: `${newEvent.severity} Threat Alert: ${newEvent.threatType} from ${newEvent.sourceIP}`,
          threatType: newEvent.threatType,
          severity: newEvent.severity,
          riskScore: newEvent.riskScore,
          status: 'Active'
        });
        broadcastEvent('new-alert', alert);
      }
    }

    return res.json({
      event: newEvent,
      mlResult,
      incidentCreated: !!incident
    });
  } catch (err) {
    return res.status(500).json({ error: `Analysis failed: ${err.message}` });
  }
};

exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select a valid CSV file to upload.' });
    }

    const records = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv())
      .on('data', (row) => records.push(row))
      .on('end', async () => {
        if (records.length === 0) {
          return res.status(400).json({ error: 'Uploaded CSV file contains no data rows.' });
        }

        const parsedPayloads = records.map((row, idx) => {
          return {
            duration: Number(row.duration || row.dur || 0.1),
            protocol: String(row.protocol || row.proto || 'TCP').toUpperCase(),
            source_bytes: Number(row.source_bytes || row.src_bytes || row.bytes_in || 100),
            destination_bytes: Number(row.destination_bytes || row.dst_bytes || row.bytes_out || 100),
            packet_count: Number(row.packet_count || row.packets || row.pkt_cnt || 10),
            source_port: Number(row.source_port || row.src_port || row.sport || 40000 + (idx % 1000)),
            destination_port: Number(row.destination_port || row.dst_port || row.dport || 80),
            failed_attempts: Number(row.failed_attempts || row.failed_logins || 0),
            connection_count: Number(row.connection_count || row.count || 5),
            request_rate: Number(row.request_rate || row.rate || 10.0),
            source_ip: row.source_ip || row.src_ip || `192.168.1.${(idx % 250) + 1}`,
            destination_ip: row.destination_ip || row.dst_ip || `10.0.0.${(idx % 20) + 1}`
          };
        });

        const mlResults = await predictThreat(parsedPayloads);

        const eventsToCreate = parsedPayloads.map((p, idx) => {
          const resItem = Array.isArray(mlResults) ? mlResults[idx] : mlResults;
          return {
            timestamp: new Date(),
            sourceIP: p.source_ip,
            destinationIP: p.destination_ip,
            sourcePort: p.source_port,
            destinationPort: p.destination_port,
            protocol: p.protocol,
            features: {
              duration: p.duration,
              sourceBytes: p.source_bytes,
              destinationBytes: p.destination_bytes,
              packetCount: p.packet_count,
              failedAttempts: p.failed_attempts,
              connectionCount: p.connection_count,
              requestRate: p.request_rate
            },
            prediction: resItem.prediction || 'normal',
            anomalyScore: resItem.anomaly_score || resItem.anomalyScore || 0.1,
            threatType: resItem.threat_type || resItem.threatType || 'Normal',
            riskScore: resItem.risk_score || resItem.riskScore || 10,
            severity: resItem.severity || 'Low'
          };
        });

        const createdEvents = await NetworkEvent.insertMany(eventsToCreate);
        const anomalies = createdEvents.filter(e => e.prediction === 'anomaly');

        // Create incidents for detected anomalies
        for (const ev of anomalies) {
          const inc = await Incident.create({
            eventId: ev._id,
            threatType: ev.threatType,
            severity: ev.severity,
            riskScore: ev.riskScore,
            status: 'New',
            priority: ev.severity === 'Critical' ? 'P1' : (ev.severity === 'High' ? 'P2' : 'P3'),
            sourceIP: ev.sourceIP,
            destinationIP: ev.destinationIP,
            sourcePort: ev.sourcePort,
            destinationPort: ev.destinationPort,
            protocol: ev.protocol,
            anomalyScore: ev.anomalyScore,
            features: ev.features,
            notes: `CSV Batch Flagged ${ev.threatType}`
          });
          broadcastEvent('new-incident', inc);
        }

        return res.json({
          message: `Successfully processed ${records.length} CSV records.`,
          totalRecords: records.length,
          anomaliesDetected: anomalies.length,
          anomalies: anomalies.slice(0, 50) // top 50 anomalies preview
        });
      });
  } catch (err) {
    return res.status(500).json({ error: `CSV Upload error: ${err.message}` });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.prediction) filter.prediction = req.query.prediction;
    if (req.query.threatType) filter.threatType = req.query.threatType;

    const events = await NetworkEvent.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await NetworkEvent.countDocuments(filter);

    return res.json({
      events,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
