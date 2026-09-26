const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');
const { verifyToken } = require('../middleware/auth');

router.post('/analyze', verifyToken, networkController.analyzeSingle);
router.post('/upload', verifyToken, networkController.uploadMiddleware, networkController.uploadCSV);
router.get('/events', verifyToken, networkController.getEvents);

module.exports = router;
