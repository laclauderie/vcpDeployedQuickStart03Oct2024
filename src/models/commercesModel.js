// vcpBackend/src/models/commercesModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const BusinessOwner = require('./businessOwnersModel');
const Ville = require('./villesModel');

const Commerce = sequelize.define('Commerce', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true 
  },
  commerce_name: {
    type: DataTypes.STRING, 
    allowNull: false
  },
  business_owner_id: {
    type: DataTypes.UUID,
    references: {
      model: BusinessOwner,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  ville_id: {
    type: DataTypes.UUID,
    references: {
      model: Ville,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  image_commerce: {
    type: DataTypes.STRING
  },
  services: {
    type: DataTypes.TEXT('long'), // Use TEXT for SQL Server
    allowNull: false,
    defaultValue: ''
  }
}, {
  tableName: 'commerces',
  timestamps: false // Assuming you don't want Sequelize to manage createdAt and updatedAt fields
});

// Define associations
Commerce.belongsTo(BusinessOwner, { foreignKey: 'business_owner_id' });
Commerce.belongsTo(Ville, { foreignKey: 'ville_id' });

module.exports = Commerce;
