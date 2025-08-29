import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { config } from '@config/env';
import rateLimit from 'express-rate-limit';
import { logger } from '@utils/logger';
import { UserRoutes } from '@modules/user/user.route';
import compression from 'compression';
import { errorHandler } from '@middleware/error.middleware';
import { notFound } from '@middleware/notFound.middleware';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

//default router
app.get('/', (req, res) => {
  res.send('🎯 Mongodb API is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});
// Compression middleware
app.use(compression());
// API Routes
app.use('/api/users', UserRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
