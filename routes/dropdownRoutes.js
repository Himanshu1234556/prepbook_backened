const express = require('express');
const router = express.Router();
const profileDropdown = require('../controllers/profileDropdown');

router.get('/profile', profileDropdown.getCoursesDropdown);

module.exports = router;
