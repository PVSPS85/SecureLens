const tls = require('tls');
const BaseAnalyzer = require('../../contracts/analyzer.interface');
const ResourceLimits = require('../../security/resource-limits');

class TLSAnalyzer extends BaseAnalyzer {
  constructor() {
    super('tls');
  }

  async analyze(context) {
    const hostname = context.hostname || context.value;
    const port = context.port || 443;

    try {
      const certInfo = await ResourceLimits.withTimeout(
        this.fetchCertificate(hostname, port),
        5000,
        'TLS Inspection'
      );

      return this.formatResult(true, certInfo);
    } catch (err) {
      return this.formatResult(false, { valid: false }, err);
    }
  }

  fetchCertificate(hostname, port) {
    return new Promise((resolve, reject) => {
      const socket = tls.connect(
        { host: hostname, port, servername: hostname, rejectUnauthorized: false },
        () => {
          const cert = socket.getPeerCertificate(true);
          const authorized = socket.authorized;
          const authorizationError = socket.authorizationError;
          socket.end();

          if (!cert || Object.keys(cert).length === 0) {
            return reject(new Error('No certificate presented by server'));
          }

          const validTo = new Date(cert.valid_to);
          const validFrom = new Date(cert.valid_from);
          const now = new Date();

          resolve({
            subject: cert.subject?.CN || null,
            issuer: cert.issuer?.O || cert.issuer?.CN || null,
            validFrom: validFrom.toISOString(),
            validTo: validTo.toISOString(),
            isExpired: now > validTo,
            isSelfSigned: cert.issuer?.CN === cert.subject?.CN,
            authorized,
            authorizationError: authorizationError ? String(authorizationError) : null,
            fingerprint: cert.fingerprint256 || cert.fingerprint
          });
        }
      );

      socket.on('error', (err) => reject(err));
    });
  }
}

module.exports = TLSAnalyzer;
