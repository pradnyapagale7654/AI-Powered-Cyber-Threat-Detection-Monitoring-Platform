const express = require('express');
const router = express.Router();
const sourceController = require('../controllers/sourceController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, sourceController.getSources);

module.exports = router;
