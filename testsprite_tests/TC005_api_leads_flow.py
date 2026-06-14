import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_api_leads_flow():
    session = requests.Session()
    # Authenticate admin to get token
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {"username": "admin", "password": "admin123"}
    try:
        login_resp = session.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        token = login_resp.json().get("token")
        assert token and isinstance(token, str), "Invalid token received from login"
        headers_auth = {"Authorization": f"Bearer {token}"}
    except Exception as e:
        assert False, f"Exception during login: {e}"

    lead_id = None
    # Step 1: Public lead creation
    lead_create_url = f"{BASE_URL}/api/leads"
    lead_data = {
        "name": "Test Lead",
        "email": "testlead@example.com",
        "phone": "+1234567890",
        "message": "Interested in legal consultation.",
        "source": "Landing Page"
    }
    try:
        lead_create_resp = session.post(lead_create_url, json=lead_data, timeout=TIMEOUT)
        assert lead_create_resp.status_code in [200, 201], f"Lead creation failed with status {lead_create_resp.status_code}"
        lead_resp_json = lead_create_resp.json()
        assert isinstance(lead_resp_json, dict), "Lead creation response is not a JSON object"
        # Save lead id for later operations
        lead_id = lead_resp_json.get("id")
        assert lead_id is not None, "Created lead ID not returned"
    except Exception as e:
        assert False, f"Exception during lead creation: {e}"

    try:
        # Step 2: Admin listing (authenticated)
        leads_list_url = f"{BASE_URL}/api/leads"
        try:
            leads_list_resp = session.get(leads_list_url, headers=headers_auth, timeout=TIMEOUT)
            assert leads_list_resp.status_code == 200, f"Leads listing failed with status {leads_list_resp.status_code}"
            leads_list_json = leads_list_resp.json()
            assert isinstance(leads_list_json, list), "Leads listing response is not a list"
            # The created lead should be present in the list
            lead_ids = [lead.get("id") for lead in leads_list_json if "id" in lead]
            assert lead_id in lead_ids, "Created lead not found in leads listing"
        except Exception as e:
            assert False, f"Exception during leads listing: {e}"

        # Step 3: Status update PUT /api/leads/:id/status
        lead_status_url = f"{BASE_URL}/api/leads/{lead_id}/status"
        new_status_payload = {"status": "contacted"}
        try:
            status_update_resp = session.put(lead_status_url, headers=headers_auth, json=new_status_payload, timeout=TIMEOUT)
            assert status_update_resp.status_code == 200, f"Lead status update failed with status {status_update_resp.status_code}"
            status_update_json = status_update_resp.json()
            # Check if 'status' field directly or nested
            status_value = None
            if 'status' in status_update_json:
                status_value = status_update_json.get('status')
            elif 'lead' in status_update_json and isinstance(status_update_json['lead'], dict):
                status_value = status_update_json['lead'].get('status')
            assert status_value == "contacted", "Lead status was not updated to 'contacted'"
        except Exception as e:
            assert False, f"Exception during lead status update: {e}"

    finally:
        # Cleanup: delete the created lead if API supported delete, but no DELETE /api/leads/:id endpoint mentioned.
        # So no delete done as per PRD. If needed, can add logic here.
        pass

test_api_leads_flow()
