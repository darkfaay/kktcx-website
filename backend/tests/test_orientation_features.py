"""
Test suite for Orientation-based features:
1. User registration with orientations field
2. Login returns user with orientations
3. /api/auth/me returns orientations
4. /api/auth/profile can update orientations
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Basic health check"""
    
    def test_api_accessible(self):
        """Test that API is accessible"""
        response = requests.get(f"{BASE_URL}/api/cities")
        assert response.status_code == 200
        print(f"API accessible: {response.status_code}")


class TestUserRegistrationWithOrientations:
    """Test user registration with orientations field"""
    
    def test_register_user_with_single_orientation(self):
        """Test registering a user with a single orientation"""
        unique_email = f"test_orientation_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "email": unique_email,
            "password": "Test123!",
            "name": "Test Orientation User",
            "role": "user",
            "language": "tr",
            "orientations": ["heterosexual"]
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["orientations"] == ["heterosexual"]
        print(f"SUCCESS: Registered user with single orientation: {data['user']['orientations']}")
        
        return data["access_token"], data["user"]
    
    def test_register_user_with_multiple_orientations(self):
        """Test registering a user with multiple orientations"""
        unique_email = f"test_multi_orient_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "email": unique_email,
            "password": "Test123!",
            "name": "Test Multi Orientation",
            "role": "user",
            "language": "tr",
            "orientations": ["bisexual", "lesbian"]
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        data = response.json()
        assert data["user"]["orientations"] == ["bisexual", "lesbian"]
        print(f"SUCCESS: Registered user with multiple orientations: {data['user']['orientations']}")
    
    def test_register_user_without_orientations(self):
        """Test registering a user without orientations (should default to empty list)"""
        unique_email = f"test_no_orient_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "email": unique_email,
            "password": "Test123!",
            "name": "Test No Orientation",
            "role": "user",
            "language": "tr"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        data = response.json()
        assert data["user"]["orientations"] == []
        print(f"SUCCESS: Registered user without orientations (empty list): {data['user']['orientations']}")
    
    def test_register_user_with_gay_orientation(self):
        """Test registering a user with gay orientation"""
        unique_email = f"test_gay_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "email": unique_email,
            "password": "Test123!",
            "name": "Test Gay User",
            "role": "user",
            "language": "tr",
            "orientations": ["gay"]
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        data = response.json()
        assert data["user"]["orientations"] == ["gay"]
        print(f"SUCCESS: Registered user with gay orientation: {data['user']['orientations']}")


class TestLoginReturnsOrientations:
    """Test that login returns user with orientations field"""
    
    @pytest.fixture
    def test_user_with_orientation(self):
        """Create a test user with orientation for login tests"""
        unique_email = f"test_login_orient_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "email": unique_email,
            "password": "Test123!",
            "name": "Test Login Orientation",
            "role": "user",
            "language": "tr",
            "orientations": ["lesbian"]
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        return unique_email, "Test123!", ["lesbian"]
    
    def test_login_returns_orientations(self, test_user_with_orientation):
        """Test that login response includes orientations"""
        email, password, expected_orientations = test_user_with_orientation
        
        login_payload = {
            "email": email,
            "password": password
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "user" in data
        assert "orientations" in data["user"]
        assert data["user"]["orientations"] == expected_orientations
        print(f"SUCCESS: Login returns orientations: {data['user']['orientations']}")


class TestAuthMeReturnsOrientations:
    """Test that /api/auth/me returns orientations"""
    
    @pytest.fixture
    def authenticated_user(self):
        """Create and authenticate a test user"""
        unique_email = f"test_me_orient_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "email": unique_email,
            "password": "Test123!",
            "name": "Test Me Orientation",
            "role": "user",
            "language": "tr",
            "orientations": ["bisexual"]
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        data = response.json()
        return data["access_token"], ["bisexual"]
    
    def test_auth_me_returns_orientations(self, authenticated_user):
        """Test that /api/auth/me includes orientations in response"""
        token, expected_orientations = authenticated_user
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        assert response.status_code == 200, f"Auth/me failed: {response.text}"
        
        data = response.json()
        assert "orientations" in data
        assert data["orientations"] == expected_orientations
        print(f"SUCCESS: /api/auth/me returns orientations: {data['orientations']}")


class TestProfileUpdateOrientations:
    """Test that /api/auth/profile can update orientations"""
    
    @pytest.fixture
    def authenticated_user_for_update(self):
        """Create and authenticate a test user for profile update"""
        unique_email = f"test_update_orient_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "email": unique_email,
            "password": "Test123!",
            "name": "Test Update Orientation",
            "role": "user",
            "language": "tr",
            "orientations": ["heterosexual"]
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        data = response.json()
        return data["access_token"], data["user"]["id"]
    
    def test_update_profile_orientations(self, authenticated_user_for_update):
        """Test updating user orientations via profile endpoint"""
        token, user_id = authenticated_user_for_update
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Update orientations
        update_response = requests.put(
            f"{BASE_URL}/api/auth/profile",
            headers=headers,
            params={"orientations": ["gay", "bisexual"]}
        )
        
        assert update_response.status_code == 200, f"Profile update failed: {update_response.text}"
        
        # Verify update via /api/auth/me
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert me_response.status_code == 200
        
        data = me_response.json()
        assert "orientations" in data
        assert set(data["orientations"]) == {"gay", "bisexual"}
        print(f"SUCCESS: Profile orientations updated: {data['orientations']}")
    
    def test_update_profile_change_orientations(self, authenticated_user_for_update):
        """Test changing user orientations to different values"""
        token, user_id = authenticated_user_for_update
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Change orientations to a single different value
        update_response = requests.put(
            f"{BASE_URL}/api/auth/profile?orientations=lesbian",
            headers=headers
        )
        
        assert update_response.status_code == 200, f"Profile update failed: {update_response.text}"
        
        # Verify update via /api/auth/me
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert me_response.status_code == 200
        
        data = me_response.json()
        assert data["orientations"] == ["lesbian"]
        print(f"SUCCESS: Profile orientations changed: {data['orientations']}")


class TestExistingUserLogin:
    """Test login with existing admin user"""
    
    def test_admin_login(self):
        """Test admin login works"""
        login_payload = {
            "email": "admin@kktcx.com",
            "password": "admin123"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        # Admin may or may not have orientations field
        assert "orientations" in data["user"]
        print(f"SUCCESS: Admin login works, orientations: {data['user'].get('orientations', [])}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
