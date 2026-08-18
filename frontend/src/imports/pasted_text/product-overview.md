Create a COMPLETE, DETAILED, IMPLEMENTATION-READY FRONTEND DOCUMENTATION PACKAGE for the CURRENT SecureLens Figma project.

THIS IS A DOCUMENTATION TASK ONLY.

DO NOT redesign the UI.
DO NOT regenerate the application.
DO NOT change the visual design.
DO NOT add features.
DO NOT rename approved pages or components.
DO NOT invent missing functionality.

Your job is to STUDY the CURRENT SecureLens design and create a precise written source of truth that another frontend developer, who has never seen our previous conversations, can give to an AI coding assistant such as Cursor and have that AI understand the entire frontend.

The documentation must explain the product, navigation, pages, layout, visual system, components, interactions, states, animations, responsive behavior, and frontend implementation expectations in enough detail that a developer can implement the frontend without repeatedly asking what the design means.

==================================================
PRIMARY SOURCE OF TRUTH
=======================

Use the CURRENT SecureLens Figma project and its actual implemented designs as the PRIMARY visual source.

Also use any screenshots, reference images, notes, or files supplied with this task.

IMPORTANT:

* Document what is actually present in the current design.
* Do not replace the design with your own preferred design.
* Do not assume a value that cannot be determined.
* When an exact value is visible or specified, document it.
* When an exact value cannot be determined, explicitly write "Not specified in the source design."
* Clearly distinguish CURRENT DESIGN from implementation recommendations.
* Do not silently fix contradictions; document them in a "Known Issues / Decisions" section if they exist.

==================================================
OUTPUT FORMAT
=============

Create ONE folder:

SECURELENS-DEVELOPER-HANDOFF/

Inside it create EXACTLY these 6 files:

01_PRODUCT_OVERVIEW.md
02_USER_FLOW_AND_NAVIGATION.md
03_DESIGN_SYSTEM.md
04_PAGE_BY_PAGE_SPECIFICATION.md
05_COMPONENTS_AND_INTERACTIONS.md
06_DEVELOPER_IMPLEMENTATION_GUIDE.md

Do NOT create dozens of smaller files.

The six files must be comprehensive enough to serve as the complete frontend handoff.

==================================================
FILE 1
01_PRODUCT_OVERVIEW.md
======================

Purpose:
Explain what SecureLens is before the developer reads anything else.

Include:

### 1. Product identity

* Product name
* Product purpose
* Product positioning
* Main user problem solved

### 2. Product experience

Explain what a normal user is expected to do.

Core experience:

Dashboard
→ Quick Scan
→ Enter URL / domain / IP / website name
→ Resolve/select target when necessary
→ Scan
→ Scan analysis animation
→ Scan Report
→ Save completed result to Scan History when appropriate

### 3. Target users

Document all intended user groups that are actually represented by the current project, for example:

* Normal users
* Developers
* Cybersecurity users/students
* Investigators/reviewers
* Technical judges/reviewers

Do not invent additional audiences.

### 4. Major product areas

Describe:

* Dashboard
* Lookalike Detection
* Scan History
* Reports
* QR Scanner
* Email Scanner
* Phone Scanner
* Browser Extension
* Settings
* SecureAI

### 5. Core principles

Document these principles if represented by the project:

* Evidence-driven
* Risk-first but evidence-supported
* Human-readable explanations
* Deterministic checks before AI explanation
* Professional and accessible UX
* Fast user experience
* Minimal unnecessary steps
* AI as an assistant, not the sole source of truth
* Lightweight Chrome extension
* No duplicate URL-scanning workflow

### 6. Guest vs authenticated user

Document:

Guest:

* Can initiate scans
* Can see scan results
* Does not require login just to perform a scan

Authenticated:

* Has persistent personal Scan History
* Can access saved/history results later

Clearly explain that login is optional for normal scanning.

### 7. Automatic/background analysis

Explain the difference between:

USER-INITIATED SCAN

* User starts it
* Analysis animation is shown
* User proceeds to Scan Report

EXTENSION-INITIATED FULL SCAN

* User opens the full scan from Chrome extension
* Analysis animation is shown
* User proceeds to Scan Report

AUTOMATIC/BACKGROUND ANALYSIS

* No user-facing scan animation
* Analysis happens in the background
* Completed results can appear in Scan History/other appropriate data views
* The user should not be forced to watch an animation for every automatic check

### 8. What SecureLens does NOT do

Document intentional exclusions, including:

* No duplicate URL Scanner
* No mandatory login before scanning
* No identity/owner lookup for phone numbers
* QR Scanner is an input method that extracts a URL and then uses the existing Scan workflow
* Browser extension is lightweight and does not perform the entire heavy investigation locally
* Other exclusions visible in the final design

==================================================
FILE 2
02_USER_FLOW_AND_NAVIGATION.md
==============================

This file is the MASTER FLOW MAP.

It must make it possible to understand how every page and action connects.

### 1. Final navigation structure

Document the current sidebar/navigation exactly as designed.

For each navigation item explain:

* Label
* Icon
* Purpose
* Destination
* Active state
* Hover state
* Collapsed-sidebar state
* Mobile behavior

### 2. Dashboard → Quick Scan

Document the complete behavior.

The Dashboard is the primary place to start a new scan.

Input supports:

* Full URL
* Domain
* IP address
* Website / brand name

Example:
User types "apple"

Expected behavior:

* Show a clean search/autocomplete dropdown
* Show legitimate/possible website results
* User selects a target
* Selected target appears in the input
* User presses Scan

Example:
apple
→ Apple
→ apple.com
→ selected
→ Scan

If a complete URL/domain/IP is entered:

* allow direct Scan
* no unnecessary selection step

### 3. Scan animation

Document the exact user-facing flow:

Scan pressed
→ Scan/analysis state
→ progressive check states
→ completed
→ Scan Report

Document:

* What appears
* What text appears
* What the user can click
* Whether the user can leave the page
* Transition behavior
* Loading appearance
* Success appearance

Clearly distinguish this from automatic/background scans.

### 4. Scan History

Document:

Scan History
→ list of completed scans
→ search/filter/sort
→ View
→ existing Scan Report

Opening an already completed scan must NOT replay the analysis animation.

Document how completed user scans are automatically added to the user's history.

### 5. Lookalike Detection

Document the exact concept:

Legitimate Website
↔
Suspicious Lookalike

Examples from the design may include:

apple.com
↔ apple-login-secure.net

Document:

* Brand
* Real website
* Suspicious domain
* Similarity
* Detection reason
* Risk
* Scan action
* Destination after Scan

### 6. QR Scanner

Document:

QR image/camera
→ decode
→ extracted URL
→ Scan
→ analysis animation
→ Scan Report

Explain that QR does NOT have a separate security-analysis engine.

### 7. Email Scanner

Current intended input:

* User pastes email content

Flow:
Paste Email
→ Scan Email
→ email checking state
→ Email Security Result

Document every visible step.

### 8. Phone Scanner

Flow:
Phone number
→ Scan Phone
→ phone security analysis
→ Phone Security Result

Document that this is security/reputation intelligence, not identity lookup.

### 9. Browser Extension

Document:

Current browser page
→ Chrome extension
→ lightweight risk signal
→ View Full Scan
→ SecureLens website
→ analysis animation
→ Scan Report
→ history behavior depending on authentication

Chrome only.

### 10. Login/signup flow

Document:

Guest
→ Scan
→ Result
→ optional login for persistent history

And:

Login/signup
→ authenticated
→ Dashboard
→ scans automatically associated with the user

Document:

* Login
* Sign up
* Google login if visually present
* Forgot password
* Logout
* Guest history access behavior

### 11. Every major button

Create a table describing at minimum:

Dashboard

* Quick Scan
* Scan
* View all

History

* View
* Search
* Filters

Lookalike Detection

* Scan
* View

Reports

* View
* Export PDF

QR

* Upload
* Use Camera
* Scan URL

Email

* Scan Email

Phone

* Scan Phone

Extension

* Add to Chrome
* View Full Scan

Authentication

* Log in
* Sign up
* Google login
* Forgot password
* Logout

For each action explain:

* trigger
* UI state
* resulting state/page
* animation if any
* whether data is saved
* whether authentication affects the action

==================================================
FILE 3
03_DESIGN_SYSTEM.md
===================

Document the ENTIRE visual language.

Do not summarize.

### 1. Colors

Document every confirmed color in the design:

* Primary brand
* Sidebar
* Background
* Surface
* Card
* Primary text
* Secondary text
* Border
* Accent
* Hover
* Focus
* Disabled

Risk colors:

* Low
* Medium
* High
* Critical
* Warning
* Unknown/unavailable

For every confirmed color include:

* Name
* Hex
* Usage
* Contrast/usage notes if visible in design

### 2. Typography

Document:

* Font family
* Heading levels
* Body
* Labels
* Captions
* Technical/monospace values
* Font sizes
* Weight
* Line-height
* Letter spacing if specified

Do not invent values.

### 3. Spacing

Document:

* Base spacing scale if visible
* Section spacing
* Card padding
* Input padding
* Table row spacing
* Sidebar spacing
* Header spacing

### 4. Layout/grid

Document:

* Main page width
* Content max width if specified
* Sidebar width
* Collapsed sidebar width
* Header height
* Column layouts
* Gaps
* Alignment rules
* Sticky elements
* Right-side timeline positioning

### 5. Cards

Document:

* Radius
* Border
* Shadow
* Background
* Padding
* Header
* Footer
* Hover
* Selected
* Disabled

### 6. Buttons

Document every variant:

* Primary
* Secondary
* Accent
* Ghost
* Destructive
* Icon

For each:

* height
* width rules
* padding
* radius
* typography
* icon positioning
* hover
* active
* focus
* disabled
* loading

### 7. Inputs/search

Document:

* URL/domain/IP field
* website-name search
* autocomplete
* filters
* AI input
* phone number input
* email textarea
* QR upload area

Document:

* placeholder
* focus
* validation
* error
* loading
* selected
* disabled

### 8. Tables

Document:

* header style
* row height
* separators
* hover
* selected state
* column alignment
* long-domain behavior
* truncation/wrapping
* risk badges
* action buttons
* pagination/scroll behavior

### 9. Sidebar

Document every micro-detail:

* expanded width
* collapsed width
* collapse button
* open/close behavior
* transition
* active item
* hover
* tooltip
* icon placement
* label placement
* content resizing
* mobile behavior

### 10. Motion

Document:

* page transitions
* sidebar transition
* button transitions
* card hover
* scan progress
* SecureAI opening
* modal transitions
* loading
* skeleton
* timing/easing if visible or specified

Never invent exact timing where it is not specified.

### 11. Accessibility

Document:

* contrast
* keyboard focus
* text alternatives
* status labels
* risk not relying solely on color
* keyboard navigation
* responsive readability

==================================================
FILE 4
04_PAGE_BY_PAGE_SPECIFICATION.md
================================

This is the largest file.

Create a separate section for EVERY actual page/screen in the final design.

For EACH PAGE use this exact structure:

1. Page name
2. Purpose
3. Route/path if known
4. Entry points
5. Exit destinations
6. Page layout
7. Header
8. Sidebar
9. Main content
10. Components
11. Text/content shown
12. Buttons/actions
13. Data displayed
14. Interactive behavior
15. Loading state
16. Empty state
17. Error state
18. Success state
19. Responsive behavior
20. Accessibility considerations
21. Notes for implementation

Cover at minimum:

### Dashboard

Include:

* Sidebar
* Header
* Quick Scan
* Website-name autocomplete
* Summary cards
* Recent Scans
* System Health
* Lookalike/other dashboard widgets
* responsive behavior

### Scan Report

Include:

* header
* score
* risk
* summary
* website screenshot
* target information
* technical evidence
* DNS
* IP/ASN
* TLS
* HTTP
* redirects
* threat intelligence
* website analysis
* technologies
* links
* cookies/tracking
* security headers
* phishing
* brand impersonation
* lookalike
* SecureAI
* recommendations
* timeline
* report actions

### Scan History

Include:

* automatic history
* search
* filters
* table/list
* View action
* relationship to account/authentication

### Lookalike Detection

Include:

* legitimate site
* suspicious lookalike
* similarity
* risk
* detection type
* Scan action

### Reports

Include:

* report listing
* filters
* search
* view
* PDF export
* report states

### QR Scanner

Include:

* upload
* preview
* decode
* extracted URL
* camera state
* Scan URL
* result routing

### Email Scanner

Include:

* email textarea
* sample format
* Scan Email
* sender checks
* SPF
* DKIM
* DMARC
* links
* phishing/content
* result

### Phone Scanner

Include:

* country
* number
* Scan Phone
* validation
* country/region
* carrier/line type if shown
* reputation
* scam/spam indicators
* risk
* recommendation

### Chrome Extension

Include:

* extension landing
* Chrome-only messaging
* install/Add to Chrome state
* popup preview
* lightweight behavior
* View Full Scan
* relationship to website

### Login

### Sign Up

### Forgot Password

### Settings

* Profile
* Appearance
* Notifications
* Security
* Investigation preferences
* SecureAI
* Data & History

Do not document pages that do not actually exist in the final design.

==================================================
FILE 5
05_COMPONENTS_AND_INTERACTIONS.md
=================================

This file defines reusable frontend components.

For every reusable component document:

* Component name
* Purpose
* Where it is used
* Visual structure
* Props/data it conceptually needs
* Variants
* States
* Interaction behavior
* Responsive behavior
* Accessibility
* Implementation notes

Include at minimum:

### Navigation

* App Shell
* Sidebar
* Sidebar collapse button
* Header
* Account control

### Forms

* Scan input
* Search input
* Autocomplete
* Phone input
* Email textarea
* QR upload
* Camera scanner area

### Data display

* Risk score
* Risk badge
* Status badge
* KPI card
* Evidence card
* Table
* Table row
* Filters
* Timeline
* Screenshot viewer
* Progress indicator
* Skeleton loader

### Actions

* Primary button
* Secondary button
* Icon button
* Export button
* Scan button
* View button
* Rescan button

### SecureAI

Document:

* floating SecureAI trigger
* opened panel
* suggested questions
* message area
* input
* loading state
* response
* error
* evidence reference
* close/minimize behavior
* investigation context indicator

### Modals/overlays

* confirmation
* export
* login prompt
* delete/clear history
* image viewer

### Micro-interactions

Document every visible micro-interaction in the current design, including:

* hover elevation
* focus ring
* button loading
* sidebar sliding
* card hover
* table hover
* autocomplete opening
* scan progress
* report opening
* SecureAI expansion
* modal entry/exit

If the exact animation value is not specified in the source, state that instead of inventing it.

==================================================
FILE 6
06_DEVELOPER_IMPLEMENTATION_GUIDE.md
====================================

This file translates the design into frontend implementation guidance.

Do NOT invent backend implementation details that are outside the available project specification.

Document the frontend expectations.

### 1. Stack

Use the agreed stack:

* React
* TypeScript
* Vite
* Tailwind CSS
* Existing frontend libraries where applicable

### 2. Architecture expectations

Explain:

* component reuse
* page composition
* reusable states
* layout system
* routing
* API boundaries
* data models needed by UI
* auth state
* scan state
* history state
* SecureAI state
* extension relationship

### 3. Suggested frontend structure

Give a practical structure such as:

src/
├── app/
├── pages/
├── components/
├── layouts/
├── features/
├── hooks/
├── services/
├── types/
├── data/
└── styles/

Do not force an unnecessarily complex folder structure.

### 4. UI state model

Explain expected states for:

Scan:
idle
→ resolving
→ analyzing
→ completed
→ failed

History:
loading
→ loaded
→ empty
→ error

QR:
idle
→ uploading
→ decoding
→ decoded
→ scan-ready
→ scanning
→ result
→ error

Email:
idle
→ scanning
→ result
→ error

Phone:
idle
→ scanning
→ result
→ error

SecureAI:
idle
→ open
→ thinking
→ response
→ error

### 5. API expectations

Do not invent exact API routes unless they already exist.

Instead document what the frontend expects conceptually:

* create scan
* retrieve scan
* list history
* retrieve report
* lookalike results
* scanner results
* authentication
* SecureAI response
* system status

Mark these as "frontend data requirements / expected API contracts" where actual backend contracts are not yet finalized.

### 6. Mock-data strategy

Explain:

* how demo data should be structured
* how realistic demo targets should be consistent across pages
* no conflicting values between Dashboard, History, Report and Lookalike pages
* mock data must be clearly separated from future API data

### 7. Performance

Document:

* avoid unnecessary re-renders
* skeleton loading
* progressive UI updates
* cached/history results where appropriate
* avoid blocking UI
* compact tables
* lazy-load heavy panels where appropriate
* keep SecureAI lightweight until requested

### 8. Responsive implementation

Describe:

* desktop
* tablet
* mobile
* sidebar transformation
* tables
* report layout
* timeline
* SecureAI
* scanner forms

### 9. Accessibility

Describe:

* keyboard navigation
* focus
* labels
* semantic controls
* status announcements
* risk color + text
* readable contrast

### 10. What the frontend must NOT invent

Explicitly state:

Do not add:

* new navigation items
* new pages
* duplicate URL Scanner
* unapproved browser support
* unsupported identity lookup
* undocumented security claims
* fake live API behavior
* arbitrary UI components
* arbitrary colors
* arbitrary typography

The implementation must follow this handoff package and the Figma design.

==================================================
CROSS-FILE CONSISTENCY REQUIREMENT
==================================

All six files must use the SAME:

* terminology
* page names
* navigation names
* button names
* workflow names
* risk categories
* component names

Do not call the same feature different names in different files unless the difference is intentional and explained.

Preferred current user-facing terminology:

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

If the underlying system uses technical terminology such as "investigation", explain the relationship instead of randomly renaming it.

==================================================
DESIGN DETAILS MUST BE EXPLICIT
===============================

For every page/component where possible, describe micro-details such as:

* approximate position
* alignment
* relative size
* width behavior
* height behavior
* spacing
* icon placement
* text hierarchy
* hover
* focus
* active
* disabled
* loading
* transition
* keyboard behavior
* responsive behavior

Example:

SIDEBAR:

Expanded:

* full labels and icons
* active state
* collapse button

Collapsed:

* icons only
* tooltips
* content area expands

Do NOT merely write:
"Sidebar is collapsible."

Explain exactly how it behaves.

==================================================
VISUAL REFERENCE HANDLING
=========================

For every major page, identify which Figma frame/screen is its visual reference.

Where Figma supports frame/image references, include the corresponding frame name or identifier.

The developer should be able to map:

Documentation section
→ Figma frame
→ Screenshot
→ implementation target

Do NOT embed dozens of duplicate images into the documentation.

Use the Figma design itself as the primary visual reference.

==================================================
KNOWN ISSUES / DESIGN DECISIONS
===============================

At the end of the package, document any remaining known inconsistencies discovered during inspection.

For each one:

Issue
Current behavior
Final intended behavior
Whether it should be fixed in frontend
Whether it affects backend/API
Priority

Do not silently invent a solution.

==================================================
FINAL README
============

README.md must explain:

What this folder is.

How the six files should be read.

Recommended reading order:

01 Product Overview
↓
02 User Flow and Navigation
↓
03 Design System
↓
04 Page-by-Page Specification
↓
05 Components and Interactions
↓
06 Developer Implementation Guide

Also include:

"Use this documentation together with the final Figma design and screenshots. The Figma design is the primary visual reference; these six files explain the behavior, structure, and implementation intent."

==================================================
QUALITY REQUIREMENT
===================

Before finishing, verify that:

* Every important page has been documented.
* Every important component has been documented.
* Every major workflow is documented.
* Every major button/action has a destination/state.
* Every important loading/error/empty/success state is documented.
* The navigation matches the current design.
* The terminology is consistent.
* Micro-interactions are documented.
* Responsive behavior is documented.
* Accessibility is documented.
* No unsupported assumptions are presented as facts.
* No unnecessary seventh file is created.
* No extra folders are created.
* The six files are detailed enough that a frontend developer and their AI can understand the application without needing our previous conversation.

FINAL PRINCIPLE:

The developer should be able to read these six files, open the Figma design, and understand:

WHAT SecureLens is
WHAT every page does
WHERE every element belongs
WHAT every button does
HOW the user moves through the application
HOW every state behaves
HOW the interface responds
HOW the components look
HOW the frontend should be structured
WHAT should be implemented
WHAT should not be invented

Do not summarize.
Document the actual design in implementation-ready detail.
