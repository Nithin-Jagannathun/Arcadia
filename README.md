# 🏛️ Arcadia — Student Life Manager
> **End-Term Software Project Submission**  
> **Course:** Advanced Full-Stack Software Engineering / Project  
> **Official Submission Form:** [https://forms.gle/sBy4sfqyiRG2Zpom9](https://forms.gle/sBy4sfqyiRG2Zpom9)

---

## 📌 Submission Overview & Metadata

```text
Project Name:                 Arcadia — Student Life Manager
Student Name:                 Nithin Jagannathun (ID: 25f3003982)
Student Email:                25f3003982@ds.study.iitm.ac.in
GitHub Repository:            https://github.com/Nithin-Jagannathun/Arcadia
Deployed Application / Build: Accessible locally via 'npm run dev' & deployable to Vercel/Render
Demo Video:                   [Link to Demo Video / Screencast]
Tech Stack:                   MongoDB (Atlas / In-Memory Fallback), Express.js, React 19 (Vite), Node.js, Tailwind CSS v4
```

---

## 1. Problem Statement
College students frequently juggle multiple overlapping course deadlines, lab assignments, capstone milestones, and personal development goals across disconnected syllabi, LMS portals, and scattered notes. 

Key challenges addressed:
- **Deadline Blindness:** Deadlines scattered across course sites are easily overlooked, resulting in last-minute panic or late penalties.
- **Absence of Intelligent Urgency Prioritization:** Standard generic to-do apps sort tasks alphabetically or creation-date-wise, failing to distinguish between work due in 6 hours versus work due in 6 weeks.
- **Disconnection Between Day-to-Day Tasks & Long-Term Goals:** Students rarely connect daily homework to strategic semester goals (e.g., capstone research or placement prep).
- **Academic Fatigue & Lack of Integrated Creative Outlet:** Students require a single cohesive platform that couples structured academic focus with a creative space to de-stress.

---

## 2. Target Users
- **Undergraduate & Graduate College Students:** Managing heavy semester coursework, group deliverables, and strict assignment deadlines.
- **Student Researchers & Capstone Teams:** Roadmapping multi-phase academic projects and tracking sequential milestones.
- **Independent Self-Directed Learners:** Balancing skill development, personal goals, and coursework.

---

## 3. Solution
**Arcadia** is an integrated student cockpit designed to eliminate deadline anxiety. Rather than acting as a static website or a basic CRUD task list, Arcadia incorporates **deep application logic**:
- **Dynamic Urgency Engine:** Derives deadline status (`Overdue`, `Due Soon`, `Upcoming`) directly from the deadline timestamp and current time, adjusting dynamically according to a **user-configurable warning window** (default: 3 days).
- **Overdue Visual Danger Strip:** Ensures overdue assignments are never silently hidden, providing a one-click submission toggle.
- **Goal Roadmapping:** Maps discrete academic assignments to overarching goals, calculating milestone completion percentage mathematically (`completed / total * 100`).
- **Ideation Incubator:** Captures research papers, thoughts, and study topics, with **1-click conversion** into actionable assignments or goals.
- **Doodle Studio:** A built-in pixel-art editor supporting multiple canvas resolutions (16×16, 24×24, 32×32), pencil, eraser, flood fill, undo/redo, cloud persistence in MongoDB, and high-resolution crisp PNG export.

---

## 4. Key Features & Workflows

### A. Academic Dashboard ("What should I focus on right now?")
1. **Upcoming Deadline Strip:** Active coursework approaching deadlines sorted strictly by time remaining (excludes submitted items).
2. **Overdue Assignments Strip:** Prominently displays overdue coursework with elapsed time indicators.
3. **Summary Metric Counters:** Live aggregates of *Pending Assignments*, *Due Soon (< Warning Window)*, *Overdue*, and *Submitted This Week*.
4. **Today's Focus Queue:** Priority-weighted queue prioritizing overdue, imminent deadlines, and high-impact assignments.
5. **Quick Modals:** Instant assignment and goal creation without navigating away from the dashboard.

### B. Comprehensive Assignments Management
- **Full CRUD:** Create, view, edit, and delete coursework with title, description, course, deadline, priority (*Low*, *Medium*, *High*), status (*Not Started*, *In Progress*, *Submitted*), type (*Individual*, *Group*), and estimated effort.
- **Multi-Dimensional Filtering:** Filter simultaneously by Course, Status, Priority, Type, and text search across titles, courses, and descriptions.
- **Multi-Field Sorting:** Sort by earliest deadline, latest deadline, priority weight, and creation date.
- **In-Place Status Updates:** Dropdown selector directly on each assignment card with visual indicators.

### C. Goals & Milestone Roadmaps
- **Strategic Goal Categories:** *Academics*, *Career*, *Projects*, *Personal*, and *Custom*.
- **Interactive Timeline:** Vertical milestone roadmap with interactive completion checkmarks.
- **Mathematical Progress Calculation:** Derived strictly from completed milestones (`completed / total * 100`).
- **Assignment Linking:** Links assignments directly to goals and displays all linked coursework under each goal card.

### D. Ideation Workspace
- **Card-Based Thought Capture:** Notes with title, notes, categories, tags, and planning stages (*Brainstorming*, *Exploring*, *Planned*, *Archived*).
- **Pin Important Ideas:** Pinned ideas stay at the top of the workspace.
- **1-Click Action Conversion:** Converts brainstorming notes into an active **Assignment** or **Goal** with prefilled details, setting the original idea's stage to *Planned*.

### E. Doodle Studio (Creative Pixel-Art Editor)
- **Multi-Resolution Canvas:** Toggle between **16×16**, **24×24**, and **32×32** grids.
- **Interactive Painting:** Continuous pointer-event drawing without gaps between cells, with touch support.
- **Tools:** Pencil, Eraser, and Breadth-First Flood Fill (Bucket).
- **Preset & Custom Colors:** 16-color curated palette plus a native hex color picker.
- **Undo & Redo:** Multi-level history stacks (up to 30 actions).
- **Cloud Persistence:** Save, load, rename, and delete pixel art stored in MongoDB.
- **Crisp PNG Export:** Off-screen HTML5 Canvas with `imageSmoothingEnabled = false` for sharp, high-res downloads.

### F. User Settings
- **Configurable Deadline Warning Window:** Customize the warning threshold between 1 and 30 days (persisted per user) with immediate effect on the dashboard.

---

## 5. Tech Stack

| Layer | Technology | Engineering Decisions |
|---|---|---|
| **Frontend Framework** | React 19 + Vite | High-performance bundling, lightning-fast HMR, modern ES syntax |
| **Styling & Aesthetics** | Tailwind CSS v4 + Vanilla CSS | Utility-first responsive design, dark slate aesthetics, custom scrollbars |
| **Routing** | React Router v7 | Declarative client-side routing & route protection |
| **Icons** | Lucide React | Clean, consistent, lightweight SVG iconography |
| **HTTP Client** | Axios | Interceptors for JWT authentication and automatic redirection |
| **Backend Framework** | Node.js + Express (ES Modules) | Clean separation of routes, controllers, models, and middleware |
| **Database & ODM** | MongoDB + Mongoose | Flexible document schema, compound indexes, validation |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs | Stateless, secure password hashing and session tokens |
| **Zero-Config Database**| MongoDB Memory Server | Standalone local demo execution without external services |

---

## 6. Architecture & System Design

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

## 7. Local Setup Instructions

### Prerequisites
- **Node.js** v18+ (tested on Node v20/v24)
- **npm** v9+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Nithin-Jagannathun/Arcadia.git
cd Arcadia

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Return to root directory
cd ..
```

### 2. Configure Environment Variables
Copy `.env.example` in `server/` to `server/.env`:
```bash
cp server/.env.example server/.env
```
*(No changes are needed for local testing; the built-in fallback will automatically launch an in-memory database if no local MongoDB instance is running).*

### 3. (Optional) Seed Realistic Academic Demo Data
```bash
npm run seed
```
This populates sample courses (*CS401 Distributed Systems*, *CS301 Algorithms*, *CS302 OS*), overdue and urgent assignments, capstone milestones, research notes, and sample pixel art under the demo account:
- **Email:** `alex@arcadia.edu`
- **Password:** `password123`

### 4. Run the Full Application
```bash
npm run dev
```
This single command concurrently boots:
- **Backend API:** `http://localhost:5000`
- **Vite React Frontend:** `http://localhost:5173`

Open `http://localhost:5173` in your browser. Click **"Fill Demo Credentials"** on the login page to access the application immediately.

---

## 8. Environment Variables

Create a `server/.env` file based on the template below:

```bash
# Server Port
PORT=5000

# MongoDB Connection String (Atlas URI or local instance)
# If offline, the server automatically starts an in-memory fallback
MONGODB_URI=mongodb://127.0.0.1:27017/arcadia

# JWT Authentication Secret
JWT_SECRET=your_jwt_secret_key_here

# Frontend Client URL for CORS
CLIENT_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

> **Security Note:** Real credentials and `.env` files are excluded from Git via `.gitignore`. An example file `server/.env.example` is provided for reference.

---

## 9. Deployment Instructions

### Option A: Full-Stack Deployment on Render / Railway
1. **Frontend Build:** In `client/`, run `npm run build` to generate static assets in `client/dist`.
2. **Backend Setup:** Set the root start command to `node server/src/index.js`.
3. **Environment Variables:** In the hosting dashboard, configure:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string.
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: The URL of your deployed frontend.

### Option B: Split Deployment (Vercel Frontend + Render Backend)
1. **Frontend:** Deploy `client/` to Vercel. Set `VITE_API_BASE_URL` to your backend URL.
2. **Backend:** Deploy `server/` to Render or Railway. Set `CLIENT_URL` to your Vercel deployment URL.

---

## 10. Security & Data Isolation
- **Authentication:** Protected routes require a valid JWT token signed by `JWT_SECRET`.
- **Authorization:** Server-side ownership checks ensure users can only read, update, or delete their own resources (`{ user: req.user._id }`).
- **Password Protection:** Passwords are pre-hashed using `bcryptjs` with 10 salt rounds. Plaintext passwords are never stored or logged.
- **Safe Serialization:** Password hashes are automatically stripped from all User JSON responses.

---

## 📄 License
This project is open-source under the MIT License. Developed for the End-Term Software Engineering Project.
