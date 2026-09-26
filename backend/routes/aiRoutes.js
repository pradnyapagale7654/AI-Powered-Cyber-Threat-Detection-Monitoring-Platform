const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.post('/analyze-incident', verifyToken, checkRole(['Admin', 'Analyst']), aiController.analyzeIncident);

module.exports = router;
