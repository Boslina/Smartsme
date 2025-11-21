// backend/server.js - UPDATED WITH CORS FIX
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ========== UPDATED CORS CONFIGURATION ==========
// This allows your frontend to communicate with the backend
app.use(cors({
  origin: [
    'http://localhost:3000',      // React dev server (default)
    'http://localhost:3001',      // Alternative port
    'http://127.0.0.1:3000',      // Alternative localhost format
    // Add your production URLs here when you deploy:
    // 'https://your-app-name.vercel.app',
    // 'https://your-custom-domain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========== ROUTES ==========
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/insights', require('./routes/insights'));

// ========== TEST ENDPOINT ==========
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SmartSME API',
    version: '2.0',
    status: 'running',
    endpoints: {
      transactions: '/api/transactions',
      insights: '/api/insights',
      chat: '/api/insights/chat',
      forecast: '/api/insights/forecast',
      test: '/api/test'
    }
  });
});

// ========== MONGODB CONNECTION ==========
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartsme';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📍 Database: ${MONGODB_URI}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('💡 Make sure MongoDB is running!');
  process.exit(1);
});

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

// ========== ERROR HANDLING MIDDLEWARE ==========
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      '/api/transactions',
      '/api/insights',
      '/api/insights/chat',
      '/api/insights/forecast'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 SmartSME Backend Server Started');
  console.log('='.repeat(50));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
  console.log('📋 Available endpoints:');
  console.log(`   • GET  http://localhost:${PORT}/`);
  console.log(`   • GET  http://localhost:${PORT}/api/test`);
  console.log(`   • GET  http://localhost:${PORT}/api/transactions`);
  console.log(`   • POST http://localhost:${PORT}/api/transactions`);
  console.log(`   • GET  http://localhost:${PORT}/api/insights`);
  console.log(`   • GET  http://localhost:${PORT}/api/insights/forecast`);
  console.log(`   • POST http://localhost:${PORT}/api/insights/chat`);
  console.log('='.repeat(50));
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, closing server gracefully...');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, closing server gracefully...');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

module.exports = app;
