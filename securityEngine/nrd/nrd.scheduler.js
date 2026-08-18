const Logger = require('../utils/logger');

class NRDScheduler {
  constructor(nrdProcessor, fetchFeedFn, intervalMs = 3600000) { // Default 1 hour
    this.processor = nrdProcessor;
    this.fetchFeedFn = fetchFeedFn;
    this.intervalMs = intervalMs;
    this.timer = null;
  }

  start() {
    Logger.info('Starting NRD Cron Scheduler...');
    this.timer = setInterval(async () => {
      try {
        const rawFeed = await this.fetchFeedFn();
        await this.processor.processBatch(rawFeed);
      } catch (err) {
        Logger.error('Scheduled NRD job failed:', err);
      }
    }, this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      Logger.info('Stopped NRD Scheduler.');
    }
  }
}

module.exports = NRDScheduler;
