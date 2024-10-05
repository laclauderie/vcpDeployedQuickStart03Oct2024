// vcpBackend/src/controllers/detailsController.js
const Detail = require('../models/detailsModel');
const Product = require('../models/productsModel');
const Category = require('../models/categoriesModel');
const Commerce = require('../models/commercesModel');
const BusinessOwner = require('../models/businessOwnersModel');
const cloudinary = require('cloudinary').v2; // Make sure Cloudinary is configured

// Create a new detail
async function createDetail(req, res) {
    try {
        const { commerceId, categoryId, productId } = req.params; // Get commerceId, categoryId, and productId from route parameters
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT

        const { detail_name, description } = req.body; // Get detail information from the request body
    
        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Verify commerce ownership
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Verify category ownership within the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the commerce' });
        }

        // Verify product ownership within the category
        const product = await Product.findOne({ where: { id: productId, category_id: category.id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the category' });
        }

        let image_detail = null;

        // Handle file upload and update image URL if file is uploaded
        if (req.file) {
            try {
                // Upload the image to Cloudinary with transformations
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'details', // Store in a 'details' folder for organization
                    transformation: [
                        { width: 400, height: 400, crop: 'fill' }, // Resize and crop to 400x400 pixels
                        { quality: 'auto', fetch_format: 'auto' }  // Optimize quality and format
                    ]
                });
                image_detail = result.secure_url; // Save the transformed image URL
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
            }
        }

        // Create the detail
        const newDetail = await Detail.create({
            detail_name,
            description,
            product_id: product.id,
            image_detail
        });

        res.status(201).json(newDetail);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get all details for a specific product
async function getDetailsByProduct(req, res) {
    try {
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT
        const { commerceId, categoryId, productId } = req.params; // Get commerceId, categoryId, and productId from route parameters

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Verify commerce ownership
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Verify category ownership within the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the commerce' });
        }

        // Verify product ownership within the category
        const product = await Product.findOne({ where: { id: productId, category_id: category.id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the category' });
        }

        // Fetch all details related to the product
        const details = await Detail.findAll({ where: { product_id: product.id } });

        res.status(200).json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get a detail by its ID
async function getDetailById(req, res) {
    try {
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT
        const { commerceId, categoryId, productId, detailId } = req.params; // Get commerceId, categoryId, productId, and detailId from route parameters

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Verify commerce ownership
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Verify category ownership within the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the commerce' });
        }

        // Verify product ownership within the category
        const product = await Product.findOne({ where: { id: productId, category_id: category.id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the category' });
        }

        // Fetch the detail by its ID and verify its association with the product
        const detail = await Detail.findOne({
            where: { id: detailId, product_id: product.id }
        });
        if (!detail) {
            return res.status(404).json({ error: 'Detail not found or does not belong to the product' });
        }

        res.status(200).json(detail);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Update a detail
async function updateDetail(req, res) {
    try {
        const { detail_name, description } = req.body; // Get non-image detail fields from the request body
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT
        const { commerceId, categoryId, productId, detailId } = req.params; // Get commerceId, categoryId, productId, and detailId from route parameters

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Verify commerce ownership
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Verify category ownership within the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the commerce' });
        }

        // Verify product ownership within the category
        const product = await Product.findOne({ where: { id: productId, category_id: category.id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the category' });
        }

        // Fetch the detail by its ID and verify its association with the product
        const detail = await Detail.findOne({
            where: { id: detailId, product_id: product.id }
        });
        if (!detail) {
            return res.status(404).json({ error: 'Detail not found or does not belong to the product' });
        }

        // Update detail fields
        detail.detail_name = detail_name || detail.detail_name;
        detail.description = description || detail.description;

        if (req.file) {
            try {
                // Upload the image to Cloudinary with transformations
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'details', // Store in a 'details' folder for organization
                    transformation: [
                        { width: 400, height: 400, crop: 'fill' }, // Resize and crop to 400x400 pixels
                        { quality: 'auto', fetch_format: 'auto' }  // Optimize quality and format
                    ]
                });
                detail.image_detail = result.secure_url; // Save the transformed image URL
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
            }
          }

        await detail.save();
        res.status(200).json(detail);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Delete a detail
async function deleteDetail(req, res) {
    try {
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT
        const { commerceId, categoryId, productId, detailId } = req.params; // Get commerceId, categoryId, productId, and detailId from route parameters

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Verify commerce ownership
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Verify category ownership within the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the commerce' });
        }

        // Verify product ownership within the category
        const product = await Product.findOne({ where: { id: productId, category_id: category.id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the category' });
        }

        // Fetch the detail by its ID and verify its association with the product
        const detail = await Detail.findOne({
            where: { id: detailId, product_id: product.id }
        });
        if (!detail) {
            return res.status(404).json({ error: 'Detail not found or does not belong to the product' });
        }

        await detail.destroy();
        res.status(204).send(); // No Content
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Method to get details by product ID for non-logged-in users
async function getDetailsByProductIdForNonLoggedUser(req, res) {
    try {
        const { productId } = req.params; // Get productId from route parameters
        console.log('Requested productId:', productId);

        // Retrieve the product
        const product = await Product.findOne({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Retrieve all details related to the product
        const details = await Detail.findAll({ where: { product_id: productId } });
        console.log('Retrieved details:', details);

        if (!details.length) {
            return res.status(404).json({ error: 'No details found for this product' });
        }

        res.status(200).json(details);
    } catch (error) {
        console.error('Error fetching details:', error);
        res.status(500).json({ error: error.message });
    }
}


module.exports = {
    createDetail,
    getDetailsByProduct,
    getDetailById,
    updateDetail,
    deleteDetail,
    getDetailsByProductIdForNonLoggedUser,
};
