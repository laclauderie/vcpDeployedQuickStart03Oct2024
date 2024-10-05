// vcpBackend/src/controllers/commercesController.js
const { v4: uuidv4 } = require("uuid");
const Commerce = require("../models/commercesModel");
const BusinessOwner = require("../models/businessOwnersModel");
const Ville = require("../models/villesModel");
const { validationResult } = require("express-validator"); // Add this line
const { Op } = require('sequelize');

// Constants for error messages
const COMMERCE_NOT_FOUND = "Commerce not found";
const BUSINESS_OWNER_NOT_FOUND = "Business owner not found";
const VILLE_NOT_FOUND = "Ville not found";

// Constants for error messages
const NO_PAID_BUSINESS_OWNERS_FOUND = "No commerces found with paid business owners";

const cloudinary = require('cloudinary').v2; // Make sure Cloudinary is configured

// Create a new commerce for the logged-in user
const createCommerceForUser = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract user ID from the JWT token (attached in the middleware)
  const userId = req.user.userId;

  // Get other fields from the request body
  const { commerce_name, ville_name, services } = req.body;
  
  // Check if all required fields are provided
  if (!commerce_name || !ville_name || !services) {
    return res.status(400).json({ error: "All fields are required" });
  }
   
  try {
    // Find the BusinessOwner associated with the userId
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: userId },
    });

    // Check if a BusinessOwner was found
    if (!businessOwner) {
      return res.status(404).json({ error: "Business owner not found" });
    }

    // Find the Ville based on the ville_name
    const ville = await Ville.findOne({ where: { ville_name: ville_name } });

    // Check if a Ville was found
    if (!ville) {
      return res.status(404).json({ error: "Ville not found" });
    }

    let image_commerce = null;

    // Handle file upload and update image URL if file is uploaded
    if (req.file) {
      try {
        // Upload the image to Cloudinary with transformation (e.g., resizing to 300x300)
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'commerces', // Organize the image in a folder in Cloudinary (optional)
          transformation: [
            { width: 300, height: 300, crop: 'fill' }, // Ensure the image is resized to 300x300 and cropped to fit
            { quality: 'auto' } // Optional: Automatically adjust image quality for optimization
          ]
        });
        image_commerce = result.secure_url; // Save the image URL
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
      }
    }

    // Create the Commerce record
    const commerce = await Commerce.create({
      commerce_name,
      business_owner_id: businessOwner.id, // Use the ID from the found BusinessOwner
      ville_id: ville.id, // Use the ID from the found Ville
      image_commerce, // Store the Cloudinary URL
      services,
    });

    res.status(201).json(commerce);
  } catch (error) {
    console.error("Error creating commerce:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Get commerce by ID for non-logged-in users
const getCommerceByIdForNonLoggedUser = async (req, res) => {
  const { id } = req.params; // Get the commerce ID from URL parameters

  try {
    // Find the commerce by ID
    const commerce = await Commerce.findOne({
      where: { id },
      include: [
        {
          model: BusinessOwner,
          attributes: ['id', 'name', 'email'], // Include business owner details if needed
        },
        {
          model: Ville,
          attributes: ['id', 'ville_name'], // Include ville details if needed
        }
      ],
      attributes: [
        'id', // Commerce ID
        'commerce_name', // Name of the commerce
        'image_commerce', // Commerce image
        'services', // Services provided by the commerce
        'ville_id' // Associated Ville ID
      ]
    });

    if (commerce) {
      res.status(200).json(commerce);
    } else {
      res.status(404).json({ error: COMMERCE_NOT_FOUND });
    }
  } catch (error) {
    console.error('Error fetching commerce:', error);
    res.status(500).json({ error: 'An error occurred while fetching the commerce' });
  }
};

// Get all commerces for business owners who have paid their monthly fees
const getCommercesByPaidBusinessOwners = async (req, res) => {
  try {
    // Find all business owners who have paid their monthly fees
    const paidBusinessOwners = await BusinessOwner.findAll({
      where: { monthly_fee_paid: true }, // Only business owners with paid fees
      attributes: ['id', 'name', 'email'], // Include attributes as needed
    });

    if (paidBusinessOwners.length === 0) {
      return res.status(404).json({ error: 'No paid business owners found' });
    }

    // Find all commerces associated with these business owners
    const commerces = await Commerce.findAll({
      where: {
        business_owner_id: paidBusinessOwners.map(owner => owner.id), // Filter by paid business owners' IDs
      },
      include: [
        {
          model: Ville,
          attributes: ['id', 'ville_name'], // Include attributes for Ville
        },
        {
          model: BusinessOwner,
          attributes: ['id', 'name'], // Include attributes for BusinessOwner if needed
        }
      ],
      attributes: [
        'id', // Commerce ID
        'commerce_name', // Name of the commerce
        'image_commerce', // Commerce image
        'services', // Services provided by the commerce
        'ville_id' // Associated Ville ID
      ]
    });

    // Check if any commerces were found
    if (commerces.length === 0) {
      return res.status(404).json({ error: 'No commerces found for paid business owners' });
    }

    // Send the result back to the client
    res.status(200).json(commerces);
  } catch (error) {
    console.error("Error fetching commerces by paid business owners:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all commerces for the logged-in user
const getCommercesForUser = async (req, res) => {
  try {
    // Retrieve the business owner associated with the user
    const businessOwner = await BusinessOwner.findOne({ 
      where: { user_id: req.user.userId },
    });  

    // Check if the business owner was found
    if (!businessOwner) {
      return res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }

    // Find all commerces associated with the business owner
    const commerces = await Commerce.findAll({
      where: { business_owner_id: businessOwner.id },
      include: [Ville], // Assuming BusinessOwner is not necessary to include here
    });

    res.status(200).json(commerces);
  } catch (error) {
    console.error("Error fetching commerces:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update commerce details for the logged-in user
const updateCommerceForUser = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { commerce_name, ville_name, services } = req.body;

  try {
    // Find the BusinessOwner associated with the userId
    const businessOwner = await BusinessOwner.findOne({ where: { user_id: req.user.userId } });

    // Check if a BusinessOwner was found
    if (!businessOwner) {
      return res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }

    // Find the Commerce by ID and business_owner_id
    const commerce = await Commerce.findOne({
      where: { id, business_owner_id: businessOwner.id }
    });

    if (!commerce) {
      return res.status(404).json({ error: COMMERCE_NOT_FOUND });
    }

    // Update the fields if they are provided in the request body
    if (commerce_name !== undefined) commerce.commerce_name = commerce_name;
    if (ville_name !== undefined) {
      const ville = await Ville.findOne({ where: { ville_name } });
      if (!ville) {
        return res.status(404).json({ error: VILLE_NOT_FOUND });
      }
      commerce.ville_id = ville.id;
    }
    if (services !== undefined) commerce.services = services;

    // Handle file upload and update image URL if a file is uploaded
    if (req.file) {
      try {
        // Upload the image to Cloudinary with transformation (e.g., resizing to 300x300)
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'commerces', // Optional: organize the image in a 'commerces' folder in Cloudinary
          transformation: [
            { width: 300, height: 300, crop: 'fill' }, // Resize the image to 300x300 and crop to fit
            { quality: 'auto' } // Optional: automatically adjust image quality for optimization
          ]
        });
        commerce.image_commerce = result.secure_url; // Save the image URL
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
      }
    }

    // Save the updated commerce details
    await commerce.save();
    res.status(200).json(commerce);
  } catch (error) {
    console.error("Error updating commerce:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCommerceByIdForUser = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // Find the business owner by the user ID
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: userId }
    });

    if (!businessOwner) {
      return res.status(404).json({ error: 'Business owner not found' });
    }

    // Find the commerce by ID and business owner ID
    const commerce = await Commerce.findOne({
      where: { id, business_owner_id: businessOwner.id },
      include: [BusinessOwner, Ville]
    });

    if (commerce) {
      res.status(200).json(commerce);
    } else {
      res.status(404).json({ error: 'Commerce not found' });
    }
  } catch (error) {
    console.error("Error fetching commerce:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCommerceByIdForUser,
  // other controller methods
};

// Delete a commerce for the logged-in user
const deleteCommerceForUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch the business owner using the userId from the token
    const businessOwner = await BusinessOwner.findOne({ where: { user_id: req.user.userId } });
    
    if (!businessOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Use the business_owner_id to find the commerce
    const commerce = await Commerce.findOne({
      where: { id, business_owner_id: businessOwner.id },
    });

    if (commerce) {
      await commerce.destroy();
      res.status(200).json({ message: "Commerce deleted successfully" });
    } else {
      res.status(404).json({ error: 'COMMERCE_NOT_FOUND' });
    }
  } catch (error) {
    console.error("Error deleting commerce:", error);
    res.status(500).json({ error: error.message });
  }
};

const searchCommerces = async (searchTerm) => {
  try {
    const commerces = await Commerce.findAll({
      where: {
        [Op.or]: [
          {
            commerce_name: {
              [Op.like]: `%${searchTerm}%` // Search in commerce_name
            }
          },
          {
            services: {
              [Op.like]: `%${searchTerm}%` // Search in services field
            }
          }
        ]
      }
    });

    return commerces;
  } catch (error) {
    console.error('Error searching commerces:', error);
    throw new Error('Unable to search commerces.');
  }  
};

// Method to get unique sorted villes from a list of commerces
const getUniqueSortedVilles = async (req, res) => {
  try {
    const commerceIds = req.query.commerceIds.split(',').map(Number); // Convert query string to array of numbers

    if (!commerceIds.length) {
      return res.status(400).json({ error: 'No commerce IDs provided' });
    }

    const villes = await Ville.findAll({
      include: {
        model: Commerce,
        attributes: [],
        where: {
          id: {
            [Op.in]: commerceIds
          }
        }
      },
      attributes: ['id', 'ville_name'],
      group: ['Ville.id', 'ville_name'],
      order: [['ville_name', 'ASC']]
    });

    res.status(200).json(villes);
  } catch (error) {
    console.error('Error fetching unique sorted villes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Method to get unique sorted villes from a list of commerces
const getVillesFromCommerces = async (req, res) => {
  try {
    const commerceIds = req.query.commerceIds; // Expecting an array of commerce IDs

    if (!commerceIds || !Array.isArray(commerceIds)) {
      return res.status(400).json({ error: 'Invalid or missing commerce IDs' });
    }

    // Fetch unique villes related to the given list of commerce IDs and sort them alphabetically
    const villes = await Ville.findAll({
      include: {
        model: Commerce,
        attributes: [],
        where: {
          id: {
            [Op.in]: commerceIds
          }
        }
      },
      attributes: ['id', 'ville_name'],
      group: ['Ville.id', 'ville_name'], // Group by Ville ID and name to avoid duplicates
      order: [['ville_name', 'ASC']] // Sort alphabetically by ville_name
    });

    res.status(200).json(villes);
  } catch (error) {
    console.error('Error fetching villes from commerces:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCommercesByVille = async (villeName) => {
  try {
    // Find the Ville by name
    const ville = await Ville.findOne({ where: { ville_name: villeName } });

    // Check if Ville was found
    if (!ville) {
      throw new Error('Ville not found');
    }

    const villeId = ville.id;

    // Find all commerces associated with the Ville
    const commerces = await Commerce.findAll({
      where: { ville_id: villeId },
      include: [
        {
          model: BusinessOwner,
          attributes: ['id', 'name'] // Include business owner attributes if needed
        }
      ],
      attributes: [
        'id',
        'commerce_name',
        'image_commerce',
        'services'
      ]
    });

    // Check if any commerces were found
    if (commerces.length === 0) {
      throw new Error('No commerces found for the specified ville');
    }

    return commerces;
  } catch (error) {
    console.error("Error fetching commerces by ville:", error);
    throw error; // Re-throw to be caught in route handler
  }
};


module.exports = {
  getCommercesForUser,
  createCommerceForUser,
  updateCommerceForUser,
  getCommerceByIdForUser,
  deleteCommerceForUser,
  getCommercesByPaidBusinessOwners,
  searchCommerces,
  getUniqueSortedVilles,
  getVillesFromCommerces,
  getCommercesByVille,
  getCommerceByIdForNonLoggedUser
};
