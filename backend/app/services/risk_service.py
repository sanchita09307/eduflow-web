from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from ..models.models import (
    StudentGroup,
    Subject,
    ProjectMilestone,
    Task,
    Submission,
    GroupMembership,
    User
)
from ..ai.risk_engine import RuleBasedRiskEngine
from ..ai.contribution import ContributionCalculator


class RiskService:
    @staticmethod
    async def evaluate_teacher_groups_risk(
        db: AsyncSession,
        current_teacher: User
    ) -> List[Dict[str, Any]]:
        # Fetch teacher's subjects
        if current_teacher.role == "admin":
            subj_stmt = select(Subject)
        else:
            subj_stmt = select(Subject).filter(Subject.teacher_id == current_teacher.id)
        subjects = (await db.execute(subj_stmt)).scalars().all()
        subject_ids = [s.id for s in subjects]

        if not subject_ids:
            return []

        # Fetch groups for these subjects
        grp_stmt = select(StudentGroup).filter(StudentGroup.subject_id.in_(subject_ids))
        groups = (await db.execute(grp_stmt)).scalars().all()

        results = []
        for group in groups:
            # Milestones
            milestones = []
            if group.project_id:
                ms_stmt = select(ProjectMilestone).filter(ProjectMilestone.project_id == group.project_id)
                ms_rows = (await db.execute(ms_stmt)).scalars().all()
                milestones = [
                    {
                        "id": m.id,
                        "title": m.title,
                        "deadline": m.deadline,
                        "weightage": m.weightage
                    }
                    for m in ms_rows
                ]

            # Tasks
            t_stmt = select(Task).filter(Task.group_id == group.id)
            t_rows = (await db.execute(t_stmt)).scalars().all()
            tasks = [
                {
                    "id": t.id,
                    "status": t.status,
                    "priority": t.priority,
                    "due_date": t.due_date
                }
                for t in t_rows
            ]

            # Submissions
            sub_stmt = select(Submission).filter(Submission.group_id == group.id)
            sub_rows = (await db.execute(sub_stmt)).scalars().all()
            submissions = [
                {
                    "id": s.id,
                    "milestone_id": s.milestone_id,
                    "status": s.status,
                    "submitted_at": s.submitted_at
                }
                for s in sub_rows
            ]

            assessment = RuleBasedRiskEngine.evaluate_group_risk(
                group_id=group.id,
                group_name=group.name,
                milestones=milestones,
                tasks=tasks,
                submissions=submissions
            )
            results.append(assessment)

        return results

    @staticmethod
    async def get_group_contribution(
        db: AsyncSession,
        group_id: str,
        current_user: User
    ) -> List[Dict[str, Any]]:
        # Fetch group
        grp_stmt = select(StudentGroup).filter(StudentGroup.id == group_id)
        group = (await db.execute(grp_stmt)).scalar_one_or_none()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )

        # Check permissions
        if current_user.role == "student":
            mem_stmt = select(GroupMembership).filter(
                GroupMembership.group_id == group_id,
                GroupMembership.user_id == current_user.id
            )
            is_member = (await db.execute(mem_stmt)).scalar_one_or_none()
            if not is_member:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only access contribution metrics for your own group."
                )
        elif current_user.role == "teacher":
            subj_stmt = select(Subject).filter(Subject.id == group.subject_id)
            subject = (await db.execute(subj_stmt)).scalar_one_or_none()
            if not subject or subject.teacher_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not teach the subject assigned to this student group."
                )

        # Fetch group memberships
        mem_stmt = select(GroupMembership).filter(GroupMembership.group_id == group_id)
        memberships = (await db.execute(mem_stmt)).scalars().all()

        # Fetch all tasks and submissions for group
        t_stmt = select(Task).filter(Task.group_id == group_id)
        all_tasks = (await db.execute(t_stmt)).scalars().all()

        sub_stmt = select(Submission).filter(Submission.group_id == group_id)
        all_submissions = (await db.execute(sub_stmt)).scalars().all()

        contributions = []
        for mem in memberships:
            u_stmt = select(User).filter(User.id == mem.user_id)
            user = (await db.execute(u_stmt)).scalar_one_or_none()
            if not user:
                continue

            member_tasks = [
                {"id": t.id, "status": t.status, "priority": t.priority}
                for t in all_tasks if t.assigned_to_id == user.id
            ]
            member_submissions = [
                {"id": s.id, "status": s.status}
                for s in all_submissions if s.submitted_by_id == user.id
            ]

            is_leader = (group.leader_id == user.id or mem.role_in_group == "leader")

            calc = ContributionCalculator.calculate_member_contribution(
                user_id=user.id,
                name=user.name,
                roll_number=user.roll_number or user.college_id or "N/A",
                is_leader=is_leader,
                member_tasks=member_tasks,
                member_submissions=member_submissions
            )
            contributions.append(calc)

        return contributions
