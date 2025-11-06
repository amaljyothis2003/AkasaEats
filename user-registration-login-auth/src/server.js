require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { initializeFirebase } = require('./config/firebase');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;
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
    // Allow requests with no origin (like mobile apps or curl)
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
    message: 'Auth service is running',
    timestamp: new Date().toISOString(),
    service: 'user-registration-login-auth',
  });
});

// API Routes
app.use(`${API_PREFIX}/auth`, authRoutes);

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
║  🚀 User Auth Service Started                         ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  📡 Server:    http://localhost:${PORT}                   ║
║  🔧 API:       ${API_PREFIX}                         ║
║  🌍 ENV:       ${process.env.NODE_ENV || 'development'}                   ║
║  ✅ Firebase:  Connected                              ║
╚════════════════════════════════════════════════════════╝
  `);
  console.log('Available routes:');
  console.log(`  GET    /health`);
  console.log(`  POST   ${API_PREFIX}/auth/register`);
  console.log(`  POST   ${API_PREFIX}/auth/login`);
  console.log(`  GET    ${API_PREFIX}/auth/user/:uid`);
  console.log(`  GET    ${API_PREFIX}/auth/profile [Protected]`);
  console.log(`  PUT    ${API_PREFIX}/auth/profile [Protected]`);
  console.log(`  DELETE ${API_PREFIX}/auth/user [Protected]`);
  console.log(`  POST   ${API_PREFIX}/auth/verify-email`);
  console.log(`  POST   ${API_PREFIX}/auth/custom-token`);
  console.log(`  POST   ${API_PREFIX}/auth/logout [Protected]`);
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
