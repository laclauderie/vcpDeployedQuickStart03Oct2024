// vcpBackend/src/models/detailsModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Product = require('./productsModel');

const Detail = sequelize.define('Detail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  detail_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  product_id: {
    type: DataTypes.UUID,
    references: {
      model: Product,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  image_detail: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'details',
  timestamps: false // Assuming you don't want Sequelize to manage createdAt and updatedAt fields
});

// Define associations
Detail.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = Detail;
