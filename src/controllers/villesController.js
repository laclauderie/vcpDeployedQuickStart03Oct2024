// vcpBackend/src/controllers/villesController.js
const Ville = require('../models/villesModel');

// Get all villes from the villes table
const getAllVilles = async (req, res) => {
  try {
    const villes = await Ville.findAll();
    res.status(200).json(villes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching villes', error });
  }
};

// Get villeId from ville_name
const getVilleId = async (req, res) => {
  const { ville_name } = req.params;
  try {
    const ville = await Ville.findOne({ where: { ville_name } });
    if (ville) {
      res.status(200).json({ id: ville.id });
    } else {
      res.status(404).json({ message: 'Ville not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ville ID', error });
  }
};

// Get villeName from ville_id
const getVilleName = async (req, res) => {
  const { ville_id } = req.params;
  try {
    const ville = await Ville.findByPk(ville_id);
    if (ville) {
      res.status(200).json({ ville_name: ville.ville_name });
    } else {
      res.status(404).json({ message: 'Ville not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ville name', error });
  }
};

module.exports = {
  getAllVilles,
  getVilleId,
  getVilleName
};
