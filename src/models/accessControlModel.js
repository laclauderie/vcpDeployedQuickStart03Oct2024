// vcpBackend/src/models/accessControlModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const BusinessOwner = require('./businessOwnersModel'); // Make sure to require the BusinessOwner model

const AccessControl = sequelize.define('AccessControl', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  access_control_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  business_owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: BusinessOwner,
      key: 'id'
    }
  },
  access_allowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'access_control',
  timestamps: false // Assuming you don't want Sequelize to manage createdAt and updatedAt fields
});

// Define associations if needed
AccessControl.associate = function(models) {
  AccessControl.belongsTo(models.BusinessOwner, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });
};

module.exports = AccessControl;
