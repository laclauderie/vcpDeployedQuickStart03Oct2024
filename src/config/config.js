// /Users/jclonana2005hotmail.com/vcpCloudinary/laclauderie-expressIonic24Aout2024Backend/src/config/config.js
require('dotenv').config(); // Load environment variables from .env file
const { DefaultAzureCredential } = require("@azure/identity");
const { Connection, Request } = require("tedious");

module.exports = {
  development: {
    database: process.env.DB_NAME,
    server: process.env.DB_HOST,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      rowCollectionOnRequestCompletion: true // Option to collect rows for response
    },
    authentication: {
      type: "azure-active-directory-msi-app-service" // Updated for App Service
    },
    dialect: "mssql",  // Specify SQL dialect
    async acquireToken() {
      try {
        const credential = new DefaultAzureCredential();
        const tokenResponse = await credential.getToken("https://database.windows.net/");
        return tokenResponse.token;
      } catch (error) {
        console.error("Error acquiring Azure token:", error);
        throw error;
      }
    }
  },
  production: {
    database: process.env.DB_NAME,
    server: process.env.DB_HOST,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      rowCollectionOnRequestCompletion: true
    },
    authentication: {
      type: "azure-active-directory-msi-app-service"  // Use Managed Identity authentication for Azure App Service
    },
    dialect: "mssql",
    async acquireToken() {
      try {
        const credential = new DefaultAzureCredential();
        const tokenResponse = await credential.getToken("https://database.windows.net/");
        return tokenResponse.token;
      } catch (error) {
        console.error("Error acquiring Azure token:", error);
        throw error;
      }
    }
  }
};
