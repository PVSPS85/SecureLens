Now perform ONLY the second refinement pass for SecureLens.

IMPORTANT:
Do not redesign the entire application.
Do not modify the sidebar, dashboard, scanners, settings, or browser extension unless a small change is absolutely necessary for consistency.

FOCUS ONLY ON:
The Investigation Result / Investigation Report experience.

The investigation result page is the core feature of SecureLens, so make it feel like a professional security-analysis workspace.

1. TOP INVESTIGATION HEADER

Keep the existing header structure.

It should clearly show:

- Back navigation
- Investigated domain / URL
- Risk badge
- Investigation ID
- First analyzed time
- Last analyzed time

Actions on the right:

- Open URL
- Export Report
- Rescan

Keep these actions compact and aligned.

Do not make the header excessively tall.

2. INVESTIGATION SUMMARY

Add a prominent "Investigation Summary" section near the top of the report.

This is different from the raw technical evidence.

The summary should be understandable to a normal user.

Example structure:

INVESTIGATION SUMMARY

Risk: Critical

"This website shows strong indicators of credential harvesting and possible brand impersonation."

Then show:

Key findings:
- Suspicious login form detected
- Brand impersonation indicators detected
- Redirect chain contains suspicious destination
- Threat intelligence warning detected

Recommended action:
"Do not enter credentials or sensitive information on this website."

Use the existing demo data.

Do not invent unrelated findings.

3. RISK SCORE CARD

Keep the large risk score.

Example:

98 / 100
CRITICAL

Strong evidence of a credential-harvesting phishing page.

Also show compact finding counts:

Critical
4

High
3

Medium
2

Low
1

Below this show:

18 checks completed
5 warnings
2 checks failed
21 total checks

Make the hierarchy much clearer.

The risk score should be the visual focus without taking up the entire page.

4. WEBSITE SCREENSHOT / VISUAL EVIDENCE

This is REQUIRED.

Create a proper section called:

"Website Preview"

The section should contain a large website screenshot/preview of the investigated website.

The screenshot should look like actual visual evidence from the analyzed website.

For the existing suspicious-login demo investigation, the preview can visually represent:

- suspicious login page
- credential input fields
- suspicious branding
- warning indicators

Add a small label such as:

"Captured website preview"

and optionally:

"Visual evidence"

The screenshot should look like evidence collected during investigation, NOT like a decorative stock image.

If screenshot data is unavailable, show a deliberate "Screenshot unavailable" state rather than a huge empty white box.

5. VISUAL ANALYSIS

Immediately around the website screenshot, provide useful interpretation.

For example:

Visual Findings

Brand impersonation
CRITICAL

Login form detected
HIGH

Suspicious page structure
HIGH

Do not duplicate the entire technical report here.

The purpose is to explain what the screenshot tells the investigator.

6. TARGET INFORMATION

Keep the Target Information section.

Organize it cleanly into a structured information grid.

Include the existing fields:

Submitted URL
Effective URL
Domain
IP Address
Country
Hosting Provider
ASN
Server
Page Title
HTTP Status

Make long URLs wrap properly.

Do not allow text to overflow.

Use monospace styling for technical values where appropriate.

7. TECHNICAL EVIDENCE

Keep the existing investigation sections:

Target
URL
DNS
IP / ASN
TLS
HTTP
Redirects
Threat Intel
Website
Technologies
Links
Cookies
Phishing
AI Analysis

Each section should contain meaningful evidence.

Use a consistent evidence-card design.

Each evidence item should clearly communicate:

- Check name
- Result
- Severity/status
- Relevant value
- Short explanation

Possible statuses:

PASS
WARNING
SUSPICIOUS
HIGH
CRITICAL

Use:
Green → PASS
Amber → WARNING
Orange → SUSPICIOUS/HIGH
Red → CRITICAL

Do not use color everywhere.
Use color primarily for status and severity.

8. EVIDENCE DETAILS

Avoid turning the report into huge blocks of text.

Use compact rows/cards.

Example:

TLS Certificate
PASS

Valid certificate detected.

Certificate issuer:
Let's Encrypt

Expiry:
Aug 2027

This should be scannable by a security analyst.

9. REDIRECT CHAIN

Give Redirects its own useful visual treatment.

Show the chain as:

Submitted URL
↓
Redirect 1
↓
Redirect 2
↓
Final URL

Clearly mark suspicious redirects.

Do not just show the URLs as a plain paragraph.

10. THREAT INTELLIGENCE

Create a clear Threat Intelligence section.

Show relevant indicators such as:

- Domain reputation
- Known threat intelligence matches
- Phishing indicators
- Brand impersonation
- Suspicious infrastructure

Each result should have a severity indicator and short explanation.

11. AI ANALYSIS

Keep SecureAI as a separate section near the end of the investigation.

It should provide a concise interpretation of the evidence.

Structure:

SecureAI Assessment

Overall assessment:
Critical risk

Reasoning:
Short explanation based on the investigation evidence.

Confidence:
High

Recommended action:
Do not interact with the website or submit credentials.

Do not make SecureAI look like a generic chatbot.

It is an analysis engine inside the investigation report.

12. INVESTIGATION TIMELINE

Keep the Investigation Timeline on the right side on desktop.

It should remain compact.

Use the existing timeline data.

Show:

Investigation started
URL analysis completed
DNS analysis completed
IP intelligence completed
TLS analysis completed
HTTP analysis completed
Redirect analysis completed
Threat intelligence warning
Brand impersonation detected
Risk score calculated
SecureAI analysis completed

Use visual status indicators.

Do not allow the timeline to become unnecessarily tall.

13. RESPONSIVE BEHAVIOR

Desktop:
- Main investigation content
- Section navigation
- Right-side investigation timeline

Tablet:
- Reduce widths
- Timeline can move below the main report

Mobile:
- Stack everything vertically
- Section navigation becomes compact/collapsible
- Timeline moves below the investigation content

Do not allow horizontal overflow.

14. SECTION NAVIGATION

Keep the investigation section navigation.

It should remain easy to understand.

The active section should be clearly highlighted.

When a section contains critical findings, show a subtle red indicator.

When a section contains warnings, show an amber indicator.

Do not make the navigation visually louder than the actual report.

15. EMPTY STATES

Do not leave large empty white areas.

If some evidence is unavailable, show a compact meaningful state:

"No evidence available for this check."

Do not create fake evidence simply to fill space.

16. OVERALL VISUAL QUALITY

The final investigation page should feel like:

A professional cybersecurity investigation console.

It should be:

- clean
- dense but readable
- evidence-focused
- professional
- trustworthy
- easy to scan
- consistent

Avoid:

- giant empty cards
- excessive rounded containers
- oversized typography
- unnecessary gradients
- decorative graphics
- repeated information
- fake-looking dashboards

IMPORTANT:
Use the existing SecureLens components and design language wherever possible.

Do not change the underlying concept.

Improve the information hierarchy and presentation of the existing investigation data.

After completing this pass, stop.
Do not make additional unrelated changes.