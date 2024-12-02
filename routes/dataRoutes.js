const express = require('express');
const router = express.Router();
const fetchEbooksAndFreeResources = require('../controllers/fetchEbooksAndFreeResources');

// Middleware for JWT Authentication
const authMiddleware = require('../middlewares/authMiddleware');

// Route to fetch ebooks and free resources
router.get('/fetch-ebooks-and-resources', authMiddleware.verifyToken, fetchEbooksAndFreeResources.fetchEbooksAndFreeResources);

module.exports = router;
