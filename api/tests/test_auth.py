from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_and_login_flow():
    # 1. Register new user
    register_payload = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepassword123"
    }
    reg_response = client.post("/auth/register", json=register_payload)
    assert reg_response.status_code == 200
    reg_data = reg_response.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "test@example.com"
    token = reg_data["access_token"]

    # 2. Test duplicate registration failure
    dup_response = client.post("/auth/register", json=register_payload)
    assert dup_response.status_code == 400
    assert "already exists" in dup_response.json()["detail"]

    # 3. Test login with correct credentials
    login_payload = {
        "email": "test@example.com",
        "password": "securepassword123"
    }
    login_response = client.post("/auth/login", json=login_payload)
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data

    # 4. Test login with wrong password
    bad_login = client.post("/auth/login", json={"email": "test@example.com", "password": "wrongpassword"})
    assert bad_login.status_code == 401

    # 5. Test GET /auth/me with valid Bearer token
    me_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "test@example.com"

    # 6. Test GET /auth/me with invalid token
    bad_me = client.get("/auth/me", headers={"Authorization": "Bearer invalid_token"})
    assert bad_me.status_code == 401
