const express = require('express');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategoryIdForNonLoggedUser
} = require('../controllers/productsController');
const authenticateJWT = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Route to create a new product for the logged-in user
router.post(
    '/create-product/:commerceId/:categoryId',
    authenticateJWT,
    upload.single('image'),
    createProduct
);

// Route to get all products for a specific commerce and category
router.get(
    '/get-products/:commerceId/:categoryId',
    authenticateJWT,
    getAllProducts
);

// Route to get a specific product by ID for the logged-in user, with commerceId and categoryId
router.get(
    '/get-product/:commerceId/:categoryId/:productId',
    authenticateJWT,
    getProductById
);

// Route to update product details for the logged-in user
router.put(
    '/update-product/:commerceId/:categoryId/:productId',
    authenticateJWT,
    upload.single('image'),
    updateProduct
);

// Route to delete a product for the logged-in user
router.delete(
    '/delete-product/:commerceId/:categoryId/:productId',
    authenticateJWT,
    deleteProduct
);

// New route to get products by category ID for non-logged-in users
router.get(
    '/public-products/:categoryId', 
    getProductsByCategoryIdForNonLoggedUser
);

module.exports = router;
