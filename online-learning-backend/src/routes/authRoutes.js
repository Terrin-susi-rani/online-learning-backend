const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
    learnerRegisterValidation,
    educatorRegisterValidation,
    loginValidation 
} = require('../middleware/authValidation');

router.post('/auth/register', learnerRegisterValidation, authController.registerLearner);
router.post('/auth/educator/register', educatorRegisterValidation, authController.registerEducator);
router.post('/auth/login', loginValidation, authController.login);

module.exports = router;