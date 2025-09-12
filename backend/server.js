const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import configurations and utilities
const { testConnection, initializeDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const metaRoutes = require('./routes/meta');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - optimized for large uploads
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://resources.bylinelms.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // Cache preflight for 24 hours
}));

// Increase buffer sizes for large uploads
app.use(express.json({ 
  limit: '500mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '500mb',
  parameterLimit: 100000
}));

// Optimize for large file uploads
app.use((req, res, next) => {
  // No timeout for large uploads
  
  // Set headers for better upload handling
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Allow large uploads
  if (req.method === 'POST' && req.path.includes('/api/resources')) {
    res.setHeader('Connection', 'keep-alive');
  }
  
  next();
});

// Static file serving for uploads with caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Simple error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database with default data
    await initializeDatabase();
    
    // Start listening with optimized settings
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
    });

    // Optimize server for large uploads
    server.maxConnections = 1000;
    server.keepAliveTimeout = 300000; // 5 minutes for large uploads
    server.headersTimeout = 310000; // 5 minutes + 10 seconds
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
