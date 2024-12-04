const express = require('express');
const router = express.Router();
const freeResourceController = require('../controllers/fetchFreeResources'); // Correct controller for free resources
const ebookController = require('../controllers/ebookController'); // Correct controller for ebooks
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware for JWT Authentication

// Route to fetch free resources
router.get('/fetch-free-resources', authMiddleware.verifyToken, freeResourceController.fetchFreeResources);

// Route to fetch ebooks
router.get('/fetch-ebooks', authMiddleware.verifyToken, ebookController.fetchEbooks);

module.exports = router;
