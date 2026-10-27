import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from ..models.models import Project, ProjectMilestone, Subject, StudentGroup, User
from ..schemas.schemas import ProjectCreate


class ProjectService:
    @staticmethod
    async def create_project(db: AsyncSession, req: ProjectCreate, current_teacher: User) -> Project:
        # Check that subject exists and belongs to the teacher
        stmt = select(Subject).filter(Subject.id == req.subject_id)
        subject = (await db.execute(stmt)).scalar_one_or_none()
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found"
            )
        if subject.teacher_id != current_teacher.id and current_teacher.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to add projects to this subject."
            )

        # Validate milestone weights sum to 100
        total_weight = sum(m.weightage for m in req.milestones)
        if total_weight != 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Milestone weightages must sum to exactly 100% (currently sums to {total_weight}%)."
            )

        # Validate milestone deadlines
        now = datetime.now(timezone.utc)
        for m in req.milestones:
            m_deadline = m.deadline
            if m_deadline.tzinfo is None:
                m_deadline = m_deadline.replace(tzinfo=timezone.utc)
            if m_deadline <= now:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Milestone '{m.title}' deadline must be in the future."
                )

        project_id = f"prj_{uuid.uuid4().hex[:12]}"
        project = Project(
            id=project_id,
            subject_id=req.subject_id,
            title=req.title.strip(),
            description=req.description,
            instructions=req.instructions,
            teacher_id=current_teacher.id,
            weightage_total=100,
            status="active"
        )
        db.add(project)

        # Add milestones
        for idx, m in enumerate(req.milestones, start=1):
            m_deadline = m.deadline
            if m_deadline.tzinfo is None:
                m_deadline = m_deadline.replace(tzinfo=timezone.utc)

            milestone = ProjectMilestone(
                id=f"ms_{uuid.uuid4().hex[:12]}",
                project_id=project_id,
                title=m.title.strip(),
                description=m.description,
                deadline=m_deadline,
                weightage=m.weightage,
                order_index=m.order_index if m.order_index is not None else idx,
                requires_file=m.requires_file
            )
            db.add(milestone)

        # Assign groups if specified
        if req.assigned_group_ids:
            for gid in req.assigned_group_ids:
                g_stmt = select(StudentGroup).filter(StudentGroup.id == gid)
                group = (await db.execute(g_stmt)).scalar_one_or_none()
                if group and group.subject_id == req.subject_id:
                    group.project_id = project_id

        await db.commit()
        await db.refresh(project)
        return project
