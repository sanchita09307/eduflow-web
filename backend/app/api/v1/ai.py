from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...core.permissions import get_current_user
from ...models.models import User
from ...schemas.schemas import AIAssistantRequest, AIAssistantResponse
from ...services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.post("/assistant", response_model=AIAssistantResponse)
async def ai_assistant_query(
    req: AIAssistantRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await AIService.generate_assistant_response(
        db=db,
        query=req.query,
        current_user=current_user,
        subject_id=req.subject_id,
        group_id=req.group_id
    )
    return AIAssistantResponse(**result)
