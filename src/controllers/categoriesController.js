// vcpBackend/src/controllers/categoriesController.js
const BusinessOwner = require("../models/businessOwnersModel");
const Commerce = require("../models/commercesModel");
const Category = require("../models/categoriesModel");
const cloudinary = require('../config/cloudinaryConfig');


// Create category for the logged user
const createCategoryForUser = async (req, res) => {
  const { category_name, commerce_id } = req.body; // Ensure the necessary data is in the request body
 
  try { 
    // Get the user_id from the authenticated request
    const userId = req.user.userId;

    // Find the business owner associated with this user
    const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });

    if (!businessOwner) {
      return res.status(404).json({ error: 'Business owner not found' });
    }

    // Find the commerce associated with the business owner and the provided commerce_id
    const commerce = await Commerce.findOne({
      where: {
        id: commerce_id,
        business_owner_id: businessOwner.id
      }
    });

    if (!commerce) {
      return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
    }

    let image_category= null;

    // Handle file upload and update image URL if file is uploaded
    if (req.file) {
      try {
        // Upload the image to Cloudinary with transformation (e.g., resizing and cropping)
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'categories', // Optional: organize the image in a 'categories' folder in Cloudinary
          transformation: [
            { width: 300, height: 300, crop: 'fill' }, // Resize the image to 300x300 and crop to fit
            { quality: 'auto' } // Optional: automatically adjust image quality for optimization
          ]
        });
        image_category = result.secure_url; // Save the image URL
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return res.status(500).json({ error: "Error uploading image to Cloudinary" });
      }
    }

    // Create the new category
    const newCategory = await Category.create({
      category_name,
      commerce_id: commerce.id,
      image_category,
    });

    // Respond with the newly created category
    res.status(201).json(newCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the category' });
  }
};

// get all categories associated to a commerce for the logged user
const getCategoriesForCommerce = async (req, res) => {
  const { commerceId } = req.params; // Access the commerceId parameter from the URL

  try {
    const { userId } = req.user; // Access the userId from the authenticated user's token

    const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });

    if (!businessOwner) {
      return res.status(404).json({ error: 'Business owner not found' });
    }

    const commerce = await Commerce.findOne({
      where: {
        id: commerceId,
        business_owner_id: businessOwner.id
      }
    });

    if (!commerce) {
      return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
    }

    const categories = await Category.findAll({
      where: {
        commerce_id: commerce.id
      }
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error:', error); // Logging error for debugging
    res.status(500).json({ error: 'An error occurred while retrieving the categories' });
  }
};


const getCategoryByIdForUser = async (req, res) => {
  const userId = req.user.userId; // Extracted from the token by authenticateJWT middleware
  const { categoryId, commerceId } = req.params;

  try {
    // Find the BusinessOwner by userId
    const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });

    if (!businessOwner) {
      return res.status(404).json({ error: 'Business owner not found' });
    }

    // Ensure the Commerce belongs to the BusinessOwner
    const commerce = await Commerce.findOne({
      where: {
        id: commerceId,
        business_owner_id: businessOwner.id,
      },
    });

    if (!commerce) {
      return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
    }

    // Find the Category by categoryId and commerce_id
    const category = await Category.findOne({
      where: {
        id: categoryId,
        commerce_id: commerce.id,
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCategoryForUser = async (req, res) => {
  const { id, commerceId } = req.params; // Capture the category ID and commerce ID from route parameters
  const { category_name } = req.body; // Capture new data for category
  

  try {
    const userId = req.user.userId;

    // Find the business owner for the logged-in user
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: userId }
    });

    if (!businessOwner) {
      console.log('Business owner not found for userId:', userId);
      return res.status(404).json({ error: 'Business owner not found' });
    }

    // Ensure the commerce belongs to the business owner
    const commerce = await Commerce.findOne({
      where: {
        id: commerceId,
        business_owner_id: businessOwner.id
      }
    });

    if (!commerce) {
      console.log('Commerce not found for businessOwnerId:', businessOwner.id, 'and commerceId:', commerceId);
      return res.status(404).json({ error: 'Commerce not found for the business owner' });
    }

    // Find the category by its ID and commerce_id
    const category = await Category.findOne({
      where: {
        id: id,
        commerce_id: commerce.id
      }
    });

    if (!category) {
      console.log('Category not found or does not belong to commerce. categoryId:', id, 'commerceId:', commerce.id);
      return res.status(404).json({ error: 'Category not found or does not belong to the commerce' });
    }

    // Update the category with new data
    if (category_name !== undefined) {
      category.category_name = category_name;
    }
         
    // Handle file upload and update image URL if file is uploaded
     if (req.file) {
      try {
        // Upload the image to Cloudinary with transformation (e.g., resizing and cropping)
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'categories', // Optional: organize the image in a 'categories' folder
          transformation: [
            { width: 300, height: 300, crop: 'fill' }, // Resize to 300x300 and crop
            { quality: 'auto' } // Auto-optimize quality
          ]
        });
        category.image_category = result.secure_url; // Save the image URL
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return res.status(500).json({ error: "Error uploading image to Cloudinary" });
      }
    }

    await category.save();

    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Error while updating category:', error);
    res.status(500).json({ error: 'An error occurred while updating the category' });
  }
};

// Delete a category by its ID for the logged-in user
const deleteCategoryForUser = async (req, res) => {
  const { id: categoryId, commerceId } = req.params;

  try {
    const userId = req.user.userId;

    // Find the business owner for the logged-in user
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: userId }
    });

    if (!businessOwner) {
      console.log('Business owner not found for userId:', userId);
      return res.status(404).json({ error: 'Business owner not found' });
    }

    // Ensure the commerce belongs to the business owner
    const commerce = await Commerce.findOne({
      where: {
        id: commerceId,
        business_owner_id: businessOwner.id
      }
    });

    if (!commerce) {
      console.log('Commerce not found for businessOwnerId:', businessOwner.id, 'and commerceId:', commerceId);
      return res.status(404).json({ error: 'Commerce not found for the business owner' });
    }

    // Find the category by its ID and commerce_id
    const category = await Category.findOne({
      where: {
        id: categoryId,
        commerce_id: commerce.id
      }
    });

    if (!category) {
      console.log('Category not found or does not belong to commerce. categoryId:', categoryId, 'commerceId:', commerce.id);
      return res.status(404).json({ error: 'Category not found or does not belong to the commerce' });
    }

    // Delete the category
    await category.destroy();

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error while deleting category:', error);
    res.status(500).json({ error: 'An error occurred while deleting the category' });
  }
};

// Get categories by commerce ID for non-logged-in users
const getCategoriesByCommerceIdForNonLoggedUser = async (req, res) => {
  const { commerceId } = req.params;

  try {
    // Find categories associated with the provided commerce ID
    const categories = await Category.findAll({
      where: { commerce_id: commerceId },
      include: [
        {
          model: Commerce,
          attributes: ['id', 'commerce_name'] // Optionally include commerce details
        }
      ]
    });

    // Check if any categories were found
    if (categories.length === 0) {
      return res.status(404).json({ error: 'No categories found for this commerce' });
    }

    // Respond with the categories
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories by commerce ID:", error);
    res.status(500).json({ error: error.message });
  }
};




module.exports = {
  createCategoryForUser,
  getCategoriesForCommerce,
  getCategoryByIdForUser,
  updateCategoryForUser,
  deleteCategoryForUser,
  getCategoriesByCommerceIdForNonLoggedUser
};
