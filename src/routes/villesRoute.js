// vcpBackend/src/routes/villesRoute.js
const express = require("express");
const {
  getAllVilles,
  getVilleId,
  getVilleName
} = require("../controllers/villesController");

const authenticateJWT = require("../middleware/auth"); // Middleware for authentication

const router = express.Router();

// Route to get all villes (public)
router.get('/get-all-villes', getAllVilles);

// Route to get villeId by ville_name (protected)
router.get('/id/:ville_name', getVilleId);

// Route to get villeName by ville_id (protected)
router.get('/name/:ville_id', getVilleName);

module.exports = router;
