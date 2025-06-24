const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const {auth} = require('../middleware/auth');

// Get available tests
router.get('/', testController.getTests);

// Start a test
router.post('/:id/start', auth, testController.startTest);

// Submit test answers
router.post('/:sessionId/submit', auth, testController.submitTest);

module.exports = router;