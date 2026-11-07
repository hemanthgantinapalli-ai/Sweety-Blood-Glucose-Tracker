const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const readingRoutes = require('./routes/readingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root API welcome endpoint
app.get('/', (req, res) => {
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

// Health Check
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

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;

