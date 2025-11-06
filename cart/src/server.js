require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { initializeFirebase } = require('./config/firebase');
const cartRoutes = require('./routes/cart');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3003;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Initialize Firebase Admin
try {
  initializeFirebase();
} catch (error) {
  console.error('Failed to start server due to Firebase initialization error');
  process.exit(1);
}

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cart service is running',
    timestamp: new Date().toISOString(),
    service: 'cart-management',
  });
});

// API Routes
app.use(`${API_PREFIX}/cart`, cartRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  🛒 Cart Management Service Started                   ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  📡 Server:    http://localhost:${PORT}                   ║
║  🔧 API:       ${API_PREFIX}                         ║
║  🌍 ENV:       ${process.env.NODE_ENV || 'development'}                   ║
║  ✅ Firebase:  Connected                              ║
╚════════════════════════════════════════════════════════╝
  `);
  console.log('Available routes:');
  console.log(`  GET    /health`);
  console.log(`  GET    ${API_PREFIX}/cart [Protected]`);
  console.log(`  POST   ${API_PREFIX}/cart [Protected]`);
  console.log(`  PUT    ${API_PREFIX}/cart/:itemId [Protected]`);
  console.log(`  DELETE ${API_PREFIX}/cart/:itemId [Protected]`);
  console.log(`  DELETE ${API_PREFIX}/cart [Protected]`);
  console.log(`  GET    ${API_PREFIX}/cart/validate [Protected]`);
  console.log();
  console.log(`🔗 Item Service: ${process.env.ITEM_SERVICE_URL || 'http://localhost:3002/api/v1'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
