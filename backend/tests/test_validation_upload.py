import pytest
import httpx
from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.asyncio
async def test_file_upload_format_whitelist():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Student login
        s_resp = await client.post("/api/v1/auth/login", json={
            "email": "aditya.21cs042@engg.edu.in",
            "password": "Student@2026!"
        })
        student_token = s_resp.json()["access_token"]

        # 1. Invalid file format .exe
        files_bad = {
            "file": ("malicious.exe", b"MZ\x90\x00\x03\x00\x00\x00", "application/octet-stream")
        }
        data_bad = {
            "group_id": "grp_1",
            "milestone_id": "ms_1",
            "notes": "Test upload"
        }
        resp_bad = await client.post(
            "/api/v1/submissions",
            headers={"Authorization": f"Bearer {student_token}"},
            data=data_bad,
            files=files_bad
        )
        assert resp_bad.status_code == 400
        assert "Unsupported file format" in resp_bad.json()["detail"]

        # 2. Valid file format .pdf
        files_ok = {
            "file": ("project_report.pdf", b"%PDF-1.4 mock content for project report", "application/pdf")
        }
        data_ok = {
            "group_id": "grp_1",
            "milestone_id": "ms_1",
            "notes": "Valid submission"
        }
        resp_ok = await client.post(
            "/api/v1/submissions",
            headers={"Authorization": f"Bearer {student_token}"},
            data=data_ok,
            files=files_ok
        )
        assert resp_ok.status_code == 201
        sub_data = resp_ok.json()
        assert sub_data["file_name"] == "project_report.pdf"
        assert sub_data["version"] >= 1
        assert sub_data["status"] == "submitted"
