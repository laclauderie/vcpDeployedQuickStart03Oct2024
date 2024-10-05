// vcpBackend/src/routes/userRoute.js
const express = require('express');
const { 
  register, 
  login, 
  verifyEmail, 
  requestPasswordReset, 
  resetPassword, 
  getAllUsers, 
  getUserById, 
  deleteUser,
  getUserByEmail 
} = require('../controllers/userController');

const router = express.Router();

// User registration
router.post('/register', register); 

// User login
router.post('/login', login);

// Email verification
router.get('/verify/:token', verifyEmail);

// Request password reset
router.post('/request-password-reset', requestPasswordReset);

// Reset password
router.post('/reset-password/:token', resetPassword);

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Delete user
router.delete('/:id', deleteUser);

// Get user by email
router.get('/email/:email', getUserByEmail); // Add the new route

module.exports = router;
