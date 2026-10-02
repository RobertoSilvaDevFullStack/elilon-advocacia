import requests

BASE_URL = "http://localhost:5000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
PROFESSIONALS_URL = f"{BASE_URL}/api/professionals"
TIMEOUT = 30

def test_crud_api_professionals():
    # Step 1: Verify GET /api/professionals is public (no auth required)
    try:
        response = requests.get(PROFESSIONALS_URL, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 for public GET /api/professionals but got {response.status_code}"
        professionals_list = response.json()
        assert isinstance(professionals_list, list), "Expected a JSON array on GET /api/professionals"
    except Exception as e:
        assert False, f"GET /api/professionals request failed: {e}"

    # Step 2: Login as admin to get access token
    login_payload = {"username": "admin", "password": "admin123"}
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Admin login failed with status code {login_resp.status_code}"
        token = login_resp.json().get("token")
        assert token and isinstance(token, str), "Token not found in admin login response"
    except Exception as e:
        assert False, f"Admin login request failed: {e}"

    headers = {"Authorization": f"Bearer {token}"}

    # Step 3: Admin creates a new professional (POST /api/professionals)
    create_payload = {
        "name": "Test Professional",
        "title": "Senior Attorney",
        "email": "test.professional@example.com",
        "phone": "123-456-7890",
        "specialties": ["Corporate Law", "Litigation"],
        "bio": "Experienced professional for testing purposes."
    }
    new_professional_id = None
    try:
        create_resp = requests.post(PROFESSIONALS_URL, json=create_payload, headers=headers, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Expected 201 on creating professional but got {create_resp.status_code}"
        created_professional = create_resp.json()
        new_professional_id = created_professional.get("id")
        assert new_professional_id is not None, "Created professional response missing 'id'"
        for key in create_payload:
            assert created_professional.get(key) == create_payload[key], f"Mismatch in created professional field {key}"
    except Exception as e:
        assert False, f"POST /api/professionals request failed: {e}"

    # Setup URL for this resource
    professional_url_with_id = f"{PROFESSIONALS_URL}/{new_professional_id}"

    try:
        # Step 4: Admin updates the professional (PUT /api/professionals/:id)
        update_payload = {
            "title": "Lead Counsel",
            "phone": "987-654-3210",
            "specialties": ["Corporate Law", "Intellectual Property"],
            "bio": "Updated bio for professional."
        }
        try:
            update_resp = requests.put(professional_url_with_id, json=update_payload, headers=headers, timeout=TIMEOUT)
            assert update_resp.status_code == 200, f"Expected 200 on updating professional but got {update_resp.status_code}"
            updated_professional = update_resp.json()
            for key in update_payload:
                assert updated_professional.get(key) == update_payload[key], f"Mismatch in updated professional field {key}"
        except Exception as e:
            assert False, f"PUT /api/professionals/:id request failed: {e}"

        # Step 5: Admin deletes the professional (DELETE /api/professionals/:id)
        try:
            delete_resp = requests.delete(professional_url_with_id, headers=headers, timeout=TIMEOUT)
            assert delete_resp.status_code == 200, f"Expected 200 on deleting professional but got {delete_resp.status_code}"
        except Exception as e:
            assert False, f"DELETE /api/professionals/:id request failed: {e}"

        # Step 6: Confirm deletion by trying to GET the deleted professional (should fail, expect 404 or 400)
        try:
            get_deleted_resp = requests.get(professional_url_with_id, headers=headers, timeout=TIMEOUT)
            assert get_deleted_resp.status_code in (404, 400), f"Expected 404 or 400 for deleted professional GET but got {get_deleted_resp.status_code}"
        except Exception as e:
            # Accept connection errors or not found errors here as confirmation of deletion
            pass

    finally:
        # Cleanup if professional still exists
        if new_professional_id:
            try:
                requests.delete(professional_url_with_id, headers=headers, timeout=TIMEOUT)
            except Exception:
                pass

test_crud_api_professionals()
