const express = require('express');
const { getAdsConfig } = require('../controllers/adsController');

const router = express.Router();

// Route to fetch Ad Configuration
router.get('/', getAdsConfig);

module.exports = router;
