import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import config from './config/index.js';
import logger from './utils/logger.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const app = express();

// 1. Security Headers via Helmet
app.use(helmet());

// 2. Request Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. CORS configuration with explicit boundaries
const allowedOrigins = config.corsOrigin
  ? config.corsOrigin.split(',').map(o => o.trim())
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      logger.warn(`Blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// 4. Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// 5. Mount API Routes
app.use('/api/v1', apiRouter);

// 6. Handle Route-Not-Found (404)
app.use(notFoundHandler);

// 7. Global Error Handler (Sanitizes response, logs stack trace internally)
app.use(errorHandler);

export default app;
