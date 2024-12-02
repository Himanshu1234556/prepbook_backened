const express = require('express');
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Route to stream the file with JWT protection
router.get('/files/:fileType/:fileName', authMiddleware.verifyToken, fileController.streamFile);

module.exports = router;
