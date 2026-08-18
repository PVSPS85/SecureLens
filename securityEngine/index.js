const TargetUtils = require('./utils/target');
const DomainAnalyzer = require('./analyzers/domain/domain.analyzer');
const DNSAnalyzer = require('./analyzers/dns/dns.analyzer');
const WhoisAnalyzer = require('./analyzers/whois/whois.analyzer');
const TLSAnalyzer = require('./analyzers/tls/tls.analyzer');
const HTTPAnalyzer = require('./analyzers/http/http.analyzer');
const LookalikeAnalyzer = require('./analyzers/lookalike/lookalike.analyzer');
const IPASNAnalyzer = require('./analyzers/ip-asn/ip-asn.analyzer');
const EvidenceAggregator = require('./aggregation/evidence.aggregator');
const CompletenessCalculator = require('./aggregation/completeness');
const ConfidenceCalculator = require('./aggregation/confidence');
const FailureHandler = require('./aggregation/failure-handler');
const RulebookAdapter = require('./rulebook/rulebook.adapter');

class SecurityEngine {
  constructor(config = {}) {
    this.config = config;
    this.analyzers = [
      new DomainAnalyzer(),
      new DNSAnalyzer(),
      new WhoisAnalyzer(),
      new TLSAnalyzer(),
      new HTTPAnalyzer(),
      new LookalikeAnalyzer(),
      new IPASNAnalyzer()
    ];
  }

  /**
   * Scans a target domain, URL, or IP.
   * @param {string} rawTarget 
   */
  async scan(rawTarget) {
    const targetContext = TargetUtils.parseTarget(rawTarget);

    // Execute all analyzers concurrently with failure isolation
    const analyzerPromises = this.analyzers.map(analyzer => 
      analyzer.analyze(targetContext).catch(err => 
        FailureHandler.createFallback(analyzer.name, err)
      )
    );

    const results = await Promise.all(analyzerPromises);

    // Aggregate facts
    const evidencePayload = EvidenceAggregator.aggregate(targetContext, results);
    const analyzersDict = evidencePayload.analyzers;

    // Compute meta metrics
    const completeness = CompletenessCalculator.calculate(analyzersDict, this.analyzers.length);
    const confidence = ConfidenceCalculator.calculate(analyzersDict);

    // Evaluate risks using Rulebook
    const assessment = RulebookAdapter.evaluateEvidence(evidencePayload);

    return {
      target: targetContext.value,
      targetType: targetContext.type,
      timestamp: new Date().toISOString(),
      completeness,
      confidence,
      assessment,
      evidence: evidencePayload
    };
  }
}

module.exports = SecurityEngine;
