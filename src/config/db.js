// /Users/jclonana2005hotmail.com/vcpCloudinary/laclauderie-expressIonic24Aout2024Backend/src/config/db.js

const sequelize = require('./sequelize');
const User = require('../models/userModel');
const BusinessOwner = require('../models/businessOwnersModel');
const Payments = require('../models/paymentsModel'); 
const BusinessOwnersPayments = require('../models/businessOwnersPaymentsModel'); 
const AccessControl = require('../models/accessControlModel');
const Commerces = require('../models/commercesModel');
const Villes = require('../models/villesModel');
const Categories = require('../models/categoriesModel');
const Products = require('../models/productsModel');
const Details = require('../models/detailsModel');

const MAX_RETRIES = 5; // Maximum number of retries for connecting to the database
const RETRY_DELAY = 5000; // 5 seconds between retries

async function connectToDatabase(retries = MAX_RETRIES) {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    if (retries > 0) {
      console.log(`Retrying to connect... Attempts left: ${retries - 1}`);
      await new Promise(res => setTimeout(res, RETRY_DELAY)); // Wait before retrying
      return connectToDatabase(retries - 1); // Retry connection
    } else {
      console.error('Max retries reached. Exiting.');
      throw error;
    }
  }
}

async function closeDatabaseConnection() {
  await sequelize.close();
  console.log('Database connection closed.');
}

async function initDatabase() {
  try {
    await connectToDatabase();
    setupAssociations();
    await sequelize.sync();
    console.log('Database initialized successfully');
  } catch (err) {
    console.log('Errors during database initialization:', err);
    throw err;
  }
} 

function setupAssociations() {
  // Associations here...
  User.hasOne(BusinessOwner, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  BusinessOwner.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

  BusinessOwner.hasMany(Payments, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });
  Payments.belongsTo(BusinessOwner, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });

  BusinessOwner.hasOne(BusinessOwnersPayments, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });
  BusinessOwnersPayments.belongsTo(BusinessOwner, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });

  Payments.hasOne(BusinessOwnersPayments, { foreignKey: 'payment_id', onDelete: 'CASCADE' });
  BusinessOwnersPayments.belongsTo(Payments, { foreignKey: 'payment_id', onDelete: 'CASCADE' });

  BusinessOwner.hasOne(AccessControl, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });
  AccessControl.belongsTo(BusinessOwner, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });

  BusinessOwner.hasMany(Commerces, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });
  Commerces.belongsTo(BusinessOwner, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });

  Commerces.belongsTo(Villes, { foreignKey: 'ville_id', onDelete: 'CASCADE' });
  Villes.hasMany(Commerces, { foreignKey: 'ville_id', onDelete: 'CASCADE' });

  Categories.belongsTo(Commerces, { foreignKey: 'commerce_id', onDelete: 'CASCADE' });
  Commerces.hasMany(Categories, { foreignKey: 'commerce_id', onDelete: 'CASCADE' });

  Products.belongsTo(Categories, { foreignKey: 'category_id', onDelete: 'CASCADE' });
  Categories.hasMany(Products, { foreignKey: 'category_id', onDelete: 'CASCADE' });

  Details.belongsTo(Products, { foreignKey: 'product_id', onDelete: 'CASCADE' });
  Products.hasMany(Details, { foreignKey: 'product_id', onDelete: 'CASCADE' });
}

// Initialize the database
initDatabase().catch((error) => {
  console.error('Error initializing database:', error);
  process.exit(1); 
});

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
  setupAssociations,
};