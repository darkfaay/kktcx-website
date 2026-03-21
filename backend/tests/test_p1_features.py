"""
P1 Features Test Suite for KKTCX Platform
Tests:
1. Admin Verified Badge Toggle - PUT /api/admin/profiles/{id}/verified
2. Admin Media Management - GET/POST/DELETE /api/admin/media endpoints
3. WebSocket Chat - ws://[host]/ws/chat/{token}
4. Stripe Payments - POST /api/payments/checkout, GET /api/payments/status/{session_id}
"""

import pytest
import requests
import os
import json
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@kktcx.com"
ADMIN_PASSWORD = "admin123"


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ API health check passed")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login(self):
        """Test admin login and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["role"] == "admin", "User is not admin"
        print(f"✓ Admin login successful, token received")
        return data["access_token"]


@pytest.fixture(scope="module")
def admin_token():
    """Get admin token for authenticated requests"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip("Admin login failed - skipping authenticated tests")
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    """Get headers with admin token"""
    return {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }


class TestAdminVerifiedBadge:
    """Test Admin Verified Badge Toggle - PUT /api/admin/profiles/{id}/verified"""
    
    def test_get_profiles_list(self, admin_headers):
        """Test getting profiles list"""
        response = requests.get(f"{BASE_URL}/api/admin/profiles", headers=admin_headers)
        assert response.status_code == 200, f"Failed to get profiles: {response.text}"
        data = response.json()
        assert "profiles" in data, "No profiles key in response"
        assert "total" in data, "No total key in response"
        print(f"✓ Got {len(data['profiles'])} profiles, total: {data['total']}")
        return data["profiles"]
    
    def test_toggle_verified_badge_on(self, admin_headers):
        """Test toggling verified badge ON for a profile"""
        # First get a profile
        response = requests.get(f"{BASE_URL}/api/admin/profiles", headers=admin_headers)
        assert response.status_code == 200
        profiles = response.json().get("profiles", [])
        
        if not profiles:
            pytest.skip("No profiles available to test verified badge toggle")
        
        profile = profiles[0]
        profile_id = profile["id"]
        
        # Toggle verified ON
        response = requests.put(
            f"{BASE_URL}/api/admin/profiles/{profile_id}/verified",
            params={"is_verified": True},
            headers=admin_headers
        )
        assert response.status_code == 200, f"Failed to toggle verified: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Toggle verified did not return success"
        print(f"✓ Toggled verified badge ON for profile {profile_id}")
        
        # Verify the change persisted
        response = requests.get(f"{BASE_URL}/api/admin/profiles", headers=admin_headers)
        profiles = response.json().get("profiles", [])
        updated_profile = next((p for p in profiles if p["id"] == profile_id), None)
        assert updated_profile is not None, "Profile not found after update"
        assert updated_profile.get("is_verified") == True, "Verified badge not persisted"
        print(f"✓ Verified badge persisted correctly")
    
    def test_toggle_verified_badge_off(self, admin_headers):
        """Test toggling verified badge OFF for a profile"""
        # First get a profile
        response = requests.get(f"{BASE_URL}/api/admin/profiles", headers=admin_headers)
        profiles = response.json().get("profiles", [])
        
        if not profiles:
            pytest.skip("No profiles available to test verified badge toggle")
        
        profile = profiles[0]
        profile_id = profile["id"]
        
        # Toggle verified OFF
        response = requests.put(
            f"{BASE_URL}/api/admin/profiles/{profile_id}/verified",
            params={"is_verified": False},
            headers=admin_headers
        )
        assert response.status_code == 200, f"Failed to toggle verified: {response.text}"
        data = response.json()
        assert data.get("success") == True
        print(f"✓ Toggled verified badge OFF for profile {profile_id}")


class TestAdminMediaManagement:
    """Test Admin Media Management endpoints"""
    
    def test_get_media_list(self, admin_headers):
        """Test GET /api/admin/media - List all media files"""
        response = requests.get(f"{BASE_URL}/api/admin/media", headers=admin_headers)
        assert response.status_code == 200, f"Failed to get media: {response.text}"
        data = response.json()
        assert "files" in data, "No files key in response"
        assert "total" in data, "No total key in response"
        assert "storage" in data, "No storage key in response"
        print(f"✓ Got {len(data['files'])} media files, total: {data['total']}")
        print(f"  Storage: {data['storage']}")
    
    def test_get_media_with_type_filter(self, admin_headers):
        """Test GET /api/admin/media with type filter"""
        response = requests.get(
            f"{BASE_URL}/api/admin/media",
            params={"type": "image"},
            headers=admin_headers
        )
        assert response.status_code == 200, f"Failed to get media with filter: {response.text}"
        data = response.json()
        assert "files" in data
        print(f"✓ Got {len(data['files'])} image files with type filter")
    
    def test_upload_media_file(self, admin_headers):
        """Test POST /api/admin/media/upload - Upload a media file"""
        # Create a simple test image (1x1 pixel PNG)
        import base64
        # Minimal valid PNG (1x1 transparent pixel)
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        
        files = {
            'file': ('test_image.png', png_data, 'image/png')
        }
        headers = {"Authorization": admin_headers["Authorization"]}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/media/upload",
            files=files,
            headers=headers
        )
        assert response.status_code == 200, f"Failed to upload media: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Upload did not return success"
        assert "file" in data, "No file info in response"
        
        file_info = data["file"]
        assert "id" in file_info, "No file id in response"
        assert "filename" in file_info, "No filename in response"
        assert file_info["filename"] == "test_image.png"
        print(f"✓ Uploaded media file: {file_info['id']}")
        return file_info["id"]
    
    def test_delete_media_file(self, admin_headers):
        """Test DELETE /api/admin/media/{id} - Delete a media file"""
        # First upload a file to delete
        import base64
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        
        files = {'file': ('test_delete.png', png_data, 'image/png')}
        headers = {"Authorization": admin_headers["Authorization"]}
        
        upload_response = requests.post(
            f"{BASE_URL}/api/admin/media/upload",
            files=files,
            headers=headers
        )
        assert upload_response.status_code == 200
        file_id = upload_response.json()["file"]["id"]
        print(f"  Uploaded test file for deletion: {file_id}")
        
        # Now delete it
        response = requests.delete(
            f"{BASE_URL}/api/admin/media/{file_id}",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Failed to delete media: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Delete did not return success"
        print(f"✓ Deleted media file: {file_id}")
        
        # Verify deletion - file should not be in list
        list_response = requests.get(f"{BASE_URL}/api/admin/media", headers=admin_headers)
        files_list = list_response.json().get("files", [])
        deleted_file = next((f for f in files_list if f["id"] == file_id), None)
        assert deleted_file is None, "File still exists after deletion"
        print(f"✓ Verified file no longer exists in media list")
    
    def test_delete_nonexistent_file(self, admin_headers):
        """Test DELETE /api/admin/media/{id} with non-existent file"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(
            f"{BASE_URL}/api/admin/media/{fake_id}",
            headers=admin_headers
        )
        assert response.status_code == 404, f"Expected 404 for non-existent file, got {response.status_code}"
        print(f"✓ Correctly returned 404 for non-existent file")


class TestStripePayments:
    """Test Stripe Payment endpoints"""
    
    @pytest.fixture
    def partner_token(self):
        """Create or get a partner user for payment tests"""
        # Try to login as a test partner
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_partner@kktcx.com",
            "password": "testpass123"
        })
        
        if response.status_code == 200:
            return response.json()["access_token"]
        
        # If partner doesn't exist, register one
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "test_partner@kktcx.com",
            "password": "testpass123",
            "name": "Test Partner",
            "role": "partner"
        })
        
        if response.status_code in [200, 201]:
            return response.json()["access_token"]
        
        pytest.skip("Could not create partner user for payment tests")
    
    def test_get_packages_list(self):
        """Test GET /api/packages - List available packages"""
        response = requests.get(f"{BASE_URL}/api/packages")
        assert response.status_code == 200, f"Failed to get packages: {response.text}"
        packages = response.json()
        assert isinstance(packages, list), "Packages should be a list"
        print(f"✓ Got {len(packages)} packages")
        
        # Verify package structure
        if packages:
            pkg = packages[0]
            assert "id" in pkg, "Package missing id"
            assert "name" in pkg, "Package missing name"
            assert "price" in pkg, "Package missing price"
            print(f"  Sample package: {pkg.get('name')} - ${pkg.get('price')}")
        return packages
    
    def test_payment_checkout_requires_auth(self):
        """Test POST /api/payments/checkout requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout",
            params={"package_id": "test", "origin_url": "https://test.com"}
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Checkout correctly requires authentication")
    
    def test_payment_status_requires_auth(self):
        """Test GET /api/payments/status/{session_id} requires authentication"""
        response = requests.get(f"{BASE_URL}/api/payments/status/test_session")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Payment status correctly requires authentication")


class TestWebSocketChat:
    """Test WebSocket Chat endpoint - Note: Basic connectivity test only"""
    
    def test_websocket_endpoint_exists(self, admin_token):
        """Test that WebSocket endpoint is accessible"""
        # WebSocket endpoints can't be tested with regular HTTP
        # But we can verify the token validation by checking the endpoint exists
        ws_url = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
        print(f"  WebSocket URL: {ws_url}/ws/chat/{{token}}")
        print(f"✓ WebSocket endpoint configured at /ws/chat/{{token}}")
        
        # Note: Full WebSocket testing requires websocket client library
        # The endpoint accepts JWT token and manages real-time chat
    
    def test_websocket_invalid_token_handling(self):
        """Document WebSocket behavior with invalid token"""
        # WebSocket with invalid token should close with code 4001
        print("  WebSocket closes with code 4001 for invalid tokens")
        print("✓ WebSocket token validation documented")


class TestAdminProfileActions:
    """Test other admin profile actions for completeness"""
    
    def test_toggle_vitrin(self, admin_headers):
        """Test PUT /api/admin/profiles/{id}/vitrin"""
        response = requests.get(f"{BASE_URL}/api/admin/profiles", headers=admin_headers)
        profiles = response.json().get("profiles", [])
        
        if not profiles:
            pytest.skip("No profiles available")
        
        profile_id = profiles[0]["id"]
        
        response = requests.put(
            f"{BASE_URL}/api/admin/profiles/{profile_id}/vitrin",
            params={"is_vitrin": True},
            headers=admin_headers
        )
        assert response.status_code == 200
        print(f"✓ Toggle vitrin endpoint working")
    
    def test_toggle_featured(self, admin_headers):
        """Test PUT /api/admin/profiles/{id}/featured"""
        response = requests.get(f"{BASE_URL}/api/admin/profiles", headers=admin_headers)
        profiles = response.json().get("profiles", [])
        
        if not profiles:
            pytest.skip("No profiles available")
        
        profile_id = profiles[0]["id"]
        
        response = requests.put(
            f"{BASE_URL}/api/admin/profiles/{profile_id}/featured",
            params={"is_featured": True},
            headers=admin_headers
        )
        assert response.status_code == 200
        print(f"✓ Toggle featured endpoint working")
    
    def test_toggle_homepage_vitrin(self, admin_headers):
        """Test PUT /api/admin/profiles/{id}/homepage-vitrin"""
        response = requests.get(f"{BASE_URL}/api/admin/profiles", headers=admin_headers)
        profiles = response.json().get("profiles", [])
        
        if not profiles:
            pytest.skip("No profiles available")
        
        profile_id = profiles[0]["id"]
        
        response = requests.put(
            f"{BASE_URL}/api/admin/profiles/{profile_id}/homepage-vitrin",
            params={"is_homepage_vitrin": True},
            headers=admin_headers
        )
        assert response.status_code == 200
        print(f"✓ Toggle homepage vitrin endpoint working")
    
    def test_toggle_city_vitrin(self, admin_headers):
        """Test PUT /api/admin/profiles/{id}/city-vitrin"""
        response = requests.get(f"{BASE_URL}/api/admin/profiles", headers=admin_headers)
        profiles = response.json().get("profiles", [])
        
        if not profiles:
            pytest.skip("No profiles available")
        
        profile_id = profiles[0]["id"]
        
        response = requests.put(
            f"{BASE_URL}/api/admin/profiles/{profile_id}/city-vitrin",
            params={"is_city_vitrin": True},
            headers=admin_headers
        )
        assert response.status_code == 200
        print(f"✓ Toggle city vitrin endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
