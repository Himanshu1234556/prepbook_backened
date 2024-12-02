const express = require('express');
const { getAppData } = require('../controllers/appController');

const router = express.Router();

// Route for fetching both app info and marketing assets
router.get('/app-data', getAppData);

module.exports = router;
