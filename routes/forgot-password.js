const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ where: { Email: email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save the reset token hash and expiration date to the user's record
    user.resetToken = resetTokenHash;
    user.resetTokenExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send the reset link via email
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error in /forgot-password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    // Find user by reset token
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpire: { [Op.gt]: Date.now() },
      },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password and save it
    user.Password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    res.json({ message: 'Password successfully reset' });
  } catch (error) {
    console.error('Error in /reset-password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
