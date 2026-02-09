const express = require('express');
const router = express.Router();
const { loginUser, registerUser, verifyOtp, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/signup', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

module.exports = router;
