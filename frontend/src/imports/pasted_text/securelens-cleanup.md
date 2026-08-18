FINAL SECURELENS CONSISTENCY & DOCUMENTATION CLEANUP

This is a FINAL CLEANUP task.

Do NOT redesign the SecureLens UI.
Do NOT add new features.
Do NOT create new pages.
Do NOT change the approved layout, colors, typography, sidebar structure, component style, or workflows.

Only fix the specific inconsistencies listed below and update the developer handoff documentation so the documentation matches the final intended behavior.

==================================================
1. SCAN HISTORY — DEFINE IT CLEARLY
==================================================

FINAL RULE:

"Scan History" means the history of scans initiated by the user.

It should NOT act as a feed of automatically discovered suspicious domains.

Clarify the distinction:

### Scan History
Contains:
- scans started by the user
- Quick Scan results
- QR scans initiated by the user
- Email scans initiated by the user
- Phone scans initiated by the user
- Chrome Extension full scans initiated by the user

Opening an existing completed item:
Scan History
→ View
→ Scan Report

IMPORTANT:
Opening an existing completed scan must go DIRECTLY to the Scan Report.

Do NOT replay the scan animation.

### Automatic / background discoveries

Automatically detected suspicious domains belong to:
- Lookalike Detection
- Lookalike Alerts / monitoring data
- other appropriate discovery/monitoring surfaces

They should NOT be presented as the user's personal Scan History.

Update both the UI wording and documentation so this distinction is unambiguous.

==================================================
2. DASHBOARD — RENAME DOMAIN DISCOVERY WIDGET
==================================================

On the Dashboard, the current "Domain Discovery" widget creates confusion because the dedicated feature is now "Lookalike Detection."

Rename the Dashboard widget to:

"Lookalike Alerts"

Subtitle:

"Recently detected suspicious lookalike domains"

The widget should display a small preview of suspicious lookalike domains.

Primary action:

"View Lookalike Alerts →"

This should route to:

/discovery

Do NOT create another discovery page.

Do NOT add another feature.

The dedicated page remains:

"Lookalike Detection"

==================================================
3. LOOKALIKE DETECTION — FINAL PURPOSE
==================================================

Make the distinction very clear:

Lookalike Detection is NOT the user's scan history.

Its purpose is:

"Identify suspicious domains that resemble legitimate brands or websites."

Each record represents:

LEGITIMATE WEBSITE
↔
SUSPICIOUS LOOKALIKE

Example:

Apple
apple.com
↔
apple-login-secure.net
94%
Critical

Possible detection reasons:
- Brand Impersonation
- Lookalike Domain
- Typosquatting
- Keyword Impersonation

The user can select:

"Scan"

That starts the normal SecureLens scan workflow:

Lookalike Detection
→ Scan
→ Dashboard scan animation
→ Scan Report

No separate analysis engine should be created for Lookalike Detection.

==================================================
4. STANDARDIZE THE DEMO INVESTIGATION
==================================================

There is currently a contradiction in the sample Scan Report.

Some areas reference:

PayPal — 94%

while another phishing section references:

Apple — 92%

and the printable report uses:

PayPal — 92%
91% confidence

This MUST be standardized.

Use ONE consistent sample investigation throughout the entire prototype.

FINAL SAMPLE:

Impersonated brand:
PayPal

Visual similarity:
94%

Risk:
Critical

Score:
98/100

Use the same values everywhere.

Update ALL relevant locations:

- Investigation Summary
- Website Preview
- Phishing section
- AI/SecureAI section
- Visual findings
- Printable Report
- Timeline if applicable
- Dashboard sample if applicable
- any related mock content
- documentation

There must be no Apple/PayPal contradiction.

==================================================
5. STANDARDIZE MOCK DATA RELATIONSHIPS
==================================================

The current prototype uses separate mock arrays with unrelated counts.

Do not make the UI appear as though these are connected real production datasets.

For the prototype, keep the existing visual content where possible, but make the documentation explicitly state:

"Prototype mock data is illustrative and may be stored in separate datasets."

However, where the same scan/domain appears across multiple pages, its information MUST remain consistent.

For example:

If:

suspicious-login-update.net
= Critical
= 98/100

then the same target should not have a different risk or score elsewhere.

Likewise:

crypto-wallet-verify.io
75/100

shop-deals-today.com
45/100

example-secure.com
12/100

must remain consistent wherever they appear.

Do not randomly change unrelated rows.

==================================================
6. SCAN VS INVESTIGATION TERMINOLOGY
==================================================

Preferred user-facing terminology:

Scan
New Scan
Quick Scan
Scan History
Scan Report
Lookalike Detection
QR Scanner
Email Scanner
Phone Scanner
Browser Extension
SecureAI

Where the term "Investigation" is purely internal/technical, it may remain:

/investigate
Investigation ID
SL-INV-000142
internal component names

But user-facing labels should prefer "Scan" wherever changing them does not break the existing approved design.

Do NOT rename technical routes or component names.

Do NOT casually change navigation structure.

The documentation must clearly explain:

"Scan" is the user-facing term.

"Investigation" is the underlying technical/report record terminology.

==================================================
7. DASHBOARD LABEL CONSISTENCY
==================================================

Make sure Dashboard wording is consistent:

"Scan a website"

"Scan"

"Recent Scans"

"Scan History"

"Lookalike Alerts"

"System Health"

Remove confusing references that make it sound as though Dashboard contains a separate Domain Discovery system.

==================================================
8. DOCUMENTATION UPDATE
==================================================

After making the above consistency fixes, update the six handoff files so they reflect the FINAL behavior.

Update:

01_PRODUCT_OVERVIEW.md
02_USER_FLOW_AND_NAVIGATION.md
03_DESIGN_SYSTEM.md
04_PAGE_BY_PAGE_SPECIFICATION.md
05_COMPONENTS_AND_INTERACTIONS.md
06_DEVELOPER_IMPLEMENTATION_GUIDE.md

Also update README.md if necessary.

IMPORTANT:

Remove outdated contradictions from the documentation.

Do not leave old behavior documented as though it is still the final intended architecture.

For Known Issues / Decisions:

Keep only genuine remaining prototype limitations.

Do NOT list the four issues fixed in this task as unresolved issues.

==================================================
9. DO NOT CHANGE
==================================================

Absolutely do NOT modify:

- Sidebar architecture
- Sidebar collapsed/expanded behavior
- colors
- typography
- component design
- Scan animation
- QR workflow
- Email workflow
- Phone workflow
- Chrome Extension concept
- authentication concept
- SecureAI concept
- Scan Report layout
- Lookalike Detection layout
- Scan History layout
- Reports layout

This task is ONLY consistency cleanup.

==================================================
10. FINAL VERIFICATION
==================================================

Before finishing, verify the entire prototype from the perspective of a new developer.

The developer should understand:

Dashboard
→ Scan

Lookalike Detection
→ suspicious brand/lookalike feed
→ Scan

Scan History
→ user's own completed scans
→ View
→ Scan Report

Automatic/background detection
→ Lookalike Alerts / discovery
→ NOT personal Scan History

QR
→ decode URL
→ normal Scan workflow

Email
→ email security result

Phone
→ phone security/reputation result

Extension
→ lightweight signal
→ full Scan

Make sure the documentation and UI describe exactly this architecture.

Do not add anything else.

This is the FINAL CONSISTENCY PASS before SecureLens is handed to frontend development.