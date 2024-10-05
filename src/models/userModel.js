// vcpBackend/src/models/userModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
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
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email_verified: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      isIn: [[0, 1]]
    }
  },
  reset_password_token: {
    type: DataTypes.STRING
  },
  reset_password_token_expires: {
    type: DataTypes.DATE
  },
  verification_token: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'user' // Set the table name explicitly
});

module.exports = User;

