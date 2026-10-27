# EduFlow Database Schema Documentation

## Relational Entity ERD Overview

### 1. `users` Table
Stores faculty in-charge, students, and administrators.
- `id` (VARCHAR 36, PK): Unique UUID
- `email` (VARCHAR 255, UNIQUE, NOT NULL): College domain email
- `hashed_password` (VARCHAR 255, NOT NULL): Argon2 / bcrypt hash
- `name` (VARCHAR 100, NOT NULL): Full name
- `role` (VARCHAR 20, NOT NULL): 'teacher' | 'student' | 'admin'
- `roll_number` (VARCHAR 50, NULL): e.g. '21CS042'
- `department` (VARCHAR 100, NOT NULL): e.g. 'Computer Science & Engineering'
- `created_at` (TIMESTAMP): Record creation time

### 2. `subjects` Table
Represents curriculum courses / lab sessions.
- `id` (VARCHAR 36, PK)
- `code` (VARCHAR 20, NOT NULL): Course code (e.g., 'CS601')
- `name` (VARCHAR 255, NOT NULL): Subject title
- `semester` (VARCHAR 50, NOT NULL): 'Semester VI'
- `department` (VARCHAR 100, NOT NULL)
- `teacher_id` (VARCHAR 36, FK -> users.id)
- `academic_year` (VARCHAR 50, NOT NULL): e.g. '2026-2027'
- `description` (TEXT)

### 3. `projects` Table
Capstone, lab, or mini-projects created under a subject.
- `id` (VARCHAR 36, PK)
- `subject_id` (VARCHAR 36, FK -> subjects.id)
- `title` (VARCHAR 255, NOT NULL)
- `description` (TEXT)
- `instructions` (TEXT): IEEE guidelines, repository format
- `teacher_id` (VARCHAR 36, FK -> users.id)
- `weightage_total` (INT): Default 100%

### 4. `project_milestones` Table
Discrete deadlines and grading weightages.
- `id` (VARCHAR 36, PK)
- `project_id` (VARCHAR 36, FK -> projects.id)
- `title` (VARCHAR 255, NOT NULL)
- `description` (TEXT)
- `deadline` (TIMESTAMP, NOT NULL)
- `weightage` (INT, NOT NULL): Percentage weightage
- `order_index` (INT, NOT NULL)
- `requires_file` (BOOLEAN, DEFAULT TRUE)

### 5. `student_groups` Table
Student teams allocated to work on a project.
- `id` (VARCHAR 36, PK)
- `project_id` (VARCHAR 36, FK -> projects.id)
- `subject_id` (VARCHAR 36, FK -> subjects.id)
- `name` (VARCHAR 100, NOT NULL): e.g. 'Group 04 — Team Synapse'
- `leader_id` (VARCHAR 36, FK -> users.id)
- `progress_percentage` (INT, DEFAULT 0)
- `github_url` (VARCHAR 255)

### 6. `tasks` Table
Kanban tasks assigned to individual students.
- `id` (VARCHAR 36, PK)
- `group_id` (VARCHAR 36, FK -> student_groups.id)
- `milestone_id` (VARCHAR 36, FK -> project_milestones.id, NULL)
- `title` (VARCHAR 255, NOT NULL)
- `description` (TEXT)
- `assigned_to_id` (VARCHAR 36, FK -> users.id)
- `status` (VARCHAR 20): 'todo' | 'in_progress' | 'in_review' | 'completed'
- `priority` (VARCHAR 20): 'low' | 'medium' | 'high' | 'urgent'
- `due_date` (TIMESTAMP, NOT NULL)
- `completed_at` (TIMESTAMP, NULL)

### 7. `submissions` Table
Versioned deliverables submitted by student groups.
- `id` (VARCHAR 36, PK)
- `group_id` (VARCHAR 36, FK -> student_groups.id)
- `milestone_id` (VARCHAR 36, FK -> project_milestones.id)
- `version` (INT, DEFAULT 1): Timestamped increment
- `file_name` (VARCHAR 255, NOT NULL)
- `file_size` (VARCHAR 50)
- `file_url` (VARCHAR 500)
- `submission_notes` (TEXT)
- `submitted_by_id` (VARCHAR 36, FK -> users.id)
- `submitted_at` (TIMESTAMP)
- `status` (VARCHAR 30): 'submitted' | 'under_review' | 'approved' | 'rework_requested'

### 8. `submission_reviews` Table
Faculty evaluations and rubric marks.
- `id` (VARCHAR 36, PK)
- `submission_id` (VARCHAR 36, FK -> submissions.id, UNIQUE)
- `reviewer_id` (VARCHAR 36, FK -> users.id)
- `status` (VARCHAR 30): 'approved' | 'rework_requested' | 'rejected'
- `score` (FLOAT, NOT NULL): Marks awarded
- `max_score` (FLOAT, DEFAULT 20.0)
- `feedback` (TEXT, NOT NULL)
- `reviewed_at` (TIMESTAMP)
