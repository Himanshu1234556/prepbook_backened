const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

router.get('/videos/:videoName', videoController.streamVideo);

module.exports = router;
