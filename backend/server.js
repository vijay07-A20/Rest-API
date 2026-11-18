import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Middlewares
import { requestLogger, sseClients } from './middleware/requestLogger.js';
import { regexValidator } from './middleware/regexValidator.js';
import { pdaMiddleware } from './middleware/pdaSequenceMonitor.js';
import { dfaMiddleware } from './middleware/dfaEngine.js';
import { abuseDetectionMiddleware } from './middleware/abuseDetector.js';
import { rateLimitMiddleware } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Route Handlers
import dashboardRoutes from './routes/dashboardRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import rateLimitRoutes from './routes/rateLimitRoutes.js';
import dfaRoutes from './routes/dfaRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import testRoutes from './routes/testRoutes.js';
import protectedApiRoutes from './routes/protectedApiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting Vite frontend in dev & production origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_ORIGIN || '').split(',').map(origin => origin.trim()),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or matching origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS security policy'));
    }
  },
  credentials: true,
  exposedHeaders: ['Retry-After', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'X-Request-ID'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health Check Endpoint (Bypasses rate limiting for monitoring agents & cloud orchestrators)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'REST API Rate Limiting and Abuse Detection Sentinel',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Real-Time Server-Sent Events (SSE) Stream Endpoint
app.get('/api/stream/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  // Send initial ping to establish handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Stream active' })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Middleware Security Pipeline (Ordered Execution)
app.use(requestLogger);
app.use(regexValidator);
app.use(pdaMiddleware);
app.use(dfaMiddleware);

// Test routes bypass rate limiting so tests can simulate arbitrary loads safely
app.use('/api/test', testRoutes);

// Dashboard read-only routes bypass strict rate limiting to allow continuous monitoring
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ratelimit', rateLimitRoutes);
app.use('/api/dfa', dfaRoutes);
app.use('/api/settings', settingsRoutes);

// Application Protected Routes (Subject to Abuse Detection and Sliding Window Rate Limiting)
app.use('/api/v1', abuseDetectionMiddleware, rateLimitMiddleware, protectedApiRoutes);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Bootstrap Server & Database
async function bootstrap() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(` REST API RATE LIMITING & ABUSE DETECTION SENTINEL`);
    console.log(` Backend Service running on: http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` SSE Stream: http://localhost:${PORT}/api/stream/events`);
    console.log(`================================================================`);
  });

  // Graceful Shutdown
  const gracefulShutdown = () => {
    console.log('[System] Received shutdown signal. Closing HTTP connections...');
    server.close(() => {
      console.log('[System] Sentinel HTTP server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

bootstrap().catch(err => {
  console.error('[System] Fatal startup failure:', err);
  process.exit(1);
});

export default app;
