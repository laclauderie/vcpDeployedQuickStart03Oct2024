// vcpBackend/src/models/businessOwnersModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./userModel'); // Make sure to require the User model to establish associations

const BusinessOwner = sequelize.define('BusinessOwner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image_owner: {
    type: DataTypes.STRING
  },
  adresse: {
    type: DataTypes.STRING
  },
  telephone1: {
    type: DataTypes.STRING
  },
  telephone2: {
    type: DataTypes.STRING
  },
  monthly_fee_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  role: {
    type: DataTypes.STRING
  },
  user_id: {
    type: DataTypes.UUID,
    unique: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  latest_payment_date: {
    type: DataTypes.DATE
  },
  latest_payment_id: {
    type: DataTypes.UUID
  }
}, {
  tableName: 'business_owners',
  timestamps: false // Assuming you don't want Sequelize to manage createdAt and updatedAt fields
});

// Define associations if needed
BusinessOwner.associate = function(models) {
  BusinessOwner.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
};

module.exports = BusinessOwner;
