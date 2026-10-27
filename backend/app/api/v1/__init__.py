from fastapi import APIRouter
from .auth import router as auth_router
from .subjects import router as subjects_router
from .projects import router as projects_router
from .groups import router as groups_router
from .tasks import router as tasks_router
from .submissions import router as submissions_router
from .reviews import router as reviews_router
from .analytics import router as analytics_router
from .ai import router as ai_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(subjects_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(groups_router)
api_v1_router.include_router(tasks_router)
api_v1_router.include_router(submissions_router)
api_v1_router.include_router(reviews_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(ai_router)

__all__ = ["api_v1_router"]
