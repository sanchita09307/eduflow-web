import uuid
import pytest
import httpx
from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.asyncio
async def test_health_check():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"


@pytest.mark.asyncio
async def test_teacher_seed_login():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Teacher login from seed
        response = await client.post("/api/v1/auth/login", json={
            "email": "sharma.cse@engg.edu.in",
            "password": "Teacher@2026!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "teacher"
        assert data["user"]["name"] == "Prof. Rajeshwar Sharma"

        token = data["access_token"]
        # Verify /auth/me
        me_resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["email"] == "sharma.cse@engg.edu.in"
        assert me_data["role"] == "teacher"


@pytest.mark.asyncio
async def test_login_invalid_password():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/auth/login", json={
            "email": "sharma.cse@engg.edu.in",
            "password": "WrongPassword123!"
        })
        assert response.status_code == 401
        assert "detail" in response.json()


@pytest.mark.asyncio
async def test_register_weak_password_fails():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/auth/register", json={
            "email": f"student_{uuid.uuid4().hex[:6]}@engg.edu.in",
            "password": "weak",
            "name": "New Student",
            "department": "Computer Science & Engineering"
        })
        assert response.status_code == 400
        assert "Password must be at least 8 characters" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_creates_student_role_only():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Even if email contains 'teacher', role must strictly be student
        email = f"candidate_{uuid.uuid4().hex[:6]}@engg.edu.in"
        response = await client.post("/api/v1/auth/register", json={
            "email": email,
            "password": "ValidPassword@2026",
            "name": "Enrolled Student",
            "department": "Computer Science & Engineering"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["user"]["role"] == "student"
        assert data["user"]["email"] == email
