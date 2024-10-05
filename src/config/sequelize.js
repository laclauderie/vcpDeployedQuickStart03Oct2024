const { Sequelize } = require("sequelize");
require("dotenv").config(); // Load environment variables from .env file

// Create a new Sequelize instance for Azure SQL Database
const sequelize = new Sequelize(
  process.env.DB_NAME,            // Database name from .env
  process.env.DB_USER,            // Username from .env
  process.env.DB_PASSWORD,        // Password from .env
  {
    host: process.env.DB_HOST,    // Host from .env (Azure SQL server)
    port: process.env.DB_PORT || 1433,  // Port from .env (default 1433 for MSSQL)
    dialect: "mssql",             // Specify MSSQL dialect
    dialectOptions: {
      options: {
        encrypt: true,            // Ensure encryption for Azure SQL
        trustServerCertificate: true, // Trust server certificate for secure connections
      },
    },
    logging: false,               // Disable logging for cleaner console output
  }
);

// Export the sequelize instance for use in other parts of the application
module.exports = sequelize;
