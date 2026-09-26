const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

router.get('/summary', verifyToken, dashboardController.getSummary);
router.get('/trends', verifyToken, dashboardController.getTrends);
router.get('/threat-distribution', verifyToken, dashboardController.getThreatDistribution);

module.exports = router;
