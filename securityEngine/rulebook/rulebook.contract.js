class RulebookContract {
  /**
   * Defines a rule standard for risk calculation.
   * @param {Object} rule 
   * @param {string} rule.id - Unique identifier (e.g. 'RULE_NEW_DOMAIN')
   * @param {string} rule.description - Short explanation of the risk
   * @param {number} rule.weight - Points added to risk score
   * @param {Function} rule.condition - Function accepting evidence and returning boolean
   */
  constructor({ id, description, weight, condition }) {
    if (!id || typeof id !== 'string') throw new Error('Rule must have a valid string id');
    if (typeof weight !== 'number') throw new Error('Rule weight must be a number');
    if (typeof condition !== 'function') throw new Error('Rule condition must be a function');

    this.id = id;
    this.description = description;
    this.weight = weight;
    this.condition = condition;
  }

  evaluate(evidencePayload) {
    try {
      return this.condition(evidencePayload) === true;
    } catch {
      return false;
    }
  }
}

module.exports = RulebookContract;
