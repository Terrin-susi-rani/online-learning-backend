const { body, validationResult } = require('express-validator');

exports.learnerRegisterValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('mobile').notEmpty().withMessage('Mobile number is required'),
    body('targetExam').notEmpty().withMessage('Target exam is required'),
    body('preferredLanguage').notEmpty().withMessage('Preferred language is required'),
    body('currentLevel').notEmpty().withMessage('Current level is required')
];
exports.educatorRegisterValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('mobile').notEmpty().withMessage('Mobile number is required'),
    body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required'),
    body('qualification').notEmpty().withMessage('Qualification is required'),
    body('experience').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
    body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
];
exports.loginValidation = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['learner', 'educator']).withMessage('Invalid role')
];