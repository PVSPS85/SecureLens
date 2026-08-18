const Logger = require('../utils/logger');

class NRDProcessor {
  constructor(engineInstance, concurrency = 5) {
    this.engine = engineInstance;
    this.concurrency = concurrency;
  }

  async processBatch(domainList) {
    Logger.info(`Starting NRD batch processing for ${domainList.length} domains...`);
    const results = [];

    for (let i = 0; i < domainList.length; i += this.concurrency) {
      const chunk = domainList.slice(i, i + this.concurrency);
      const chunkPromises = chunk.map(domain => 
        this.engine.scan(domain).catch(err => ({
          target: domain,
          error: err.message
        }))
      );

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    Logger.info(`Completed NRD batch processing.`);
    return results;
  }
}

module.exports = NRDProcessor;
