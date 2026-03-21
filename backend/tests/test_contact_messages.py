"""
Contact Messages API Tests
Tests for:
- POST /api/contact - Submit contact form
- GET /api/admin/contact-messages - List messages (admin)
- GET /api/admin/contact-messages/{id} - Get single message (admin)
- PUT /api/admin/contact-messages/{id} - Update message status (admin)
- DELETE /api/admin/contact-messages/{id} - Delete message (admin)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@kktcx.com"
ADMIN_PASSWORD = "admin123"


class TestContactFormSubmission:
    """Tests for public contact form submission"""
    
    def test_submit_contact_form_success(self):
        """Test successful contact form submission"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "name": f"TEST_User_{unique_id}",
            "email": f"test_{unique_id}@example.com",
            "subject": "Test Subject",
            "message": "Test message from pytest"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "message" in data or "Mesajınız" in str(data)
    
    def test_submit_contact_form_without_subject(self):
        """Test contact form submission without optional subject"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "name": f"TEST_User_{unique_id}",
            "email": f"test_{unique_id}@example.com",
            "message": "Test message without subject"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
    
    def test_submit_contact_form_missing_name(self):
        """Test contact form submission without required name field"""
        payload = {
            "email": "test@example.com",
            "message": "Test message"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        # Should return 400 or 422 for validation error
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
    
    def test_submit_contact_form_missing_email(self):
        """Test contact form submission without required email field"""
        payload = {
            "name": "Test User",
            "message": "Test message"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
    
    def test_submit_contact_form_missing_message(self):
        """Test contact form submission without required message field"""
        payload = {
            "name": "Test User",
            "email": "test@example.com"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"


class TestAdminContactMessages:
    """Tests for admin contact messages management"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup admin authentication"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed - skipping admin tests")
        
        self.token = login_response.json().get("access_token")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    @pytest.fixture
    def create_test_message(self):
        """Create a test message and return its ID"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "name": f"TEST_Admin_{unique_id}",
            "email": f"admin_test_{unique_id}@example.com",
            "subject": "Admin Test Subject",
            "message": "Admin test message for pytest"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 200
        
        # Get the message ID from the list
        list_response = requests.get(
            f"{BASE_URL}/api/admin/contact-messages",
            headers=self.headers
        )
        messages = list_response.json().get("messages", [])
        
        # Find the message we just created
        for msg in messages:
            if msg.get("email") == payload["email"]:
                return msg["id"]
        
        pytest.skip("Could not find created test message")
    
    def test_get_contact_messages_list(self):
        """Test getting list of contact messages"""
        response = requests.get(
            f"{BASE_URL}/api/admin/contact-messages",
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "messages" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        assert isinstance(data["messages"], list)
    
    def test_get_contact_messages_with_status_filter(self):
        """Test filtering messages by status"""
        response = requests.get(
            f"{BASE_URL}/api/admin/contact-messages?status=unread",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned messages should have unread status
        for msg in data.get("messages", []):
            assert msg.get("status") == "unread"
    
    def test_get_contact_messages_pagination(self):
        """Test pagination parameters"""
        response = requests.get(
            f"{BASE_URL}/api/admin/contact-messages?page=1&limit=5",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 1
        assert len(data["messages"]) <= 5
    
    def test_get_single_contact_message(self, create_test_message):
        """Test getting a single contact message"""
        message_id = create_test_message
        
        response = requests.get(
            f"{BASE_URL}/api/admin/contact-messages/{message_id}",
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["id"] == message_id
        assert "name" in data
        assert "email" in data
        assert "message" in data
        # Should be marked as read after viewing
        assert data["status"] == "read"
    
    def test_get_nonexistent_message(self):
        """Test getting a message that doesn't exist"""
        fake_id = str(uuid.uuid4())
        
        response = requests.get(
            f"{BASE_URL}/api/admin/contact-messages/{fake_id}",
            headers=self.headers
        )
        
        assert response.status_code == 404
    
    def test_update_message_status(self, create_test_message):
        """Test updating message status"""
        message_id = create_test_message
        
        response = requests.put(
            f"{BASE_URL}/api/admin/contact-messages/{message_id}",
            headers=self.headers,
            json={"status": "replied", "admin_note": "Test admin note"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        
        # Verify the update
        verify_response = requests.get(
            f"{BASE_URL}/api/admin/contact-messages/{message_id}",
            headers=self.headers
        )
        verify_data = verify_response.json()
        
        assert verify_data["status"] == "replied"
        assert verify_data["admin_note"] == "Test admin note"
    
    def test_update_nonexistent_message(self):
        """Test updating a message that doesn't exist"""
        fake_id = str(uuid.uuid4())
        
        response = requests.put(
            f"{BASE_URL}/api/admin/contact-messages/{fake_id}",
            headers=self.headers,
            json={"status": "read"}
        )
        
        assert response.status_code == 404
    
    def test_delete_message(self, create_test_message):
        """Test deleting a contact message"""
        message_id = create_test_message
        
        response = requests.delete(
            f"{BASE_URL}/api/admin/contact-messages/{message_id}",
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        
        # Verify deletion
        verify_response = requests.get(
            f"{BASE_URL}/api/admin/contact-messages/{message_id}",
            headers=self.headers
        )
        assert verify_response.status_code == 404
    
    def test_delete_nonexistent_message(self):
        """Test deleting a message that doesn't exist"""
        fake_id = str(uuid.uuid4())
        
        response = requests.delete(
            f"{BASE_URL}/api/admin/contact-messages/{fake_id}",
            headers=self.headers
        )
        
        assert response.status_code == 404
    
    def test_unauthorized_access(self):
        """Test that endpoints require admin authentication"""
        # No auth header
        response = requests.get(f"{BASE_URL}/api/admin/contact-messages")
        assert response.status_code in [401, 403, 422]
        
        # Invalid token
        response = requests.get(
            f"{BASE_URL}/api/admin/contact-messages",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code in [401, 403]


class TestContactMessagesCleanup:
    """Cleanup test data after tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup admin authentication"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed")
        
        self.token = login_response.json().get("access_token")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_cleanup_test_messages(self):
        """Clean up TEST_ prefixed messages"""
        response = requests.get(
            f"{BASE_URL}/api/admin/contact-messages?limit=100",
            headers=self.headers
        )
        
        if response.status_code != 200:
            pytest.skip("Could not fetch messages for cleanup")
        
        messages = response.json().get("messages", [])
        deleted_count = 0
        
        for msg in messages:
            if msg.get("name", "").startswith("TEST_"):
                delete_response = requests.delete(
                    f"{BASE_URL}/api/admin/contact-messages/{msg['id']}",
                    headers=self.headers
                )
                if delete_response.status_code == 200:
                    deleted_count += 1
        
        print(f"Cleaned up {deleted_count} test messages")
        assert True  # Cleanup is best-effort
