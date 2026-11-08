# 🌸 Sweety – Blood Glucose Tracker

[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-4169e1.svg)](https://neon.tech/)
[![Tests](https://img.shields.io/badge/Tests-29_Passed-brightgreen.svg)]()

> A modern, full-stack healthcare application designed for tracking daily blood glucose readings with clinical accuracy, strict time-slot enforcement, aggregate analytics, and privacy-first multi-user isolation.
>
> Built for the **Kenpath Junior Full Stack Developer (JavaScript & AI)** technical assignment.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Folder Structure](#-folder-structure)
5. [Neon PostgreSQL Setup & Database Schema](#-neon-postgresql-setup--database-schema)
6. [Environment Variables](#-environment-variables)
7. [Installation & Setup](#-installation--setup)
8. [Database Initialization & Migration](#-database-initialization--migration)
9. [Seed Data & Demo Credentials](#-seed-data--demo-credentials)
10. [Running the Application](#-running-the-application)
11. [Running the Test Suite](#-running-the-test-suite)
12. [REST API Documentation](#-rest-api-documentation)
13. [Business & Validation Rules](#-business--validation-rules)
14. [Design & UI/UX Principles](#-design--uiux-principles)
15. [Assumptions & Future Enhancements](#-assumptions--future-enhancements)

---

## 🌟 Project Overview

**Sweety** is engineered to simplify diabetes management and glycemic monitoring. Patients can record readings across four daily physiological time slots (**Morning fasting**, **After breakfast**, **After lunch**, and **After dinner**), review historical records with medical target indicators, and generate comprehensive daily and monthly aggregate reports with statistical rounding.

---

## ✨ Key Features

- **🔐 Robust JWT Authentication**: Secure password hashing with `bcryptjs`, JWT token issuance, persistent local sessions, and automatic route guards.
- **🛡️ Strict Multi-User Privacy**: Row-level tenant isolation ensuring users can only read, update, delete, or aggregate their own glucose records. Never trusts client-supplied IDs.
- **⏱️ 4 Enforced Daily Time Slots**:
  1. `Morning (fasting)`
  2. `After breakfast`
  3. `After lunch`
  4. `After dinner`
- **📋 5-Point Validation Guardrails**:
  1. **Value Required**: `"Please enter a glucose value."`
  2. **Range Check**: Whole numbers between 40 and 600 mg/dl (`"Value must be between 40 and 600 mg/dl."`).
  3. **Duplicate Slot Guard**: Unique reading per time slot per day (`"You already have an After lunch reading for this date."`).
  4. **Max Frequency**: Maximum four readings per day (`"You can add only 4 readings per day."`).
  5. **No Future Dates**: Prevents future date entries (`"Date cannot be in the future."`).
- **📊 3 Clinical Aggregate Reports**:
  - **Daily Report**: Peak (highest), minimum (lowest), daily mean (average rounded to 1 decimal place), total count, and individual slot logs.
  - **Month-to-Date Report**: Month start (1st) to selected date statistics and daily trend visualization.
  - **Previous Month Report**: Full calendar previous month aggregates.
- **🎨 Pastel Healthcare UI**: Calming pastel color palette (soft pink, gentle lavender, clean slate), rounded cards, subtle shadows, responsive tables, interactive Recharts graphs, and modal workflows.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (JSX), Tailwind CSS, React Router DOM v6, Axios, Recharts, Lucide React |
| **Backend** | Node.js (v22), Express.js, JavaScript (CommonJS), `pg` (node-postgres), JWT (`jsonwebtoken`), bcryptjs, `express-validator` |
| **Database** | PostgreSQL (Neon Cloud Serverless PostgreSQL with SSL pooling) |
| **Testing** | Jest, Supertest (29 unit & integration test cases) |

---

## 📁 Folder Structure

```
glucose-tracker/
├── client/                     # Frontend React + Vite Application
│   ├── public/
│   │   └── logo.svg            # Custom SVG Brand Icon
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── DashboardCard.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── GlucoseBadge.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ReadingModal.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state, JWT persistence & interceptors
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx   # Shell with Sidebar, Navbar & Global Modal
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Daily summary, quick-action cards & recent logs
│   │   │   ├── History.jsx     # Filterable readings table, edit/delete
│   │   │   ├── Landing.jsx     # Marketing & feature introduction
│   │   │   ├── Login.jsx       # Sign in with 1-click demo filler
│   │   │   ├── Profile.jsx     # User details & ADA glucose clinical guidelines
│   │   │   ├── Register.jsx    # User registration with password matching
│   │   │   └── Reports.jsx     # Daily, MTD & Previous Month reports with charts
│   │   ├── services/
│   │   │   ├── api.js          # Axios client with JWT Bearer interceptor
│   │   │   ├── readingService.js
│   │   │   └── reportService.js
│   │   ├── utils/
│   │   │   └── helpers.js      # ADA classifications & validation rules
│   │   ├── App.jsx             # React Router routing & ProtectedRoute
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend Express.js API
│   ├── database/
│   │   ├── migrate.js          # Migration runner script
│   │   └── schema.sql          # DDL with tables, constraints & indexes
│   ├── scripts/
│   │   └── seed.js             # Idempotent demo user & realistic readings seeder
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # pg.Pool with SSL connection handling
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── readingController.js
│   │   │   └── reportController.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verification middleware
│   │   │   └── errorHandler.js # Centralized PostgreSQL/app error handler
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── readingRoutes.js
│   │   │   └── reportRoutes.js
│   │   ├── utils/
│   │   │   └── jwt.js          # JWT sign & verify helpers
│   │   ├── validators/
│   │   │   ├── authValidators.js
│   │   │   └── readingValidators.js
│   │   ├── app.js              # Express app setup & route mounting
│   │   └── server.js           # Server entry point & DB connection check
│   ├── tests/
│   │   ├── mockDb.js           # Isolated test database simulation
│   │   ├── auth.test.js        # Auth registration, login & token tests
│   │   ├── readings.test.js    # CRUD & 5 validation rules tests
│   │   └── reports.test.js     # Daily, MTD & previous-month tests
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🗄️ Neon PostgreSQL Setup & Database Schema

Sweety connects to Neon PostgreSQL using `node-postgres` with pooled connections and SSL configuration (`ssl: { rejectUnauthorized: false }`).

### Database Tables & Constraints

```sql
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Glucose Readings Table
CREATE TABLE IF NOT EXISTS glucose_readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    glucose_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_reading_date_slot UNIQUE (user_id, reading_date, time_slot),
    CONSTRAINT check_glucose_value_range CHECK (glucose_value >= 40 AND glucose_value <= 600),
    CONSTRAINT check_valid_time_slot CHECK (time_slot IN (
        'Morning (fasting)',
        'After breakfast',
        'After lunch',
        'After dinner'
    ))
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_glucose_readings_user_id ON glucose_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_glucose_readings_reading_date ON glucose_readings(reading_date);
CREATE INDEX IF NOT EXISTS idx_glucose_readings_user_date ON glucose_readings(user_id, reading_date);
```

---

## 🔑 Environment Variables

### 1. Server Configuration (`server/.env`)

Copy `server/.env.example` to `server/.env`:

```env
# Neon PostgreSQL Connection String (Provided in your Neon console)
DATABASE_URL=postgresql://username:password@ep-sample-pooler.region.neon.tech/neondb?sslmode=require

# JWT Secret Key
JWT_SECRET=sweety_super_secret_jwt_random_key_2026

# Server Port & Environment
PORT=5000
NODE_ENV=development

# Allowed Client Origin
CLIENT_URL=http://localhost:5173
```

### 2. Client Configuration (`client/.env`)

Copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Installation & Setup

Ensure **Node.js (v18+)** and **npm** are installed on your machine.

### Step 1: Install Server Dependencies

```bash
cd server
npm install
```

### Step 2: Install Client Dependencies

```bash
cd ../client
npm install
```

---

## 🚀 Database Initialization & Migration

Once your `server/.env` file contains your valid Neon `DATABASE_URL` (and, if available, `DATABASE_URL_UNPOOLED` for migrations):

```bash
cd server
npm run migrate
```

This reads `server/database/schema.sql` and creates the `users` and `glucose_readings` tables, unique constraints, check constraints, and performance indexes automatically.

Production startup runs this idempotent migration before serving requests. Set `DATABASE_URL_UNPOOLED` to Neon’s direct connection string for migrations; if it is not set, the app falls back to `DATABASE_URL`.

---

## 🌱 Seed Data & Demo Credentials

To populate the database with realistic sample data spanning today, recent days, and the previous calendar month:

```bash
cd server
npm run seed
```

This script is **idempotent** (can be executed multiple times safely without duplicate errors).

### 🔑 Demo Credentials

| Field | Value |
| :--- | :--- |
| **Email** | `demo@sweety.com` |
| **Password** | `Password123!` |
| **Name** | Kenpath Demo User |

*(A convenient **"Fill Demo"** button is also available on the Login screen for instant testing).*

---

## 💻 Running the Application

### 1. Start the Express Backend

```bash
cd server
npm run dev
# Or for production:
npm start
```
*Backend runs on: `http://localhost:5000`*  
*Health Check: `http://localhost:5000/api/health`*

### 2. Start the React Frontend

Open a new terminal window:

```bash
cd client
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running the Test Suite

Sweety includes 29 automated tests verifying registration, login, JWT authorization, data ownership protection, all 5 validation rules, and statistical report calculations.

```bash
cd server
npm test
```

### Test Coverage Highlights:
- ✅ Successful user registration and JWT token issuance.
- ✅ Rejection of duplicate email registrations (HTTP 409).
- ✅ Password length check (< 8 characters rejected) & mismatch rejection.
- ✅ Login verification & invalid password rejection (HTTP 401).
- ✅ Unauthenticated / missing Bearer token rejection (HTTP 401).
- ✅ Successful reading creation.
- ✅ **Rule 1**: Missing glucose value rejection (`"Please enter a glucose value."`).
- ✅ **Rule 2**: Glucose values below 40 rejected (`"Value must be between 40 and 600 mg/dl."`).
- ✅ **Rule 2**: Glucose values above 600 rejected (`"Value must be between 40 and 600 mg/dl."`).
- ✅ **Rule 2**: Float / decimal values rejected.
- ✅ **Rule 3**: Duplicate time slot on same day rejected (`"You already have an After lunch reading for this date."`).
- ✅ **Rule 4**: Fifth reading on same day rejected (`"You can add only 4 readings per day."`).
- ✅ **Rule 5**: Future dates rejected (`"Date cannot be in the future."`).
- ✅ **Ownership Protection**: User B cannot view, edit, or delete User A's reading (HTTP 403).
- ✅ **Daily Report**: Accurate highest, lowest, average rounded to 1 decimal place, and total readings count.
- ✅ **Data Isolation**: User B's metrics never leak into User A's reports.
- ✅ **Month-to-Date Report**: Accurately bounded between 1st of month and selected date.
- ✅ **Previous Month Report**: Accurately bounded to the full previous calendar month.
- ✅ **Empty Reports**: Gracefully returns `null` stats and empty arrays without crashing.

---

## 📡 REST API Documentation

All protected endpoints require the HTTP header:  
`Authorization: Bearer <jwt_token>`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`, `confirmPassword`) | No |
| `POST` | `/api/auth/login` | Authenticate with `email` and `password` | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | **Yes** |

### Glucose Readings Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/readings` | Create a new glucose reading | **Yes** |
| `GET` | `/api/readings` | List readings with optional filters (`date`, `time_slot`, `page`, `limit`) | **Yes** |
| `GET` | `/api/readings/:id` | Get specific reading (verifies ownership) | **Yes** |
| `PUT` | `/api/readings/:id` | Update reading (validates constraints & ownership) | **Yes** |
| `DELETE` | `/api/readings/:id` | Delete reading (verifies ownership) | **Yes** |

### Reports & Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/daily?date=YYYY-MM-DD` | Highest, lowest, average (rounded 1 dec), total, and slot list | **Yes** |
| `GET` | `/api/reports/month-to-date?date=YYYY-MM-DD` | Aggregates from 1st of month to selected date + daily trend | **Yes** |
| `GET` | `/api/reports/previous-month?date=YYYY-MM-DD` | Aggregates for full previous calendar month + daily trend | **Yes** |

---

## ⚖️ Business & Validation Rules

Sweety enforces validation on **both frontend and backend**:

1. **Rule 1 (Value Required)**:
   - Error: `"Please enter a glucose value."`
2. **Rule 2 (Value Range)**:
   - Whole numbers only, between 40 and 600 inclusive.
   - Error: `"Value must be between 40 and 600 mg/dl."`
3. **Rule 3 (Unique Time Slot per Day)**:
   - Only one entry per slot on a given date.
   - Error: `"You already have an After lunch reading for this date."`
4. **Rule 4 (Max 4 Readings per Day)**:
   - Daily reading limit is 4.
   - Error: `"You can add only 4 readings per day."`
5. **Rule 5 (No Future Dates)**:
   - Error: `"Date cannot be in the future."`

---

## 🎨 Design & UI/UX Principles

- **Medical-Grade Aesthetic**: Built using a soft pastel palette (`#fff1f2` pink, `#f5f3ff` lavender, clean `#fafafc` backgrounds) designed to minimize medical anxiety and promote consistent daily logging.
- **Adaptive Badges**: Color-coded glucose level indicators according to standard American Diabetes Association (ADA) clinical guidelines:
  - Fasting: `70-99 mg/dl` (Normal), `100-125 mg/dl` (Elevated), `126+ mg/dl` (High).
  - Post-meal: `< 140 mg/dl` (Normal), `140-199 mg/dl` (Elevated), `200+ mg/dl` (High).
  - Hypoglycemia warning: `< 70 mg/dl` (Low).
- **Responsive Layout**: Seamless experience across mobile phones (drawer menu, quick action bottom triggers), tablets, and desktop displays.
- **Accessible & Clear Modals**: Non-destructive form cancellations, deletion confirmations, and clear inline validation feedback.

---

## 🔮 Assumptions & Future Enhancements

### Assumptions
- **Time Slots**: Fasting is primarily measured in the morning before food; post-meal readings correlate with meals across the 24-hour cycle.
- **Units**: Glucose is quantified in `mg/dl` (standard US/clinical measurement).
- **Timezones**: Date filtering uses ISO standard `YYYY-MM-DD` dates aligned with the patient's local recording day.

### Future Enhancements
- **Export to PDF/CSV**: Export clinical logs for doctor visits.
- **A1C Estimation**: Projected 90-day HbA1c estimate derived from continuous 90-day average glucose.
- **Insulin & Medication Logs**: Optional tracking of basal/bolus insulin alongside meal readings.
- **Push Reminders**: Automated reminders for post-meal testing 2 hours after meals.

---

## ☁️ Cloud Deployment (Render & Neon)

Sweety is ready for deployment on **Render**:

### Option 1: Automated Deployment via `render.yaml`
1. Push this repository to GitHub.
2. In Render, select **Blueprints** and choose your repository.
3. Render will automatically read [`render.yaml`](file:///c:/Users/heman/OneDrive/Desktop/glucose-tracker/render.yaml) and build both the frontend and backend into a single Web Service.
4. Set the `DATABASE_URL` environment variable in the Render dashboard to your Neon connection string.

### Option 2: Manual Web Service Setup
- **Environment**: Node
- **Build Command**: `npm install --prefix server && npm install --prefix client && npm run build --prefix client`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `DATABASE_URL`: `your_neon_connection_string`
  - `DATABASE_URL_UNPOOLED`: optional direct Neon URL used for migrations
  - `JWT_SECRET`: `your_secure_random_secret`
  - `NODE_ENV`: `production`

---

## 📄 License

This project was built for the **Kenpath Junior Full Stack Developer Technical Assessment**.
