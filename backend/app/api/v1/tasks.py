import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...core.database import get_db
from ...core.permissions import get_current_user
from ...models.models import Task, StudentGroup, GroupMembership, Subject, ActivityLog, User
from ...schemas.schemas import TaskCreate, TaskStatusUpdate, TaskResponse, VALID_STATUS_TRANSITIONS

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    group_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Task).options(selectinload(Task.assignee))

    if group_id:
        # Check permissions for this group
        if current_user.role == "student":
            mem = (await db.execute(
                select(GroupMembership).filter(
                    GroupMembership.group_id == group_id,
                    GroupMembership.user_id == current_user.id
                )
            )).scalar_one_or_none()
            if not mem:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to tasks for this group")
        stmt = stmt.filter(Task.group_id == group_id)
    else:
        if current_user.role == "student":
            # Only tasks of groups student belongs to
            grp_stmt = select(GroupMembership.group_id).filter(GroupMembership.user_id == current_user.id)
            group_ids = (await db.execute(grp_stmt)).scalars().all()
            stmt = stmt.filter(Task.group_id.in_(group_ids))
        elif current_user.role == "teacher":
            # Tasks for groups in teacher's subjects
            subj_stmt = select(Subject.id).filter(Subject.teacher_id == current_user.id)
            subj_ids = (await db.execute(subj_stmt)).scalars().all()
            grp_stmt = select(StudentGroup.id).filter(StudentGroup.subject_id.in_(subj_ids))
            group_ids = (await db.execute(grp_stmt)).scalars().all()
            stmt = stmt.filter(Task.group_id.in_(group_ids))

    if status_filter:
        stmt = stmt.filter(Task.status == status_filter)

    tasks = (await db.execute(stmt.order_by(Task.created_at.desc()))).scalars().all()
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    req: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify group exists
    grp = (await db.execute(select(StudentGroup).filter(StudentGroup.id == req.group_id))).scalar_one_or_none()
    if not grp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    # Authorization
    if current_user.role == "student":
        mem = (await db.execute(
            select(GroupMembership).filter(
                GroupMembership.group_id == req.group_id,
                GroupMembership.user_id == current_user.id
            )
        )).scalar_one_or_none()
        if not mem:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only create tasks for your own group.")
    elif current_user.role == "teacher":
        subj = (await db.execute(select(Subject).filter(Subject.id == grp.subject_id))).scalar_one_or_none()
        if not subj or (subj.teacher_id != current_user.id and current_user.role != "admin"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this subject.")

    due_date = req.due_date
    if due_date.tzinfo is None:
        due_date = due_date.replace(tzinfo=timezone.utc)

    task_id = f"tsk_{uuid.uuid4().hex[:12]}"
    task = Task(
        id=task_id,
        group_id=req.group_id,
        milestone_id=req.milestone_id,
        title=req.title.strip(),
        description=req.description,
        assigned_to_id=req.assigned_to_id,
        status="todo",
        priority=req.priority,
        due_date=due_date
    )
    db.add(task)

    # Activity log
    log = ActivityLog(
        id=f"act_{uuid.uuid4().hex[:12]}",
        group_id=req.group_id,
        user_id=current_user.id,
        action=f"Created task '{task.title}'",
        target=task.title,
        activity_type="task"
    )
    db.add(log)

    await db.commit()

    stmt = select(Task).filter(Task.id == task_id).options(selectinload(Task.assignee))
    return (await db.execute(stmt)).scalar_one()


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: str,
    update: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Task).filter(Task.id == task_id).options(selectinload(Task.assignee))
    task = (await db.execute(stmt)).scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Check permission
    if current_user.role == "student":
        mem = (await db.execute(
            select(GroupMembership).filter(
                GroupMembership.group_id == task.group_id,
                GroupMembership.user_id == current_user.id
            )
        )).scalar_one_or_none()
        if not mem:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update tasks in your own group.")

    # Validate state transition
    current_status = task.status
    target_status = update.status

    if current_status != target_status:
        allowed = VALID_STATUS_TRANSITIONS.get(current_status, [])
        if target_status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid task status transition from '{current_status}' to '{target_status}'. Allowed: {allowed}"
            )

        task.status = target_status
        if target_status == "completed":
            task.completed_at = datetime.now(timezone.utc)
        else:
            task.completed_at = None

        # Activity log
        log = ActivityLog(
            id=f"act_{uuid.uuid4().hex[:12]}",
            group_id=task.group_id,
            user_id=current_user.id,
            action=f"Moved task to {target_status.replace('_', ' ').capitalize()}",
            target=task.title,
            activity_type="task"
        )
        db.add(log)

        await db.commit()
        await db.refresh(task)

    return task
