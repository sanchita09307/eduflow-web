from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict


# User Schemas
class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    name: str
    role: str = "student"
    department: str
    roll_number: Optional[str] = None
    college_id: Optional[str] = None
    designation: Optional[str] = None
    semester: Optional[str] = None
    avatar: Optional[str] = None


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    department: str
    roll_number: Optional[str] = None
    college_id: Optional[str] = None
    semester: Optional[str] = None


UserCreate = RegisterRequest


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Milestone Schemas
class MilestoneBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str
    description: Optional[str] = None
    deadline: datetime
    weightage: int = 20
    order_index: int = 1
    requires_file: bool = True


class MilestoneCreate(MilestoneBase):
    pass


class MilestoneResponse(MilestoneBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str


# Project Schemas
class ProjectCreate(BaseModel):
    subject_id: str
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    weightage_total: int = 100
    milestones: List[MilestoneCreate]
    assigned_group_ids: Optional[List[str]] = []

    @field_validator("milestones")
    @classmethod
    def validate_milestones(cls, v: List[MilestoneCreate]) -> List[MilestoneCreate]:
        if not v:
            raise ValueError("Project must contain at least one milestone.")
        total_weight = sum(m.weightage for m in v)
        if total_weight != 100:
            raise ValueError(f"Milestone weightages must sum to exactly 100 (current sum: {total_weight}).")
        return v


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    subject_id: str
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    teacher_id: str
    weightage_total: int
    status: str = "active"
    created_at: datetime
    milestones: List[MilestoneResponse] = []


# Subject Schemas
class SubjectCreate(BaseModel):
    code: str
    name: str
    semester: str
    department: str
    academic_year: str = "2026-2027"
    description: Optional[str] = None


class SubjectResponse(SubjectCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    teacher_id: str
    created_at: datetime
    teacher: Optional[UserResponse] = None


# Group Membership Schemas
class GroupMembershipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    group_id: str
    user_id: str
    role_in_group: str
    user: Optional[UserResponse] = None


# Student Group Schemas
class StudentGroupCreate(BaseModel):
    name: str
    subject_id: str
    project_id: Optional[str] = None
    leader_id: str
    member_ids: Optional[List[str]] = []
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None


class StudentGroupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: Optional[str] = None
    subject_id: str
    name: str
    leader_id: str
    progress_percentage: int = 0
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    created_at: datetime
    leader: Optional[UserResponse] = None
    memberships: List[GroupMembershipResponse] = []


# Task Schemas
class TaskCreate(BaseModel):
    group_id: str
    milestone_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    assigned_to_id: str
    priority: str = "medium"
    due_date: datetime


VALID_STATUS_TRANSITIONS = {
    "todo": ["in_progress"],
    "in_progress": ["in_review", "todo"],
    "in_review": ["completed", "in_progress"],
    "completed": ["in_progress", "in_review"]
}


class TaskStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = {"todo", "in_progress", "in_review", "completed"}
        if v not in valid_statuses:
            raise ValueError(f"Invalid task status: {v}. Must be one of {valid_statuses}")
        return v


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    group_id: str
    milestone_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    assigned_to_id: str
    status: str
    priority: str
    due_date: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    assignee: Optional[UserResponse] = None


# Review Schemas
class ReviewCreate(BaseModel):
    submission_id: str
    status: str  # 'approved', 'rework_requested', 'rejected'
    score: float
    max_score: float = 20.0
    feedback: str

    @field_validator("status")
    @classmethod
    def validate_review_status(cls, v: str) -> str:
        valid = {"approved", "rework_requested", "rejected"}
        if v not in valid:
            raise ValueError(f"Status must be one of {valid}")
        return v


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    reviewer_id: str
    status: str
    score: float
    max_score: float
    feedback: str
    reviewed_at: datetime
    reviewer: Optional[UserResponse] = None


# Submission Schemas
class SubmissionCreate(BaseModel):
    group_id: str
    milestone_id: str
    file_name: str
    file_size: Optional[int] = None
    submission_notes: Optional[str] = None


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    group_id: str
    milestone_id: str
    version: int
    file_name: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    file_url: Optional[str] = None
    submission_notes: Optional[str] = None
    submitted_by_id: str
    submitted_at: datetime
    status: str
    review: Optional[ReviewResponse] = None
    submitter: Optional[UserResponse] = None


# Notifications Schemas
class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    title: str
    message: Optional[str] = None
    type: str
    read: bool
    created_at: datetime


# Activity Log Schemas
class ActivityLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    group_id: Optional[str] = None
    user_id: Optional[str] = None
    action: str
    target: str
    activity_type: str
    created_at: datetime


# AI Assistant Query
class AIAssistantRequest(BaseModel):
    query: str
    subject_id: Optional[str] = None
    group_id: Optional[str] = None


class AIAssistantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    query: str
    response: str
    heuristics_used: List[str]
    timestamp: datetime
