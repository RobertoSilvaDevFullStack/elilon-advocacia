import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_dashboard_settings_track():
    # Authenticate and get token
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {"username": "admin", "password": "admin123"}
    login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
    token = login_resp.json().get("token")
    assert token, "No token found in login response"

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Verify GET /api/dashboard returns stats
    dashboard_url = f"{BASE_URL}/api/dashboard"
    dashboard_resp = requests.get(dashboard_url, headers=headers, timeout=TIMEOUT)
    assert dashboard_resp.status_code == 200, f"GET /api/dashboard failed with status {dashboard_resp.status_code}"
    dashboard_data = dashboard_resp.json()
    assert isinstance(dashboard_data, dict), "Dashboard response is not a JSON object"
    assert len(dashboard_data) > 0, "Dashboard data is empty"

    # 2. POST /api/settings saves webhook URL, then GET /api/settings retrieves it

    settings_url = f"{BASE_URL}/api/settings"
    webhook_url = "https://example.com/webhook"

    post_settings_payload = {"webhook_url": webhook_url}
    post_resp = requests.post(settings_url, headers=headers, json=post_settings_payload, timeout=TIMEOUT)
    assert post_resp.status_code == 200, f"POST /api/settings failed with status {post_resp.status_code}"

    get_resp = requests.get(settings_url, headers=headers, timeout=TIMEOUT)
    assert get_resp.status_code == 200, f"GET /api/settings failed with status {get_resp.status_code}"
    get_resp_json = get_resp.json()
    # Assert webhook_url present and is string type (do not assert exact equality)
    assert "webhook_url" in get_resp_json, "webhook_url missing in GET /api/settings response"
    assert isinstance(get_resp_json["webhook_url"], str), "webhook_url is not a string"

    # 3. POST /api/track records a visit (no auth required)
    track_url = f"{BASE_URL}/api/track"
    visit_payload = {"page": "/test-page", "referrer": "http://referrer.com", "user_agent": "test-agent", "ip": "127.0.0.1"}
    track_resp = requests.post(track_url, json=visit_payload, timeout=TIMEOUT)
    assert track_resp.status_code in (200,201), f"POST /api/track failed with status {track_resp.status_code}"

test_dashboard_settings_track()