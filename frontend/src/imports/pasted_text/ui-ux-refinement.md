We are refining the existing SecureLens web application.

IMPORTANT:
Do NOT rebuild the application from scratch.
Do NOT create unnecessary new pages.
Do NOT invent new features.
Do NOT remove existing useful functionality.
Do NOT create empty placeholder pages just to fill navigation.
Preserve the current SecureLens visual identity, dark green sidebar, white content area, typography, spacing system, and overall professional cybersecurity/SOC aesthetic.

This is a UI/UX refinement pass based on the existing application.

PRIMARY GOAL:
Make SecureLens feel like a serious professional security investigation platform rather than a collection of disconnected prototype pages.

1. SIDEBAR
Redesign the left navigation so it supports an expand/collapse behavior.

Expanded state:
- Show the SecureLens logo/name.
- Show full navigation labels and icons.
- Keep the existing navigation hierarchy.

Collapsed state:
- Keep only icons.
- Preserve tooltips on hover.
- Keep the active-page indicator clearly visible.
- The main content area should automatically gain the additional horizontal space when the sidebar collapses.
- The transition should be smooth and professional.
- Do not make the sidebar excessively wide.

Keep these primary sections:
- Dashboard
- Investigate
- Domain Discovery
- Recent Investigations
- Reports

Scanners should remain grouped separately:
- URL Scanner
- QR Scanner
- Email Scanner
- Phone Scanner

However, do not create additional scanner functionality merely for visual completeness.

2. REMOVE DUPLICATION
The main "Investigate" page is the primary entry point for website/domain/IP investigation.

Do NOT make the user go through a separate URL Scanner page for the same core website investigation workflow.

The Investigate page should remain the main place where the user enters:
- URL
- domain
- IP address

The separate scanner pages should only exist where they represent genuinely different workflows.

3. INVESTIGATE PAGE
Improve the Investigate landing page.

Use the existing design as the foundation.

The main input section should be visually stronger and slightly wider.

Current concept:
"Investigate a website"

Support:
"Enter a URL, domain, or IP address to instantly analyze its safety and discover potential risks."

Input:
"Enter URL, domain or IP..."

Button:
"Investigate"

Make the input/button container longer horizontally so it does not feel tiny or compressed.

Keep the page clean and professional.
Do not fill the page with unnecessary decorative cards.

4. INVESTIGATION RESULT PAGE
This is the most important page in SecureLens.

Improve the existing investigation result layout rather than replacing it.

The page should clearly communicate:

A. WHAT IS THIS?
- investigated URL/domain
- investigation ID
- timestamp
- current analysis status

B. WHAT IS THE RISK?
- risk score
- risk category
- concise explanation
- critical/high/medium/low finding counts

C. SUMMARY
Add a clearly visible "Investigation Summary" / "Security Summary" section near the top.

The summary should answer in simple language:
- Is this website safe or suspicious?
- Why?
- What are the most important findings?
- What should the user do next?

D. WEBSITE VISUAL EVIDENCE
The investigation must include a proper "Website Preview" / screenshot area.

This should show the analyzed website screenshot when available.

Do not use an empty placeholder when a screenshot can be represented by the existing investigation data/mock data.

The screenshot is security evidence and should visually connect with findings such as:
- phishing
- brand impersonation
- suspicious login page
- visual similarity
- suspicious forms/content

E. TECHNICAL EVIDENCE
Keep the detailed investigation sections:
- Target
- URL
- DNS
- IP / ASN
- TLS
- HTTP
- Redirects
- Threat Intel
- Website
- Technologies
- Links
- Cookies
- Phishing
- AI Analysis

These sections should feel like one coherent investigation report.

5. INVESTIGATION SECTION NAVIGATION
The investigation page should have a section navigation that works with the collapsible sidebar concept.

It should allow the user to quickly jump between investigation sections.

Use clear status indicators such as:
- green = normal/pass
- amber = warning
- orange = suspicious
- red = critical

Do not overload the UI with unnecessary colors.

6. INVESTIGATION TIMELINE
Keep the right-side Investigation Timeline.

Make it compact and useful.

It should visually communicate:
- investigation started
- URL analysis
- DNS analysis
- IP intelligence
- TLS analysis
- HTTP analysis
- redirect analysis
- threat intelligence
- risk calculation
- SecureAI analysis

The timeline should not dominate the page.

7. DASHBOARD
Keep the existing dashboard structure.

Improve the "Recent Investigations" section so it is compact and information-dense.

IMPORTANT:
Do NOT make Recent Investigations extremely tall.

Use a compact table/list inspired by professional security tools.

Each row can show:
- domain/URL
- risk
- score
- last analyzed
- status/action

Show a reasonable number of rows without making the section unnecessarily tall.

8. BROWSER EXTENSION
SecureLens currently targets CHROME ONLY.

Do NOT show Edge, Brave, Firefox, or Safari support.

The Browser Extension page should clearly communicate that Chrome is the supported browser.

Do not imply that an extension is actually downloadable if it is only a prototype.

9. SETTINGS
Keep the existing Settings structure:
- Profile
- Appearance
- Notifications
- Security
- Investigation
- SecureAI
- Data & History

Make the settings UI consistent with the rest of SecureLens.

Do not add unnecessary settings.

10. EMPTY PAGES
This is extremely important.

Do NOT create pages that contain only:
- a title
- a subtitle
- a large empty white area

Every visible page must either:
- contain meaningful functionality,
- contain meaningful information,
- or clearly represent a deliberate future/prototype feature.

If a feature is not ready, do not spend UI space pretending it is a complete product.

11. DATA
Continue using the existing mock/demo data where it already exists.

Do NOT fabricate a backend.
Do NOT create fake API integrations.
Do NOT introduce unnecessary backend architecture.

This task is primarily UI/UX refinement.

12. DESIGN QUALITY
The final result should feel:
- professional
- clean
- trustworthy
- cybersecurity-focused
- information-dense without being cluttered
- consistent
- polished

Avoid:
- excessive rounded cards
- huge empty spaces
- unnecessary gradients
- oversized headings
- decorative elements that don't communicate information
- duplicated navigation
- empty pages

Before making changes, inspect the existing components and reuse them wherever possible.

Make the changes consistently across the application rather than fixing only one screenshot.

Do not modify unrelated functionality.