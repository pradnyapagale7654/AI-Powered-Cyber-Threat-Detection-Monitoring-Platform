const Alert = require('../models/Alert');
const Incident = require('../models/Incident');

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json(alerts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateAlert = async (req, res) => {
  try {
    const { read, status } = req.body;
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (read !== undefined) alert.read = read;
    if (status) alert.status = status;

    await alert.save();
    return res.json(alert);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
