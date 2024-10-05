// vcpBackend/src/models/paymentsModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const BusinessOwner = require('./businessOwnersModel'); // Make sure to require the BusinessOwner model to establish associations

const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  business_owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: BusinessOwner,
      key: 'id'
    }
  },
  latest_payment: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'payments',
  timestamps: false // Assuming you don't want Sequelize to manage createdAt and updatedAt fields
});

// Define associations if needed
Payment.associate = function(models) {
  Payment.belongsTo(models.BusinessOwner, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });
};

module.exports = Payment;
