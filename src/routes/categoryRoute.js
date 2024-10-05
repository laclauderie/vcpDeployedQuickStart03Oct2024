// vcpBackend/src/routes/categoryRoute.js
const express = require("express");
const {
  createCategoryForUser,
  getCategoriesForCommerce,
  getCategoryByIdForUser,
  updateCategoryForUser,
  deleteCategoryForUser,
  getCategoriesByCommerceIdForNonLoggedUser
} = require("../controllers/categoriesController");

const authenticateJWT = require("../middleware/auth");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// Route to create a new category for the logged-in user
router.post("/create-category", 
  authenticateJWT, 
  upload.single('image'), 
  createCategoryForUser
);

// Route to get all categories for a specific commerce
router.get(
  "/get-categories/:commerceId",
  authenticateJWT,
  getCategoriesForCommerce
);

// Route to get a specific category by ID for the logged-in user, with commerce_id
router.get('/get-category/:commerceId/:categoryId', authenticateJWT, getCategoryByIdForUser);

// Route to update category details for the logged-in user
router.put(
  "/update-category/:commerceId/:id", 
  authenticateJWT, 
  upload.single('image'), 
  updateCategoryForUser
);


// Route to delete a category for the logged-in user
router.delete(
  '/delete-category/:commerceId/:id',
  authenticateJWT,
  deleteCategoryForUser
);

// Public route to get categories by commerce ID for non-logged-in users
router.get('/public-categories/:commerceId', getCategoriesByCommerceIdForNonLoggedUser);



module.exports = router;
