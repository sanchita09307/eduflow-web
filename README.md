# EduFlow — Teacher-First College Project Management & Evaluation SaaS

EduFlow is an interactive, teacher-first college project management and continuous viva evaluation SaaS platform designed specifically for Indian colleges (NAAC & NBA accredited engineering programs).

Inspired by Google Classroom, Trello, and AI-powered project risk analytics.

---

## Key Features

1. **Teacher-First Curriculum Management**:
   - Create a capstone project once and allocate it across multiple student groups.
   - Define milestones (Synopsis, Architecture, Prototype, Testing, Final Viva), strict deadlines, and weightage percentage constraints (must equal 100%).
2. **Interactive Group Kanban Board**:
   - 4-lane Kanban (To Do, In Progress, In Review, Completed).
   - Task assignment to individual student roll numbers, priority badges (Urgent, High, Medium, Low), and target due dates.
3. **Multi-Version Deliverable Ingestion & Review**:
   - Timestamped version history (v1, v2, v3).
   - Prevents silent overwriting.
   - Faculty grading modal with score input, feedback notes, rework requests, and confetti on milestone approval.
4. **Explainable AI Risk Engine**:
   - Algorithmic assessment of overdue milestones, blocker tasks, and prolonged student inactivity.
   - Categorical risk levels (Low, Medium, High, Critical) with clear pedagogical intervention advice.
5. **Transparent Individual Student Contribution Index**:
   - Non-punitive, verifiable participation tracking based on completed tasks, submissions authored, and leadership responsibilities.
   - Ideal for continuous internal assessment and university viva defense.
6. **AI Teacher Assistant**:
   - Natural language assistant for batch summaries, overdue student alerts, and viva rubric generation.
7. **Role-Based Access Control**:
   - Switch effortlessly between Teacher view (Prof. Rajeshwar Sharma) and Student view (Aditya Verma).
   - Students cannot modify deadlines, rubric weightages, or self-grade.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion, Canvas Confetti.
- **Backend (Python)**: FastAPI, SQLAlchemy 2.0, Pydantic, Alembic, JWT Authentication, Passlib/Argon2.
- **AI & Analytics**: Explainable Heuristic Rule-Based Risk Engine, Contribution Calculator.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run the full-stack web application
npm run dev
```

Visit `http://localhost:3000` to access EduFlow.
