Continue from the current SecureLens design. Do NOT redesign the existing visual language, sidebar, header, dashboard, colors, typography, spacing, or components that are already working.

IMPORTANT: This is a prototype refinement task. Do not rebuild the entire application from scratch and do not create unnecessary complexity. Preserve all existing work.

Our current problem is that several navigation pages are currently only empty shells with a title and subtitle. We need to make those pages feel like real, coherent product pages using realistic MOCK DATA only.

Do NOT create a backend, API integrations, authentication system, database, or real security scanning. This is a frontend/prototype experience and all data must remain clearly mock/demo data.

==================================================
1. RECENT INVESTIGATIONS
==================================================

Make /history a complete investigation history page.

Create a substantial table/list with around 10–12 realistic mock investigations.

Each row should include:
- Domain / URL
- Risk level
- Risk score
- Investigation type
- Last analyzed time
- Status
- View action

Use realistic examples such as:
- suspicious-login-update.net
- crypto-wallet-verify.io
- shop-deals-today.com
- example-secure.com
- fake-paypal-login.net
- secure-account-check.com
- github-login-verify.net
- unknown-domain.xyz

Add:
- Search
- Risk filter
- Investigation type filter
- Sort by newest / oldest / risk
- Pagination or load-more
- Clear visual distinction between Low, Medium, High and Critical

Clicking "View" should open the corresponding investigation result using the existing investigation UI.

==================================================
2. DOMAIN DISCOVERY
==================================================

Make /discovery a real discovery dashboard rather than an empty page.

Create a suspicious-domain discovery feed.

Include:
- Recently registered domains
- Brand/lookalike domains
- Suspicious keywords
- First-seen time
- Domain age
- Risk level
- Risk score
- Detection reason
- Investigate button

Add realistic mock examples.

Include filters:
- Risk
- Brand
- Domain age
- First seen
- Detection type

Each domain should have an "Investigate" action that opens the investigation flow with that domain.

==================================================
3. REPORTS
==================================================

Make /reports a useful report library.

Create a list/table of generated investigation reports.

Each report should show:
- Domain
- Risk
- Report type
- Created date
- Status
- View
- Export PDF

Add:
- Search
- Risk filter
- Date filter
- Empty-state design only if there are genuinely no reports

Use realistic mock reports.

The report view should reuse the investigation evidence and summary instead of inventing a completely different visual system.

==================================================
4. SCANNERS
==================================================

The URL Scanner, QR Scanner, Email Scanner and Phone Scanner pages must no longer be blank.

Create a consistent scanner layout for all four.

Each scanner page should contain:

- Clear scanner title
- Short explanation
- Large input/upload area
- Primary Scan button
- Recent scans section
- Example/demo input
- Supported checks
- Security/privacy note

URL Scanner:
- URL input
- Scan URL button
- Recent URL scans

QR Scanner:
- Upload QR image area
- Camera placeholder
- Scan QR button
- Recent QR scans

Email Scanner:
- Email/message input or upload area
- Analyze Email button
- Recent email analyses

Phone Scanner:
- Phone number input
- Country selector
- Analyze Number button
- Recent phone checks

These pages should look like real product interfaces, but remain prototype/mock-data experiences.

==================================================
5. BROWSER EXTENSION
==================================================

Create a polished Browser Extension landing/setup page.

Include:
- SecureLens extension explanation
- Browser extension preview/mockup
- Key capabilities
- "Add to Chrome" style primary CTA
- Supported browser information
- How it works: 3 simple steps
- Security/privacy explanation

Do not claim that a real extension exists or is actually downloadable.

Make it clearly a prototype concept.

==================================================
6. SETTINGS
==================================================

Create a useful Settings page without overbuilding it.

Include sections for:
- Profile
- Appearance
- Notifications
- Security preferences
- Investigation preferences
- AI preferences
- Data/history preferences

Use realistic switches, dropdowns and buttons.

The settings should look functional in the prototype, but no real persistence/backend is required.

==================================================
7. SECUREAI
==================================================

Keep the existing floating SecureAI button.

Improve its interaction so that clicking it opens a compact AI assistant panel.

The assistant must be contextual to the current investigation.

Include quick actions:
- Why is this risky?
- Explain the evidence
- Show strongest finding
- Explain in simple terms
- Is it safe to continue?

Include a text input:
"Ask SecureAI about this investigation..."

The AI interface is a prototype only. Use realistic prewritten/mock responses when appropriate.

Do not implement a real LLM API.

==================================================
8. INVESTIGATION EXPERIENCE — IMPORTANT
==================================================

Do NOT reduce the investigation page to a simple risk card.

The investigation result should feel like the core product.

Keep the existing Check Explorer with the investigation sections.

Use approximately these sections:

1. Target Information
2. DNS Records
3. HTTP Analysis
4. Redirect Chain
5. TLS / SSL Certificate
6. IP & ASN
7. Hosting / Infrastructure
8. Threat Intelligence
9. Website / Page Analysis
10. Links & Resources
11. Cookies & Tracking
12. Security Headers
13. Brand Impersonation

Each section must have:
- Status
- Severity
- Short summary
- Evidence
- Expand/collapse interaction

Use statuses:
PASS
WARNING
SUSPICIOUS
HIGH
CRITICAL

When expanded, show realistic evidence details such as:
- DNS records
- IP addresses
- HTTP status codes
- response headers
- redirect destinations
- TLS version/certificate information
- ASN/hosting information
- threat intelligence matches
- page title
- detected technologies
- links
- cookies
- security headers
- brand similarity indicators

Do not fabricate real-world claims about actual organizations. These are demonstration values only.

==================================================
9. INVESTIGATION TIMELINE
==================================================

On the investigation result page, keep the Investigation Timeline as a persistent right-side panel on desktop.

It should show previous investigations and allow the user to jump between them.

Example:

Current:
suspicious-login-update.net
CRITICAL — 98/100

Previous:
crypto-wallet-verify.io
HIGH — 75/100

shop-deals-today.com
MEDIUM — 45/100

example-secure.com
LOW — 12/100

Make the timeline scrollable so many investigations can be represented.

==================================================
10. DASHBOARD
==================================================

Do not redesign the dashboard.

Only improve the Recent Investigations section so it shows more rows, approximately 8–10 investigations, while preserving the existing dashboard layout.

Keep the existing KPI cards if they are already implemented.

The "Total Investigations" KPI may remain, but it should not dominate the dashboard.

==================================================
11. IMPORTANT DESIGN RULES
==================================================

Preserve the existing SecureLens visual identity:
- Deep green sidebar
- Clean white content area
- Dark navy typography
- Green success states
- Amber warning states
- Orange high-risk states
- Red critical states
- Soft borders
- Rounded cards
- Professional cybersecurity SaaS aesthetic

Do NOT introduce a completely new design system.

Do NOT make every page visually identical.

Use appropriate tables, cards, tabs, filters, timelines, evidence panels and empty states depending on the page.

Make the application feel like one complete cybersecurity investigation product.

==================================================
12. CREDIT-SAVING CONSTRAINT
==================================================

This is extremely important:

Do not rebuild components that already work.

Reuse existing components and data structures wherever possible.

Do not add unnecessary animations.

Do not generate backend logic.

Do not add external APIs.

Do not create unnecessary files.

Do not make speculative architectural changes.

Focus on filling the currently empty pages and improving their interactions using mock data.

Before making changes, inspect the existing structure and preserve it.

The final result should have NO major navigation page that is just a title and an empty white screen.