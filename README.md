# 🛡️ SecureLens — AI-Powered Phishing & Real-World Domain Spoofing Detection

> **Smart India Hackathon (SIH) Cybersecurity Platform — Problem Statement: SIH260072**  
> Sub-second threat analysis, real-world Newly Registered Domain (NRD) live ingestion, brand lookalike intelligence, and active browser protection.

---

## 📖 Table of Contents
- [Architecture Overview](#-architecture-overview)
- [Directory Hierarchy](#-directory-hierarchy)
- [Quick Start Guide](#-quick-start-guide)
  - [Option 1: 1-Click Docker Compose (Recommended)](#option-1-1-click-docker-compose-recommended)
  - [Option 2: Local Node.js Development](#option-2-local-nodejs-development)
- [Chrome Extension Setup](#-chrome-extension-setup)
- [Specialized Scanners Guide](#-specialized-scanners-guide)
- [REST API Contract](#-rest-api-contract)
- [Environment Configuration](#-environment-configuration)

---

## 📑 Architecture Overview

SecureLens operates on a zero-trust, multi-layered cybersecurity pipeline:

```text
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
            │  (Gemini 2.0 Flash & Groq Rotation)  │
            └──────────────────┬───────────────────┘
                               │
                               ▼
      ┌────────────────────────┴────────────────────────┐
      ▼                                                 ▼
[ Forensic Web Dashboard (React 18 + Vite) ]   [ Chrome Extension (Manifest V3) ]
```

---

## 📂 Directory Hierarchy

```text
SecureLens/
├── backend/                  # Express.js REST API Server
│   ├── src/
│   │   ├── controllers/      # Scan, Lookalike, Scanner, and SecureAI controllers
│   │   ├── db/               # Supabase PostgreSQL queries and client setup
│   │   ├── services/         # SecurityEngine interface & Shreshta NRD daemon
│   │   ├── utils/            # Normalizer, SSRF Guard, AI Rotator, Logger
│   │   └── index.js          # API Server entry point
│   ├── scripts/              # Database maintenance & wipe utility scripts
│   ├── .env.example          # Environment variables template
│   └── Dockerfile            # Multi-stage production backend container
│
├── frontend/                 # React 18 + Vite + TailwindCSS Web Dashboard
│   ├── src/
│   │   ├── components/       # Layouts, UI primitives, and AI Chat Assistant
│   │   ├── pages/            # Dashboard, Investigate, Lookalikes, Scanners, Reports
│   │   └── routes.tsx        # Application router
│   └── Dockerfile            # Frontend container configuration
│
├── securityEngine/           # Multi-vector forensic analyzers & rulebook engine
│   ├── analyzers/            # Domain, DNS, TLS, WHOIS, HTTP, Redirects, Lookalikes
│   ├── rulebook/             # Paranoia Rulebook multi-signal scoring algorithms
│   └── index.js              # Security engine runner
│
├── extension/                # Chrome Extension (Manifest V3)
│   ├── src/
│   │   ├── background.js     # Service worker with sub-200ms quick-scans
│   │   └── popup.js          # Extension popup UI logic
│   ├── popup.html            # Extension popup layout
│   └── manifest.json         # Chrome extension manifest
│
├── database/                 # Supabase PostgreSQL schema & migrations
│   └── migrations/           # 001_initial_schema.sql
│
├── docker-compose.yml        # 1-click orchestration
├── package.json              # Workspace convenience scripts
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start Guide

### Option 1: 1-Click Docker Compose (Recommended)

Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is running.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PVSPS85/SecureLens.git
   cd SecureLens
   ```

2. **Configure environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Launch all services in 1 command:**
   ```bash
   docker compose up --build
   ```

4. **Access the platform:**
   - 🌐 **Web Dashboard:** [http://localhost:5173](http://localhost:5173)
   - ⚡ **Backend REST API:** [http://localhost:5001](http://localhost:5001)

---

### Option 2: Local Node.js Development

**Prerequisites:** Node.js v18+ and npm installed.

1. **Install dependencies for all workspaces:**
   ```bash
   npm run install:all
   ```

2. **Configure backend environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Start the Backend API Server (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```

4. **Start the Frontend Dashboard (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧩 Chrome Extension Setup

1. Open Google Chrome and go to `chrome://extensions/`.
2. Toggle **Developer mode** ON in the top-right corner.
3. Click **"Load unpacked"** in the top-left corner.
4. Select the `extension/` directory from this repository:
   ```text
   /path/to/SecureLens/extension
   ```
5. Click the **SecureLens** icon on your Chrome toolbar to test sub-200ms quick scans on any live website!

---

## 🛠️ REST API Contract

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/scan` | Initiate full deep forensic scan |
| `POST` | `/api/v1/scan?quick=true` | Execute fast sub-200ms browser quick scan |
| `GET` | `/api/v1/scan/:id/report` | Retrieve complete telemetry & analyzer findings |
| `GET` | `/api/v1/lookalikes` | Query detected lookalike threat alerts |
| `GET` | `/api/v1/secure-ai/summary/:id` | Fetch dynamic AI threat executive summary |
| `POST` | `/api/v1/secure-ai/chat` | Ask SecureAI interactive investigation questions |
| `POST` | `/api/v1/scanners/phone` | Analyze international E.164 phone reputation |
| `POST` | `/api/v1/scanners/email` | Run live DNS SPF/DMARC/DKIM email domain check |

---

## 🌐 Environment Configuration

Create `backend/.env` with the following parameters:

```env
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Supabase PostgreSQL Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Intelligence API Keys (Optional for live LLM rotation)
GEMINI_API_KEYS=your_gemini_api_key_here
GROQ_API_KEYS=your_groq_api_key_here
```

---

## 🛡️ License
Licensed under the MIT License. Built for Smart India Hackathon (SIH).