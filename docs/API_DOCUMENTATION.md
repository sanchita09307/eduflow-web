# EduFlow API Documentation (v1)

## Base URL: `/api/v1`

### Authentication & Users
- `POST /api/v1/auth/login`: Authenticate with email/password, returns JWT token.
- `GET /api/v1/auth/me`: Fetch authenticated profile and role ('teacher' or 'student').

### Academic Subjects
- `GET /api/v1/subjects`: List subjects for current user.
- `POST /api/v1/subjects`: Create course syllabus entry (Teacher only).

### Capstone Projects & Milestones
- `GET /api/v1/projects`: Retrieve projects with nested milestones.
- `POST /api/v1/projects`: Create project, validate 100% milestone weightage, allocate to student groups.

### Student Groups & Kanban Tasks
- `GET /api/v1/groups`: List teams with leader and student roster.
- `GET /api/v1/tasks?group_id={id}`: Get Kanban tasks categorized by status.
- `POST /api/v1/tasks`: Assign new task to a specific student with deadline.
- `PATCH /api/v1/tasks/{id}/status`: Advance task from To Do -> In Progress -> In Review -> Completed.

### Milestone Deliverables & Faculty Reviews
- `POST /api/v1/submissions`: Turn in report/prototype with automatic version increment.
- `POST /api/v1/submissions/{id}/review`: Faculty review action (Approve, Rework, or Reject with viva marks).

### AI & Analytics Telemetry
- `GET /api/v1/analytics/risk`: Retrieve rule-based heuristic risk diagnoses.
- `POST /api/v1/ai/assistant`: Context-aware natural language query processing.
