import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import model_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduFlow SaaS"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # In production, SECRET_KEY must be provided explicitly via environment variable
    SECRET_KEY: str = "eduflow-secret-development-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # PostgreSQL default, SQLite fallback supported
    DATABASE_URL: str = "postgresql+asyncpg://eduflow_user:eduflow_secure_pwd_2026@localhost:5432/eduflow_db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://eduflow-frontend-rho.vercel.app"
    ]

    GEMINI_API_KEY: str = ""
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB

    @model_validator(mode="after")
    def validate_production_secret(self) -> "Settings":
        if self.ENVIRONMENT != "development" and (
            not self.SECRET_KEY or self.SECRET_KEY == "eduflow-secret-development-key-change-in-prod"
        ):
            raise ValueError("SECRET_KEY must be configured and securely set in non-development environments.")
        return self

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
