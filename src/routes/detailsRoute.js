const express = require('express');
const {
    createDetail,
    getDetailsByProduct,
    getDetailById,
    updateDetail,
    deleteDetail,
    getDetailsByProductIdForNonLoggedUser
} = require('../controllers/detailsController');
const authenticateJWT = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware'); // Assuming you'll use this for image upload

const router = express.Router();

// Route to create a new detail for the logged-in user
router.post(
    '/create-detail/:commerceId/:categoryId/:productId',
    authenticateJWT,
    upload.single('image'), // Assuming details have images
    createDetail
);

// Route to get all details for a specific product
router.get(
    '/get-details-by-product/:commerceId/:categoryId/:productId',
    authenticateJWT,
    getDetailsByProduct
);

// Route to get a specific detail by ID for the logged-in user, with commerceId, categoryId, and productId
router.get(
    '/get-detail/:commerceId/:categoryId/:productId/:detailId',
    authenticateJWT,
    getDetailById
);

// Route to update detail for the logged-in user
router.put(
    '/update-detail/:commerceId/:categoryId/:productId/:detailId',
    authenticateJWT,
    upload.single('image'), // Assuming details have images
    updateDetail
);

// Route to delete a detail for the logged-in user
router.delete(
    '/delete-detail/:commerceId/:categoryId/:productId/:detailId',
    authenticateJWT,
    deleteDetail
);

// New route to get details by product ID for non-logged-in users
router.get(
    '/public-detail-product/:productId', 
    getDetailsByProductIdForNonLoggedUser
); 

module.exports = router;
