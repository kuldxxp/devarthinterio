const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to the MongoDB database
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Database connection error:', err));

// Define the admin schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create Admin model
const Admin = mongoose.model('Admin', adminSchema);

// Function to create and store admin with hashed password
async function createAdmin(username, password) {
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new admin document
    const admin = new Admin({
      username: username,
      password: hashedPassword,
    });

    // Save the admin document to the database
    await admin.save();
    console.log('Admin created successfully with hashed password');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();  // Close the database connection
  }
}

// Replace 'admin' and 'admin123' with desired credentials
createAdmin('admin', 'admin123');
