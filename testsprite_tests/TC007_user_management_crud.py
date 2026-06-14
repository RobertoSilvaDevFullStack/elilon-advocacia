import requests
import time

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_user_management_crud():
    # Login to get the token
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {"username": "admin", "password": "admin123"}
    login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json().get("token")
    assert token, "No token received from login"
    headers = {"Authorization": f"Bearer {token}"}

    user_id = None

    # Generate unique username/email for the test run
    unique_suffix = str(int(time.time()))

    try:
        # Create user
        create_url = f"{BASE_URL}/api/users"
        user_payload = {
            "username": f"testuser_tc007_{unique_suffix}",
            "email": f"testuser_tc007_{unique_suffix}@example.com",
            "password": "TestPass123!",
            "fullName": "Test User TC007"
        }
        create_resp = requests.post(create_url, json=user_payload, headers=headers, timeout=TIMEOUT)
        assert create_resp.status_code in (200, 201), f"User creation failed: {create_resp.text}"
        created_user = create_resp.json()
        user_id = created_user.get("id")
        assert user_id, "Created user ID not returned"

        # List users and check created user present
        list_url = f"{BASE_URL}/api/users"
        list_resp = requests.get(list_url, headers=headers, timeout=TIMEOUT)
        assert list_resp.status_code == 200, f"Listing users failed: {list_resp.text}"
        users_list = list_resp.json()
        assert any(str(u.get("id")) == str(user_id) for u in users_list), "Created user not in list"

        # Update user
        update_url = f"{BASE_URL}/api/users/{user_id}"
        update_payload = {"fullName": "Updated Test User TC007", "email": f"updated_tc007_{unique_suffix}@example.com"}
        update_resp = requests.put(update_url, json=update_payload, headers=headers, timeout=TIMEOUT)
        assert update_resp.status_code == 200, f"User update failed: {update_resp.text}"
        updated_user = update_resp.json()
        assert updated_user.get("fullName") == update_payload["fullName"], "User fullName not updated"
        assert updated_user.get("email") == update_payload["email"], "User email not updated"

        # Approve user
        approve_url = f"{BASE_URL}/api/users/{user_id}/approve"
        approve_resp = requests.put(approve_url, headers=headers, timeout=TIMEOUT)
        assert approve_resp.status_code == 200, f"User approval failed: {approve_resp.text}"

        # Verify approval in user list
        list_resp2 = requests.get(list_url, headers=headers, timeout=TIMEOUT)
        assert list_resp2.status_code == 200, f"Listing users after approval failed: {list_resp2.text}"
        users_list2 = list_resp2.json()
        approved_user = next((u for u in users_list2 if str(u.get("id")) == str(user_id)), None)
        assert approved_user is not None, "Approved user not found after approval"
        # Assuming there's an 'approved' or 'status' field to confirm approval
        approved_flag = approved_user.get("approved", None)
        if approved_flag is None:
            approved_flag = approved_user.get("status", None)
            assert approved_flag in ("approved", "active", True), f"User approval status unexpected: {approved_flag}"
        else:
            assert approved_flag is True, f"User not marked approved: {approved_flag}"

        # Reject user (should remove or mark as rejected)
        reject_url = f"{BASE_URL}/api/users/{user_id}/reject"
        reject_resp = requests.delete(reject_url, headers=headers, timeout=TIMEOUT)
        assert reject_resp.status_code in (200, 204), f"User rejection failed: {reject_resp.text}"

        # Verify user removed or marked rejected
        list_resp3 = requests.get(list_url, headers=headers, timeout=TIMEOUT)
        assert list_resp3.status_code == 200, f"Listing users after rejection failed: {list_resp3.text}"
        users_list3 = list_resp3.json()
        user_after_reject = next((u for u in users_list3 if str(u.get("id")) == str(user_id)), None)
        # User might be removed or have rejected status
        if user_after_reject:
            rej_status = user_after_reject.get("rejected", None)
            if rej_status is None:
                rej_status = user_after_reject.get("status", "")
                assert rej_status.lower() in ("rejected", "inactive", "disabled"), f"User rejection status unexpected: {rej_status}"
            else:
                assert rej_status is True, "User not marked as rejected"

        # Finally, delete the user (if still present)
        delete_url = f"{BASE_URL}/api/users/{user_id}"
        delete_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
        # Accept 200 or 204 or 404 if user already deleted by rejection
        assert delete_resp.status_code in (200, 204, 404), f"User deletion failed: {delete_resp.text}"

    finally:
        # Attempt to delete the user if exists to clean up
        if user_id:
            cleanup_url = f"{BASE_URL}/api/users/{user_id}"
            try:
                cleanup_resp = requests.delete(cleanup_url, headers=headers, timeout=TIMEOUT)
                # Accept 200 or 204 or 404
                assert cleanup_resp.status_code in (200, 204, 404), f"Cleanup deletion failed: {cleanup_resp.text}"
            except Exception:
                pass

test_user_management_crud()
