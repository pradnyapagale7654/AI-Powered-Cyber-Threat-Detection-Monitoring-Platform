const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/', verifyToken, alertController.getAlerts);
router.patch('/:id', verifyToken, checkRole(['Admin', 'Analyst']), alertController.updateAlert);

module.exports = router;
