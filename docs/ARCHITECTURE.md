# EduFlow Architecture & System Design Document

## 1. System Vision
EduFlow is an opinionated, teacher-first college project management SaaS engineered for Indian higher education institutions (accredited under NAAC, NBA, and AICTE frameworks).

Unlike generic project trackers (e.g. Jira or Asana), EduFlow balances:
1. **Academic hierarchy**: Faculty in-charge, lab assistants, project guides, and student group leaders.
2. **Pedagogical evaluation**: Milestone rubrics, continuous evaluation marks, and internal/external viva defense preparation.
3. **Plagiarism & accountability telemetry**: Versioned deliverable records and verifiable individual Kanban task velocity.

---

## 2. Architectural Blueprint

```
+-----------------------------------------------------------------------------------+
|                              Client Web Tier (Vite / React 19)                    |
|  - Teacher Command Center        - Multi-Group Project Creator                    |
|  - Kanban Velocity Board         - Multi-Version Submissions & Grading Modal      |
|  - Explainable Risk Alerts       - Student Portal Hub                             |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ HTTPS / JSON API
+-----------------------------------------------------------------------------------+
|                         Backend API Layer (FastAPI / Express)                     |
|  - Role-Based Access Control (RBAC: Teacher vs Student)                           |
|  - Heuristic Explainable Risk Engine                                              |
|  - Transparent Student Contribution Calculator                                    |
|  - Versioned Deliverable Ingestion & Plagiarism Auditing                          |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ SQL Engine
+-----------------------------------------------------------------------------------+
|                                 Persistence Layer                                 |
|  - PostgreSQL 16 (Relational Schema: Users, Subjects, Projects, Tasks, Reviews)   |
|  - LocalStorage / IndexedDB resilient state cache                                 |
+-----------------------------------------------------------------------------------+
```

---

## 3. Core Engine Specifications

### 3.1 Explainable Heuristic Risk Engine
The risk engine analyzes 4 key risk vectors:
- **Milestone Deadline Breach**: Penalizes 25 points per overdue milestone with no submitted work.
- **Critical Path Blockers**: Adds 7 points per unfinished urgent Kanban task.
- **Delivery Recency**: Flags extended gaps exceeding 20 days since the last student upload.
- **Score Classification**:
  - `0 - 27`: Low Risk (tracking normally).
  - `28 - 44`: Medium Risk (upcoming deadline warning).
  - `45 - 69`: High Risk (1 overdue milestone, leader check-in required).
  - `70 - 100`: Critical Risk (multiple overdue milestones, immediate viva intervention).

### 3.2 Transparent Contribution Index
Computes non-punitive continuous evaluation metrics:
- 60% weight on verified task completion percentage.
- 25% weight on sprint task fulfillment volume.
- 15% weight on deliverable authorship and leadership duties.
