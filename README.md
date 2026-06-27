# MaaRaksha — AI-Powered Maternal Health Early Warning Network

> Reduce preventable maternal deaths through early detection, AI risk assessment, family alerts, and ASHA worker prioritization.

## Quick Start

```bash
# Install all dependencies
npm run install-all

# Start frontend + backend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## Demo Login

Click any role on the login page, or sign in with:

| Role | Email | Password |
|------|-------|----------|
| Pregnant Woman | priya@demo.com | demo123 |
| ASHA Worker | lakshmi@demo.com | demo123 |
| Family Member | rajesh@demo.com | demo123 |
| PHC Admin | meera@demo.com | demo123 |
| District Officer | anil@demo.com | demo123 |

## Features

- **Voice Symptom Reporting** — Web Speech API with Hindi/English/regional language support
- **AI Clinical Risk Engine** — GREEN/YELLOW/RED classification (Gemini + local fallback)
- **ASHA Priority Dashboard** — Auto-sorted pregnancy list with filters
- **Family Alert Engine** — Email alerts with SMS/WhatsApp ready architecture
- **5 Role-Based Dashboards** — Woman, ASHA, Family, PHC, District Officer
- **Longitudinal Analytics** — Weekly/monthly/district trend charts
- **Smart Health Reports** — PDF export with AI summary
- **Pregnancy Journey Timeline** — Week-by-week milestones
- **ANC Appointments** — Track upcoming, completed, missed visits
- **Medicine Reminders** — Daily supplement tracking
- **Emergency SOS** — One-click emergency activation
- **AI Maternal Assistant** — Conversational health chatbot
- **Village Heatmap** — Risk distribution visualization
- **Offline PWA** — Installable with service worker caching
- **Multi-language** — Hindi, English, Tamil, Telugu, Marathi, Bengali

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Database | Firebase Firestore (with demo mode fallback) |
| Auth | Firebase Authentication (with demo mode) |
| AI | Google Gemini API |
| Charts | Chart.js |
| Deploy | Vercel (frontend), Render (backend) |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
GEMINI_API_KEY=your_key    # Enables AI features
VITE_FIREBASE_*=           # Enables production Firebase
SMTP_*=                    # Enables email alerts
```

Demo mode works fully without any configuration.

## Deployment

**Frontend (Vercel):**
```bash
npm run build
# Deploy dist/ to Vercel
```

**Backend (Render):**
```bash
cd server && npm run build
# Deploy with start command: node dist/index.js
```

## Project Structure

```
src/
├── components/     # UI, charts, voice, layout
├── contexts/       # Auth & data state
├── features/       # Role-based feature modules
│   ├── woman/      # Pregnant woman dashboard
│   ├── asha/       # ASHA worker dashboard
│   ├── family/     # Family member dashboard
│   ├── phc/        # PHC admin dashboard
│   ├── district/   # District officer dashboard
│   └── landing/    # Marketing landing page
├── lib/            # Utils, API, Firebase, i18n, demo data
└── types/          # TypeScript interfaces
server/
├── src/
│   ├── services/   # Gemini, risk engine, alerts
│   └── index.ts    # Express API
```
