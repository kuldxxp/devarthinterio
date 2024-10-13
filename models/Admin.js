const mongoose = require('mongoose');

// Define the schema for the admin
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }  // The hashed password
});

// Create the model for admin
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
