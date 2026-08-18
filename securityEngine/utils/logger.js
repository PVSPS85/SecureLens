class Logger {
  static sanitize(message) {
    if (typeof message !== 'string') return message;
    return message
      .replace(/(api[_-]?key|password|bearer|token)=['"][^'"]+['"]/gi, '$1=[REDACTED]')
      .replace(/([a-zA-Z0-9_\-\.]{20,})/g, (match) => {
        // Redact potential high-entropy API tokens while keeping basic logs intact
        return match.length > 32 ? `${match.slice(0, 4)}...[REDACTED]` : match;
      });
  }

  static info(msg, ...meta) {
    console.log(`[INFO] [${new Date().toISOString()}] ${this.sanitize(msg)}`, ...meta);
  }

  static warn(msg, ...meta) {
    console.warn(`[WARN] [${new Date().toISOString()}] ${this.sanitize(msg)}`, ...meta);
  }

  static error(msg, ...meta) {
    console.error(`[ERROR] [${new Date().toISOString()}] ${this.sanitize(msg)}`, ...meta);
  }
}

module.exports = Logger;
