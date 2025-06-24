const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { auth } = require('../middleware/auth');

// GET learning dashboard
router.get('/dashboard', auth, progressController.getDashboard);

// GET course progress
router.get('/course/:courseId', auth, progressController.getCourseProgress);

module.exports = router;