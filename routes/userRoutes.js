const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Profile update route (protected by verifyToken middleware)
router.patch('/update-profile', authMiddleware.verifyToken, userController.updateProfile);

module.exports = router;
