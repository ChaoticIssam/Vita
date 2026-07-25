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
    response = client.post(
        "/events",
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
    assert body["event"]["source"] == "desktop"
    assert body["event"]["event_type"] == "app_usage"
    assert body["event"]["payload"] == {"application": "browser"}
