// vcpBackend/src/models/villesModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Ville = sequelize.define('Ville', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ville_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'villes',
  timestamps: false // Assuming you don't want Sequelize to manage createdAt and updatedAt fields
});

module.exports = Ville;
