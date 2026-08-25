from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_returns_service_message() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Vita API is running"}


def test_health_returns_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_event_ingestion_accepts_payload() -> None:
    import uuid
    unique_email = f"event_test_{uuid.uuid4().hex[:8]}@example.com"
    reg_response = client.post(
        "/auth/register",
        json={"name": "Event Tester", "email": unique_email, "password": "password123"}
    )
    token = reg_response.json()["access_token"]

    response = client.post(
        "/events",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "source": "desktop",
            "event_type": "app_usage",
            "occurred_at": "2026-07-22T12:00:00Z",
            "payload": {"application": "browser"},
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["accepted"] is True
