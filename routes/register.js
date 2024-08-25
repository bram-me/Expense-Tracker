const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Registration route
router.post('../public/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { Email: email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      Email: email,
      Password: hashedPassword,
      Name: name,
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in /register:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
