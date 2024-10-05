// vcpBackend/src/routes/businessOwnerRoute.js
const express = require("express");
const {
  updateBusinessOwner,
  getBusinessOwnerForUser,
  deleteBusinessOwnerForUser,
  findBusinessOwnerByEmail,
  getBusinessOwnerImage,
  getBusinessOwnerById
} = require("../controllers/businessOwnerController");

const authenticateJWT = require("../middleware/auth");

const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Route to update business owner
router.put('/update-business-owner', authenticateJWT, upload.single('image'), updateBusinessOwner);

// Route to get business owner data for the logged-in user
router.get("/get-business-owner", authenticateJWT, getBusinessOwnerForUser);

// Route to delete business owner data for the logged-in user
router.delete("/delete-business-owner", authenticateJWT, deleteBusinessOwnerForUser);

// Route to find a business owner by email
router.get("/find-business-owner/:email", authenticateJWT, findBusinessOwnerByEmail);

// Route to get the business owner image
router.get('/get-business-owner-image', authenticateJWT, getBusinessOwnerImage);

// Public route for non-logged-in users
router.get('/public-business-owner/:id', getBusinessOwnerById); // New route for non-logged-in users

module.exports = router;
