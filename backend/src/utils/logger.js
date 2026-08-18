const LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  
  // Clean up metadata if it's an error object
  let formattedMeta = { ...meta };
  if (meta instanceof Error) {
    formattedMeta = {
      errorMessage: meta.message,
      stack: meta.stack
    };
  }

  // Structured logging for production, clean console output for development
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...formattedMeta
    });
  }

  const metaString = Object.keys(formattedMeta).length 
    ? ` | ${JSON.stringify(formattedMeta)}` 
    : '';
  return `[${timestamp}] [${level}] ${message}${metaString}`;
};

export const logger = {
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage(LEVELS.DEBUG, message, meta));
    }
  },
  info: (message, meta) => {
    console.log(formatMessage(LEVELS.INFO, message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatMessage(LEVELS.WARN, message, meta));
  },
  error: (message, meta) => {
    console.error(formatMessage(LEVELS.ERROR, message, meta));
  }
};

export default logger;
