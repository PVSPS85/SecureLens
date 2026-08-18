const SecurityEngine = require('./index');
const Logger = require('./utils/logger');

async function runSampleScan() {
  const engine = new SecurityEngine();
  const target = 'example.com';

  Logger.info(`Initiating scan for target: ${target}`);

  try {
    const report = await engine.scan(target);
    console.log('\n================ SCAN REPORT ================');
    console.log(`Target:       ${report.target} (${report.targetType})`);
    console.log(`Risk Score:   ${report.assessment.riskScore}/100 [${report.assessment.riskLevel}]`);
    console.log(`Completeness: ${report.completeness * 100}%`);
    console.log(`Confidence:   ${report.confidence * 100}%`);
    console.log('\nDetected Risks:');
    if (report.assessment.detectedRisks.length === 0) {
      console.log(' - None detected');
    } else {
      report.assessment.detectedRisks.forEach(risk => console.log(` - ${risk}`));
    }
    console.log('=============================================\n');
  } catch (err) {
    Logger.error(`Scan failed: ${err.message}`);
  }
}

runSampleScan();
