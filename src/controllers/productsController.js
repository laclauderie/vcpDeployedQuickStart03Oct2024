// vcpBackend/src/controllers/productsController.js
const Product = require('../models/productsModel');
const Category = require('../models/categoriesModel');
const Commerce = require('../models/commercesModel'); // Ensure this import is here
const BusinessOwner = require('../models/businessOwnersModel');
const cloudinary = require('cloudinary').v2; // Make sure Cloudinary is configured


async function createProduct(req, res) {
    try {
        const { product_name, price, reference, description } = req.body;
        const { commerceId, categoryId } = req.params;
        const userId = req.user.userId;

        // Validate required fields
        if (!product_name || !price) {
            return res.status(400).json({ error: 'Product name and price are required' });
        }

        if (isNaN(price)) {
            return res.status(400).json({ error: 'Invalid price format' });
        }

        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the specified commerce' });
        }

        let image_product = null;

        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'products',
                    transformation: [
                        { width: 500, height: 500, crop: 'fill' },
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                });
                image_product = result.secure_url;
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
            }
        }

        // Create product
        const newProduct = await Product.create({
            product_name,
            price,
            reference,
            description,
            commerce_id: commerceId,
            category_id: categoryId,
            image_product,
        });

        // Log the created product for debugging
        console.log('New Product:', newProduct);

        // Send a success response with the created product
        return res.status(201).json({
            message: 'Product created successfully',
            product: newProduct,  // Make sure image URL is sent here
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}


async function getAllProducts(req, res) {
    try {
        const { commerceId, categoryId } = req.params; // Get commerceId and categoryId from route parameters
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Retrieve the commerce using commerceId
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Retrieve the category using categoryId and ensure it belongs to the retrieved commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the specified commerce' });
        }

        // Fetch products related to the specified category
        const products = await Product.findAll({
            where: { category_id: categoryId },
            include: [Category] // Optionally include Category for additional details
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getProductById(req, res) {
    try {
        const { commerceId, categoryId, productId } = req.params; // Get commerceId, categoryId, and productId from route parameters
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Retrieve the commerce using commerceId and ensure it belongs to the business owner
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Retrieve the category using categoryId and ensure it belongs to the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the specified commerce' });
        }

        // Retrieve the product using productId and ensure it belongs to the specified category
        const product = await Product.findOne({
            where: { id: productId, category_id: categoryId },
            include: {
                model: Category,
                include: {
                    model: Commerce,
                    where: { id: commerceId }
                }
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the specified category and commerce' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateProduct(req, res) {
    try {
        const { commerceId, categoryId, productId } = req.params; // Get commerceId, categoryId, and productId from route parameters
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT

        const { product_name, price, reference, description } = req.body; // Get product details from the request body
        
        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Retrieve the commerce using commerceId and ensure it belongs to the business owner
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Retrieve the category using categoryId and ensure it belongs to the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the specified commerce' });
        }

        // Retrieve the product using productId and ensure it belongs to the specified category
        const product = await Product.findOne({ where: { id: productId, category_id: categoryId } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the specified category' });
        }

        // Update product details
        product.product_name = product_name || product.product_name;
        
        // Ensure the price is a valid decimal before updating
        if (price && !isNaN(price)) {
            product.price = price;
        }
        
        product.reference = reference || product.reference;
        product.description = description || product.description;
        product.category_id = categoryId || product.category_id;

        if (req.file) {
            try {
                // Upload the image to Cloudinary with transformations
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'products', // Store in a 'products' folder for organization
                    transformation: [
                        { width: 500, height: 500, crop: 'fill' }, // Resize and crop to 500x500 pixels
                        { quality: 'auto', fetch_format: 'auto' }  // Optimize quality and format
                    ]
                });
                product.image_product = result.secure_url; // Save the transformed image URL
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
            }
          }

        await product.save();
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteProduct(req, res) {
    try {
        const { commerceId, categoryId, productId } = req.params; // Get commerceId, categoryId, and productId from route parameters
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Retrieve the commerce using commerceId and ensure it belongs to the business owner
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Retrieve the category using categoryId and ensure it belongs to the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the specified commerce' });
        }

        // Retrieve the product using productId and ensure it belongs to the specified category
        const product = await Product.findOne({ where: { id: productId, category_id: categoryId } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the specified category' });
        }

        // Delete the product
        await product.destroy();
        res.status(204).send(); // No content to return
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getProductsByCategoryIdForNonLoggedUser(req, res) {
    try {
        const { categoryId } = req.params;

        // Check if the category exists
        const category = await Category.findOne({ where: { id: categoryId } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Retrieve products associated with the given category ID
        const products = await Product.findAll({
            where: { category_id: categoryId },
            attributes: ['id', 'product_name', 'price', 'reference', 'description', 'image_product'],
            include: [{
                model: Category,
                attributes: ['category_name'],
                include: [{
                    model: Commerce,
                    attributes: ['commerce_name']
                }]
            }]
        });

        // If no products are found, return an empty array
        if (!products.length) {
            return res.status(200).json([]);
        }

        // No need to convert image_product to base64, return it as is (Cloudinary URL)
        const productsWithImages = products.map(product => {
            return {
                ...product.get({ plain: true }),  // Get plain JSON from Sequelize instance
                image_product: product.image_product  // Return the image URL as is
            };
        });

        res.status(200).json(productsWithImages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}




module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategoryIdForNonLoggedUser,
   
};
