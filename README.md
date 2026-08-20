# 🛡️ SecureLens — AI-Powered Phishing & Real-World Domain Spoofing Detection

> **Smart India Hackathon (SIH) Cybersecurity Platform**  
> Comprehensive, sub-second threat analysis, lookalike domain intelligence, real-world Newly Registered Domain (NRD) ingestion, and active browser protection.

---

## 📑 Architecture Overview

SecureLens operates on a zero-trust, multi-layered cybersecurity pipeline:

```
[ Real-World Shreshta Labs Feed / User Target / Chrome Extension ]
                               │
                               ▼
            ┌──────────────────────────────────────┐
            │       SecureLens API Server          │
            │   (Node.js Express + Supabase DB)    │
            └──────────────────┬───────────────────┘
                               │
                               ▼
            ┌──────────────────────────────────────┐
            │       Security Analysis Engine       │
            ├──────────────────────────────────────┤
            │  • Domain & Punycode Analyzer        │
            │  • Brand Lookalike & Homoglyphs      │
            │  • Live TLS Certificate Handshake    │
            │  • Authoritative DNS Resolution      │
            │  • WHOIS Domain Age & Registrar      │
            │  • HTTP Security Headers & Redirection│
            │  • DOM Form & Credential Inspection  │
            └──────────────────┬───────────────────┘
                               │
                               ▼
            ┌──────────────────────────────────────┐
            │   Paranoia Mode Rulebook Engine      │
            │   (Compound Multi-Signal Scoring)    │
            └──────────────────┬───────────────────┘
                               │
                               ▼
            ┌──────────────────────────────────────┐
            │         SecureAI Intelligence        │
            │  (Gemini 3.6 Flash / Groq Compound)  │
            └──────────────────┬───────────────────┘
                               │
                               ▼
      ┌────────────────────────┴────────────────────────┐
      ▼                                                 ▼
[ Forensic Web Dashboard (React + Vite) ]   [ Chrome Extension (Manifest V3) ]
```

---

## 📂 Project Directory Structure

```text
SecureLens/
├── backend/                  # Node.js / Express REST API Server
│   ├── src/
│   │   ├── controllers/      # Scan, Lookalike, Scanners, and SecureAI controllers
│   │   ├── db/               # Supabase PostgreSQL queries and client
│   │   ├── services/         # ScoringEngine, IngestionDaemon, and SecurityEngine interface
│   │   ├── utils/            # Normalizer, SSRF Guard, AI Rotator, Logger
│   │   └── index.js          # API Server entry point
│   ├── scripts/              # Ingestion, cache, and migration scripts
│   ├── .env.example          # Environment variables template
│   └── Dockerfile            # Backend production container configuration
│
├── frontend/                 # React 18 + Vite + TailwindCSS Web Application
│   ├── src/
│   │   ├── components/       # UI cards, navigation, widgets, and AI chat assistant
│   │   ├── pages/            # Dashboard, Investigate, Lookalikes, Scanners, Reports, Extension
│   │   └── routes.tsx        # Application router
│   └── Dockerfile            # Frontend container configuration
│
├── securityEngine/           # Core forensic analyzers & rulebook engine
│   ├── analyzers/            # Domain, Lookalike, DNS, TLS, WHOIS, HTTP, Redirects, Visual
│   ├── rulebook/             # Paranoia Rulebook scoring algorithms
│   └── index.js              # Security engine runner
│
├── extension/                # Chrome Browser Extension (Manifest V3)
│   ├── src/
│   │   ├── background.js     # Background service worker with sub-200ms quick scans
│   │   └── popup.js          # Interactive popup interface
│   ├── popup.html            # Extension popup layout
│   └── manifest.json         # Chrome extension manifest
│
├── database/                 # Supabase PostgreSQL database schema & migrations
│   └── migrations/           # 001_initial_schema.sql
│
├── docker-compose.yml        # 1-click Docker orchestration
├── package.json              # Workspace scripts
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start Guide

### Option 1: Run with Docker Compose (Recommended)

Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PVSPS85/SecureLens.git
   cd SecureLens
   ```

2. **Configure environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   *(Ensure your Supabase keys, Gemini API key, and Groq API key are populated in `backend/.env`)*

3. **Start all services:**
   ```bash
   docker compose up --build
   ```

4. **Access the applications:**
   - 🌐 **Web Dashboard:** [http://localhost:5173](http://localhost:5173)
   - ⚡ **Backend API:** [http://localhost:5001](http://localhost:5001)

---

### Option 2: Run Locally with Node.js

**Prerequisites:** Node.js v18+ and npm installed.

1. **Install dependencies for all workspaces:**
   ```bash
   npm run install:all
   ```

2. **Configure environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Run the Backend Server (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```

4. **Run the Frontend Dashboard (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧩 How to Install the Chrome Extension

1. Open Google Chrome and navigate to:
   ```text
   chrome://extensions/
   ```
2. Enable **Developer mode** in the top-right corner.
3. Click **"Load unpacked"** in the top-left corner.
4. Select the `extension/` folder inside this repository:
   ```text
   /path/to/SecureLens/extension
   ```
5. Click **Select**. SecureLens is now active!
6. Visit any website (e.g., `github.com` or `youtube.com`) and click the **SecureLens** icon on your toolbar to run an instant safety audit.

---

## 🔍 Core Features & Capabilities

- 🔎 **Real-World Shreshta Labs Feed Ingestion:** Automatically ingests newly registered domains (8,400+ domains) and flags active homoglyphs and spoofing campaigns.
- ⚡ **Sub-200ms Quick Scans:** High-throughput network-level threat evaluation designed for real-time browser protection.
- 🎯 **Lookalike & Homoglyph Detection:** SLD extraction, Brand substring containment, Levenshtein distance, and Punycode spoofing detection across major brands.
- 🤖 **SecureAI Neural Threat Intelligence:** Real-time conversational security advisor powered by rotated Gemini 3.6 Flash & Groq Compound LLMs.
- 📱 **Specialized Scanners:**
  - **QR Code Scanner:** Decodes uploaded images or camera frames for embedded malicious links.
  - **Email Scanner:** Parses raw email headers and runs live DNS SPF/DMARC alignment audits.
  - **Phone Number Scanner:** ITU-T E.164 standard formatting and dialing prefix verification.
- 📄 **Forensic PDF Export:** Clean, printable investigation reports for incident responders.

---

## 🛠️ API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/scan` | Initiate full deep forensic scan |
| `POST` | `/api/v1/scan?quick=true` | Execute fast sub-200ms network audit |
| `GET` | `/api/v1/scan/:id/report` | Fetch complete telemetry & analyzer evidence |
| `GET` | `/api/v1/lookalikes` | Query detected lookalike alerts |
| `GET` | `/api/v1/secure-ai/summary/:id` | Retrieve dynamic AI threat summary |
| `POST` | `/api/v1/secure-ai/chat` | Ask SecureAI interactive investigation questions |
| `POST` | `/api/v1/scanners/email` | Run live DNS SPF/DMARC email audit |
| `POST` | `/api/v1/scanners/phone` | Analyze phone number reputation & format |

---

## 🛡️ License
This project is licensed under the MIT License. Built for the Smart India Hackathon (SIH).