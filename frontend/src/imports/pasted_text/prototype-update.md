Continue improving the existing SecureLens prototype.

IMPORTANT:
This batch has ONLY TWO goals:
1. Browser Extension
2. Settings

Do NOT modify:
- Dashboard
- Investigate
- Investigation Result
- Domain Discovery
- Recent Investigations
- Reports
- Scanners

Do NOT redesign the global visual system.
Reuse existing components and styling.
Do not create unnecessary pages or functionality.

==================================================
1. BROWSER EXTENSION — CHROME ONLY
==================================================

SecureLens will support ONLY Google Chrome for the browser extension.

Remove/hide any references to:
- Firefox
- Microsoft Edge
- Brave
- Safari
- Other browsers

The Browser Extension page should communicate a lightweight extension workflow.

Header:

"SecureLens for Chrome"

Subtitle:

"Get a quick security signal while browsing, then open SecureLens for the complete investigation."

Create a realistic Chrome extension preview.

The preview should contain:

SecureLens
Current website/domain
Risk level
Risk score
A few important quick signals
"View Full Investigation"

The extension should NOT perform the complete investigation locally.

Show the architecture clearly:

Chrome Extension
↓
Current URL
↓
SecureLens Backend
↓
Quick Risk Signal
↓
View Full Investigation
↓
SecureLens Web Application

Explain the three-step user flow:

1. Install the Chrome extension
2. Browse normally
3. Open SecureLens for detailed investigation

Include a Chrome-only CTA:

"Add to Chrome"

Because this is currently a prototype, do NOT claim that the extension is actually published in the Chrome Web Store.

The CTA may show a prototype state such as:

"Chrome Extension — Coming Soon"

or a demo interaction.

Add a small section:

"What the extension does"

- Detects the current website
- Provides a lightweight risk signal
- Gives quick access to SecureLens
- Does not perform the full investigation inside the browser

Add:

"Why use the website?"

Explain that the full investigation provides detailed technical evidence such as:

DNS
IP / ASN
TLS
HTTP
Redirects
Threat Intelligence
Website Analysis
Phishing Indicators
SecureAI

Keep this page professional and compact.

Do NOT add other browser support.

==================================================
2. SETTINGS
==================================================

Complete the existing Settings experience while keeping it simple.

The Settings navigation should contain:

Profile
Appearance
Notifications
Security
Investigation
SecureAI
Data & History

Use the existing SecureLens Settings visual style.

--------------------------------------------------
PROFILE
--------------------------------------------------

Show:

Name
Email
Organization
Role
Profile photo

Actions:

Save Changes
Cancel

Include realistic form validation states.

--------------------------------------------------
APPEARANCE
--------------------------------------------------

Include:

Theme:
Light
Dark

Compact tables:
On / Off

Technical values:
Monospace / Standard

These should look like real controls in the prototype.

--------------------------------------------------
NOTIFICATIONS
--------------------------------------------------

Include toggles for:

Investigation completed
Critical risk detected
Report generated
SecureAI analysis completed

Keep the controls simple.

--------------------------------------------------
SECURITY
--------------------------------------------------

Include:

Password
Active sessions
Two-factor authentication

Use appropriate actions such as:

Change Password
View Sessions
Enable 2FA

Do not implement real authentication functionality.

--------------------------------------------------
INVESTIGATION
--------------------------------------------------

Include useful investigation preferences such as:

Save investigation history
Default investigation view
Automatic report creation
Show technical evidence by default

--------------------------------------------------
SECUREAI
--------------------------------------------------

Include:

SecureAI enabled
Context-aware investigation mode
Response detail level
Confirm before AI analysis

Add a short explanation:

"SecureAI interprets investigation evidence. It does not replace the underlying security checks."

--------------------------------------------------
DATA & HISTORY
--------------------------------------------------

Include:

Investigation history
Saved reports
Data retention
Export data
Clear history

For destructive actions such as "Clear History", show a confirmation dialog.

--------------------------------------------------
IMPORTANT UX RULES
--------------------------------------------------

Settings should not become an oversized dashboard.

Use a clean settings layout:

Left:
Settings navigation

Right:
Current settings section

Keep sections organized and easy to scan.

Do not create unnecessary settings.

Do not add backend functionality.

Use prototype/demo interactions only.

==================================================
FINAL QUALITY CHECK
==================================================

Make sure:

- Browser Extension mentions Chrome only
- No other browser logos/names appear
- Settings are consistent with SecureLens
- No major empty white areas
- No unnecessary cards
- No overlapping text
- No horizontal overflow
- Existing pages remain unchanged
- Existing components are reused

STOP after completing these two areas.