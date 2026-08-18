class DNSUtils {
  /**
   * Analyzes TXT records for SPF and DMARC policies.
   * @param {Array<string|Array<string>>} txtRecords 
   */
  static parseEmailSecurityRecords(txtRecords = []) {
    const flattened = txtRecords.map(r => (Array.isArray(r) ? r.join('') : r));

    const spfRecord = flattened.find(r => r.startsWith('v=spf1'));
    const dmarcRecord = flattened.find(r => r.startsWith('v=DMARC1'));

    return {
      hasSPF: Boolean(spfRecord),
      spfRecord: spfRecord || null,
      hasDMARC: Boolean(dmarcRecord),
      dmarcRecord: dmarcRecord || null,
      isDmarcRejectPolicy: dmarcRecord ? dmarcRecord.includes('p=reject') : false
    };
  }
}

module.exports = DNSUtils;
