'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const { connectDB } = require('./config/database');
require('./models'); // Load all models + associations
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Route imports
const authRoutes       = require('./routes/authRoutes');
const studentRoutes    = require('./routes/studentRoutes');
const courseRoutes     = require('./routes/courseRoutes');
const marksRoutes      = require('./routes/marksRoutes');
const feesRoutes       = require('./routes/feesRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes  = require('./routes/dashboardRoutes');

// ─────────────────────────────────────────────────
// App setup
// ─────────────────────────────────────────────────
const app = express();

// ── CORS — allow React dev server ────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP request logging (Morgan → Winston) ─────
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.url === '/health',
  })
);

// ── Swagger API Docs ────────────────────────────
try {
  const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
  app.use(
    '/api/v1/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'CMS API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
} catch (e) {
  logger.warn('swagger.yaml not found, skipping API docs.');
}

// ── API Routes (v1) ─────────────────────────────
const BASE = '/api/v1';
app.use(`${BASE}/auth`,       authRoutes);
app.use(`${BASE}/students`,   studentRoutes);
app.use(`${BASE}/courses`,    courseRoutes);
app.use(`${BASE}/marks`,      marksRoutes);
app.use(`${BASE}/fees`,       feesRoutes);
app.use(`${BASE}/attendance`, attendanceRoutes);
app.use(`${BASE}/dashboard`,  dashboardRoutes);

// ── Health check ─────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎓 College Management System API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── 404 handler ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// ── Centralized error handler ────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📚 API Docs: http://localhost:${PORT}/api/v1/docs`);
    logger.info(`🏥 Health: http://localhost:${PORT}/health`);
  });
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
