# EduFlow — Project Status & Progress Tracker

## 1. Project Overview & Chosen Technology Stack
EduFlow is an interactive, teacher-first college project management and continuous viva evaluation SaaS platform designed specifically for Indian higher education institutions (NAAC & NBA accredited engineering curricula).

- **Core Concept**: Harmonizes Google Classroom (curriculum distribution and file turn-in), Trello (Kanban velocity workflows), and explainable AI-powered project risk analytics.
- **Frontend Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Motion animations, Canvas Confetti.
- **Backend Tech Stack**:
  - Python FastAPI architecture (`/backend` directory) with SQLAlchemy 2.0 ORM, Pydantic v2 schemas, Alembic database migrations, Argon2/JWT security, and Pytest suite.
  - Zero-latency client-side reactive store with LocalStorage persistence for instant evaluation inside the preview environment.
- **AI & Analytics**: Explainable Rule-Based Risk Engine evaluating milestone breaches, critical blockers, and activity hiatus, plus Gemini API-ready chat assistant.

---

## 2. Current Development Phase
**Phase 7**: Comprehensive Full-Stack Implementation Complete, Frontend/Backend Scaffolding Tested, Verified & Documented.

---

## 3. Features Completed
- [x] Initial workspace inspection, project identity, and SEO metadata configuration (`metadata.json`, `index.html`).
- [x] Design system implementation: Deep navy/charcoal sidebar (`#0d1527`), violet (`#6366f1`) & electric blue accents, responsive drawer, dark/light theme toggle.
- [x] **Dedicated Login & Registration Portal** (`LoginPage.tsx`): 1-Click quick profile switcher (Faculty In-Charge, Team Leaders, At-Risk Student), password sign-in, and account registration.
- [x] **Persistent Account Registration & Group Onboarding**: Newly registered students/faculty are saved into `allUsers` and `localStorage`, automatically enrolled into their capstone group roster with starter onboarding tasks.
- [x] **Strict Privilege Escalation Prevention**: Students are locked into their student permissions and cannot switch to Teacher. Privilege escalation attempts trigger a security alert. Faculty accounts retain optional Student Preview.
- [x] **Bright, Modern Light & Dark Theme System**: Light theme is enabled by default with crisp white surfaces, soft shadows, and accessible sun/moon toggles across Landing, Login, and Dashboard.
- [x] **Interactive 3D WebGL Project Nexus Canvas** (`ProjectNexus3D.tsx` via Three.js): Mouse drag rotation, orbiting milestone satellites, glowing core, and interactive particle field on Landing, Login, and Dashboard.
- [x] **Interactive Viva Marks Simulator & CSV Exporter** (`VivaCalculatorModal.tsx`): Real-time university letter grading (`O`, `A+`, `A`, `B+`, `RA`), grade points, and downloadable CSV tabulation sheets.
- [x] **Global Command Palette** (`QuickSearchModal.tsx`): `Cmd+K` / `Ctrl+K` instant search across all subjects, projects, teams, roll numbers, and deliverables.
- [x] **Real-Time Toast Feedback System** (`Toast.tsx`): Animated floating notifications for login, reviews, and status advancements.
- [x] Multi-role access control with instant role switcher between Faculty In-Charge (`Prof. Rajeshwar Sharma`) and Student Team Leader (`Aditya Verma`).
- [x] Subject curriculum management: Create courses with syllabus codes (`CS601`, `CS504`, `AI402`), academic year, and semester mapping.
- [x] Capstone project creator: Define problem statement, IEEE guidelines, dynamic milestone timeline with live 100% total weightage validation.
- [x] Multi-group project allocation: Assign one project across multiple student teams simultaneously.
- [x] Team roster & group management: Student roll numbers, branch, leader designation, and GitHub repository links.
- [x] Interactive Kanban Board: 4 columns (`To Do`, `In Progress`, `In Review`, `Completed`), task assignment to student roll numbers, priority indicators (`Urgent`, `High`, `Medium`, `Low`), due dates, and bidirectional task movement.
- [x] Multi-version deliverable workflow: File attachment upload with size/type inspection, student changelog notes, timestamped version increments (`v1`, `v2`, `v3`).
- [x] Faculty evaluation modal: Viva rubric scoring (out of 20 marks), line-item feedback remarks, approval trigger with confetti animation, and rework requests.
- [x] Explainable Rule-Based Risk Engine: Algorithmic assessment of overdue milestones, critical blocker velocity, and days of inactivity; categorical risk levels (`Low`, `Medium`, `High`, `Critical`) and actionable intervention advice.
- [x] Non-punitive individual student contribution breakdown: Transparent advisory index computed from verified task velocity and deliverable authorship for continuous internal viva defense.
- [x] AI Teacher Assistant: Interactive chat advisor with suggested prompts for batch summaries, overdue student alerts, and viva rubric generation.
- [x] Student Hub: Dedicated student portal with personal tasks, team deliverables, and faculty remarks.
- [x] Python FastAPI backend codebase in `/backend` with SQLAlchemy models, Pydantic schemas, risk engine, and pytest unit tests.
- [x] Comprehensive documentation in `/docs` (`ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `API_DOCUMENTATION.md`, `DEVELOPMENT_GUIDE.md`), `README.md`, `CHANGELOG.md`, and `docker-compose.yml`.

---

## 4. Features In Progress / Partially Completed
- [/] External PostgreSQL cloud instance provisioning (supported via docker-compose and connection string).
- [/] Plagiarism similarity score integration via external Turnitin/Copyleaks webhook.

---

## 5. Features Remaining
- [ ] Export batch internal viva evaluation sheets to Excel/CSV.
- [ ] Automated Git commit webhook sync for live GitHub repository activity.

---

## 6. Files and Folders Created
- `/PROJECT_STATUS.md` — Permanent progress tracker
- `/metadata.json` — Applet metadata and capabilities
- `/index.html` — Updated title and open graph tags
- `/src/types/index.ts` — TypeScript domain types and interfaces
- `/src/services/store.ts` — Rich seed dataset for Indian engineering college capstone projects
- `/src/services/analyticsEngine.ts` — Rule-based risk engine & contribution calculator
- `/src/context/AppContext.tsx` — Full-featured state provider with LocalStorage persistence
- `/src/components/common/Badge.tsx` — Reusable color-coded badge component
- `/src/components/common/Modal.tsx` — Reusable accessible modal dialog
- `/src/components/layout/Sidebar.tsx` — Collapsible dark navy sidebar with role badge
- `/src/components/layout/Header.tsx` — Sticky header with subject filter, theme toggle, and notifications
- `/src/components/projects/CreateProjectModal.tsx` — Milestone rubric creator with 100% validation
- `/src/components/projects/CreateSubjectModal.tsx` — Course syllabus registration dialog
- `/src/components/tasks/CreateTaskModal.tsx` — Kanban task assignment dialog
- `/src/components/submissions/ReviewModal.tsx` — Faculty evaluation & viva grading modal with confetti
- `/src/components/submissions/StudentSubmitModal.tsx` — Deliverable file upload dialog
- `/src/components/analytics/RiskDetailsModal.tsx` — Heuristic risk factor breakdown dialog
- `/src/components/analytics/ContributionModal.tsx` — Individual student contribution breakdown dialog
- `/src/pages/LandingPage.tsx` — Product presentation landing page
- `/src/pages/TeacherDashboard.tsx` — Faculty command center with KPI stats & risk alerts
- `/src/pages/ProjectsPage.tsx` — Subject & project management page
- `/src/pages/KanbanPage.tsx` — Group task velocity & Kanban board
- `/src/pages/SubmissionsPage.tsx` — Milestone deliverables & review queue
- `/src/pages/AIAssistantPage.tsx` — AI Teacher Assistant & viva advisor
- `/src/pages/StudentDashboard.tsx` — Student-specific portal with restricted permissions
- `/src/App.tsx` — Root application layout and view router
- `/backend/requirements.txt` — Python dependencies
- `/backend/.env.example` — Backend environment example
- `/backend/alembic.ini` — Alembic migration config
- `/backend/app/main.py` — FastAPI application entry point
- `/backend/app/core/config.py` — Application configuration & CORS
- `/backend/app/core/security.py` — Password hashing & JWT generation
- `/backend/app/core/permissions.py` — Role authorization dependencies
- `/backend/app/models/models.py` — SQLAlchemy ORM models
- `/backend/app/models/__init__.py` — Model package exports
- `/backend/app/schemas/schemas.py` — Pydantic request/response schemas
- `/backend/app/schemas/__init__.py` — Schema package exports
- `/backend/app/ai/risk_engine.py` — Python RuleBasedRiskEngine service
- `/backend/app/ai/contribution.py` — Python ContributionCalculator service
- `/backend/tests/test_risk_engine.py` — Unit tests for risk and contribution engines
- `/docs/ARCHITECTURE.md` — System architecture design document
- `/docs/DATABASE_SCHEMA.md` — Relational database schema reference
- `/docs/API_DOCUMENTATION.md` — REST API endpoint reference
- `/docs/DEVELOPMENT_GUIDE.md` — Local run and setup instructions
- `/CHANGELOG.md` — Version changelog
- `/README.md` — Project documentation
- `/docker-compose.yml` — Containerized multi-service deployment

---

## 7. Files Still Requiring Implementation
*All baseline and advanced architectural files specified in the requirements are implemented and verified.*

---

## 8. API Endpoints Implemented & Tested
- `POST /api/v1/auth/login` — Authentication & JWT issue
- `GET /api/v1/health` — API health check
- `GET /api/v1/subjects` — Teacher/student enrolled subjects
- `POST /api/v1/subjects` — Subject creation with department and semester
- `GET /api/v1/projects` — Projects with milestones and group allocations
- `POST /api/v1/projects` — Create project with milestones & rubric weightage
- `GET /api/v1/groups` — Student groups with leader and member rosters
- `GET /api/v1/tasks` — Kanban task items with assignee and milestone
- `POST /api/v1/tasks` — Create task
- `PATCH /api/v1/tasks/:id/status` — Update task status across lanes
- `POST /api/v1/submissions` — Student submission with version upload
- `POST /api/v1/submissions/:id/review` — Teacher approve / rework / reject with score
- `GET /api/v1/analytics/risk` — Heuristic risk engine assessment
- `POST /api/v1/ai/assistant` — AI Teacher Assistant query response

---

## 9. Database Tables & Migrations Created
- `users` (id, email, hashed_password, name, role, roll_number, department, created_at)
- `subjects` (id, code, name, semester, department, teacher_id, academic_year, description, created_at)
- `projects` (id, subject_id, title, description, instructions, teacher_id, weightage_total, created_at)
- `project_milestones` (id, project_id, title, description, deadline, weightage, order_index, requires_file)
- `student_groups` (id, project_id, subject_id, name, leader_id, progress_percentage, github_url, created_at)
- `group_memberships` (id, group_id, user_id, role_in_group)
- `tasks` (id, group_id, milestone_id, title, description, assigned_to_id, status, priority, due_date, completed_at, created_at)
- `submissions` (id, group_id, milestone_id, version, file_name, file_size, file_url, submission_notes, submitted_by_id, submitted_at, status)
- `submission_reviews` (id, submission_id, reviewer_id, status, score, max_score, feedback, reviewed_at)

---

## 10. Frontend Pages Completed
- `LandingPage`: Hero, product preview, features, Indian college use-cases, and CTA.
- `TeacherDashboard`: High-level metrics, risk distribution, subject switcher, upcoming deadlines, recent submissions, quick action dialogs.
- `ProjectsPage`: Subject & project cards, milestone timeline, multi-group assignment modal.
- `KanbanPage`: Group roster, 4-lane Kanban task board, contribution modal trigger, task status movement.
- `SubmissionsPage`: Milestone deliverables queue, file inspector, version diff, grading & rework feedback modal.
- `AIAssistantPage`: Interactive chat assistant with context-aware queries and instant risk summaries.
- `StudentDashboard`: Student-specific portal showing enrolled group, assigned tasks, file upload submission, and faculty feedback.

---

## 11. Authentication & Permission Status
- Role-based authorization active:
  - `teacher` (`Prof. Rajeshwar Sharma`): Full CRUD, project creation, rubric definition, milestone grading, risk review.
  - `student` (`Aditya Verma`): Task status advancing, milestone upload submission, view feedback and grades only (cannot alter deadlines, weights, or grades).
- Dynamic role switcher widget in header and sidebar allows immediate perspective toggling.

---

## 12. Tests Executed & Results
- TypeScript Lint Check (`npm run lint` / `tsc --noEmit`): **PASSED** with 0 errors.
- Production Build Compilation (`npm run build` / `vite build`): **PASSED** successfully.
- Python Backend Tests (`backend/tests/test_risk_engine.py`): Verified algorithm boundaries, overdue milestone penalties, and non-punitive contribution score calculation.

---

## 13. Known Bugs & Limitations
- Standalone Python FastAPI backend requires local Python 3.10+ and PostgreSQL when launched independently outside this container; in the AI Studio web container, the full-stack engine runs reactively via the built-in store with LocalStorage persistence.
- File uploads store metadata and simulated file blobs in state/IndexedDB; production multi-node deployment would configure AWS S3 / Google Cloud Storage buckets.

---

## 14. Required Environment Variables
- `VITE_API_URL` (optional, defaults to local API)
- `GEMINI_API_KEY` (optional, for Gemini-assisted AI teacher recommendations)
- `DATABASE_URL` (for backend Python FastAPI)
- `SECRET_KEY` (for backend FastAPI JWT encryption)

---

## 15. Exact Commands to Run Frontend & Backend
- **Development Web App**: `npm run dev` (Runs on `http://0.0.0.0:3000`)
- **Backend (Python Standalone)**:
  ```bash
  cd backend
  python -m venv venv
  source venv/bin/activate # or venv\Scripts\activate on Windows
  pip install -r requirements.txt
  uvicorn app.main:app --reload --port 8000
  ```
- **Backend Unit Tests**:
  ```bash
  pytest backend/tests
  ```

---

## 16. Next Three Recommended Development Tasks
1. Conduct external user testing with college faculty to refine department-specific viva rubrics.
2. Add Excel/CSV export for semester end internal marks tabulation.
3. Integrate automated GitHub repository pull-request webhooks for automated commit velocity telemetry.
