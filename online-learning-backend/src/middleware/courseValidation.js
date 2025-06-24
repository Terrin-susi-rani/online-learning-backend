const { check, validationResult } = require('express-validator');

exports.enrollValidation = [
  check('userId', 'User ID must be an integer').isInt(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
