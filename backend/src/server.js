import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Middleware
import { requestLogger, errorLogger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import guestRoutes from './routes/guests.js';
import attendanceRoutes from './routes/attendance.js';
import thankYouRoutes from './routes/thankYou.js';
import webhookRoutes from './routes/webhook.js';
import whatsappRoutes from './routes/whatsapp.js';

// Database
import pool from './config/database.js';

// Worker
import ThankYouWorker from './workers/thankYouWorker.js';

// Services
import whatsappService from './services/whatsappService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for frontend
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/guests', guestRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/thank-you', thankYouRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// API root
app.get('/api', (req, res) => {
  res.json({
    name: 'Wedding Guest Dashboard API',
    version: '1.0.0',
    endpoints: {
      guests: '/api/guests',
      attendance: '/api/attendance',
      thankYou: '/api/thank-you',
      webhook: '/api/webhook'
    }
  });
});

// Serve frontend for all other routes (SPA support)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  } else {
    notFoundHandler(req, res);
  }
});

// Error logging
app.use(errorLogger);

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  
  // Test database connection
  try {
    await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    console.log('Please ensure PostgreSQL is running and .env is configured correctly');
  }
  
  // Start Thank You Worker in background
  if (process.env.AUTO_START_WORKER !== 'false') {
    const worker = new ThankYouWorker();
    worker.start().catch(console.error);
    console.log('✓ Thank You Worker started');
  }

  // Initialize WhatsApp service
  if (process.env.AUTO_START_WHATSAPP !== 'false') {
    try {
      await whatsappService.initialize();
      console.log('✓ WhatsApp service initialized');
    } catch (error) {
      console.error('✗ WhatsApp initialization failed:', error.message);
      console.log('You can initialize it later via API endpoint /api/whatsapp/initialize');
    }
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

export default app;
