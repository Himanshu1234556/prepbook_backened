const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Define routes
router.get('/realtime', analyticsController.getRealtimeAnalytics);
router.get('/longterm', analyticsController.getLongTermAnalytics);
router.get('/users/top', analyticsController.getTopUsers);
router.get('/endpoints/top', analyticsController.getTopEndpoints);

module.exports = router;
