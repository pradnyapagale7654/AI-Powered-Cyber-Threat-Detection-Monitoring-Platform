const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/', verifyToken, incidentController.getIncidents);
router.get('/:id', verifyToken, incidentController.getIncidentById);
router.patch('/:id', verifyToken, checkRole(['Admin', 'Analyst']), incidentController.updateIncident);
router.post('/:id/investigations', verifyToken, checkRole(['Admin', 'Analyst']), incidentController.addInvestigationNote);

module.exports = router;
