// /Users/jclonana2005hotmail.com/vcpCloudinary/laclauderie-expressIonic24Aout2024Backend/src/config/config.js
require('dotenv').config(); // Load environment variables from .env file

module.exports = {
  development: {
    username: process.env.DB_USER,          // Username from .env
    password: process.env.DB_PASSWORD,      // Password from .env
    database: process.env.DB_NAME,          // Database name from .env
    host: process.env.DB_HOST,              // Azure SQL host from .env
    dialect: "mssql",
    port: process.env.DB_PORT || 1433,      // Port from .env (default is 1433)
    dialectOptions: {
      options: {
        encrypt: true,                      // Required for Azure SQL
        trustServerCertificate: true        // Trust self-signed certificates
      }
    }
  },
  test: {
    username: process.env.DB_USER,          // Username from .env
    password: process.env.DB_PASSWORD,      // Password from .env
    database: `${process.env.DB_NAME}_test`, // Test database
    host: process.env.DB_HOST,              // Azure SQL host from .env
    dialect: "mssql",
    port: process.env.DB_PORT || 1433,      // Port from .env (default is 1433)
    dialectOptions: {
      options: {
        encrypt: true,                      // Required for Azure SQL
        trustServerCertificate: true        // Trust self-signed certificates
      }
    }
  },
  production: {
    username: process.env.DB_USER,          // Username from .env
    password: process.env.DB_PASSWORD,      // Password from .env
    database: `${process.env.DB_NAME}_prod`, // Production database
    host: process.env.DB_HOST,              // Azure SQL host from .env
    dialect: "mssql",
    port: process.env.DB_PORT || 1433,      // Port from .env (default is 1433)
    dialectOptions: {
      options: {
        encrypt: true,                      // Required for Azure SQL
        trustServerCertificate: true        // Trust self-signed certificates
      }
    }
  }
};