// vcpBackend/src/controllers/businessOwnerController.js
const fs = require('fs');
const path = require('path');

const BusinessOwner = require("../models/businessOwnersModel");
const User = require("../models/userModel");

const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinaryConfig');

// Constants for error messages
const USER_NOT_FOUND = "User not found";
const BUSINESS_OWNER_NOT_FOUND = "Business owner not found";

// Get the business owner by ID for non-logged-in users
const getBusinessOwnerById = async (req, res) => {
  const { id } = req.params; // Extract the ID from request parameters

  try {
    // Find the business owner by ID
    const businessOwner = await BusinessOwner.findByPk(id);

    // Check if the business owner was found
    if (businessOwner) {
      res.status(200).json(businessOwner);
    } else {
      res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }
  } catch (error) {
    console.error("Error fetching business owner:", error); // Improved logging
    res.status(500).json({ error: error.message });
  }
};

// Get the business owner data for the logged-in user
const getBusinessOwnerForUser = async (req, res) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: req.user.userId },
    });
    if (businessOwner) {
      res.status(200).json(businessOwner);
    } else {
      res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }
  } catch (error) {
    console.error("Error fetching business owner:", error); // Improved logging
    res.status(500).json({ error: error.message });
  }
};

// Retrieve the business owner's image
const getBusinessOwnerImage = async (req, res) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: req.user.userId },
    });

    if (businessOwner && businessOwner.image_owner) {
      // Check if image_owner contains a URL
      const imageUrl = businessOwner.image_owner;

      // Send the URL as a response
      res.status(200).json({ imageUrl });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Error retrieving business owner image:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete the business owner data for the logged-in user
const deleteBusinessOwnerForUser = async (req, res) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: req.user.userId },
    });
    if (businessOwner) {
      await businessOwner.destroy();
      res.status(200).json({ message: "Business owner deleted successfully" });
    } else {
      res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }
  } catch (error) {
    console.error("Error deleting business owner:", error); // Improved logging
    res.status(500).json({ error: error.message });
  }
};

// Find business owner by email
const findBusinessOwnerByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const businessOwner = await BusinessOwner.findOne({ where: { email } });
    if (businessOwner) {
      res.status(200).json(businessOwner);
    } else {
      res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }
  } catch (error) {
    console.error("Error finding business owner by email:", error); // Improved logging
    res.status(500).json({ error: error.message });
  }
};

// Update business owner fields and image URL
const updateBusinessOwner = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, adresse, telephone1, telephone2, monthly_fee_paid, role } = req.body;

  try {
    // Retrieve the logged-in business owner using the user ID from JWT
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: req.user.userId },
    });

    if (businessOwner) {
      // Update non-image fields if present
      if (name !== undefined) businessOwner.name = name;
      if (adresse !== undefined) businessOwner.adresse = adresse;
      if (telephone1 !== undefined) businessOwner.telephone1 = telephone1;
      if (telephone2 !== undefined) businessOwner.telephone2 = telephone2;
      if (monthly_fee_paid !== undefined) businessOwner.monthly_fee_paid = monthly_fee_paid;
      if (role !== undefined) businessOwner.role = role;

      // Handle file upload and update image URL if file is uploaded
      if (req.file) {
        try {
          // Upload the image to Cloudinary with transformation (e.g., resizing to 300x300)
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'businessOwners', // Organize the image in a folder in Cloudinary (optional)
            transformation: [
              { width: 300, height: 300, crop: 'fill' }, // Ensure the image is resized to 300x300 and cropped to fit
              { quality: 'auto' } // Optional: Automatically adjust image quality for optimization
            ]
          });

          // Save the transformed image URL
          businessOwner.image_owner = result.secure_url;
        } catch (uploadError) {
          console.error('Error uploading image to Cloudinary:', uploadError);
          return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
        }
      }

      await businessOwner.save();
      res.status(200).json(businessOwner);
    } else {
      res.status(404).json({ error: 'Business owner not found' });
    }
  } catch (error) {
    console.error("Error updating business owner:", error);
    res.status(500).json({ error: 'An error occurred while updating the business owner' });
  }
};
module.exports = {
  updateBusinessOwner,
  getBusinessOwnerForUser,
  getBusinessOwnerImage,
  deleteBusinessOwnerForUser,
  findBusinessOwnerByEmail,
  getBusinessOwnerById
};
