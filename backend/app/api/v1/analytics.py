from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...core.permissions import get_current_user, require_teacher
from ...models.models import User
from ...services.risk_service import RiskService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/risk")
async def get_risk_assessment(
    current_teacher: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    return await RiskService.evaluate_teacher_groups_risk(db, current_teacher)


@router.get("/contribution/{group_id}")
async def get_group_contribution(
    group_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    return await RiskService.get_group_contribution(db, group_id, current_user)
