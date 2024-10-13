const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true, // Ensure the category is provided
    trim: true // Remove any extra spaces
  },
  path: {
    type: String,
    required: true // Ensure the file path is provided
  },
  filename: {
    type: String,
    required: true // Ensure the file name is provided
  },
  uploadedAt: {
    type: Date,
    default: Date.now // Automatically set the upload date
  }
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
