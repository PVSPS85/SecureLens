Continue refining the existing SecureLens prototype.

IMPORTANT CREDIT-SAVING INSTRUCTION:
Make ONLY the changes explicitly requested below.
Do NOT redesign existing pages.
Do NOT change the sidebar.
Do NOT redesign the Dashboard.
Do NOT redesign the Investigation Result layout.
Do NOT modify scanners, settings, browser extension, landing page, or authentication.
Reuse all existing components and styling.

THIS BATCH HAS ONLY TWO GOALS:

1. Improve the Investigation Report / PDF report experience.
2. Improve the SecureAI investigation assistant.

==================================================
1. INVESTIGATION REPORT / PDF
==================================================

SecureLens needs a professional investigation report that can eventually be exported as PDF.

Do NOT create a completely separate visual language.

The report should reuse the existing Investigation Result evidence and styling.

Create a polished report structure:

--------------------------------------------------
SECURELENS INVESTIGATION REPORT
--------------------------------------------------

Header:

SecureLens
Security Investigation Report

Investigation ID
Date / Time
Investigation status

--------------------------------------------------
TARGET
--------------------------------------------------

Submitted URL
Effective URL
Domain
IP Address
Country
Hosting Provider

--------------------------------------------------
RISK SUMMARY
--------------------------------------------------

Risk Score

98 / 100

CRITICAL

Short explanation of the overall risk.

Show:

Critical findings
High findings
Medium findings
Low findings

Checks completed
Warnings
Failed checks
Total checks

--------------------------------------------------
INVESTIGATION SUMMARY
--------------------------------------------------

Provide a concise human-readable explanation.

Example:

"This website shows strong indicators of credential harvesting and possible brand impersonation."

Then:

Key Findings
- Suspicious login form
- Brand impersonation indicators
- Suspicious redirect
- Threat intelligence warning

Recommended Action:
"Do not enter credentials or sensitive information."

Use existing demo investigation data.

Do not invent new findings.

--------------------------------------------------
WEBSITE VISUAL EVIDENCE
--------------------------------------------------

Include the investigated website screenshot / website preview.

Label it:

"Website Visual Evidence"

If an actual screenshot is unavailable, show the existing deliberate unavailable state.

Do NOT create a huge blank area.

--------------------------------------------------
TECHNICAL EVIDENCE
--------------------------------------------------

Include the existing investigation evidence sections:

URL
DNS
IP / ASN
TLS
HTTP
Redirects
Threat Intelligence
Website
Technologies
Links
Cookies
Phishing

Each section should contain:

Check
Status
Value / Evidence
Short explanation

Use the existing evidence data.

Keep the report compact and readable.

--------------------------------------------------
SECUREAI ASSESSMENT
--------------------------------------------------

Include a short SecureAI assessment near the end.

Show:

Overall Assessment
Confidence
Reasoning
Recommended Action

--------------------------------------------------
REPORT FOOTER
--------------------------------------------------

Include:

SecureLens

Investigation ID
Generated date
Prototype / Demo Data notice

Do not make unsupported claims.

==================================================
2. REPORT ACTION
==================================================

The existing "Export Report" action should visually communicate that the report can be exported as PDF.

Do NOT build a real PDF generation backend.

This is a prototype interaction.

When clicked, show a professional export state such as:

"Preparing Investigation Report..."

then:

"Report ready"

with:

[ Download PDF ]

Since this is a prototype, the button may use a demo interaction.

Do not claim that a real backend has generated the file.

==================================================
3. SECUREAI
==================================================

Improve the existing SecureAI experience.

SecureAI is an investigation-aware assistant.

It must use the CURRENT investigation as context.

The assistant should NOT behave like a generic ChatGPT clone.

The interface should clearly communicate:

"SecureAI"

"Ask about this investigation"

Example suggested questions:

- Why is this website risky?
- Show the strongest evidence.
- Explain this finding in simple terms.
- Is it safe to continue?
- What should I do next?

==================================================
4. SECUREAI RESPONSE DESIGN
==================================================

When a user asks a question, show:

User question

SecureAI response

Evidence references where appropriate.

Example:

Question:
"Why is this website risky?"

Response:

"SecureLens identified several indicators associated with phishing:

1. Brand impersonation detected
2. Suspicious credential collection form
3. Suspicious redirect behavior
4. Threat intelligence match

These findings together contribute to the Critical risk score."

Then optionally:

"Evidence used"

with links/chips to:

Threat Intel
Redirects
Phishing
Website

Do not invent evidence.

==================================================
5. SECUREAI ACTIONS
==================================================

Keep the existing quick actions:

Explain this finding
Show strongest evidence
Explain in simple terms
Is it safe to continue?

Make them context-aware.

For example:

If the user is viewing the TLS section:

"Explain this finding"

should explain TLS evidence.

If the user is viewing Threat Intelligence:

"Explain this finding"

should explain threat intelligence evidence.

Do not create generic responses unrelated to the current investigation.

==================================================
6. SECUREAI SAFETY / TRUST
==================================================

Add a subtle disclaimer:

"SecureAI explains the investigation evidence. It does not replace the underlying security checks."

Do not make SecureAI appear to independently determine the final risk score.

The risk engine / investigation evidence remains the source of the score.

==================================================
7. SECUREAI STATES
==================================================

Include only the necessary UI states:

Idle
Loading
Response
Error

Loading:

"SecureAI is analyzing the investigation evidence..."

Error:

"SecureAI couldn't generate an explanation right now."

[ Try Again ]

Keep these states compact.

==================================================
8. VISUAL DESIGN
==================================================

Use the existing SecureLens visual language.

SecureAI should feel:

Professional
Trustworthy
Investigation-aware
Technical
Helpful

Do NOT turn it into:

- A full-screen chatbot
- A colorful consumer AI interface
- A separate AI application
- A generic chat window

The investigation remains the main product.

==================================================
9. IMPORTANT DATA RULE
==================================================

Use ONLY the existing SecureLens demo investigation data.

Do not fabricate additional investigations.

Do not invent new security findings.

Do not introduce unsupported security claims.

==================================================
10. FINAL CHECK
==================================================

Before finishing:

- Preserve all existing pages.
- Preserve existing navigation.
- Preserve existing sidebar.
- Preserve existing Dashboard.
- Preserve existing investigation layout.
- Preserve existing visual identity.
- Do not create unnecessary pages.
- Do not modify unrelated components.

Only complete:

A. Investigation Report / PDF experience
B. SecureAI investigation assistant

Stop after these changes.