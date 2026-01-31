const express = require('express');
const cors = require('cors');
const path = require('path');

// Diagnostic startup logging
console.log('[Startup] Starting backend...');
process.on('uncaughtException', (err) => {
  console.error('[Startup] Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Startup] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const envPath = path.join(__dirname, '../.env');
console.log('[Startup] Loading env from:', envPath);
require('dotenv').config({ path: envPath });

// Import routes
const meetingRoutes = require('./src/routes/meetingRoutes');

// Import config to validate on startup
const watsonxConfig = require('./src/config/watsonx');

const app = express();
const PORT = process.env.PORT || 5000;
console.log('[Startup] Port configured:', PORT);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for large transcripts
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running 🚀',
    watsonxConfigured: watsonxConfig.isConfigured(),
    timestamp: new Date().toISOString()
  });
});

// API Info route
app.get('/api', (req, res) => {
  res.json({
    name: 'Smart Meeting Assistant API',
    version: '1.0.0',
    endpoints: {
      'POST /api/meeting/process': 'Process complete meeting transcript',
      'POST /api/meeting/summary': 'Get meeting summary only',
      'POST /api/meeting/actions': 'Get action items only',
      'POST /api/meeting/followups': 'Get follow-up suggestions',
      'POST /api/meeting/qa': 'Ask questions about the meeting',
      'DELETE /api/meeting/cache/:sessionId': 'Clear session cache'
    }
  });
});

// Mount routes
app.use('/api/meeting', meetingRoutes);

// Serve frontend for any non-API routes (SPA support)
app.use((req, res, next) => {
  // Skip API routes and other static files
  if (req.path.startsWith('/api') || req.path === '/health' || req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: '/api'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════════════╗
  ║   🤖 Smart Meeting Assistant                                      ║
  ║   Server running on http://localhost:${PORT}                         ║
  ║   Frontend: http://localhost:${PORT}                                 ║
  ║   API Docs: http://localhost:${PORT}/api                             ║
  ║   watsonx.ai configured: ${watsonxConfig.isConfigured() ? '✅' : '❌'}                                       ║
  ╚═══════════════════════════════════════════════════════════════════╝
  `);
  
  if (!watsonxConfig.isConfigured()) {
    console.warn('⚠️  Warning: watsonx.ai is not configured. Set WATSONX_API_KEY, WATSONX_PROJECT_ID, and WATSONX_URL in .env');
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`[Startup] CRITICAL ERROR: Port ${PORT} is already in use. Please close the other process or set a different PORT in .env`);
  } else {
    console.error('[Startup] Server Error:', e);
  }
  process.exit(1);
});
