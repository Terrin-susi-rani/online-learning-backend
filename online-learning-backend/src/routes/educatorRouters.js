const express = require('express');
const router = express.Router();
const educatorController = require('../controllers/educatorController');
const {auth} = require('../middleware/auth');

// Browse educators
router.get('/', educatorController.getEducators);

// Get educator profile
router.get('/:id', educatorController.getEducatorProfile);

// Follow educator
router.post('/:id/follow', auth, educatorController.followEducator);

module.exports = router;