// vcpBackend/src/middleware/uploadMiddleware.js


const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig'); // Adjust the path as needed

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'your_folder_name', // Specify the folder where you want to store images
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Allowed image formats
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
