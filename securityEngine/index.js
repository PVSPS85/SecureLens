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
const RedirectAnalyzer = require('./analyzers/redirects/redirect.analyzer');
const ThreatIntelAnalyzer = require('./analyzers/threat-intelligence/threat-intel.analyzer');
const BrowserAnalyzer = require('./analyzers/browser/browser.analyzer');
const VisualAnalyzer = require('./analyzers/visual/visual.analyzer');
const dns = require('dns').promises;

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
      new IPASNAnalyzer(),
      new RedirectAnalyzer(),
      new ThreatIntelAnalyzer(),
      new BrowserAnalyzer(),
      new VisualAnalyzer()
    ];
  }

  /**
   * Scans a target domain, URL, or IP.
   * @param {string} rawTarget 
   * @param {object} [options={}] - Scan options: mode ('full' | 'quick' | 'fast')
   */
  async scan(rawTarget, options = {}) {
    const targetContext = TargetUtils.parseTarget(rawTarget);

    // If quick/fast mode requested, filter out heavy browser/visual analyzers
    const isQuick = options.mode === 'quick' || options.mode === 'fast' || options.quick === true;
    const activeAnalyzers = isQuick
      ? this.analyzers.filter(a => a.name !== 'browser' && a.name !== 'visual')
      : this.analyzers;

    // Fallback: If target is not an IP, resolve it so IPASNAnalyzer has an IP to test
    if (targetContext.type !== 'ip' && !targetContext.resolvedIp) {
      try {
        const lookupResult = await dns.lookup(targetContext.hostname || targetContext.value);
        targetContext.resolvedIp = lookupResult.address;
      } catch (err) {
        // Continue silently; IPASNAnalyzer will fail gracefully
      }
    }

    // Execute active analyzers concurrently with failure isolation
    const analyzerPromises = activeAnalyzers.map(analyzer => 
      analyzer.analyze(targetContext).catch(err => 
        FailureHandler.createFallback(analyzer.name, err)
      )
    );

    const results = await Promise.all(analyzerPromises);

    // Aggregate facts
    const evidencePayload = EvidenceAggregator.aggregate(targetContext, results);
    const analyzersDict = evidencePayload.analyzers;

    // Compute meta metrics
    const completeness = CompletenessCalculator.calculate(analyzersDict, activeAnalyzers.length);
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
