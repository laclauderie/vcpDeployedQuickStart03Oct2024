// src/config/cloudinaryConfig.js

const cloudinary = require('cloudinary').v2; // Import cloudinary

// Check if environment variables are set
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary environment variables are not set');
}

// Configure cloudinary with environment variables
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Optional: Check Cloudinary configuration
cloudinary.api.ping().then(() => {
  console.log('Cloudinary configuration is successful');
}).catch(err => {
  console.error('Error connecting to Cloudinary:', err);
});

module.exports = cloudinary;