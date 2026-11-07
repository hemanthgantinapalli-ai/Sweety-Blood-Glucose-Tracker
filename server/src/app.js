const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const readingRoutes = require('./routes/readingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Determine client URL
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve built frontend assets if client/dist exists (production deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const hasClientDist = fs.existsSync(clientDistPath);

if (hasClientDist) {
  app.use(express.static(clientDistPath));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Sweety Blood Glucose Tracker API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/reports', reportRoutes);

// Catch-all 404 for undefined /api routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Single Page Application (SPA) fallback or Welcome API response
app.get('*', (req, res) => {
  const indexHtml = path.join(clientDistPath, 'index.html');
  if (hasClientDist && fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.status(200).json({
    success: true,
    message: 'Welcome to Sweety - Blood Glucose Tracker API',
    frontend: clientUrl,
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      readings: '/api/readings',
      reports: '/api/reports',
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
