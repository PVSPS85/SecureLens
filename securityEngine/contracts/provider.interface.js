class BaseProvider {
  constructor(name) {
    if (new.target === BaseProvider) {
      throw new TypeError("Cannot instantiate BaseProvider directly.");
    }
    this.name = name;
  }

  /**
   * Queries external API provider.
   * @param {string} target 
   * @returns {Promise<Object>}
   */
  async query(target) {
    throw new Error(`Method 'query()' must be implemented in ${this.name}`);
  }
}

module.exports = BaseProvider;
