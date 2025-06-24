const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { auth } = require('../middleware/auth');


// Get lesson details
router.get('/lessons/:id', auth, lessonController.getLessonDetails);

router.post(
    '/lessons/:id/progress',
    auth,
    lessonController.updateLessonProgress
);

// Get lesson progress
router.get(
    '/lessons/:id/progress',
    auth,
    lessonController.getLessonProgress
);


module.exports = router;