import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import { startNrdDaemon, stopNrdDaemon } from './services/nrdDaemon.js';

let server;

// Start Server listening
try {
  server = app.listen(config.port, () => {
    logger.info(`=================================================`);
    logger.info(` SecureLens API Server initialized successfully  `);
    logger.info(` Port: ${config.port}                            `);
    logger.info(` Environment: ${config.env}                      `);
    logger.info(`=================================================`);
    
    // Initialize Newly Registered Domain monitoring daemon
    startNrdDaemon();
  });
} catch (error) {
  logger.error('Failed to start server:', error);
  process.exit(1);
}

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  stopNrdDaemon();
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle process termination events
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch any unhandled promise rejections or exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at:', promise);
  logger.error('Reason:', reason);
  // Fail closed gracefully
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  // Fail closed gracefully
  gracefulShutdown('uncaughtException');
});
