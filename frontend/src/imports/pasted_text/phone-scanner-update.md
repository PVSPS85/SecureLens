Update ONLY the existing Phone Scanner page in SecureLens.

Do not modify:
- Dashboard
- Quick Scan
- Scan History
- Lookalike Detection
- Scan Report
- QR Scanner
- Email Scanner
- Browser Extension
- Settings
- Login / Sign Up

Preserve the existing SecureLens visual design, dark green sidebar, typography, cards, spacing, buttons, and overall product style.

==================================================
1. PHONE SCANNER PURPOSE
==================================================

The Phone Scanner is a security-intelligence tool for checking whether a phone number shows signs of spam, scam, fraud, spoofing, or suspicious activity.

It is NOT an identity lookup service.

Do not claim to reveal the private owner/person behind a phone number.

Do not copy Truecaller.

The purpose is:

"Check a phone number for security and reputation signals."

==================================================
2. INPUT
==================================================

Keep the existing country selector and phone number input.

Example:

Country: India
Phone number:
+91 98765 43210

Primary action:

"Scan Phone"

Show a small example underneath if useful.

Support international numbers through the country selector.

==================================================
3. USER-INITIATED SCAN FLOW
==================================================

When the user clicks "Scan Phone":

Phone number entered
→ Phone analysis animation
→ Security checks
→ Phone Security Result

Use a short professional analysis state.

Show sequential steps such as:

Number received
→ Number validation
→ Country / region lookup
→ Carrier / line-type check
→ Reputation check
→ Scam report check
→ Spam activity check
→ Spoofing risk check
→ Risk score calculated

Keep the animation subtle and approximately 2–4 seconds.

Use illustrative/demo data in the prototype.

==================================================
4. PHONE SECURITY RESULT
==================================================

After the scan, show a professional result page/card.

Example:

+91 98765 43210

RISK LEVEL
HIGH

78 / 100

Summary:
"This number shows multiple indicators associated with spam and potential scam activity."

==================================================
5. NUMBER INFORMATION
==================================================

Show useful non-sensitive information such as:

Country
India

Region
Karnataka

Line Type
Mobile

Carrier
Illustrative Telecom Provider

Number Validity
Valid

Possible Number Type
Mobile / VoIP / Landline

Do not expose private ownership information.

==================================================
6. REPUTATION & REPORTS
==================================================

Show security reputation information such as:

Spam reports
31

Scam reports
18

Fraud-related reports
7

Last reported
2 days ago

Reputation:
Suspicious

Use illustrative/demo numbers and clearly keep them as prototype data.

==================================================
7. SECURITY SIGNALS
==================================================

Show individual findings with clear severity:

Examples:

✓ Valid number format
✓ Country and carrier resolved
⚠ Multiple spam reports
⚠ Suspicious calling reputation
🔴 Scam reports detected
⚠ Spoofing risk indicator

Use the existing SecureLens severity system:

Low
Medium
High
Critical

==================================================
8. SCAM / SPAM CATEGORIES
==================================================

Where applicable, show reported activity categories such as:

- Scam calls
- Spam calls
- Financial fraud
- OTP / verification scams
- Impersonation
- Promotional spam
- Robocalls

Do not claim a specific category unless the illustrative demo data supports it.

==================================================
9. RECOMMENDED ACTION
==================================================

Add a clear plain-language recommendation based on the risk.

For example:

HIGH RISK

"Do not share OTPs, passwords, banking details, or payment information with this number."

Possible actions:

- Block number
- Report number
- Avoid responding

These should be presented as recommendations, not actions SecureLens is secretly performing.

==================================================
10. RECENT PHONE SCANS
==================================================

Keep the existing "Recent Phone Checks" section.

Rename it to:

"Recent Phone Scans"

It should display previously completed scans performed through the Phone Scanner.

Show:

Phone number
Risk
Score
Finding
Time

This is a local scanner history/list and should remain separate from the user's main Scan History if that is already how the prototype is structured.

==================================================
11. SUPPORTED CHECKS
==================================================

Keep a Supported Checks panel.

Use items such as:

- Number format validation
- Country / region lookup
- Carrier & line-type lookup
- Spam reputation
- Scam report intelligence
- Fraud report matching
- Spoofing risk assessment
- Number type detection

Do not claim real-time access to external services in the prototype.

==================================================
12. PRIVACY
==================================================

Add a small privacy/prototype note.

Example:

"Prototype notice: Results shown in this prototype are illustrative. Production analysis would use approved security and reputation data sources and process submitted numbers securely."

Do not imply that SecureLens has access to private phone-owner databases.

==================================================
13. TERMINOLOGY
==================================================

Use:

Phone Scanner
Scan Phone
Phone Security Result
Recent Phone Scans

Avoid:

Truecaller
Owner lookup
Identity lookup
Person lookup

==================================================
14. IMPORTANT
==================================================

This should feel like a professional cybersecurity phone-reputation tool, not a caller-ID application.

Do not add unnecessary charts.
Do not add unnecessary pages.
Do not redesign unrelated parts of SecureLens.

Only improve the Phone Scanner workflow and result experience described above.