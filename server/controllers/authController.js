const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendWhatsAppMessage } = require('../utils/whatsappClient');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailClient');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists by email OR username
    const user = await User.findOne({ 
        $or: [
            { email: email },
            { username: email }
        ]
    });

    if (user && (await user.matchPassword(password))) {
      
      // Check phone verification only for non-admin users
      if (!user.isPhoneVerified && user.role !== 'admin') {
          return res.status(401).json({ message: 'Phone number not verified. Please signup again to verify.' });
      }

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        address: user.address,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email/username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, username, email, phoneNumber, countryCode, password, address } = req.body;

    // Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one symbol.' 
        });
    }

    const userExists = await User.findOne({ email });
    const usernameExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // SEND WHATSAPP MESSAGE
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const message = `Your verification code for TimberZee is: *${otp}*`;
    
    // Send asynchronously - don't block response
    sendWhatsAppMessage(fullPhoneNumber, message);

    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      countryCode,
      password,
      address: address || {},
      role: 'buyer',
      isEmailVerified: false,
      isPhoneVerified: false,
      phoneOtp: otp,
      phoneOtpExpires: otpExpires
    });

    if (user) {
      res.status(201).json({
        email: user.email,
        message: 'OTP sent to phone number. Please verify.',
        requiresOtp: true,
        phoneNumber: `${countryCode} ${phoneNumber}`
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isPhoneVerified) {
             return res.status(200).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                stripeCustomerId: user.stripeCustomerId,
                address: user.address,
                token: generateToken(user._id),
             });
        }

        if (user.phoneOtp === otp && user.phoneOtpExpires > Date.now()) {
            user.isPhoneVerified = true;
            user.phoneOtp = undefined;
            user.phoneOtpExpires = undefined;
            await user.save();

            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                stripeCustomerId: user.stripeCustomerId,
                address: user.address,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    await user.save();

    // Create reset url
    // Assumes client runs on port 3000
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please click on the following link to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail(user.email, 'Password Reset Request', message);

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid Token' });
    }

    // Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
        return res.status(400).json({ 
            message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one symbol.' 
        });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      data: 'Password reset success',
      token: generateToken(user._id),
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginUser,
  registerUser,
  verifyOtp,
  forgotPassword,
  resetPassword
};
