const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth } = require('../middleware/auth');
const { check, param } = require('express-validator'); // ✅ added param

// Get all courses
router.get('/courses', courseController.getCourses);

// Get course details
router.get('/courses/:id', courseController.getCourseDetails);

// Enroll in course
router.post('/courses/:id/enroll', 
    auth,
    [
        check('userId', 'User ID must be an integer').isInt(),
        param('id', 'Course ID must be an integer').isInt()
    ],
    courseController.enrollCourse
);

module.exports = router;
