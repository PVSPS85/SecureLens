class BrowserUtils {
  /**
   * Evaluates input fields and forms present on a page context.
   * @param {Array<Object>} formElements 
   */
  static extractFormSecurityDetails(formElements = []) {
    let passwordInputs = 0;
    let sensitiveInputs = 0;
    let hasExternalFormAction = false;

    for (const form of formElements) {
      if (form.action && /^https?:\/\//i.test(form.action)) {
        hasExternalFormAction = true;
      }
      for (const inputType of form.inputTypes || []) {
        if (inputType === 'password') passwordInputs++;
        if (['credit-card', 'ssn', 'cvv', 'email'].includes(inputType)) sensitiveInputs++;
      }
    }

    return {
      passwordInputs,
      sensitiveInputs,
      hasExternalFormAction,
      isCredentialHarvestingRisk: passwordInputs > 0 && hasExternalFormAction
    };
  }
}

module.exports = BrowserUtils;
