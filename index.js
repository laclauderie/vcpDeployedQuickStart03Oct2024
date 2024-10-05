const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); // Load environment variables from .env file early

const { connectToDatabase, closeDatabaseConnection } = require('./src/config/db');
const userRoute = require('./src/routes/userRoute');
const businessOwnerRoute = require('./src/routes/businessOwnerRoute');
const paymentRoute = require('./src/routes/paymentRoute');
const commerceRoute = require('./src/routes/commerceRoute');
const categoryRoute = require('./src/routes/categoryRoute');
const productRoutes = require('./src/routes/productsRoute');
const detailsRoute = require('./src/routes/detailsRoute');
const villesRoute = require('./src/routes/villesRoute');

const expirePaymentsJob = require('./src/jobs/expirePaymentsJob');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json()); // Parse incoming request bodies
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:8100', 'http://example.com'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization'
}));

app.use(helmet()); // Enhance app security by setting HTTP headers
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per window
}));

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes setup
app.use('/api/users', userRoute);
app.use('/api/business-owners', businessOwnerRoute);
app.use('/api/payments', paymentRoute);
app.use('/api/my-commerces', commerceRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/products', productRoutes);
app.use('/api/details', detailsRoute);
app.use('/api/villes', villesRoute);

// Retry logic for expirePaymentsJob
const MAX_JOB_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds retry delay

const runExpirePaymentsJobOnStart = async (retries = MAX_JOB_RETRIES) => {
  try {
    await expirePaymentsJob();
    console.log('Expire Payments Job executed successfully on startup.');
  } catch (error) {
    console.error('Error executing expire payments job on startup:', error);
    if (retries > 0) {
      console.log(`Retrying expire payments job... Attempts left: ${retries - 1}`);
      await new Promise(res => setTimeout(res, RETRY_DELAY));
      return runExpirePaymentsJobOnStart(retries - 1);
    }
  }
};

// Run the job when the server starts
runExpirePaymentsJobOnStart();

// Start the server after connecting to the database
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error starting server:', error);
    process.exit(1); // Exit the process with error code 1
  });

// Gracefully close the database connection when the process is terminated
const gracefulShutdown = async () => {
  try {
    await closeDatabaseConnection();
    console.log('Database connection closed gracefully');
    process.exit(0); // Exit with success code
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1); // Exit with error code
  }
};

// Handle SIGINT (Ctrl+C) and SIGTERM (server shutdown)
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Gracefully close the database connection on unhandled rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await gracefulShutdown();
});
