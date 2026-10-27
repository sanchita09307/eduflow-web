import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from ..models.models import User
from ..schemas.schemas import RegisterRequest
from ..core.security import get_password_hash, verify_password, validate_password_strength


class AuthService:
    @staticmethod
    async def register_student(db: AsyncSession, req: RegisterRequest) -> User:
        # Validate password strength
        if not validate_password_strength(req.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
            )

        # Check existing email
        stmt = select(User).filter(User.email == req.email.lower().strip())
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered."
            )

        # Role is STRICTLY student - teachers are only created by seed/admin
        user = User(
            id=f"usr_{uuid.uuid4().hex[:12]}",
            email=req.email.lower().strip(),
            hashed_password=get_password_hash(req.password),
            name=req.name.strip(),
            role="student",
            department=req.department.strip(),
            roll_number=req.roll_number.strip() if req.roll_number else None,
            college_id=req.college_id.strip() if req.college_id else (req.roll_number.strip() if req.roll_number else None),
            semester=req.semester.strip() if req.semester else None
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
        generic_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

        stmt = select(User).filter(User.email == email.lower().strip())
        user = (await db.execute(stmt)).scalar_one_or_none()
        if not user:
            raise generic_error

        if not verify_password(password, user.hashed_password):
            raise generic_error

        return user
