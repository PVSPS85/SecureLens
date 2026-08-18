const assert = require('assert');
const SSRFGuard = require('../security/ssrf.guard');
const TargetUtils = require('../utils/target');
const SecurityEngine = require('../index');

async function runTests() {
  console.log('--- Running Security Engine Tests ---');

  // Test 1: SSRF Guard Private IP Block
  try {
    SSRFGuard.isPrivateIP('127.0.0.1');
    assert.strictEqual(SSRFGuard.isPrivateIP('127.0.0.1'), true, '127.0.0.1 must be private');
    assert.strictEqual(SSRFGuard.isPrivateIP('8.8.8.8'), false, '8.8.8.8 must be public');
    console.log('✓ SSRF Guard IP filtering passed');
  } catch (err) {
    console.error('✗ SSRF Guard test failed:', err.message);
  }

  // Test 2: Target Parser
  try {
    const target = TargetUtils.parseTarget('https://example.com/login');
    assert.strictEqual(target.type, 'url');
    assert.strictEqual(target.hostname, 'example.com');
    console.log('✓ Target parser passed');
  } catch (err) {
    console.error('✗ Target parser test failed:', err.message);
  }

  // Test 3: Engine Full Scan Execution
  try {
    const engine = new SecurityEngine();
    const result = await engine.scan('example.com');
    assert.ok(result.assessment);
    assert.ok(typeof result.completeness === 'number');
    console.log('✓ Engine full scan execution passed');
  } catch (err) {
    console.error('✗ Engine scan test failed:', err.message);
  }

  console.log('--- Tests Completed ---');
}

runTests();
