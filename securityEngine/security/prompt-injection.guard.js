class PromptInjectionGuard {
  /**
   * Sanitizes extracted text/HTML prior to passing downstream.
   * Strips potential injection patterns and dangerous sequences.
   * @param {string} rawText 
   * @returns {string} Sanitized text
   */
  static sanitizeText(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';

    return rawText
      // Strip system prompt injection delimiters / override attempts
      .replace(/\[system\]/gi, '[filtered_tag]')
      .replace(/<\|im_start\|>/gi, '')
      .replace(/<\|im_end\|>/gi, '')
      .replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '[FILTERED_INSTRUCTION]')
      .replace(/DISREGARD PREVIOUS PROMPTS/gi, '[FILTERED_INSTRUCTION]')
      // Normalize excessive control characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim();
  }
}

module.exports = PromptInjectionGuard;
