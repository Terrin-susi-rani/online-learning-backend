const express = require('express');
const router = express.Router();
const liveClassController = require('../controllers/liveClassController');
const {auth} = require('../middleware/auth');

// Live class routes
router.post('/live-classes', auth, liveClassController.createLiveClass);
router.get('/live-classes/schedule', auth,liveClassController.getSchedule);
router.post('/live-classes/:id/join', auth, liveClassController.joinLiveClass);
router.post('/live-classes/:id/questions', auth, liveClassController.askQuestion);

module.exports = router;