import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_get_api_posts_returns_list():
    url = f"{BASE_URL}/api/posts"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to GET /api/posts failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, list), "Response JSON is not a list"

test_get_api_posts_returns_list()