from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    CheckConstraint,
    UniqueConstraint,
    Index
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="student")
    roll_number = Column(String(50), nullable=True, index=True)
    college_id = Column(String(100), nullable=True, index=True)
    designation = Column(String(100), nullable=True)
    semester = Column(String(50), nullable=True)
    avatar = Column(Text, nullable=True)
    department = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint("role IN ('teacher', 'student', 'admin')", name="ck_user_role"),
    )

    # Relationships
    subjects = relationship("Subject", back_populates="teacher", cascade="all, delete-orphan")
    assigned_tasks = relationship("Task", back_populates="assignee", foreign_keys="Task.assigned_to_id")
    memberships = relationship("GroupMembership", back_populates="user", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="submitter")
    reviews = relationship("SubmissionReview", back_populates="reviewer")
    enrollments = relationship("SubjectEnrollment", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("ActivityLog", back_populates="user")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String(36), primary_key=True, index=True)
    code = Column(String(20), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    semester = Column(String(50), nullable=False)
    department = Column(String(100), nullable=False)
    teacher_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    academic_year = Column(String(50), nullable=False, default="2026-2027")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    teacher = relationship("User", back_populates="subjects")
    projects = relationship("Project", back_populates="subject", cascade="all, delete-orphan")
    groups = relationship("StudentGroup", back_populates="subject", cascade="all, delete-orphan")
    enrollments = relationship("SubjectEnrollment", back_populates="subject", cascade="all, delete-orphan")


class SubjectEnrollment(Base):
    __tablename__ = "subject_enrollments"

    id = Column(String(36), primary_key=True, index=True)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    enrolled_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("subject_id", "user_id", name="uq_subject_user_enrollment"),
        Index("ix_subject_enrollments_subject_user", "subject_id", "user_id"),
    )

    subject = relationship("Subject", back_populates="enrollments")
    user = relationship("User", back_populates="enrollments")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, index=True)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    teacher_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    weightage_total = Column(Integer, default=100, nullable=False)
    status = Column(String(20), default="active", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint("status IN ('active', 'archived')", name="ck_project_status"),
    )

    # Relationships
    subject = relationship("Subject", back_populates="projects")
    milestones = relationship(
        "ProjectMilestone",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="ProjectMilestone.order_index"
    )
    groups = relationship("StudentGroup", back_populates="project")


class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(String(36), primary_key=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=False)
    weightage = Column(Integer, nullable=False, default=20)
    order_index = Column(Integer, nullable=False, default=1)
    requires_file = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        UniqueConstraint("project_id", "order_index", name="uq_project_milestone_order"),
        Index("ix_milestones_project_id", "project_id"),
    )

    # Relationships
    project = relationship("Project", back_populates="milestones")
    tasks = relationship("Task", back_populates="milestone")
    submissions = relationship("Submission", back_populates="milestone")


class StudentGroup(Base):
    __tablename__ = "student_groups"

    id = Column(String(36), primary_key=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    leader_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    progress_percentage = Column(Integer, default=0, nullable=False)
    github_url = Column(String(255), nullable=True)
    live_demo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="groups")
    subject = relationship("Subject", back_populates="groups")
    leader = relationship("User", foreign_keys=[leader_id])
    memberships = relationship("GroupMembership", back_populates="group", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="group", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="group", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="group", cascade="all, delete-orphan")


class GroupMembership(Base):
    __tablename__ = "group_memberships"

    id = Column(String(36), primary_key=True, index=True)
    group_id = Column(String(36), ForeignKey("student_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_in_group = Column(String(20), default="member", nullable=False)

    __table_args__ = (
        CheckConstraint("role_in_group IN ('leader', 'member')", name="ck_group_membership_role"),
        UniqueConstraint("group_id", "user_id", name="uq_group_membership_group_user"),
        Index("ix_group_memberships_group_user", "group_id", "user_id"),
    )

    # Relationships
    group = relationship("StudentGroup", back_populates="memberships")
    user = relationship("User", back_populates="memberships")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, index=True)
    group_id = Column(String(36), ForeignKey("student_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    milestone_id = Column(String(36), ForeignKey("project_milestones.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    assigned_to_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    status = Column(String(20), default="todo", nullable=False)
    priority = Column(String(20), default="medium", nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint("status IN ('todo', 'in_progress', 'in_review', 'completed')", name="ck_task_status"),
        CheckConstraint("priority IN ('low', 'medium', 'high', 'urgent')", name="ck_task_priority"),
        Index("ix_tasks_group_status", "group_id", "status"),
        Index("ix_tasks_assigned_to", "assigned_to_id"),
    )

    # Relationships
    group = relationship("StudentGroup", back_populates="tasks")
    milestone = relationship("ProjectMilestone", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_to_id])


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, index=True)
    group_id = Column(String(36), ForeignKey("student_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    milestone_id = Column(String(36), ForeignKey("project_milestones.id", ondelete="CASCADE"), nullable=False, index=True)
    version = Column(Integer, default=1, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=True)  # in bytes
    file_type = Column(String(100), nullable=True)
    file_url = Column(String(500), nullable=True)
    submission_notes = Column(Text, nullable=True)
    submitted_by_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    submitted_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    status = Column(String(30), default="under_review", nullable=False)

    __table_args__ = (
        CheckConstraint(
            "status IN ('submitted', 'under_review', 'approved', 'rework_requested')",
            name="ck_submission_status"
        ),
        UniqueConstraint("group_id", "milestone_id", "version", name="uq_submission_group_milestone_version"),
        Index("ix_submissions_group_milestone", "group_id", "milestone_id"),
    )

    # Relationships
    group = relationship("StudentGroup", back_populates="submissions")
    milestone = relationship("ProjectMilestone", back_populates="submissions")
    submitter = relationship("User", back_populates="submissions")
    review = relationship("SubmissionReview", back_populates="submission", uselist=False, cascade="all, delete-orphan")


class SubmissionReview(Base):
    __tablename__ = "submission_reviews"

    id = Column(String(36), primary_key=True, index=True)
    submission_id = Column(String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    reviewer_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    status = Column(String(30), nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, default=20.0, nullable=False)
    feedback = Column(Text, nullable=False)
    reviewed_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint("status IN ('approved', 'rework_requested', 'rejected')", name="ck_review_status"),
        Index("ix_reviews_reviewer", "reviewer_id"),
    )

    # Relationships
    submission = relationship("Submission", back_populates="review")
    reviewer = relationship("User", back_populates="reviews")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    message = Text()
    type = Column(String(20), default="info", nullable=False)
    read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint("type IN ('info', 'warning', 'danger', 'success')", name="ck_notification_type"),
        Index("ix_notifications_user_read", "user_id", "read"),
    )

    # Relationships
    user = relationship("User", back_populates="notifications")


class ActivityLog(Base):
    __tablename__ = "activity_log"

    id = Column(String(36), primary_key=True, index=True)
    group_id = Column(String(36), ForeignKey("student_groups.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    target = Column(String(255), nullable=False)
    activity_type = Column(String(20), default="submission", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint("activity_type IN ('submission', 'task', 'review', 'alert')", name="ck_activity_type"),
        Index("ix_activity_group_created", "group_id", "created_at"),
        Index("ix_activity_user_created", "user_id", "created_at"),
    )

    # Relationships
    group = relationship("StudentGroup", back_populates="activity_logs")
    user = relationship("User", back_populates="activities")
