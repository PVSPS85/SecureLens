class ResourceLimits {
  /**
   * Wraps a promise with a hard timeout limit.
   * @param {Promise<any>} promise 
   * @param {number} ms - Timeout in milliseconds
   * @param {string} taskName 
   */
  static withTimeout(promise, ms = 5000, taskName = 'Operation') {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`${taskName} timed out after ${ms}ms`));
      }, ms);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timer);
    });
  }

  /**
   * Truncates dynamic buffers/responses to prevent memory overflow.
   * @param {string} data 
   * @param {number} maxBytes 
   */
  static truncateString(data, maxBytes = 1000000) {
    if (typeof data !== 'string') return '';
    return data.length > maxBytes ? data.slice(0, maxBytes) : data;
  }
}

module.ResourceLimits = ResourceLimits;
module.exports = ResourceLimits;
