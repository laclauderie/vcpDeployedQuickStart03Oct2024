// vcpBackend/src/models/categoriesModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Commerce = require("./commercesModel");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    }, 
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    commerce_id: {
      type: DataTypes.UUID,
      references: {
        model: Commerce,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    image_category: {
      type: DataTypes.STRING
    },
  },
  {
    tableName: "categories",
    timestamps: false, // Assuming you don't want Sequelize to manage createdAt and updatedAt fields
  }
);

// Define associations
Category.belongsTo(Commerce, { foreignKey: "commerce_id" });

module.exports = Category;
