import requests

BASE_URL = "http://localhost:5000"
LOGIN_ENDPOINT = "/api/auth/login"
PROTECTED_ENDPOINTS = [
    {"method": "GET", "path": "/api/dashboard"},
    {"method": "GET", "path": "/api/settings"},
    {"method": "POST", "path": "/api/settings"},
    {"method": "GET", "path": "/api/leads"},
    {"method": "PUT", "path": "/api/leads/1/status"},  # Using 1 as sample id, expect 404 if not exists but auth is tested first
    {"method": "POST", "path": "/api/posts"},
    {"method": "PUT", "path": "/api/posts/1"},
    {"method": "DELETE", "path": "/api/posts/1"},
    {"method": "POST", "path": "/api/professionals"},
    {"method": "PUT", "path": "/api/professionals/1"},
    {"method": "DELETE", "path": "/api/professionals/1"},
    {"method": "GET", "path": "/api/users"},
    {"method": "POST", "path": "/api/users"},
    {"method": "PUT", "path": "/api/users/1"},
    {"method": "DELETE", "path": "/api/users/1"},
    {"method": "PUT", "path": "/api/users/1/approve"},
    {"method": "DELETE", "path": "/api/users/1/reject"},
]

def test_security_unauthorized_access():
    # 1. Test login with wrong credentials -> expect 401
    wrong_credentials_payload = {"username": "admin", "password": "wrongpassword"}
    try:
        r_wrong = requests.post(
            BASE_URL + LOGIN_ENDPOINT, json=wrong_credentials_payload, timeout=30
        )
        assert r_wrong.status_code == 401, f"Expected 401 for wrong login, got {r_wrong.status_code}"
    except requests.RequestException as e:
        assert False, f"RequestException on login wrong credentials: {e}"

    # 2. Login with correct credentials -> get valid token
    correct_credentials_payload = {"username": "admin", "password": "admin123"}
    try:
        r = requests.post(BASE_URL + LOGIN_ENDPOINT, json=correct_credentials_payload, timeout=30)
        assert r.status_code == 200, f"Expected 200 on correct login, got {r.status_code}"
        data = r.json()
        token = data.get("token") or data.get("access_token")
        assert token and isinstance(token, str), "JWT token missing or not a string in login response"
    except (requests.RequestException, ValueError) as e:
        assert False, f"Failed login request or parse JSON: {e}"

    # 3. Test all protected endpoints without token => expect 401 or 403
    for ep in PROTECTED_ENDPOINTS:
        method = ep["method"]
        url = BASE_URL + ep["path"]
        headers = {}
        try:
            if method == "GET":
                resp = requests.get(url, headers=headers, timeout=30)
            elif method == "POST":
                # Send minimal JSON payload or empty JSON if required
                payload = {}
                resp = requests.post(url, json=payload, headers=headers, timeout=30)
            elif method == "PUT":
                payload = {}
                resp = requests.put(url, json=payload, headers=headers, timeout=30)
            elif method == "DELETE":
                resp = requests.delete(url, headers=headers, timeout=30)
            else:
                # Skip unknown method
                continue
            assert resp.status_code in (401, 403), f"{method} {ep['path']} expected 401/403 without token, got {resp.status_code}"
        except requests.RequestException as e:
            assert False, f"RequestException for {method} {ep['path']} without token: {e}"

    # 4. Test login with correct credentials again to confirm token works (not part of instructions but sanity)
    try:
        resp = requests.post(BASE_URL + LOGIN_ENDPOINT, json=correct_credentials_payload, timeout=30)
        assert resp.status_code == 200, f"Expected 200 on retry correct login, got {resp.status_code}"
        token_retry = resp.json().get("token") or resp.json().get("access_token")
        assert token_retry and isinstance(token_retry, str), "Token missing or invalid on retry login"
        # Removed assertion that token_retry equals token since tokens typically differ on each login
    except (requests.RequestException, ValueError) as e:
        assert False, f"Exception on retry login: {e}"


test_security_unauthorized_access()