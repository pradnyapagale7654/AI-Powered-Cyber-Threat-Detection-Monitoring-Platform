const Incident = require('../models/Incident');
const Investigation = require('../models/Investigation');

exports.getIncidents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.severity && req.query.severity !== 'All') {
      filter.severity = req.query.severity;
    }
    if (req.query.threatType && req.query.threatType !== 'All') {
      filter.threatType = req.query.threatType;
    }
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { threatType: searchRegex },
        { sourceIP: searchRegex },
        { destinationIP: searchRegex },
        { notes: searchRegex }
      ];
    }

    const incidents = await Incident.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Incident.countDocuments(filter);

    return res.json({
      incidents,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const investigations = await Investigation.find({ incidentId: incident._id })
      .sort({ timestamp: -1 });

    return res.json({
      incident,
      investigations
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateIncident = async (req, res) => {
  try {
    const { status, notes, priority } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    if (status) incident.status = status;
    if (priority) incident.priority = priority;
    if (notes !== undefined) incident.notes = notes;

    await incident.save();

    // Log automatic investigation entry for state change
    await Investigation.create({
      incidentId: incident._id,
      userId: req.user?.id,
      userName: req.user?.name || 'Security Analyst',
      notes: `Updated incident status to '${incident.status}' with priority '${incident.priority}'. ${notes ? `Notes: ${notes}` : ''}`,
      action: 'Status Updated'
    });

    return res.json({ message: 'Incident updated successfully', incident });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.addInvestigationNote = async (req, res) => {
  try {
    const { notes, action } = req.body;
    const incidentId = req.params.id;

    if (!notes) {
      return res.status(400).json({ error: 'Investigation notes content is required.' });
    }

    const investigation = await Investigation.create({
      incidentId,
      userId: req.user?.id,
      userName: req.user?.name || 'Security Analyst',
      notes,
      action: action || 'Note Added'
    });

    return res.status(201).json(investigation);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
