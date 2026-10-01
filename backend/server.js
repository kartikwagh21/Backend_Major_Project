const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const technicianRoutes = require('./routes/technicianRoutes');
const requestRoutes = require('./routes/requestRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Initialize Express App
const app = express();

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// CORS Configuration (Permissive for local & any Vercel domain)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get(['/api/health', '/health', '/'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Repair Service Management System API is running smoothly.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (mounted at both /api/* and /* for compatibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/technicians', technicianRoutes);
app.use('/technicians', technicianRoutes);

app.use('/api/requests', requestRoutes);
app.use('/requests', requestRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Repair Service API Server running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
    console.log(`🔒 Image Storage: MongoDB Atlas Binary Stream`);
    console.log(`======================================================\n`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
  });
}

module.exports = app;
