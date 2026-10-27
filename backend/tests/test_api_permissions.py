import pytest
import httpx
from datetime import datetime, timezone, timedelta
from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


async def get_tokens():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Teacher login
        t_resp = await client.post("/api/v1/auth/login", json={
            "email": "sharma.cse@engg.edu.in",
            "password": "Teacher@2026!"
        })
        teacher_token = t_resp.json()["access_token"]

        # Student login
        s_resp = await client.post("/api/v1/auth/login", json={
            "email": "aditya.21cs042@engg.edu.in",
            "password": "Student@2026!"
        })
        student_token = s_resp.json()["access_token"]

        return teacher_token, student_token


@pytest.mark.asyncio
async def test_student_cannot_create_subject():
    _, student_token = await get_tokens()
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/subjects",
            headers={"Authorization": f"Bearer {student_token}"},
            json={
                "code": "CS999",
                "name": "Unauthorized Course",
                "semester": "Semester VII",
                "department": "Computer Science & Engineering"
            }
        )
        assert resp.status_code == 403
        assert "Faculty privileges required" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_project_milestone_weightage_must_sum_to_100():
    teacher_token, _ = await get_tokens()
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        now = datetime.now(timezone.utc)
        resp = await client.post(
            "/api/v1/projects",
            headers={"Authorization": f"Bearer {teacher_token}"},
            json={
                "subject_id": "sub_1",
                "title": "Invalid Project",
                "milestones": [
                    {
                        "title": "Part 1",
                        "deadline": (now + timedelta(days=10)).isoformat(),
                        "weightage": 40,
                        "order_index": 1
                    },
                    {
                        "title": "Part 2",
                        "deadline": (now + timedelta(days=20)).isoformat(),
                        "weightage": 40,  # Sums to 80, not 100!
                        "order_index": 2
                    }
                ]
            }
        )
        assert resp.status_code in [400, 422]


@pytest.mark.asyncio
async def test_student_cannot_review_submission():
    _, student_token = await get_tokens()
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/submissions/subm_1/review",
            headers={"Authorization": f"Bearer {student_token}"},
            json={
                "submission_id": "subm_1",
                "status": "approved",
                "score": 18.0,
                "max_score": 20.0,
                "feedback": "Self-grading should fail"
            }
        )
        assert resp.status_code == 403


@pytest.mark.asyncio
async def test_teacher_review_score_cannot_exceed_max():
    teacher_token, _ = await get_tokens()
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/submissions/subm_1/review",
            headers={"Authorization": f"Bearer {teacher_token}"},
            json={
                "submission_id": "subm_1",
                "status": "approved",
                "score": 25.0,  # Exceeds max 20.0!
                "max_score": 20.0,
                "feedback": "Over score"
            }
        )
        assert resp.status_code == 400
        assert "maximum allowable score" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_task_status_transition_validation():
    _, student_token = await get_tokens()
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Create a task starting at todo
        now = datetime.now(timezone.utc)
        task_resp = await client.post(
            "/api/v1/tasks",
            headers={"Authorization": f"Bearer {student_token}"},
            json={
                "group_id": "grp_1",
                "title": "State Transition Test Task",
                "assigned_to_id": "usr_s1",
                "priority": "medium",
                "due_date": (now + timedelta(days=5)).isoformat()
            }
        )
        assert task_resp.status_code == 201
        task_id = task_resp.json()["id"]

        # Try to jump illegally from 'todo' directly to 'completed'
        patch_bad = await client.patch(
            f"/api/v1/tasks/{task_id}/status",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"status": "completed"}
        )
        assert patch_bad.status_code == 400
        assert "Invalid task status transition" in patch_bad.json()["detail"]

        # Valid transition: 'todo' -> 'in_progress'
        patch_ok = await client.patch(
            f"/api/v1/tasks/{task_id}/status",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"status": "in_progress"}
        )
        assert patch_ok.status_code == 200
        assert patch_ok.json()["status"] == "in_progress"


@pytest.mark.asyncio
async def test_analytics_and_ai_endpoints():
    teacher_token, student_token = await get_tokens()
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Teacher risk analytics
        risk_resp = await client.get("/api/v1/analytics/risk", headers={"Authorization": f"Bearer {teacher_token}"})
        assert risk_resp.status_code == 200
        risk_data = risk_resp.json()
        assert isinstance(risk_data, list)
        assert len(risk_data) > 0
        assert "risk_score" in risk_data[0]

        # Student forbidden from risk assessment
        risk_forbidden = await client.get("/api/v1/analytics/risk", headers={"Authorization": f"Bearer {student_token}"})
        assert risk_forbidden.status_code == 403

        # Contribution analytics for group
        contrib_resp = await client.get("/api/v1/analytics/contribution/grp_1", headers={"Authorization": f"Bearer {student_token}"})
        assert contrib_resp.status_code == 200
        contrib_data = contrib_resp.json()
        assert isinstance(contrib_data, list)
        assert len(contrib_data) > 0
        assert "contribution_score" in contrib_data[0]

        # AI Assistant authenticated query
        ai_resp = await client.post(
            "/api/v1/ai/assistant",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"query": "What are the viva rubric criteria for final project evaluation?"}
        )
        assert ai_resp.status_code == 200
        ai_data = ai_resp.json()
        assert "response" in ai_data
        assert len(ai_data["response"]) > 20
