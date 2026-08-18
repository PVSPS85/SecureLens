class FailureHandler {
  /**
   * Formats a fallback fact result when an analyzer encounters an error or timeout.
   * @param {string} analyzerName 
   * @param {Error|string} error 
   */
  static createFallback(analyzerName, error) {
    return {
      analyzer: analyzerName,
      timestamp: new Date().toISOString(),
      success: false,
      data: { status: 'UNAVAILABLE' },
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

module.exports = FailureHandler;
