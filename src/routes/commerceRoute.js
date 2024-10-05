// vcpBackend/src/routes/commerceRoute.js
const express = require('express');
const {
  createCommerceForUser,
  getCommercesForUser,
  getCommerceByIdForUser,
  updateCommerceForUser,
  deleteCommerceForUser,
  getCommercesByPaidBusinessOwners,
  searchCommerces,
  getUniqueSortedVilles,
  getVillesFromCommerces,
  getCommercesByVille,
  getCommerceByIdForNonLoggedUser
} = require('../controllers/commercesController');

const authenticateJWT = require('../middleware/auth');

const upload = require('../middleware/uploadMiddleware');

const router = express.Router(); 

// Route to create a new commerce for the logged-in user
router.post('/create-commerce', authenticateJWT, upload.single('image'), createCommerceForUser);

// Route to get all commerces for the logged-in user
router.get('/get-commerces', authenticateJWT, getCommercesForUser);

// Route to get a specific commerce by ID for the logged-in user
router.get('/get-commerce/:id', authenticateJWT, getCommerceByIdForUser);

// Route to update commerce details for the logged-in user
router.put('/update-commerce/:id', authenticateJWT, upload.single('image'), updateCommerceForUser);

// Route to delete a commerce for the logged-in user
router.delete('/delete-commerce/:id', authenticateJWT, deleteCommerceForUser);

// Route to get all commerces for business owners who have paid their monthly fees
router.get('/commerces-paid-business-owners', getCommercesByPaidBusinessOwners);

router.get('/search-commerces', async (req, res) => {
  const searchTerm = req.query.searchTerm; // Get search term from query parameter
  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const commerces = await searchCommerces(searchTerm);
    res.status(200).json(commerces);
  } catch (error) {
    res.status(500).json({ error: 'Error searching commerces' });
  }
});

// Route to get unique sorted villes from a list of commerce IDs
router.get('/unique-sorted-villes', getUniqueSortedVilles);

// Route to get villes from a list of commerce IDs
router.get('/villes-from-commerces', getVillesFromCommerces);

// Route to get commerces by ville
router.get('/commerces-by-ville/:villeName', async (req, res) => {
  const villeName = req.params.villeName; // Get the ville name from URL parameters
  if (!villeName) {
    return res.status(400).json({ error: 'Ville name is required' });
  }

  try {
    const commerces = await getCommercesByVille(villeName);
    res.status(200).json(commerces);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving commerces by ville' });
  }
});

// Public route for non-logged-in users to get commerce by ID
router.get('/public-commerce/:id', getCommerceByIdForNonLoggedUser); // New route for non-logged-in users


module.exports = router; 
