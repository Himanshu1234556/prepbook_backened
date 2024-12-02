const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to serve assets
router.get('/assets/:assetType/:assetName', assetController.serveAsset);

module.exports = router;
