const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
require('dotenv').config();

const Image = require('./models/Image'); // Importing Image model correctly
const Admin = require('./models/Admin'); // Admin model for password management

const app = express();

// Set up Multer for image uploads (memory storage for form submissions, disk storage for admin panel)
const memoryStorage = multer.memoryStorage();  // For u_reg.html form submissions
const uploadMemory = multer({ storage: memoryStorage });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Ensure 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Filename with timestamp
  }
});
const uploadDisk = multer({ storage: diskStorage });  // For admin image uploads

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Serve static files from 'uploads', 'assets', and 'public' directories
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html as default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle form submission from u_reg.html (with file upload and email functionality)
app.post('/submit', uploadMemory.array('photos', 3), async (req, res) => {
  const { fullName, email, phoneNumber, street, city, region, postalCode, category } = req.body;
  const photos = req.files.map(file => file.originalname);
  const attachments = req.files.map(file => ({
    filename: file.originalname,
    content: file.buffer  // Use file buffer for email attachments
  }));

  try {
    // Save form data to the database
    const formData = {
      fullName,
      email,
      phoneNumber,
      address: { street, city, region, postalCode },
      category,
      photos,
      submittedAt: new Date()
    };

    await mongoose.connection.collection('formdatas').insertOne(formData);  // Save form data in MongoDB

    // Sending email with form data and image attachments
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,  // Replace with your admin email
      subject: 'New Lead from Registration Form',
      text: `
        Full Name: ${fullName}
        Email: ${email}
        Phone Number: ${phoneNumber}
        Address: ${street}, ${city}, ${region}, ${postalCode}
        Category of Interest: ${category}
      `,
      attachments  // Attach uploaded photos as buffers
    };

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);  // Log error details
        return res.status(500).json({ message: 'Error sending email' });
      }
      res.status(200).json({ message: 'success' });
    });

  } catch (err) {
    console.error('Error saving form data:', err);  // Log the error details for debugging
    res.status(500).json({ message: 'Error saving form data' });
  }
});

// Admin image upload functionality (disk storage)
app.post('/admin/upload-images', uploadDisk.array('images', 10), async (req, res) => {
  console.log(req.files);  // Log the files to debug
  const category = req.body.category;
  const files = req.files;

  try {
    const imageDocs = files.map(file => ({
      category,
      path: `/uploads/${file.filename}`,
      filename: file.originalname
    }));
    await Image.insertMany(imageDocs);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Retrieve images for a specific category
app.get('/images/:category', async (req, res) => {
  const category = req.params.category;
  try {
    const images = await Image.find({ category });
    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch images' });
  }
});

// Admin routes
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// Admin image delete functionality
app.delete('/admin/images/:category/:id', async (req, res) => {
  const { category, id } = req.params;

  try {
    // Find the image by ID
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Delete the image from the database
    await Image.findByIdAndDelete(id);

    // Remove the file from the 'uploads' folder
    const imagePath = path.join(__dirname, image.path);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return res.status(500).json({ success: false, message: 'Error deleting image file' });
      }

      // Respond with success if both the file and the DB record are deleted
      res.json({ success: true, message: 'Image deleted successfully' });
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
