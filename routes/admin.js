const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const Admin = require('../models/Admin'); 

// Admin login route (GET)
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin_login.html'));
});

// Handle admin login (POST)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find admin in the database
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin dashboard route (GET)
router.get('/dashboard', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/admin/login');
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.sendFile(path.join(__dirname, '../public/admin_dashboard.html'));
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/admin/login');
  }
});

// Admin logout route
router.get('/logout', (req, res) => {
  res.clearCookie('token'); // Clear the token cookie
  res.redirect('/admin/login'); // Redirect to the login page
});

// Password change route
router.post('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Find admin in the database
    const admin = await Admin.findOne({ username: 'admin' });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password in the database
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
