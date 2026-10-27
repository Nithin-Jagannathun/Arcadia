# 🏛️ Arcadia — Student Life Manager

> A complete, production-grade MERN web application engineered for college students to master academic coursework, identify impending deadlines, roadmap semester milestones, organize research ideas, and relax with an interactive creative pixel studio.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Target Users](#target-users)
4. [Solution & Product Vision](#solution--product-vision)
5. [Key Features & Workflows](#key-features--workflows)
6. [System Architecture](#system-architecture)
7. [Technology Stack](#technology-stack)
8. [Directory Structure](#directory-structure)
9. [Environment Variables](#environment-variables)
10. [Local Setup & Installation](#local-setup--installation)
11. [REST API Documentation](#rest-api-documentation)
12. [Security & Isolation](#security--isolation)
13. [Deployment Guide](#deployment-guide)

---

## 🌟 Project Overview

**Arcadia** is a full-stack academic productivity dashboard designed to eliminate deadline anxiety and cognitive overload for university students. Rather than acting as a plain task list or a generic clone, Arcadia provides **deep academic workflow logic**:
- Automatically calculates and sorts imminent deadlines based on a **user-configurable warning window** (defaulting to 3 days).
- Surfaces **overdue coursework** in an unavoidable visual danger strip rather than silently hiding it.
- Connects coursework directly to **long-term milestone roadmaps**.
- Facilitates ideation with **1-click conversion** of brainstorming notes into formal deliverables.
- Includes a dedicated **Doodle Studio** with persistent cloud saving and crisp PNG export for creative relaxation.

---

## 🎯 Problem Statement

College students juggle multiple concurrent courses, lab reports, group projects, and long-term career preparation milestones across disconnected syllabi and portals.
1. **Deadline Blindness:** Deadlines scattered across course websites and PDFs are easily missed, leading to panicked late submissions.
2. **Lack of Urgency Prioritization:** Standard to-do apps display tasks chronologically or alphabetically without distinguishing between what is due in 4 hours versus 4 weeks.
3. **Disconnection Between Tasks and Goals:** Daily homework rarely connects to semester-long goals (e.g., capstone projects or internship preparation).
4. **Context Switching & Fatigue:** Students need a single integrated environment that combines immediate academic urgency, long-term roadmaps, quick note capture, and creative de-stressing.

---

## 👥 Target Users

- **Undergraduate & Graduate Students:** Managing high-volume coursework, exams, and team deliverables.
- **Student Researchers & Capstone Teams:** Tracking sequential project phases and milestones.
- **Academic Mentors & Peer Study Groups:** Organizing structured schedules and milestones.

---

## 💡 Solution & Product Vision

Arcadia provides a cohesive, unified student cockpit:
- **Intelligent Urgent Agenda:** Dynamic computation of urgency levels (`Overdue`, `Due Soon`, `Normal`) without relying on manual database flags.
- **Milestone Timeline:** Visual progress bars and milestone checklists that reflect actual completion percentage.
- **Ideation Incubator:** Card-based note-taking that bridges the gap between thoughts and actionable academic assignments.
- **Creative Pixel Studio:** In-browser 16×16 / 24×24 / 32×32 pixel canvas with pencil, eraser, flood fill, undo/redo, cloud persistence, and high-resolution PNG export.

---

## ⚡ Key Features & Workflows

### 1. Unified Dashboard
- **Upcoming Deadline Strip:** Displays active coursework approaching deadlines sorted strictly by time remaining.
- **Overdue Work Strip:** Prominently displays past-due items with time elapsed and a one-click submission toggle.
- **4 Real-Time Metric Counters:** Live counts of *Pending Assignments*, *Due Soon (< Configured Warning Window)*, *Overdue*, and *Completed This Week*.
- **Today's Focus:** High-priority, imminent queue helping students answer *"What should I work on right now?"*
- **Quick Modals:** Instant assignment and goal creation without navigating away.

### 2. Comprehensive Assignments Management
- Full CRUD with server-side search, filtering, and sorting.
- Multi-dimensional filtering by **Course**, **Status** (*Not Started*, *In Progress*, *Submitted*), **Priority** (*Low*, *Medium*, *High*), and **Type** (*Individual*, *Group*).
- Multi-field sorting by earliest deadline, latest deadline, priority weight, and creation timestamp.
- Link assignments to long-term goals.
- In-place quick status change and destructive action confirmations.

### 3. Goals & Milestone Roadmaps
- Group related deliverables under strategic goals across categories: *Academics*, *Career*, *Projects*, *Personal*, *Custom*.
- Vertical milestone progression roadmap with sequential check-off indicators.
- Real mathematical completion percentage (`completed / total * 100`).
- Display of all academic assignments linked to each specific goal.

### 4. Ideation Workspace
- Lightweight note cards with customizable categories, tag badges, and planning stages (*Brainstorming*, *Exploring*, *Planned*, *Archived*).
- Pin important concepts to the top of the board.
- **One-Click Convert:** Transform an idea directly into a full Assignment or Goal with prefilled title and description.

### 5. Doodle Studio (Pixel Art Editor)
- Multi-resolution grid selection: **16×16**, **24×24**, and **32×32**.
- Continuous drag-and-paint with no cell gaps; touch and pointer event support.
- Tools: Pencil, Eraser, and Breadth-First Flood Fill (Bucket).
- Preset 16-color retro palette + native custom color picker.
- Multi-level Undo and Redo history stack.
- Persistent cloud saving & loading to MongoDB per user.
- Crisp PNG export using an off-screen HTML5 Canvas with `imageSmoothingEnabled = false`.

### 6. User Settings & Customization
- Configurable **Deadline Warning Window** (1 to 30 days, default 3) persisted in the user profile.
- Real-time impact on the dashboard's "Due Soon" thresholds.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER (React + Vite)                      │
│                                                                        │
│   React Router ────► ProtectedRoute ────► App Layout                   │
│                            │                 │                         │
│                    AuthContext (JWT)         ├── Dashboard             │
│                            │                 ├── Assignments           │
│                      Axios Client            ├── Milestones Roadmap    │
│                            │                 ├── Ideation Workspace    │
│                            │                 ├── Doodle Studio         │
│                            │                 └── System Settings       │
└────────────────────────────┼───────────────────────────────────────────┘
                             │  HTTP / REST (JSON + Cookies/Bearer)
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SERVER TIER (Node + Express)                    │
│                                                                        │
│   Express Router ──► Auth Middleware (JWT verify + User verification)  │
│                            │                                           │
│         ┌──────────────────┼─────────────────────────┐                 │
│         ▼                  ▼                         ▼                 │
│   Auth Controller   Assignment Controller    Goal / Idea / Doodle      │
│   - bcrypt hash     - Search & filter        - Timeline & toggle       │
│   - JWT sign        - Urgency computation    - Idea conversion         │
│                     - Summary aggregates     - Pixel grid persistence  │
└────────────────────────────┼───────────────────────────────────────────┘
                             │  Mongoose ODM (User-isolated queries)
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      DATABASE TIER (MongoDB)                           │
│                                                                        │
│   • Users Collection (Indexed email, warning threshold)                │
│   • Assignments Collection (Compound index: { user: 1, deadline: 1 })  │
│   • Goals Collection (Embedded milestone subdocuments)                 │
│   • Ideas Collection (Compound index: { user: 1, pinned: -1 })         │
│   • Doodles Collection (Pixel array & resolution metadata)             │
│   [Automatic Fallback: In-Memory MongoDB Server for Zero-Config Setup] │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | React 19 + Vite | High-performance bundling, fast HMR, modern ES syntax |
| **Styling & Design** | Tailwind CSS v4 + Vanilla CSS | Utility-first responsive design, dark slate aesthetics |
| **Routing** | React Router v7 | Declarative client-side routing & route protection |
| **Icons** | Lucide React | Clean, consistent, lightweight SVG iconography |
| **HTTP Client** | Axios | Interceptors for JWT authentication and automatic redirection |
| **Backend Framework** | Node.js + Express (ES Modules) | Asynchronous, scalable REST API architecture |
| **Database & ODM** | MongoDB + Mongoose | Flexible document schema, compound indexes, validation |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs | Stateless, secure password hashing and session tokens |
| **Zero-Config Database**| MongoDB Memory Server | Standalone local demo execution without external services |

---

## 📁 Directory Structure

```text
Arcadia/
├── package.json               # Root scripts (dev, build, seed)
├── .gitignore
├── server/                    # Backend Express API
│   ├── package.json
│   ├── .env.example           # Documented configuration template
│   ├── .env                   # Local active configuration
│   └── src/
│       ├── index.js           # Server entry point & CORS configuration
│       ├── seed.js            # Sample academic data seeder
│       ├── config/
│       │   └── db.js          # Mongoose connector with in-memory fallback
│       ├── models/
│       │   ├── User.js        # User model with bcrypt pre-save
│       │   ├── Assignment.js  # Coursework schema with urgency indexes
│       │   ├── Goal.js        # Roadmap schema with milestone subdocs
│       │   ├── Idea.js        # Note-taking schema with pin flag
│       │   └── Doodle.js      # Pixel grid schema
│       ├── middleware/
│       │   ├── auth.js        # JWT verification & ownership protection
│       │   └── errorHandler.js# Centralized error handler & Mongoose translators
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── assignmentController.js
│       │   ├── goalController.js
│       │   ├── ideaController.js
│       │   └── doodleController.js
│       └── routes/
│           ├── authRoutes.js
│           ├── assignmentRoutes.js
│           ├── goalRoutes.js
│           ├── ideaRoutes.js
│           └── doodleRoutes.js
└── client/                    # Frontend React + Vite SPA
    ├── package.json
    ├── vite.config.js         # Tailwind v4 plugin & API proxy
    ├── index.html             # Branding & Google Fonts
    └── src/
        ├── main.jsx           # App bootstrapping
        ├── App.jsx            # Route definitions & protection
        ├── index.css          # Design system tokens & scrollbars
        ├── api/
        │   └── axios.js       # Base API client & interceptors
        ├── context/
        │   └── AuthContext.jsx# Session restoration & state provider
        ├── components/
        │   ├── Layout.jsx     # Desktop sidebar & mobile navigation
        │   ├── Badge.jsx      # Priority, status, and deadline indicators
        │   ├── Modal.jsx      # Accessible modal dialog
        │   ├── ConfirmDialog.jsx # Confirmation dialog for destructive actions
        │   ├── EmptyState.jsx # Visual empty state handlers
        │   └── LoadingSpinner.jsx
        └── pages/
            ├── LoginPage.jsx       # Auth tabs & 1-click demo button
            ├── DashboardPage.jsx   # Metrics, deadline strip, today's focus
            ├── AssignmentsPage.jsx # Full filtering, sorting, CRUD
            ├── MilestonesPage.jsx  # Goal timeline & milestone toggles
            ├── IdeationPage.jsx    # Notes, search, and conversion
            ├── DoodleStudioPage.jsx# 16/24/32 pixel editor & PNG export
            └── SettingsPage.jsx    # Warning threshold customization
```

---

## 🔐 Environment Variables

Create a `.env` file in the `server/` directory:

```bash
# server/.env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/arcadia
JWT_SECRET=arcadia_super_secret_jwt_key_2026_xyz987
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Zero-Config Database Guarantee:** If `MONGODB_URI` points to an offline local MongoDB instance, Arcadia automatically activates an integrated fallback in-memory MongoDB server. Evaluators can launch and test the full application immediately without installing or running a MongoDB daemon!

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js** v18+ (tested on Node v20/v24)
- **npm** v9+

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd Arcadia

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Return to root
cd ..
```

### 2. Populate Realistic Academic Demo Data (Optional)
```bash
npm run seed
```
This populates sample courses (*CS401 Distributed Systems*, *CS301 Algorithms*, *CS302 OS*), overdue and urgent assignments, capstone milestones, research notes, and sample pixel art under the demo account:
- **Email:** `alex@arcadia.edu`
- **Password:** `password123`

### 3. Run the Full Application
```bash
npm run dev
```
This command starts both the Express API (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) concurrently.

Open your browser to:
**`http://localhost:5173`**

Click **"Fill Demo Credentials"** on the login page to access the preloaded student cockpit immediately.

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `POST` | `/api/auth/logout` | Clear session cookie | No |
| `GET` | `/api/auth/me` | Fetch active authenticated profile | Yes |
| `PUT` | `/api/auth/settings` | Update name & deadline warning window | Yes |

### Assignments (`/api/assignments`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/assignments` | Search, filter, and sort assignments | Yes |
| `GET` | `/api/assignments/dashboard` | Aggregated metrics, deadline strips & focus list | Yes |
| `POST` | `/api/assignments` | Create assignment | Yes |
| `GET` | `/api/assignments/:id` | Fetch single assignment | Yes |
| `PUT` | `/api/assignments/:id` | Update assignment details or status | Yes |
| `DELETE` | `/api/assignments/:id` | Delete assignment | Yes |

### Goals & Milestones (`/api/goals`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/goals` | List all goals with progress and linked assignments | Yes |
| `POST` | `/api/goals` | Create goal with sequential milestones | Yes |
| `GET` | `/api/goals/:id` | Fetch goal details | Yes |
| `PUT` | `/api/goals/:id` | Update goal and milestone structure | Yes |
| `DELETE` | `/api/goals/:id` | Delete goal and decouple assignments | Yes |
| `PATCH` | `/api/goals/:id/milestones/:mId/toggle` | Toggle milestone completion | Yes |

### Ideation (`/api/ideas`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/ideas` | List ideas with search, category, and status filters | Yes |
| `POST` | `/api/ideas` | Create new idea note | Yes |
| `PUT` | `/api/ideas/:id` | Update idea or toggle pin | Yes |
| `DELETE` | `/api/ideas/:id` | Delete idea | Yes |
| `POST` | `/api/ideas/:id/convert` | Convert idea directly to Assignment or Goal | Yes |

### Doodle Studio (`/api/doodles`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/doodles` | List saved doodles | Yes |
| `POST` | `/api/doodles` | Save pixel art grid to cloud | Yes |
| `GET` | `/api/doodles/:id` | Retrieve saved doodle grid | Yes |
| `PUT` | `/api/doodles/:id` | Update saved doodle grid | Yes |
| `DELETE` | `/api/doodles/:id` | Delete doodle | Yes |

---

## 🔒 Security & Data Isolation

- **Token Protection:** Authenticated user IDs are exclusively derived from cryptographically verified JWT tokens. Client-supplied IDs are never trusted for ownership verification.
- **Salted Password Hashing:** Passwords are pre-hashed using `bcryptjs` with 10 salt rounds. Plaintext passwords are never stored or logged.
- **Strict User Scoping:** Every Mongoose query filters by `{ user: req.user._id }`, preventing unauthorized access between students.
- **Safe Serialization:** Password hashes are automatically stripped from User JSON responses using a Mongoose schema transform.
- **Centralized Error Sanitization:** Stack traces and internal database errors are suppressed in production mode.

---

## 🚢 Deployment Guide

### Option A: Render / Railway / Fly.io (Unified or Split)
1. **Frontend Build:** In `client/`, run `npm run build` to generate static assets in `client/dist`.
2. **Backend Serving:** Configure Express to serve `client/dist` statically in production mode, or deploy the frontend to Vercel/Netlify with an environment variable pointing `VITE_API_BASE_URL` to your backend URL.
3. **Database:** Set `MONGODB_URI` to a MongoDB Atlas cluster URI (`mongodb+srv://<user>:<password>@cluster.mongodb.net/arcadia`).
4. **Secrets:** Set `JWT_SECRET` and `NODE_ENV=production` in your hosting platform's dashboard.

---

## 📄 License
This project is open-source under the MIT License. Developed for the End-Term Software Engineering Project.
