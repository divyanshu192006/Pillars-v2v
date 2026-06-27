# MaaRaksha — Complete Technical Documentation

> AI-Powered Maternal Health Early Warning Network for Rural India

**Version:** 2.0 | **Stack:** React 19 + TypeScript + Node.js + Google Gemini AI + Clerk Auth

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Application Architecture](#2-application-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Authentication Flow](#5-authentication-flow)
6. [User Roles & Dashboards](#6-user-roles--dashboards)
7. [Feature Documentation](#7-feature-documentation)
8. [AI Modules](#8-ai-modules)
9. [API Reference](#9-api-reference)
10. [Database & Data Models](#10-database--data-models)
11. [Multilingual System](#11-multilingual-system)
12. [Deployment Guide](#12-deployment-guide)
13. [Developer Setup](#13-developer-setup)

---

## 1. Project Overview

### Problem Statement
India accounts for **15% of global maternal deaths**. Most are preventable with early detection. Key failure points:
- ASHA workers use paper registers — no real-time prioritization
- Pregnant women in rural areas lack access to medical guidance
- Families are not alerted when risk escalates
- PHC and district officers have no population-level visibility

### Solution
MaaRaksha is a **multi-role, AI-powered maternal health platform** that:
- Enables voice/text symptom reporting in 6 Indian languages
- Runs Gemini AI risk assessment (GREEN/YELLOW/RED)
- Sends automated alerts to family and healthcare workers
- Provides ASHA workers with an AI-sorted priority dashboard
- Gives PHC and district officers real-time analytics

### Live URLs
- **Frontend (Vercel):** deployed via GitHub Actions
- **Backend (Render):** `https://maarakshak.onrender.com`
- **Health Check:** `https://maarakshak.onrender.com/api/health`

---

## 2. Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Vercel)                    │
│  React 19 + TypeScript + Vite + TailwindCSS v4           │
│  Clerk Auth + i18next (6 languages) + Framer Motion      │
│  Chart.js + pdf.js + PWA (offline capable)               │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS REST API calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Render)                       │
│  Node.js + Express + TypeScript (ESM)                    │
│  Multer (file uploads) + Nodemailer (alerts)             │
│  PORT: 5000 — Route prefix: /api                        │
└────────────────────────┬────────────────────────────────┘
                         │ API calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│              GOOGLE GEMINI AI (External)                 │
│  gemini-2.5-flash (primary) → 2.0-flash → fallback      │
│  Text generation + JSON structured output + Vision OCR   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              CLERK AUTH (External SaaS)                  │
│  Email/Password + Google OAuth + Session management      │
│  JWT tokens + Webhook support                            │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 19 + TypeScript | UI rendering |
| Build Tool | Vite 8 | Dev server + production build |
| Styling | TailwindCSS v4 + custom theme | Design system |
| Animation | Framer Motion | Transitions + micro-interactions |
| Charts | Chart.js + react-chartjs-2 | Risk analytics |
| Authentication | Clerk (primary) + Firebase (optional) | User auth |
| i18n | i18next + react-i18next | 6-language support |
| PDF Processing | pdf.js + Gemini Vision | Report OCR |
| Backend | Express.js + TypeScript | REST API |
| AI | Google Gemini AI SDK | Risk assessment, chat, OCR |
| File Upload | Multer | Multipart form handling |
| Email | Nodemailer | Emergency alerts |
| Hosting Frontend | Vercel | CDN + auto-deploy |
| Hosting Backend | Render | Node.js web service |

---

## 3. Frontend Architecture

### Directory Structure

```
src/
├── App.tsx                    # Root router — all routes defined here
├── main.tsx                   # Entry point — wraps with ClerkProvider + AuthProvider
├── index.css                  # TailwindCSS theme + custom utilities
│
├── assets/
│   ├── illustrations/         # 7 custom SVG illustrations
│   └── fetal-development/     # 6 SVG fetal stage visuals
│
├── components/
│   ├── auth/
│   │   └── ClerkAuthSync.tsx  # Syncs Clerk session → AuthContext
│   ├── charts/
│   │   └── RiskCharts.tsx     # Risk progression line chart
│   ├── common/
│   │   ├── Logo.tsx           # MaaRaksha logo with glow effect
│   │   ├── PregnancyCard.tsx  # Compact pregnancy risk card
│   │   └── StatCard.tsx       # Dashboard stat tile
│   ├── layout/
│   │   └── DashboardLayout.tsx # Sidebar + header + mobile drawer
│   ├── ui/                    # Radix UI primitives (badge, button, card, input)
│   └── voice/
│       └── VoiceRecorder.tsx  # Web Speech API recorder with waveform
│
├── contexts/
│   ├── AuthContext.tsx         # User session, login, logout, onboarding
│   └── DataContext.tsx         # All app data (pregnancies, risk, alerts...)
│
├── features/
│   ├── landing/
│   │   ├── SplashScreen.tsx    # Animated intro screen (route: /)
│   │   └── LandingPage.tsx     # Marketing landing page (route: /landing)
│   ├── auth/
│   │   ├── LoginPage.tsx       # Clerk SignIn widget + demo fallback
│   │   ├── SignupPage.tsx      # Clerk SignUp widget + demo fallback
│   │   └── OnboardingPage.tsx  # 4-step profile setup for new women users
│   ├── woman/                  # Pregnant woman role
│   ├── asha/                   # ASHA worker role
│   ├── family/                 # Family member role
│   ├── phc/                    # PHC admin role
│   ├── district/               # District officer role
│   └── shared/
│       └── NotificationsPage.tsx
│
├── lib/
│   ├── api.ts                  # All backend API calls
│   ├── clerk.ts                # Clerk config + appearance theme
│   ├── demo-data.ts            # Mock data for demo mode
│   ├── fetalData.ts            # Clinical fetal development data by week
│   ├── firebase.ts             # Firebase optional config
│   ├── i18n.ts                 # i18next initialization
│   └── utils.ts                # cn(), getRiskColor(), formatDate()
│
├── locales/
│   ├── en.json                 # English (31 sections, 200+ keys)
│   ├── hi.json                 # Hindi
│   ├── ta.json                 # Tamil
│   ├── te.json                 # Telugu
│   ├── mr.json                 # Marathi
│   └── bn.json                 # Bengali
│
└── types/
    └── index.ts                # All TypeScript interfaces
```

### Routing Structure (App.tsx)

```
/                    → SplashScreen (animated 10s intro)
/landing             → LandingPage (marketing)
/login               → LoginPage (Clerk SignIn)
/signup              → SignupPage (Clerk SignUp)
/onboarding          → OnboardingPage (4-step profile)
/sso-callback        → Clerk OAuth callback
/dashboard/woman/*   → WomanDashboard (Protected, role: woman)
/dashboard/asha/*    → AshaDashboard (Protected, role: asha)
/dashboard/family/*  → FamilyDashboard (Protected, role: family)
/dashboard/phc/*     → PhcDashboard (Protected, role: phc)
/dashboard/district/*→ DistrictDashboard (Protected, role: district)
```

### State Management
- **AuthContext** — user object, loading state, login/logout, language, onboarding
- **DataContext** — pregnancies, symptoms, riskReports, alerts, notifications, appointments, medicines, dailyEntries, riskHistory
- No Redux — React Context + useState is sufficient for this scale
- localStorage — persists user session, language preference, pregnancy profile

---

## 4. Backend Architecture

### Directory Structure

```
server/
├── package.json               # type: module, Node.js ESM
├── tsconfig.json              # NodeNext module resolution
└── src/
    ├── index.ts               # Express app — all routes
    └── services/
        ├── gemini.ts          # Gemini AI SDK wrapper
        ├── riskEngine.ts      # Local risk scoring fallback
        └── alerts.ts          # Nodemailer email alerts
```

### API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Health check — returns Gemini status |
| POST | `/api/risk/assess` | Risk assessment (AI or local) |
| POST | `/api/ai/symptoms` | Extract symptoms from text |
| POST | `/api/ai/chat` | AI assistant multi-turn chat |
| POST | `/api/ai/predict-risk` | 7/30-day risk forecast |
| POST | `/api/ai/nutrition-plan` | AI meal plan generator |
| POST | `/api/ai/analyze-report` | Report analysis from text/base64 |
| POST | `/api/ai/analyze-file` | Report analysis from file upload |
| POST | `/api/ai/digital-twin` | Health twin score computation |
| POST | `/api/alerts/send` | Send email alert |
| POST | `/api/reports/generate` | Generate health report |
| GET | `/api/analytics/insights` | District AI trend insights |

### Middleware Stack
```
1. dotenv.config()         — loads .env before any imports
2. CORS                    — allows all origins by default (configurable)
3. express.json()          — JSON body parsing
4. multer (per-route)      — multipart file upload (analyze-file route)
```

### Gemini Service (services/gemini.ts)

```typescript
Model fallback chain:
1. gemini-2.5-flash    (primary — latest, fastest)
2. gemini-2.0-flash    (fallback 1)
3. gemini-2.0-flash-lite (fallback 2)
4. gemini-flash-latest  (fallback 3)

Exported functions:
- isGeminiConfigured()          → boolean
- generateText(prompt)          → string
- generateJSON<T>(prompt)       → T (parsed JSON)
- generateWithImage(prompt, base64, mimeType) → string
- generateJSONWithImage<T>(...)  → T
- chatWithHistory(system, history, message) → string
```


---

## 5. Authentication Flow

### Clerk Authentication (Primary)

```
User visits /
     ↓
SplashScreen (10s animated logo)
     ↓
Redirects to /login
     ↓
LoginPage shows Clerk <SignIn> widget
     ↓
User signs in via Email/Password OR Google OAuth
     ↓
Clerk creates session → browser stores JWT
     ↓
ClerkAuthSync.tsx detects isSignedIn=true
     ↓
Calls loginWithClerkUser({ id, email, name, avatar })
     ↓
AuthContext creates/restores User record in localStorage
     ↓
If new woman user: needsOnboarding=true → redirect /onboarding
If existing user:  redirect to getDashboardPath(user.role)
```

### Onboarding Flow (New Women Users)

```
/onboarding — 4 Steps:
Step 1: Name + Age
Step 2: Gestational Month (1-9 grid selection)
Step 3: Weight (kg input)
Step 4: Pre-existing conditions + additional info + optional file upload

On completion:
- completeOnboarding() called in AuthContext
- User record updated with gestationalWeek, trimester, symptoms
- Pregnancy profile saved to localStorage
- CustomEvent 'maaraksha:onboarding-complete' fired
- Redirect to /dashboard/woman
```

### Demo Mode (Fallback when Clerk not configured)

```
If VITE_CLERK_PUBLISHABLE_KEY is absent:
  - Login page shows demo role buttons
  - 5 demo accounts available (one per role)
  - loginDemo(role) sets user directly without auth
  - All features work with mock data from demo-data.ts
```

### AuthContext Fields

```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  isDemo: boolean
  needsOnboarding: boolean         // true for new women before onboarding
  login(email, password)           // Firebase/demo login
  loginDemo(role)                  // One-click demo
  loginWithClerkUser(clerkUser)    // Called by ClerkAuthSync
  completeOnboarding(profile)      // Saves onboarding data
  logout()                         // Clears session
  setLanguage(lang)                // Updates i18n + persists
}
```

---

## 6. User Roles & Dashboards

### Role: Woman (Pregnant Patient)

**Access:** `/dashboard/woman/*`
**Nav Groups:**
1. Home → `/dashboard/woman`
2. Daily Health → Check-in, AI Risk Forecast, Health Twin
3. Pregnancy Journey → Timeline, Knowledge Hub, Nutrition Planner
4. Medical Center → Health Reports, Report Analyzer, Medicines, Appointments
5. AI Assistant → `/dashboard/woman/assistant`
6. Emergency & Hospitals → SOS, Find Hospital
7. Notifications

---

### Role: ASHA Worker

**Access:** `/dashboard/asha/*`
**Pages:** Home, Priority List, Follow-ups, Notifications
**Purpose:** Manage village pregnancies, replace paper registers

---

### Role: Family Member

**Access:** `/dashboard/family/*`
**Pages:** Home, Alerts
**Purpose:** Monitor linked pregnancy, receive emergency alerts

---

### Role: PHC Admin / Doctor

**Access:** `/dashboard/phc/*`
**Pages:** Home, Analytics, Medical Reports
**Purpose:** Clinical reports, population analytics, PHC-level monitoring

---

### Role: District Officer

**Access:** `/dashboard/district/*`
**Pages:** Home, Analytics, Heatmap
**Purpose:** District-wide population health monitoring, village heatmaps

---

## 7. Feature Documentation

---

### 7.1 Splash Screen

| Field | Detail |
|---|---|
| **Route** | `/` |
| **File** | `src/features/landing/SplashScreen.tsx` |
| **Purpose** | Branded animated intro — first impression for hackathon judges |
| **Duration** | 10 seconds (configurable via `SPLASH_DURATION`) |

**User Flow:**
1. User opens app → full-screen pink gradient background
2. Logo animates in with pulsing glow rings
3. "MaaRaksha" title fades in with text shadow glow
4. Tagline + feature badges appear sequentially
5. Progress bar fills to 100%
6. "Tap to continue" button shown
7. Auto-navigates: logged-in → dashboard, else → /login

**Animations:**
- Flowing line particles (top of screen)
- Double SVG ring pulse around logo
- Box-shadow pulse on logo image
- Sequential opacity reveals (title at 1.4s, tagline at 2.8s, description at 4s)
- Progress bar with white glow shadow

---

### 7.2 Landing Page

| Field | Detail |
|---|---|
| **Route** | `/landing` |
| **File** | `src/features/landing/LandingPage.tsx` |
| **Purpose** | Marketing page for hackathon judges, stakeholders |

**Sections:**
1. Fixed Navbar (Sign In / Get Started buttons)
2. Hero — headline, stats (70% deaths preventable, 50K+ ASHA workers, <24h alerts)
3. Problem — Late Detection, Paper Registers, Communication Gaps
4. How It Works — 4 steps with icons
5. Features — 9 feature cards
6. Impact — gradient section with 4 metrics
7. Technology badges
8. Stakeholders — 5 roles
9. Success Stories — 3 testimonials
10. FAQ — expandable with ChevronDown animation
11. Team
12. Contact + CTA
13. Footer

---

### 7.3 Login Page

| Field | Detail |
|---|---|
| **Route** | `/login` |
| **File** | `src/features/auth/LoginPage.tsx` |

**Layout:** Split panel (50/50 on desktop)
- Left: Hero panel with Logo, tagline, 3 feature bullets
- Right: Clerk `<SignIn>` widget or demo section

**When Clerk is configured:**
- Shows Clerk's embedded `<SignIn>` component
- Supports Email+Password + Google OAuth
- `forceRedirectUrl="/onboarding"` — always goes to onboarding after sign in
- `useAuthRedirect()` hook — redirects away if already logged in

**When Clerk is not configured:**
- Amber warning banner
- Collapsible demo section with email/password form + role buttons

---

### 7.4 Onboarding Page

| Field | Detail |
|---|---|
| **Route** | `/onboarding` |
| **File** | `src/features/auth/OnboardingPage.tsx` |
| **Trigger** | `needsOnboarding === true` (new Clerk users only) |

**4-Step Flow:**

| Step | Icon | Inputs | Validation |
|---|---|---|---|
| 1 | User | Name, Age | name ≥ 2 chars, age 15-55 |
| 2 | Baby | Gestational Month (grid 1-9) | required |
| 3 | Scale | Weight (kg) | 30-200 kg |
| 4 | Activity | Pre-existing conditions (chips), Additional info, File upload | optional |

**Condition chips:** High BP, Diabetes, Thyroid, Asthma, Anemia, Heart Disease, Epilepsy, Kidney Disease, Autoimmune, PCOS, Previous Pregnancy Complications, None

**On Submit:**
```
completeOnboarding({
  name, age, gestationalMonth, weight,
  symptoms, additionalInfo, previousReports
})
→ gestationalWeek = month × 4
→ trimester = week ≤ 13 ? 1 : week ≤ 27 ? 2 : 3
→ localStorage.setItem('maaraksha_pregnancy_profile', ...)
→ CustomEvent('maaraksha:onboarding-complete')
→ navigate('/dashboard/woman')
```

---

### 7.5 Woman Home Dashboard

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman` |
| **File** | `src/features/woman/pages/WomanHome.tsx` |

**4 Sections:**

#### Section 1: Pregnancy Summary Card
- Gradient header (pink/rose — red if HIGH RISK)
- Left column: gestational week, trimester label, village, progress bar (week/40), weeks left, days left
- Right column: Baby Development panel — weight, length, stage, 4 development ticks (Brain, Hearing, Lungs, Movement)
- Bottom strip: Week N Development milestones (from `fetalData.ts`)
- Collapsible weekly insight panel

**fetalData.ts** provides clinical data for weeks 1-42:
```typescript
interface FetalWeekData {
  week: number
  weightDisplay: string      // e.g. "1.1 kg"
  lengthCm: number
  stage: string
  trimester: 1 | 2 | 3
  brainDevelopment: string
  hearing: string
  lungs: string
  movement: string
  milestones: string[]       // 4 development points
  insight: string            // Clinical weekly insight
}
```

#### Section 2: Mini Calendar
- Monthly grid with color-coded check-in history
- Green = LOW risk, Amber = MEDIUM, Red = HIGH, Gray = no entry
- Click any date → slide-in detail panel showing symptoms, medicines, BP, water, AI recommendation
- Today highlighted with primary gradient ring
- "Add Today's Health Entry" CTA button

#### Section 3: AI Health Insights
- Animated gauge ring showing current risk score (0-100)
- Trend indicator: Improving ↓ / Stable → / Worsening ↑
- 7-day and 30-day forecast bars
- Main risk factors chips
- AI recommendation text
- Risk history line chart (if data exists)

#### Section 4: Upcoming Actions & Events
- Vertical timeline with colored icons
- Shows: pending medicines + upcoming appointments + nutrition/vaccination reminders
- Each item: label, sublabel, date badge, type badge
- "Today" highlighted in primary color

**Quick Actions Grid:**
- Daily Check-in, My Journey, AI Forecast, Ask AI

**SOS Button:**
- Full-width red animated pulse button
- Triggers `triggerSOS(pregnancy.id)` → sends emergency alert


---

### 7.6 Daily Health Check-In

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman/checkin` |
| **File** | `src/features/woman/pages/DailyCheckInPage.tsx` |
| **Purpose** | Daily symptom + vitals recording with AI risk analysis |

**3-Step Flow:**

#### Step 1: Symptoms
Three input modes (tab-switched):

| Mode | Description |
|---|---|
| Quick Select | 12 symptom chips with risk color coding (red=high, amber=medium, green=low) |
| Voice | VoiceRecorder component with Web Speech API |
| Type | Free-text textarea |

**Symptom chips:** Headache, Fever, Bleeding, Dizziness, Swelling, Reduced Fetal Movement, Vomiting/Nausea, High Blood Pressure, Abdominal Pain, Fatigue, Blurred Vision, No Symptoms Today

#### Step 2: Vitals (all optional)
- Weight (kg) — number input
- Blood Pressure — text input (e.g., 120/80)
- Water intake — counter with +/- buttons
- Sleep hours — counter with +/- buttons
- Medicine taken — Yes/No toggle
- Mood — 5 emoji selector (Great/Good/Okay/Poor/Bad)
- Notes — textarea

#### Step 3: AI Analysis (automatic)
```
POST /api/risk/assess
Body: { symptoms[], gestationalWeek, bloodPressure, transcription }

Gemini prompt:
- Analyzes 15+ clinical parameters
- Returns: score (0-100), level (GREEN/YELLOW/RED),
  reasoning, action, precautions[], warnings[], nextSteps

Fallback (no Gemini):
localRiskAssess() in riskEngine.ts
- High risk signs: +25 each
- Medium risk signs: +12 each
- Week ≥ 36: +5, Week ≥ 28: +3
```

**Result Display:**
- Large colored score card (GREEN/YELLOW/RED)
- Risk label + score/100
- AI recommendation paragraph
- Symptoms reported chips
- Expandable "Full AI Analysis" accordion:
  - ✅ Recommended Precautions list
  - ⚠️ Warning Signs to Watch
  - 📋 Next Steps
  - Vitals summary (BP, water, sleep)
- "Saved to Calendar" confirmation banner
- RED risk → urgent pulsing alert banner + auto-sends emergency API alert

**Side Effects:**
```
addDailyEntry(entry)               → DataContext
updatePregnancyRisk(id, level, score)
addRiskReport(report)
addNotification({ title, message })
If RED: POST /api/alerts/send → email to family + ASHA
If medicineTaken=true: auto-mark all medicines as taken
```

**Real World Impact:**
Replaces the ASHA worker's paper register visit with a daily self-reported digital check-in. Enables trend tracking and early intervention before conditions worsen.

---

### 7.7 AI Risk Forecast (Predictive Risk Engine)

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman/predict` |
| **File** | `src/features/woman/pages/PredictiveRiskPage.tsx` |
| **Purpose** | 7-day and 30-day risk trajectory forecasting |

**Input Data:**
- Risk history (week + score pairs)
- Current risk level and score
- Gestational week
- Recent symptoms
- Previous complications

**AI Processing:**
```
POST /api/ai/predict-risk

Gemini prompt includes:
- Historical risk trend (week-by-score format)
- Current clinical profile
- Symptom patterns

Returns JSON:
{
  next7Days: { probability, trend, confidence },
  next30Days: { probability, trend, confidence },
  complications: [
    { name, probability, severity }  // 5 complications
  ],
  trendDirection: "improving|stable|worsening",
  keyFactors: string[],
  aiSummary: string
}
```

**Complications forecasted:**
Pre-eclampsia, Gestational Diabetes, Anaemia, Preterm Birth, Hypertension

**Visual Components:**
- 2 forecast cards (7-day + 30-day) with trend icons and confidence rings
- Gemini AI Analysis card
- Projected risk line chart (actual + predicted, dashed line)
- Complication probability bars with severity badges
- Key risk factors chip list
- Disclaimer note

**Fallback (no Gemini):**
Local calculation using trend direction from last 2 history points.

---

### 7.8 AI Pregnancy Digital Twin

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman/digital-twin` |
| **File** | `src/features/woman/pages/DigitalTwinPage.tsx` |
| **Purpose** | Composite virtual health profile computed from all data |

**Health Score Computation (server-side):**
```
healthScore = (riskScore × 0.4) + (checkInRate × 0.25) + (medicineRate × 0.2) + (apptRate × 0.15)

complianceScore = (checkIns.length / 30) × 100
medicineScore   = (takenMeds / totalMeds) × 100
nutritionScore  = 72 (static estimate — future: from nutrition log)
riskScore       = 100 - latestRiskHistoryScore
```

**Future Risk Projection:**
- 6 data points, 2 weeks apart
- Improving: -2 per point; Worsening: +3; Stable: 0

**AI Insights (server-generated):**
- < 70% check-in compliance warning
- < 80% medicine compliance warning
- Risk > 60 → ASHA visit recommendation
- < 60% appointment adherence warning
- Otherwise: positive reinforcement message

**Visual Components:**
- Animated score rings (4): Overall, Check-in Rate, Medicines, Nutrition
- Trajectory indicator with colored icon
- Future risk projection line chart (dashed)
- AI insights cards (green = positive, amber = needs attention)
- Quick stats grid: Check-ins, Meds Taken, Appointments, Risk Reports

---

### 7.9 Pregnancy Journey (Calendar + Timeline)

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman/journey` |
| **File** | `src/features/woman/pages/JourneyPage.tsx` |
| **Purpose** | Full 40-week pregnancy tracking with daily calendar |

**Components:**

#### Hero Header
- Gradient banner with week count, trimester, weeks left
- Progress bar (week/40)
- Week 1/12/28/40 labels

#### Month Stats Strip
- Days Tracked (submitted/total + percentage)
- High Risk Days count
- Medium Risk count
- Appointments this month

#### Monthly Calendar
- 7-column grid with day cells
- Each cell shows: day number + colored dot + appointment 📅 + milestone 👶 emoji
- Color coding: Emerald=GREEN, Amber=YELLOW, Red=RED, Gray=missed, White=future
- Click any past date → Day Detail Panel

#### Day Detail Panel (slide-in from right)
- Header: date + gradient + milestone name if applicable
- Status banner: submitted (with risk level) or missed
- Appointment card (if any)
- Symptoms chips
- Medicines taken (count + list)
- Water intake (visual dots)
- Notes
- AI Recommendation
- Milestone card (if applicable)

#### Trimester Timeline
- 3 accordion cards (First/Second/Third Trimester)
- Auto-expands current trimester
- Progress bar within current trimester
- Each milestone: week badge, title, description, check/circle icon
- "You are here" badge on nearest milestone

**Demo Data Generation:**
`generateMonthData(year, month, gestationalWeek)` creates realistic dummy data for all past dates including risk levels, symptoms, medicines, and appointments.

---

### 7.10 Knowledge Hub

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman/knowledge` |
| **File** | `src/features/woman/pages/KnowledgeHubPage.tsx` |
| **Purpose** | Week-by-week pregnancy education + warning signs |

**Two Tabs:**

#### Week Guide
10 articles covering weeks 4, 8, 12, 16, 20, 24, 28, 32, 36, 40.
Each article: emoji, title, week, category badge, description, key actions list.
Categories: development, nutrition, tests, warnings, general.
Current week article auto-expanded with "You are here" badge.

#### Warning Signs
8 warning signs with urgency levels (🚨 EMERGENCY or ⚠️ URGENT).
Each: sign description + action + color-coded badge.

**Warning Signs covered:**
Severe headache+vision, Vaginal bleeding, No fetal movement 12h+, Severe abdominal pain, Sudden face/hand swelling, Fever >38°C, Reduced fetal movement, Leaking fluid.

---

### 7.11 Nutrition Planner

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman/nutrition` |
| **File** | `src/features/woman/pages/NutritionPlannerPage.tsx` |
| **Purpose** | AI-generated Indian pregnancy meal plan |

**Input:** gestational week, risk level, region (default: Rajasthan)

**AI Processing:**
```
POST /api/ai/nutrition-plan

Gemini prompt:
- Week number + risk level + region
- Requests affordable Indian foods
- Returns 4 meal categories + supplements + tips

Output JSON:
{
  breakfast: [{ item, portion, nutrients }],
  lunch: [...], dinner: [...], snacks: [...],
  supplements: string[],
  tips: string[]
}
```

**Fallback (no Gemini):**
Hardcoded ICMR-guideline based plan with daliya, palak dal, ragi, eggs, etc.

**Visual:**
- 4 MealCard components (Breakfast, Lunch, Snacks, Dinner) with colored left borders
- Supplements card (purple theme)
- Nutrition Tips card (teal theme)
- Footer: AI-generated or ICMR standard label + doctor disclaimer

---

### 7.12 Medical Report Analyzer

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman/medical?tab=analyzer` |
| **File** | `src/features/woman/pages/MedicalReportAnalyzerPage.tsx` |
| **Purpose** | AI analysis of uploaded lab reports, ultrasounds, prescriptions |

**Input Methods:**
1. **File Upload** (drag & drop or click) — PDF, JPG, PNG up to 10MB
2. **Text Input** — paste lab values manually

**Report Types:** Blood Test, Ultrasound, Prescription, Lab Report

**File Processing Flow:**
```
User uploads file
     ↓
Frontend: POST /api/ai/analyze-file (multipart/form-data)
     ↓
Server: multer parses file → buffer.toString('base64')
     ↓
Gemini Vision API: analyzes image/PDF visually (OCR included)
     ↓
Returns structured JSON:
{
  findings: string[],
  abnormalValues: string[],
  riskIndicators: string[],
  followUp: string,
  aiSummary: string
}
```

**Text Processing Flow:**
```
User types/pastes values → Submit
     ↓
POST /api/ai/analyze-report (JSON body)
     ↓
Gemini text analysis
     ↓
Same JSON output
```

**Result Display:**
- AI Summary box (blue gradient)
- Key Findings list (green checkmarks)
- Values Needing Attention (amber warning box)
- Recommended Follow-up (pink box)

**Real World Impact:**
Rural women can photograph their lab report with phone, upload it, and get an instant plain-language explanation of what the values mean for their pregnancy — without needing to travel to a doctor for interpretation.

---

### 7.13 AI Maternal Health Assistant

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman/assistant` |
| **File** | `src/features/woman/pages/AssistantPage.tsx` |
| **Purpose** | 24/7 maternal health guidance chatbot in 6 languages |

**System Prompt:**
```
You are MaaRaksha — a trusted, compassionate maternal health guide.
RULES: Not a doctor. Never diagnose. Highlight emergencies.
Be warm and simple. Always respond in [user's language].
FORMAT:
1. 🤱 What this could mean
2. ⚠️ Warning signs
3. ✅ Immediate precautions
4. 📞 When to contact ASHA
5. 🚨 When to go to hospital IMMEDIATELY
CONTEXT: Week X, Risk Y, Trimester Z
```

**Features:**
- Suggested questions in all 6 languages (pre-loaded)
- Multi-turn conversation (history passed to API)
- Streaming effect (character-by-character reveal)
- Typing indicator (3 animated dots)
- Markdown-like rendering (bold, bullet points, emergency highlights)
- Pregnancy context badges (week, risk level, trimester)
- Quick topic icons (Symptoms, Nutrition, Emergency, Medicines, Hydration, ASHA)
- Reset button clears history

**API Call:**
```
POST /api/ai/chat
Body: { message, language, history[], pregnancyContext }
Returns: { reply: string }
```

**Intelligent Fallback:**
When Gemini is unavailable, `getSmartLocalReply()` matches keywords (headache, movement, swelling, blood, vomit, food) across all 6 language keywords and returns pre-written clinical responses.

---

### 7.14 Emergency SOS

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman/emergency?tab=sos` |
| **File** | `src/features/woman/pages/EmergencyPage.tsx` |
| **Purpose** | One-tap emergency alert + quick call buttons |

**SOS Button Action:**
```
User taps large circular SOS button
     ↓
triggerSOS(pregnancy.id) in DataContext
     ↓
POST /api/alerts/send {
  pregnancyId, womanName, riskLevel: 'RED',
  message: 'URGENT SOS activated...'
}
     ↓
Nodemailer sends email to ALERT_EMAIL + FAMILY_ALERT_EMAIL
     ↓
Button shows "SENT" confirmation (5 seconds)
```

**Quick Call Buttons (4):**
- 108 — Ambulance (red)
- 104 — Health Helpline (blue)
- 1800-180-1104 — NHM Helpline (emerald)
- 112 — Emergency Services (purple)

Each button: `href="tel:number"` direct dial

**Warning Signs Panel:**
6 critical signs listed that require immediate hospital visit.

**Recent Alerts Panel:**
Shows last 5 alerts for this pregnancy with risk level and message.

---

### 7.15 Hospital Finder

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman/emergency?tab=hospitals` |
| **File** | `src/features/woman/pages/NearbyHospitalsPage.tsx` |
| **Purpose** | Find nearest PHC/CHC/Hospital with contact and directions |

**Demo Data (5 facilities near Jaipur Rural):**
- Bassi PHC (0.8 km)
- Chomu CHC (4.2 km, 24/7)
- Jaipur District Hospital (18 km, 24/7)
- Sanganer Sub-District Hospital (7.5 km, 24/7)
- Amer PHC (5.1 km)

**Each FacilityCard shows:**
- Name + type badge + 24/7 indicator
- Distance + address + phone (clickable)
- Business hours
- Services chips (ANC, C-Section, NICU, Blood Bank...)
- Call + Directions buttons (open Maps)

**Filter Bar:** All / PHC / CHC / Hospital

**High Risk Warning:** If pregnancy risk is RED/YELLOW, shows alert banner with reminder to save hospital number.

**Emergency Numbers Footer:** 108, 104, 1800-180-1104, 112


---

### 7.16 ASHA Worker Dashboard

| Field | Detail |
|---|---|
| **Route** | `/dashboard/asha/*` |
| **File** | `src/features/asha/` |
| **Purpose** | Replace paper registers with AI-sorted priority management |

**Pages:**

#### ASHA Home
- 4 stat cards: Total Pregnancies, High Risk (RED), Follow-ups Pending, Alerts Today
- Top Priority Cases (RED pregnancies first)
- Recent Activity feed

#### Priority List
- All pregnancies auto-sorted: RED → YELLOW → GREEN
- Filter by: village, risk level, trimester
- Search by name
- Each card: name, village, gestational week, risk badge, score, last report time
- Quick action: Call, Mark Visited
- Urgent visit banner for RED cases (Visit within 4 hours)

#### Follow-Up Tracker
- Cases requiring follow-up with urgency labels
- URGENT (RED): Visit within 4 hours
- SCHEDULED (YELLOW): Visit within 48 hours

**Problem Solved:**
ASHA workers previously managed 50-80 pregnancies on paper notebooks with no way to know which case needed attention most urgently. The priority dashboard shows exactly who to visit first.

---

### 7.17 Family Dashboard

| Field | Detail |
|---|---|
| **Route** | `/dashboard/family/*` |
| **File** | `src/features/family/` |
| **Purpose** | Allow family members to monitor linked pregnancy |

**Home Page:**
- Patient name + current risk level badge
- Risk score display
- Active alerts list
- Recent health updates

**Alerts Page:**
- Full history of all sent alerts
- Each alert: risk level, message, timestamp, recipients

**Workflow:**
Family members are linked to a pregnancy via `linkedPregnancyId`. They receive email alerts via Nodemailer when risk escalates to RED.

---

### 7.18 PHC Admin Dashboard

| Field | Detail |
|---|---|
| **Route** | `/dashboard/phc/*` |
| **File** | `src/features/phc/` |
| **Purpose** | Clinical oversight + population-level PHC analytics |

**Home Page:**
- 4 stat cards: Total Patients, High Risk Cases, Reports Generated, Alerts Today
- Risk distribution chart
- Recent alerts
- Cases requiring attention (RED pregnancies)

**Analytics Page:**
- Weekly risk trend line chart
- Population distribution pie chart (GREEN/YELLOW/RED)
- Monthly summary stats

**Medical Reports Page:**
- AI-generated health reports for all pregnancies
- Doctor-friendly format with: patient profile, risk assessment, symptoms, clinical reasoning, recommendations

---

### 7.19 District Officer Dashboard

| Field | Detail |
|---|---|
| **Route** | `/dashboard/district/*` |
| **File** | `src/features/district/` |
| **Purpose** | Population-level maternal health monitoring across all villages |

**Home Page:**
- 4 stat cards: Active Pregnancies, High Risk, Villages Covered, Risk Trend
- RED cases this week with "monitoring closely" badge
- District risk trend chart (6-week view)
- Population risk distribution
- Trimester breakdown
- AI trend insights (4 insights from `/api/analytics/insights`)

**Analytics Page:**
- Full longitudinal analytics with multiple chart types
- Village-by-village comparison

**Heatmap Page:**
- Village risk heatmap for Jaipur Rural district
- Color-coded by risk level: emerald=green, amber=yellow, red=high

---

### 7.20 Medicine Management

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman/medical?tab=medicines` |
| **File** | `src/features/woman/pages/MedicinesPage.tsx` |

**Features:**
- List of prescribed medicines: Iron+Folic Acid, Calcium, Vitamin D3
- Each: name, dosage, frequency, reminder time
- Toggle taken/not taken
- Pending count badge
- Daily medicine taken automatically marked if user confirms in check-in

**Data Model:**
```typescript
interface MedicineReminder {
  id, pregnancyId, womanId,
  name, dosage, frequency, time,
  taken: boolean, lastTakenAt?: string
}
```

---

### 7.21 Appointment Tracker

| Field | Detail |
|---|---|
| **Route** | `/dashboard/woman/medical?tab=appointments` |
| **File** | `src/features/woman/pages/AppointmentsPage.tsx` |

**Appointment Types:** ANC (Antenatal Care), Ultrasound, Lab Test, Follow-up

**3 Sections:** Upcoming, Completed, Missed

**Data Model:**
```typescript
interface Appointment {
  id, pregnancyId, womanId,
  type: 'ANC' | 'ultrasound' | 'lab' | 'follow_up',
  title, date, status, location, notes?
}
```

---

### 7.22 Notifications Center

| Field | Detail |
|---|---|
| **Route** | `/dashboard/*/notifications` |
| **File** | `src/features/shared/NotificationsPage.tsx` |

**Notification Types:** alert, reminder, appointment, info

**Features:**
- Unread count badge on bell icon
- Mark individual as read
- Mark all as read
- Filter by type (future enhancement)

**Auto-generated notifications:**
- After every risk assessment: "Risk Updated: LEVEL"
- Medicine reminders
- Appointment reminders
- SOS confirmation

---

## 8. AI Modules

### 8.1 Risk Assessment Engine

```
Input:
  - symptoms: string[]
  - gestationalWeek: number
  - bloodPressure?: string
  - transcription?: string
  - previousComplications?: string[]

Local Algorithm (riskEngine.ts):
  base = 10
  High risk signs (bleeding, reduced FM, high BP, blurred vision): +25 each
  Medium risk signs (headache, swelling, dizziness, abdominal pain, fever): +12 each
  Other symptoms: +5 each
  Week ≥ 36: +5
  Week ≥ 28: +3
  cap at 100

Score → Level:
  0-34 = GREEN (Low Risk)
  35-64 = YELLOW (Medium Risk)
  65-100 = RED (High Risk)

Gemini Enhancement:
  Same inputs → structured Gemini prompt
  Returns: score, level, clinicalReasoning,
           suggestedAction, followUpRecommendation
```

### 8.2 Symptom Extraction

```
Input: voice transcription text (any language)
POST /api/ai/symptoms

Gemini prompt:
"Extract maternal health symptoms from this patient report.
Language: [lang]
Report: '[text]'
Return JSON with symptoms[] and summary."

Output: { symptoms: string[], summary: string }
Local fallback: keyword matching against symptom dictionary
```

### 8.3 Predictive Risk Engine

See Section 7.7 above.

### 8.4 Nutrition Planner AI

See Section 7.11 above.

### 8.5 Medical Report Analyzer AI

See Section 7.12 above.

**Gemini Vision capability:**
- Can read scanned PDFs (OCR built into Gemini)
- Can read images (JPG, PNG) of lab reports
- Can read handwritten prescriptions
- Identifies: lab values, normal ranges, abnormalities, pregnancy implications

### 8.6 Chat Assistant

See Section 7.13 above.

### 8.7 Digital Twin Engine

See Section 7.8 above.

---

## 9. API Reference

### Base URL
- Development: `http://localhost:5000/api` (via Vite proxy)
- Production: `https://maarakshak.onrender.com/api`

### Authentication
All endpoints are open (no auth middleware on backend). Security relies on CORS allowlist.

### Endpoints

#### GET /api/health
```json
Response: {
  "status": "ok",
  "demo": false,
  "gemini": true,
  "timestamp": "2026-06-27T12:21:44.994Z"
}
```

#### POST /api/risk/assess
```json
Request: {
  "symptoms": ["Headache", "Swelling"],
  "gestationalWeek": 28,
  "bloodPressure": "138/88",
  "transcription": "I have headache since morning",
  "pregnancyId": "p1",
  "womanId": "u1"
}
Response: {
  "report": {
    "id": "r-1234567890",
    "riskLevel": "YELLOW",
    "riskScore": 45,
    "clinicalReasoning": "...",
    "suggestedAction": "...",
    "followUpRecommendation": "...",
    "riskFactors": [...],
    "symptoms": [...],
    "gestationalWeek": 28
  }
}
```

#### POST /api/ai/chat
```json
Request: {
  "message": "I have a severe headache",
  "language": "hi",
  "history": [{"role":"user","content":"..."},{"role":"assistant","content":"..."}],
  "pregnancyContext": { "week": 28, "riskLevel": "YELLOW", "trimester": 3 }
}
Response: { "reply": "🤱 **What this could mean**\n..." }
```

#### POST /api/ai/analyze-file
```
Content-Type: multipart/form-data
Fields:
  file: File (PDF/JPG/PNG, max 10MB)
  reportType: "blood_test" | "ultrasound" | "prescription" | "lab_report"
  gestationalWeek: number (optional)

Response: {
  "analysis": {
    "findings": ["..."],
    "abnormalValues": ["..."],
    "riskIndicators": ["..."],
    "followUp": "...",
    "aiSummary": "..."
  }
}
```

---

## 10. Database & Data Models

MaaRaksha uses **localStorage** for persistence in the current version (hackathon scope). Firebase Firestore is optionally configurable for production.

### Core Entities

#### User
```typescript
{
  id: string
  email: string
  name: string
  role: 'woman' | 'asha' | 'family' | 'phc' | 'district'
  phone?: string
  villageId?: string
  districtId?: string
  phcId?: string
  linkedPregnancyId?: string
  avatar?: string
  language: 'en' | 'hi' | 'ta' | 'te' | 'mr' | 'bn'
  createdAt: string
  // Onboarding fields:
  onboardingComplete?: boolean
  age?: number
  weight?: number
  gestationalMonth?: number
  gestationalWeek?: number
  symptoms?: string[]
  additionalInfo?: string
  previousReports?: string
}
```

#### Pregnancy
```typescript
{
  id, womanId, womanName, villageId, villageName, districtId,
  ashaWorkerId, familyMemberIds: string[],
  gestationalWeek, dueDate,
  trimester: 1 | 2 | 3,
  riskLevel: 'GREEN' | 'YELLOW' | 'RED',
  riskScore: number,
  isHighRisk: boolean,
  lastReportAt, bloodPressure?,
  previousComplications?: string[],
  createdAt
}
```

#### DailyEntry
```typescript
{
  id, pregnancyId, womanId, date,
  symptoms: string[],
  transcription?, weight?, bloodPressure?,
  waterIntake?, sleepHours?,
  medicineTaken?: boolean,
  mood?: 'great'|'good'|'okay'|'poor'|'bad',
  notes?,
  riskScore?, riskLevel?,
  aiRecommendation?,
  warningSignsToWatch?: string[],
  precautions?: string[],
  suggestedNextSteps?,
  createdAt
}
```

#### RiskReport
```typescript
{
  id, pregnancyId, womanId,
  riskLevel, riskScore,
  riskFactors: string[],
  clinicalReasoning, suggestedAction,
  followUpRecommendation,
  symptoms: string[],
  gestationalWeek,
  createdAt
}
```

#### Alert
```typescript
{
  id, pregnancyId, womanName,
  riskLevel,
  type: 'email'|'sms'|'whatsapp'|'in_app',
  recipients: AlertRecipient[],
  message, status, createdAt
}
```

---

## 11. Multilingual System

### Configuration (src/lib/i18n.ts)
```typescript
i18n.use(initReactI18next).init({
  resources: { en, hi, ta, te, mr, bn },
  lng: localStorage.getItem('maaraksha_lang') || 'en',
  fallbackLng: 'en',
  returnObjects: true,   // enables array translation keys
  interpolation: { escapeValue: false }
})
```

### Supported Languages
| Code | Language | Script |
|---|---|---|
| en | English | Latin |
| hi | Hindi | Devanagari |
| ta | Tamil | Tamil |
| te | Telugu | Telugu |
| mr | Marathi | Devanagari |
| bn | Bengali | Bengali |

### Translation Key Structure (31 sections)
```
nav.*        — navigation labels
common.*     — shared UI text
risk.*       — risk level labels
sos.*        — emergency strings + warningSigns[]
woman.*      — woman dashboard
journey.*    — pregnancy journey + weekDays[]
checkin.*    — daily check-in + symptoms_list + moods
appointments.*
medicines.*
assistant.*
reports.*
nutrition.*
knowledge.*
hospitals.*
emergency.*
predictiveRisk.*
digitalTwin.*
reportAnalyzer.*
asha.*
family.*
phc.*
district.*
notifications.*
login.*
onboarding.*
pregnancyCard.*
alerts.*
highRisk.*
```

### Language Switching
```
User selects language from dropdown
     ↓
setLanguage(lang) in AuthContext
     ↓
i18n.changeLanguage(lang)       — instant UI update
localStorage.setItem(lang)      — persists across sessions
user.language = lang            — saved in user profile
```

### t() Usage Pattern
Every visible text string uses `t('section.key')`.
Arrays use `t('key', { returnObjects: true }) as string[]`.
Interpolation: `t('woman.weekVillage', { week: 28, village: 'Bassi' })`.
Sub-components each call `const { t } = useTranslation()` — critical to avoid `t is not defined` crashes.

---

## 12. Deployment Guide

### Backend (Render)
1. Go to render.com → New Web Service
2. Connect `Dakshchandia/Maarakshak` GitHub repo
3. Root Directory: `server`
4. Build: `npm install && npm run build`
5. Start: `npm run start`
6. Environment Variables:
   ```
   GEMINI_API_KEY = your_key
   CORS_ORIGIN = * (or specific Vercel URL)
   PORT = 5000
   ```

### Frontend (Vercel)
1. Go to vercel.com → Import `Dakshchandia/Maarakshak`
2. Framework: Vite, Root: `.`, Build: `vite build`
3. Environment Variables:
   ```
   VITE_CLERK_PUBLISHABLE_KEY = pk_test_...
   VITE_API_URL = https://maarakshak.onrender.com/api
   ```
4. Deploy

### Clerk Setup
1. dashboard.clerk.com → Create app
2. Enable Email+Password + Google OAuth
3. Add Redirect URLs:
   ```
   https://your-app.vercel.app/sso-callback
   https://your-app.vercel.app/onboarding
   ```
4. Add Allowed Origins: `https://your-app.vercel.app`

---

## 13. Developer Setup

### Prerequisites
- Node.js 20+
- npm 10+

### Local Setup
```bash
# Clone repo
git clone https://github.com/Dakshchandia/Maarakshak.git
cd Maarakshak

# Install all dependencies
npm install --legacy-peer-deps
cd server && npm install && cd ..

# Configure environment
cp .env.example .env.local
# Edit .env.local: add VITE_CLERK_PUBLISHABLE_KEY

# Configure server
# Create server/.env with:
# GEMINI_API_KEY=your_key

# Start both servers
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

### Key Commands
```bash
npm run dev          # Start frontend + backend concurrently
npm run client       # Frontend only (Vite)
npm run server       # Backend only (tsx watch)
npm run build        # Production build (vite build)
npm run lint         # ESLint check
```

### Environment Variables

#### `.env.local` (frontend)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=                          # leave blank for localhost (Vite proxy handles it)
VITE_FIREBASE_API_KEY=                 # optional
```

#### `server/.env` (backend)
```
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
CORS_ORIGIN=*
SMTP_HOST=                             # optional email alerts
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=MaaRaksha <alerts@maaraksha.in>
ALERT_EMAIL=doctor@phc.gov.in
FAMILY_ALERT_EMAIL=family@example.com
```

### Adding a New Language
1. Create `src/locales/[code].json` with all 31 sections
2. Import in `src/lib/i18n.ts`
3. Add to `resources` object
4. Add to `LANGUAGES` array in `DashboardLayout.tsx`

### Adding a New API Endpoint
1. Add route in `server/src/index.ts`
2. Add method in `src/lib/api.ts`
3. Call from component

### Adding a New Dashboard Page
1. Create page in `src/features/[role]/pages/`
2. Add route in `[Role]Dashboard.tsx`
3. Add nav item to nav array in `[Role]Dashboard.tsx`
4. Add translation keys to all locale files

---

*MaaRaksha — Every mother deserves to live.*

*Built for India's public health infrastructure. Aligned with NHM, ABDM, and WHO maternal health guidelines.*
