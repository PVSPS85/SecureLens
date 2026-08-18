const RulebookEngine = require('./rulebook.engine');

class RulebookAdapter {
  static evaluateEvidence(evidenceContract) {
    const rawPayload = evidenceContract.toJSON ? evidenceContract.toJSON() : evidenceContract;
    return RulebookEngine.evaluate(rawPayload);
  }
}

module.exports = RulebookAdapter;
