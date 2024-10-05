// vcpBackend/src/models/productsModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Category = require('./categoriesModel');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  reference: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  category_id: {
    type: DataTypes.UUID,
    references: {
      model: Category,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  image_product: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'products',
  timestamps: false // Assuming you don't want Sequelize to manage createdAt and updatedAt fields
});

// Define associations
Product.belongsTo(Category, { foreignKey: 'category_id' });

module.exports = Product;
