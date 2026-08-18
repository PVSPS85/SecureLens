Revise the existing SecureLens application design. DO NOT rebuild the entire application from scratch and DO NOT remove the existing visual identity, navigation, pages, or working components.

The current SecureLens design is a good foundation. The main goal of this revision is to make the Investigation experience significantly more professional, detailed, scalable, and similar in depth to a real security investigation platform.

IMPORTANT:
This is a UI/UX and information-architecture revision first. Do not invent backend functionality or claim that real security checks are already implemented. Use realistic mock/demo data where necessary.

==================================================
1. PRESERVE THE EXISTING SECURELENS FOUNDATION
==================================================

Keep:
- SecureLens branding
- Deep earthy/dark green sidebar
- Clean white/light main workspace
- Existing typography hierarchy
- Existing navigation structure
- Existing dashboard visual language
- Existing rounded cards and restrained shadows
- Existing professional cybersecurity/SaaS aesthetic

Do not turn the product into a flashy neon cybersecurity dashboard.

The design should feel:
- Professional
- Trustworthy
- Technical
- Calm
- Premium
- Modern
- Enterprise-ready
- Evidence-driven

Avoid excessive glassmorphism, excessive gradients, excessive animations, or decorative elements that reduce usability.

==================================================
2. MAKE THE INVESTIGATION PAGE MUCH MORE DETAILED
==================================================

The current Investigation Results page is too short and contains too little information.

Redesign it as a comprehensive security investigation workspace.

The page should feel like a complete investigation/case file rather than a simple risk-score result.

At the top create a strong investigation header:

- Back button
- Domain / URL
- Risk classification
- Risk score
- Investigation ID
- First analyzed
- Last analyzed
- Rescan button
- Export Report button
- Open URL button

Example:

suspicious-login-update.net
CRITICAL RISK
98 / 100

Investigation ID: SL-INV-000142
Last analyzed: Just now

==================================================
3. ADD AN INVESTIGATION SUMMARY
==================================================

Create a high-quality summary section containing:

- Overall risk score
- Risk category
- Number of critical findings
- Number of high findings
- Number of medium findings
- Number of low findings
- Number of checks completed
- Number of checks failed
- Number of warnings

Include a clear visual risk indicator.

Do not make the risk score the only important piece of information.

==================================================
4. ADD WEBSITE / TARGET INFORMATION
==================================================

Create a target information card containing:

- Submitted URL
- Effective URL
- Domain
- IP address
- Country
- Hosting provider
- ASN
- Server
- Page title
- HTTP status
- HTTPS status
- Scan timestamp

Add a website screenshot preview where appropriate.

==================================================
5. CREATE A CHECK EXPLORER
==================================================

This is a major new section.

Create a structured "Investigation Checks" area.

The checks should be presented as expandable cards, tabs, or a clean investigation navigation system.

Include:

1. URL Analysis
2. Domain Intelligence
3. DNS Analysis
4. IP / ASN Intelligence
5. TLS / SSL Certificate
6. HTTP Analysis
7. Redirect Analysis
8. Threat Intelligence
9. Reputation
10. Website Analysis
11. Technology Detection
12. Link Analysis
13. DOM / Page Analysis
14. Cookies & Tracking
15. Security Headers
16. External Resources
17. Brand Impersonation
18. Phishing Indicators
19. Infrastructure Analysis
20. Risk Correlation
21. SecureAI Analysis

Each check should have a status such as:

PASS
WARNING
SUSPICIOUS
HIGH
CRITICAL
NOT AVAILABLE

Use restrained colors:
- Green = safe/pass
- Yellow/amber = warning
- Orange = suspicious
- Red = high/critical
- Gray = unavailable/not checked

==================================================
6. HTTP ANALYSIS
==================================================

Create a detailed HTTP section.

Show realistic fields such as:

- Status code
- HTTP version
- Protocol
- Server
- Content type
- Response size
- Response time
- Request method
- Security headers

Security headers should include:

- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

Each should show:

Present / Missing / Warning

Allow the user to expand individual findings for more explanation.

==================================================
7. REDIRECT ANALYSIS
==================================================

Create a visual redirect chain.

Example:

http://example.com
        ↓
301
        ↓
https://example.com
        ↓
302
        ↓
https://login-example.net
        ↓
200 OK

Highlight suspicious cross-domain redirects.

Show:

- Source URL
- Destination URL
- HTTP status
- Redirect type
- Cross-domain status
- Number of redirects

==================================================
8. DNS ANALYSIS
==================================================

Create a detailed DNS section.

Include:

- A records
- AAAA records
- MX records
- NS records
- TXT records
- CNAME records

Show:

- IP addresses
- Nameservers
- DNS provider
- Recent DNS changes
- Suspicious DNS observations

Use tables where appropriate.

==================================================
9. IP / ASN INTELLIGENCE
==================================================

Create an IP intelligence section.

Show:

- IP address
- Country
- Region
- ASN
- Organization
- Hosting provider
- Cloud provider
- Related domains
- Reputation signals

Include a small infrastructure relationship visualization if appropriate.

==================================================
10. TLS / SSL ANALYSIS
==================================================

Create a detailed certificate section.

Show:

- HTTPS status
- TLS version
- Certificate issuer
- Certificate subject
- Valid from
- Valid until
- Days remaining
- Hostname match
- Certificate status
- Certificate transparency

Use clear pass/warning states.

==================================================
11. THREAT INTELLIGENCE
==================================================

Create a dedicated Threat Intelligence section.

Show multiple intelligence sources as separate evidence cards.

Example:

Google Safe Browsing       CLEAN
Threat Feed A              SUSPICIOUS
Threat Feed B              MALICIOUS
Threat Feed C              CLEAN

Show:

- Match type
- Source
- Confidence
- Timestamp
- Evidence
- Related indicators

Do not imply that real APIs are connected. These are UI examples/mock data.

==================================================
12. TECHNOLOGY DETECTION
==================================================

Create a technology detection section.

Group technologies into categories:

Frontend
- React
- Next.js

Web Server
- Nginx

CDN
- Cloudflare

Analytics
- Google Analytics

Framework
- Example framework

Make technologies expandable to show details.

==================================================
13. LINK ANALYSIS
==================================================

Create a Link Analysis section.

Show:

- Total links
- Internal links
- External links
- Suspicious links
- External domains

Create a clean table with:

URL
Type
Domain
Risk
Status

==================================================
14. WEBSITE / PAGE ANALYSIS
==================================================

Create a Page Analysis section.

Show:

- Page title
- Forms detected
- Login forms
- Password fields
- Iframes
- External scripts
- Downloads
- Embedded resources
- Page size

Highlight suspicious behavior.

==================================================
15. COOKIES & TRACKING
==================================================

Create a Cookies & Tracking section.

Show:

- Total cookies
- First-party cookies
- Third-party cookies
- Tracking services
- Third-party domains

Allow rows to expand for details.

==================================================
16. BRAND IMPERSONATION / PHISHING
==================================================

Create a strong visual section for phishing and impersonation detection.

Example:

Possible Apple impersonation

Similarity: 92%

Indicators:
- Brand keyword in domain
- Login page detected
- Visual similarity
- Recently registered domain
- Suspicious redirect

Make this section highly readable and evidence-driven.

==================================================
17. SECUREAI ANALYSIS
==================================================

SecureAI should NOT replace technical evidence.

Instead, it should interpret the evidence.

Create a SecureAI panel containing:

"Why is this website risky?"

Then summarize the strongest findings.

Example:

1. Suspicious domain structure
2. Recent domain registration
3. Cross-domain redirect
4. Brand impersonation indicators
5. Suspicious infrastructure
6. Threat intelligence match
7. Credential collection indicators

Add actions:

- Explain this finding
- Show strongest evidence
- Explain in simple terms
- Is it safe to continue?
- Ask SecureAI

Use the existing floating AI assistant concept from the application.

==================================================
18. INVESTIGATION HISTORY / TIMELINE
==================================================

Add a persistent investigation timeline on the right side of the Investigation Results page.

This is important.

The user should be able to see every check performed during the investigation.

Example:

INVESTIGATION TIMELINE

12:42:03
Investigation started

12:42:04
✓ URL analysis completed

12:42:04
✓ DNS analysis completed

12:42:05
✓ IP intelligence completed

12:42:05
✓ TLS analysis completed

12:42:06
✓ HTTP analysis completed

12:42:07
✓ Redirect analysis completed

12:42:08
⚠ Threat intelligence warning

12:42:09
🔴 Brand impersonation detected

12:42:10
✓ Risk score calculated

12:42:11
✓ SecureAI analysis completed

Clicking a timeline item should navigate the user to the corresponding section.

This timeline should remain visually secondary to the main evidence workspace.

==================================================
19. INVESTIGATION NAVIGATION
==================================================

Because the investigation page is now long, provide a sticky investigation navigation system.

Possible categories:

Overview
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
DOM
Cookies
Security
Phishing
AI Analysis

The navigation should make it easy to jump between sections.

Do not make it visually overwhelming.

==================================================
20. EMPTY / LOADING / ERROR STATES
==================================================

Design proper states for:

- Investigation loading
- Individual check running
- Check completed
- Check failed
- API unavailable
- Data unavailable
- Scan cancelled
- Rescan in progress

Example:

DNS Analysis
Analyzing DNS records...
[progress indicator]

or

DNS Analysis
Unable to retrieve DNS data.
Retry

==================================================
21. EXTENSION CONNECTION
==================================================

Keep the Browser Extension section in the sidebar.

The website should explain that the browser extension is lightweight.

The extension should NOT perform a full security investigation locally.

Its primary purpose is:

Browser Extension
↓
Quick lightweight warning / risk signal
↓
"View full investigation"
↓
SecureLens website
↓
Full backend investigation
↓
Detailed results

Create a polished Browser Extension page later, but for now ensure the navigation and information architecture support this workflow.

==================================================
22. AI ASSISTANT UI
==================================================

Keep the floating SecureAI assistant.

Default state:
A small circular/compact AI button in the bottom-right.

When clicked:
Expand into a professional assistant panel.

The assistant should feel integrated into the investigation, not like a generic chatbot.

It should know the current investigation context.

Example quick actions:

"Explain this risk"
"Show strongest evidence"
"Summarize investigation"
"Is this safe?"
"Explain technical details"

Use subtle glass/blur effects only where appropriate.

==================================================
23. DESIGN SYSTEM
==================================================

Maintain the current SecureLens visual identity.

Use:

- Deep forest green
- Warm off-white
- Charcoal text
- Muted gray
- Controlled red/amber/green status colors

Use generous spacing.

Use consistent 8px spacing principles.

Use rounded corners, but avoid making every component excessively rounded.

Use subtle borders and shadows.

Avoid excessive gradients.

Avoid excessive glassmorphism.

Use charts, tables, badges, timelines, expandable panels and evidence cards where they improve information density.

The interface must remain readable even when the investigation contains a large amount of information.

==================================================
24. RESPONSIVE DESIGN
==================================================

Make the Investigation workspace responsive.

Desktop:
- Main evidence workspace
- Secondary investigation timeline

Tablet:
- Timeline becomes collapsible

Mobile:
- Timeline becomes a drawer
- Investigation navigation becomes horizontally scrollable or a dropdown
- Evidence sections become stacked cards

==================================================
25. IMPORTANT UX PRINCIPLE
==================================================

The user should be able to answer these questions quickly:

1. Is this website safe?
2. Why is it risky?
3. What evidence supports the risk?
4. Which checks were performed?
5. Which checks failed?
6. What infrastructure does the website use?
7. What suspicious behavior was detected?
8. What should I do next?
9. What did SecureAI conclude?
10. Can I inspect the technical evidence myself?

The UI should support both:
- Normal users who want a simple explanation
- Technical users who want detailed evidence

Do not sacrifice technical depth for visual simplicity.

==================================================
26. DO NOT CHANGE UNRELATED PAGES
==================================================

Do not redesign the entire application.

Focus this revision primarily on:

- Investigation Results
- Investigation navigation
- Investigation history/timeline
- Evidence sections
- SecureAI integration

Preserve the existing Dashboard and other pages unless a small change is required for consistency.

==================================================
27. FINAL RESULT
==================================================

The final design should feel like a serious modern security investigation platform.

It should be significantly more detailed than the current Investigation page while remaining clean and understandable.

Take inspiration from professional security analysis platforms such as urlscan-style investigation workflows, but DO NOT copy their branding, exact layout, or visual design.

SecureLens should have its own visual identity.

Prioritize information architecture, evidence visibility, hierarchy, usability, and professional polish over decorative effects.