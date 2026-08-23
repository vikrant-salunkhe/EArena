const express = require('express');
const {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getMe,
    changePassword
} = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
} = require('../validators/auth.validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.put('/reset-password/:resetToken', validate(resetPasswordSchema), resetPassword);
router.get('/me', protect, getMe);
router.patch('/change-password', protect, validate(changePasswordSchema), changePassword);

module.exports = router;
