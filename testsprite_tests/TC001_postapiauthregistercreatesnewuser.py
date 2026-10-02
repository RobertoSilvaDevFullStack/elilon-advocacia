import requests
import uuid

BASE_URL = "http://localhost:5000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
REGISTER_URL = f"{BASE_URL}/api/auth/register"
TIMEOUT = 30

def test_post_api_auth_register_creates_new_user():
    # Step 1: Authenticate as admin to get token
    login_payload = {"username": "admin", "password": "admin123"}
    login_response = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
    assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
    token = login_response.json().get("token")
    assert token, "Token not found in login response"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Step 2: Register new user with unique data
    unique_username = f"testuser_{uuid.uuid4().hex[:8]}"
    user_payload = {
        "username": unique_username,
        "password": "TestPass123!",
        "email": f"{unique_username}@example.com",
        "fullname": "Test User"
    }

    register_response = requests.post(REGISTER_URL, json=user_payload, headers=headers, timeout=TIMEOUT)
    assert register_response.status_code == 201, f"User registration failed with status {register_response.status_code}"
    response_json = register_response.json()

    assert "user" in response_json, "User object not found in register response"
    assert isinstance(response_json["user"], dict), "User field is not an object"
    returned_username = response_json["user"].get("username")
    assert returned_username == unique_username, "Returned username mismatch"


test_post_api_auth_register_creates_new_user()
