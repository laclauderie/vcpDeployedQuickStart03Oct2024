// vcpBackend/src/models/businessOwnersPaymentsModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const BusinessOwner = require('./businessOwnersModel');
const Payment = require('./paymentsModel');

const BusinessOwnersPayments = sequelize.define('BusinessOwnersPayments', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  business_owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: BusinessOwner,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  payment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    /* references: {
      model: Payment,
      key: 'payment_id'
    }, */
    onDelete: 'CASCADE'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'business_owners_payments',
  timestamps: true // Enable timestamps so Sequelize manages createdAt and updatedAt fields
});

module.exports = BusinessOwnersPayments;
