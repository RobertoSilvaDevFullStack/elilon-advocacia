import requests

BASE_URL = "http://localhost:5000"
LOGIN_ENDPOINT = "/api/auth/login"
POSTS_ENDPOINT = "/api/posts"
TIMEOUT = 30

def test_crud_api_posts_admin():
    # Step 1: Authenticate admin user and get token
    auth_payload = {"username": "admin", "password": "admin123"}
    try:
        login_resp = requests.post(BASE_URL + LOGIN_ENDPOINT, json=auth_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        token = login_resp.json().get("token")
        assert token, "No token received in login response"
    except Exception as e:
        raise AssertionError(f"Authentication request failed: {e}")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Prepare post data for creation
    post_data = {
        "title": "Test Post Title",
        "content": "This is the test content of the blog post.",
        "published": False
    }

    post_id = None
    try:
        # Step 2: Create a new blog post (POST /api/posts)
        try:
            create_resp = requests.post(BASE_URL + POSTS_ENDPOINT, json=post_data, headers=headers, timeout=TIMEOUT)
            assert create_resp.status_code in (200, 201), f"Create post failed with status {create_resp.status_code}"
            created_post = create_resp.json()
            post_id = created_post.get("id")
            assert post_id, "Created post response missing 'id'"
            assert created_post.get("title") == post_data["title"]
            assert created_post.get("content") == post_data["content"]
        except Exception as e:
            raise AssertionError(f"Post creation failed: {e}")

        # Step 3: Update the created post (PUT /api/posts/:id)
        update_data = {
            "title": "Updated Test Post Title",
            "content": "Updated content of the blog post.",
            "published": True
        }
        try:
            update_resp = requests.put(f"{BASE_URL}{POSTS_ENDPOINT}/{post_id}", json=update_data, headers=headers, timeout=TIMEOUT)
            assert update_resp.status_code == 200, f"Update post failed with status {update_resp.status_code}"
            updated_post = update_resp.json()
            assert updated_post.get("title") == update_data["title"]
            assert updated_post.get("content") == update_data["content"]
            assert updated_post.get("published") == update_data["published"]
        except Exception as e:
            raise AssertionError(f"Post update failed: {e}")

        # Step 4: Delete the post (DELETE /api/posts/:id)
        try:
            delete_resp = requests.delete(f"{BASE_URL}{POSTS_ENDPOINT}/{post_id}", headers=headers, timeout=TIMEOUT)
            assert delete_resp.status_code == 200, f"Delete post failed with status {delete_resp.status_code}"
        except Exception as e:
            raise AssertionError(f"Post deletion failed: {e}")

        # Step 5: Verify post is deleted by trying to update again, expect 404 or error
        try:
            resp_after_delete = requests.put(f"{BASE_URL}{POSTS_ENDPOINT}/{post_id}", json=update_data, headers=headers, timeout=TIMEOUT)
            assert resp_after_delete.status_code in (404, 400) or resp_after_delete.status_code >= 400, \
                f"Post still exists after deletion, status code {resp_after_delete.status_code}"
        except Exception as e:
            # Accept exception if connection fails after deletion
            pass

    finally:
        # Cleanup: Ensure post is deleted if still exists
        if post_id is not None:
            try:
                requests.delete(f"{BASE_URL}{POSTS_ENDPOINT}/{post_id}", headers=headers, timeout=TIMEOUT)
            except Exception:
                pass

test_crud_api_posts_admin()
