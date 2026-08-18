Design a complete, high-fidelity, professional SaaS web application called "SecureLens".

SecureLens is a cybersecurity investigation and website-risk analysis platform. Its purpose is to help normal users, developers, cybersecurity students, investigators, and technical reviewers investigate URLs/domains and understand whether a website appears safe, suspicious, or dangerous.

IMPORTANT:
Do not create a generic cybersecurity dashboard.
Do not make it look like a hacker/gaming website.
Do not use an overly dark futuristic aesthetic.
Do not overcrowd the interface with charts, gradients, glass effects, or unnecessary animations.

The product should feel:
- Professional
- Trustworthy
- Premium
- Calm
- Modern
- Security-focused
- Accessible
- Easy to understand
- Enterprise-quality
- Fast and efficient

VISUAL DIRECTION

Use a LIGHT theme with an "Earthy & Elegant" visual identity.

Primary visual colors:
- Deep green as the main brand/navigation color
- Warm gold/mustard as the primary accent
- Cream and warm off-white as supporting backgrounds
- White for major content cards
- Dark charcoal for primary text
- Muted gray for secondary text

Risk colors must remain separate from the brand palette:
- Low = green
- Medium = yellow
- High = orange
- Critical = red

Do not use risk colors as decorative branding.

The interface should use generous whitespace, strong visual hierarchy, subtle borders, soft shadows, and carefully controlled rounded corners.

Use modern typography such as Inter or another highly readable professional sans-serif.

DESIGN LANGUAGE

Use a combination of:
- Clean solid surfaces for most UI
- Soft rounded cards
- Very subtle shadows
- Subtle borders
- Minimal gradients
- Micro-interactions
- Professional data visualization
- Selective glassmorphism only for special floating interfaces

Do NOT use glassmorphism everywhere.

Use glass/blur selectively for:
- SecureAI floating panel
- Command palette
- Notifications
- Floating overlays

Main dashboard cards, sidebar, tables, and primary content should use solid surfaces.

BUTTON SYSTEM

Create a reusable button system with:
1. Primary button
2. Secondary button
3. Accent button
4. Destructive button
5. Ghost button
6. Icon button

Every button must have:
- Default
- Hover
- Active
- Focus
- Disabled
- Loading

Primary CTA should generally use deep green.
Accent CTA should use warm gold only when appropriate.
Do not make every button colorful.

INPUT SYSTEM

Create reusable inputs for:
- URL
- Domain
- IP address
- Search
- AI chat
- Email
- Phone number

Include:
- Default
- Focus
- Error
- Disabled
- Loading
- Validation states

The main URL investigation input should be highly visible and simple.

NAVIGATION

Use a professional left sidebar on the main application.

Sidebar structure:

SecureLens logo

Dashboard
Investigate
Domain Discovery
Recent Investigations
Reports

Scanners
- URL
- QR
- Email
- Phone

SecureAI
Browser Extension
Settings

User/account area at the bottom.

Use a deep green sidebar with a subtle gold or cream active state.

Do not overcrowd the sidebar.

MAIN DASHBOARD

Create a clean command-center dashboard.

Top header:
- SecureLens branding
- Global search
- Notifications
- User profile
- Primary "New Investigation" action

Hero area:
"Investigate a website"

Large URL/domain/IP input.

Example:
[ Enter URL, domain or IP... ] [ Investigate ]

Below it create a concise risk overview:
- Total Investigations
- Low Risk
- Medium Risk
- High/Critical

Then create:

Recent Investigations
- Domain
- Risk
- Score
- Status
- Last analyzed
- Action

Risk Overview visualization.

Domain Discovery summary.

System health/status summary.

Quick scanner access.

Do not make the dashboard visually overwhelming.

INVESTIGATION PAGE

This is the most important screen in SecureLens.

When a user opens an investigation, show:

Back navigation

Target domain/URL

Risk level:
LOW / MEDIUM / HIGH / CRITICAL

Risk score:
0–100

Investigation status

Evidence summary cards:
- DNS
- RDAP
- Threat Intelligence
- Website Analysis
- SSL
- Redirects

Then:

"Why is this risky?"

Show clear human-readable risk factors.

Example:
- Recently registered domain
- Threat intelligence match
- Suspicious redirect
- Brand impersonation indicator

Each finding should have:
- Severity
- Short explanation
- Evidence
- Expandable technical details

Create a technical-details section for advanced users.

Use a clear hierarchy:

Evidence
→ Risk
→ Explanation
→ Technical Details
→ AI Explanation
→ Recommendation

Never make AI the primary source of truth.

AI should explain collected evidence.

SECUREAI

Create SecureAI as the product's investigation assistant.

Do NOT place a huge chatbot permanently on the dashboard.

Use a small floating SecureAI button/orb near the bottom-right.

The visual identity of SecureAI should use:
- Deep green
- Warm gold
- Subtle glow
- Minimal animation

When clicked, expand into a polished assistant panel.

The assistant panel should include:
- SecureAI branding
- Current investigation context
- Suggested questions
- Chat messages
- Input field
- Send button
- Evidence references where appropriate

When a user is viewing an investigation, SecureAI should automatically understand the current investigation.

Suggested questions:
- Why is this website risky?
- Explain the risk score
- Explain the DNS findings
- Summarize this investigation
- What evidence is most important?
- What should I do next?

Do not design SecureAI as a generic chatbot.

It is an INVESTIGATION ASSISTANT.

Also create a Spotlight-style global command palette activated by:
Cmd + K / Ctrl + K

The command palette should support:
- Search investigations
- Search domains
- Scan URL
- Open reports
- Open SecureAI
- Quick actions

REPORTS

Create a professional investigation reports page.

Show:
- Report name
- Investigation ID
- Domain
- Risk
- Date
- Status
- Download PDF
- View report

Create a professional PDF-report preview screen.

DOMAIN DISCOVERY

Create a domain discovery page showing newly discovered domains.

Use:
- Domain
- Discovery date
- Risk
- Status
- Analysis progress
- Quick action

The system should support sequential/background analysis rather than making the user wait for everything simultaneously.

RECENT INVESTIGATIONS

Create a clean searchable history page.

Allow users to:
- Search
- Filter
- Sort
- Open investigation
- Re-scan
- View report

If a recently analyzed URL already has a valid result, show the existing result quickly instead of unnecessarily starting another full scan.

SCANNERS

Create a Scanners section with separate interfaces for:

1. URL Scanner
2. QR Scanner
3. Email Scanner
4. Mobile Number Scanner

QR scanner:
- Upload QR image
- Camera option
- Decode QR
- Extract URL
- Send URL to the normal SecureLens analysis system

Email scanner:
- Paste/upload email content
- Extract URLs/domains
- Analyze suspicious links
- Show evidence

Mobile number scanner:
- Input phone number
- Normalize/validate
- Show available reputation/enrichment information
- Clearly communicate limitations

Keep these interfaces simple.

CHROME EXTENSION

SecureLens also has a lightweight Chrome extension.

IMPORTANT:
The extension is NOT a second heavy scanner.

It simply:
- Detects the current browser URL
- Communicates with the SecureLens backend
- Displays a quick risk/result when available
- Provides a "View Full Investigation" action
- Opens the main SecureLens website for complete analysis

Create a dedicated "Browser Extension" page inside the SecureLens dashboard.

This page should contain:

Hero:
"SecureLens Browser Extension"

Subtitle:
"Check websites before you trust them — directly from your browser."

Actions:
- Add to Chrome
- Download for Local Demo

Include:
- Extension preview
- Feature explanation
- How it works
- Installation instructions
- Privacy/security explanation
- Lightweight architecture explanation

Also design the actual Chrome extension popup.

Extension popup:
- SecureLens logo
- Current website/domain
- Risk level
- Risk score when available
- A few key indicators
- "View Full Investigation"
- Settings/help

Keep the popup compact and extremely easy to understand.

AUTHENTICATION

Create:
- Login
- Signup
- Google login
- Forgot password
- Account/session states

Use a premium split-screen or clean centered layout.

Keep authentication visually consistent with the main product.

SETTINGS

Create settings for:
- Profile
- Authentication
- Notifications
- Privacy
- Data retention
- AI preferences
- Extension
- API/account information where appropriate

ACCESSIBILITY

The design must:
- Have strong contrast
- Never communicate risk through color alone
- Use labels and icons
- Have visible keyboard focus
- Support keyboard navigation
- Use readable font sizes
- Have accessible buttons and form labels
- Maintain clear hierarchy

RESPONSIVE DESIGN

Design desktop-first because the investigation dashboard is information-heavy.

Also provide responsive behavior for:
- Tablet
- Mobile

On mobile:
- Convert sidebar into mobile navigation
- Preserve the main investigation flow
- Keep important risk information visible
- Avoid tiny tables
- Use expandable sections where necessary

ANIMATION

Use subtle professional micro-interactions:
- Page transitions
- Card hover
- Button hover
- Risk-score animation
- Investigation progress
- Skeleton loading
- SecureAI opening/closing
- Command palette transition

Animations must communicate state and improve usability.

Avoid:
- Excessive particles
- Constant floating animations
- Gaming effects
- Distracting transitions

COMPONENT SYSTEM

Create a reusable design system containing:
- Colors
- Typography
- Buttons
- Inputs
- Cards
- Risk badges
- Status badges
- Tables
- Tabs
- Dropdowns
- Modals
- Tooltips
- Toasts
- Alerts
- Charts
- Progress indicators
- Skeleton loaders
- Navigation
- SecureAI components
- Extension components

Create variants and states for reusable components.

DATA VISUALIZATION

Use clean, minimal charts for:
- Risk distribution
- Investigation trends
- Domain discovery
- Risk score
- Investigation timeline

Do not use charts just for decoration.

PERFORMANCE-FIRST UX

The interface must feel fast.

When an investigation takes time:
- Show clear progress
- Show completed stages
- Show what is currently running
- Allow the user to leave the page and return later
- Avoid blocking the entire interface

Use:
- Skeleton loading
- Progressive rendering
- Cached/recent results
- Clear status indicators

IMPORTANT PRODUCT PRINCIPLE

SecureLens is NOT an "AI website".

The hierarchy is:

Evidence
→ Risk Engine
→ Risk
→ Explanation
→ SecureAI

Normal deterministic software should perform technical checks.

SecureAI explains the evidence and helps the user understand the investigation.

FINAL VISUAL GOAL

Make SecureLens look like a premium, trustworthy cybersecurity SaaS platform that could realistically be used by:
- Normal users
- Developers
- Cybersecurity students
- Investigators
- Technical reviewers

It should look polished enough for a hackathon/SIH judge demonstration while remaining practical enough for a real product.

Do not copy any existing website or brand.

Create an original SecureLens visual identity using the requirements above.

First establish the complete design system and core components, then create the major screens using the same visual language.