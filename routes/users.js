const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); 
const nodemailer = require('nodemailer');

// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { Email: email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      Name: name,
      Email: email,
      Password: hashedPassword,
    });

    return res.status(201).json({ message: 'User registered successfully', userId: newUser.User_ID });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'An error occurred during registration' });
  }
});

// Forgot password - generate reset token and send email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { Email: email } });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const resetToken = jwt.sign({ userId: user.User_ID }, process.env.JWT_SECRET, { expiresIn: '15m' });
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `http://${req.headers.host}/reset-password?token=${resetToken}`;
    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      text: `Please click the following link to reset your password: ${resetUrl}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send reset email' });
      }
      return res.status(200).json({ message: 'Password reset email sent successfully' });
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'An error occurred while processing the request' });
  }
});

// Reset password - verify token and update password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { User_ID: decoded.userId, resetToken: token } });

    if (!user || user.resetTokenExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.Password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'An error occurred during password reset' });
  }
});

// Get user info (protected route)
router.get('/me', async (req, res) => {
  const { userId } = req;
  try {
    const user = await User.findByPk(userId, { attributes: ['User_ID', 'Name', 'Email'] });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('User info error:', error);
    return res.status(500).json({ message: 'An error occurred while fetching user info' });
  }
});

module.exports = router;
