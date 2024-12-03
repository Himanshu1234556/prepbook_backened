
const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middlewares/authMiddleware');  // Assuming you have JWT verification middleware

// Route to fetch subject list for user
router.get('/fetch-subjects', authMiddleware.verifyToken, subjectController.getSubjectListForUser);

module.exports = router;
