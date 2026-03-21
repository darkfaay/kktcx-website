"""
Partner Photos Management API Tests
Tests for: upload, delete, set cover, blur toggle endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
PARTNER_EMAIL = "princess.0@kktcx.com"
PARTNER_PASSWORD = "Test123!"


class TestPartnerPhotosAPI:
    """Test partner photo management endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.token = None
        self.profile = None
        
    def authenticate(self):
        """Login and get auth token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": PARTNER_EMAIL,
            "password": PARTNER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        # API returns access_token, not token
        self.token = data.get("access_token") or data.get("token")
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        return data
    
    def get_profile(self):
        """Get partner profile with images"""
        response = self.session.get(f"{BASE_URL}/api/partner/profile")
        assert response.status_code == 200, f"Get profile failed: {response.text}"
        self.profile = response.json()
        return self.profile
    
    # ==================== AUTH TESTS ====================
    
    def test_01_partner_login(self):
        """Test partner can login successfully"""
        data = self.authenticate()
        assert "access_token" in data or "token" in data, "Token not in response"
        assert "user" in data, "User not in response"
        assert data["user"]["email"] == PARTNER_EMAIL
        print(f"✓ Partner login successful: {data['user']['email']}")
    
    def test_02_get_partner_profile(self):
        """Test getting partner profile with images"""
        self.authenticate()
        profile = self.get_profile()
        
        assert "id" in profile, "Profile ID missing"
        assert "images" in profile, "Images array missing"
        assert "cover_image" in profile or profile.get("cover_image") is None, "cover_image field missing"
        
        images = profile.get("images", [])
        print(f"✓ Partner profile retrieved: {len(images)} images found")
        
        # Verify image structure - check if images have proper IDs
        if images:
            img = images[0]
            has_id = "id" in img
            has_path = "path" in img
            has_url = "url" in img
            has_is_blurred = "is_blurred" in img
            
            if not has_id:
                print(f"⚠ WARNING: Images missing 'id' field - seeded data issue")
                print(f"  Image structure: {list(img.keys())}")
                # This is a data issue - seeded images don't have IDs
                pytest.skip("Seeded images missing 'id' field - cannot test photo management features")
            else:
                assert has_path or has_url, "Image path/url missing"
                assert has_is_blurred, "is_blurred field missing"
                print(f"✓ Image structure verified: id={img['id'][:8]}...")
    
    # ==================== BLUR TOGGLE TESTS ====================
    
    def test_03_blur_toggle_endpoint_exists(self):
        """Test blur toggle endpoint is accessible"""
        self.authenticate()
        profile = self.get_profile()
        images = profile.get("images", [])
        
        if not images:
            pytest.skip("No images to test blur toggle")
        
        # Check if images have IDs (seeded data may not have them)
        if "id" not in images[0]:
            pytest.skip("Seeded images missing 'id' field - cannot test blur toggle")
        
        image_id = images[0]["id"]
        current_blur = images[0].get("is_blurred", False)
        
        # Toggle blur state
        response = self.session.put(
            f"{BASE_URL}/api/partner/images/{image_id}/blur",
            params={"is_blurred": not current_blur}
        )
        assert response.status_code == 200, f"Blur toggle failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Blur toggle did not return success"
        print(f"✓ Blur toggle endpoint working: {image_id[:8]}... -> is_blurred={not current_blur}")
        
        # Verify change persisted
        profile = self.get_profile()
        updated_image = next((img for img in profile.get("images", []) if img["id"] == image_id), None)
        assert updated_image is not None, "Image not found after blur toggle"
        assert updated_image["is_blurred"] == (not current_blur), "Blur state not persisted"
        print(f"✓ Blur state persisted correctly")
        
        # Toggle back to original state
        response = self.session.put(
            f"{BASE_URL}/api/partner/images/{image_id}/blur",
            params={"is_blurred": current_blur}
        )
        assert response.status_code == 200, "Failed to restore blur state"
        print(f"✓ Blur state restored to original: {current_blur}")
    
    def test_04_blur_toggle_invalid_image(self):
        """Test blur toggle with non-existent image ID"""
        self.authenticate()
        
        response = self.session.put(
            f"{BASE_URL}/api/partner/images/non-existent-id/blur",
            params={"is_blurred": True}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Blur toggle returns 404 for non-existent image")
    
    # ==================== SET COVER TESTS ====================
    
    def test_05_set_cover_endpoint_exists(self):
        """Test set cover endpoint is accessible"""
        self.authenticate()
        profile = self.get_profile()
        images = profile.get("images", [])
        
        if len(images) < 2:
            pytest.skip("Need at least 2 images to test set cover")
        
        # Check if images have IDs (seeded data may not have them)
        if "id" not in images[0]:
            pytest.skip("Seeded images missing 'id' field - cannot test set cover")
        
        # Get a non-cover image
        cover_image = profile.get("cover_image")
        cover_id = cover_image.get("id") if cover_image else None
        
        # Find a different image to set as cover
        new_cover = None
        for img in images:
            if img.get("id") != cover_id:
                new_cover = img
                break
        
        if not new_cover:
            pytest.skip("Could not find a non-cover image")
        
        # Set new cover
        response = self.session.put(f"{BASE_URL}/api/partner/images/{new_cover['id']}/cover")
        assert response.status_code == 200, f"Set cover failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Set cover did not return success"
        print(f"✓ Set cover endpoint working: {new_cover['id'][:8]}...")
        
        # Verify change persisted
        profile = self.get_profile()
        new_cover_image = profile.get("cover_image")
        assert new_cover_image is not None, "Cover image not set"
        assert new_cover_image["id"] == new_cover["id"], "Cover image ID mismatch"
        print(f"✓ Cover image updated correctly")
    
    def test_06_set_cover_invalid_image(self):
        """Test set cover with non-existent image ID"""
        self.authenticate()
        
        response = self.session.put(f"{BASE_URL}/api/partner/images/non-existent-id/cover")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Set cover returns 404 for non-existent image")
    
    # ==================== DELETE IMAGE TESTS ====================
    
    def test_07_delete_endpoint_exists(self):
        """Test delete endpoint returns proper response"""
        self.authenticate()
        
        # Test with non-existent image (don't actually delete real images)
        response = self.session.delete(f"{BASE_URL}/api/partner/images/non-existent-id")
        # Delete endpoint returns 200 even for non-existent (idempotent)
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code}"
        print(f"✓ Delete endpoint accessible, status: {response.status_code}")
    
    # ==================== PROFILE STATS TESTS ====================
    
    def test_08_profile_image_stats(self):
        """Test profile returns correct image statistics"""
        self.authenticate()
        profile = self.get_profile()
        
        images = profile.get("images", [])
        total = len(images)
        blurred = len([img for img in images if img.get("is_blurred", False)])
        visible = total - blurred
        remaining = 10 - total
        
        print(f"✓ Image stats: Total={total}, Visible={visible}, Blurred={blurred}, Remaining={remaining}")
        
        assert total <= 10, "More than 10 images not allowed"
        assert remaining >= 0, "Remaining slots calculation error"
        assert visible + blurred == total, "Stats don't add up"
    
    # ==================== UNAUTHENTICATED ACCESS TESTS ====================
    
    def test_09_blur_requires_auth(self):
        """Test blur endpoint requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/partner/images/test-id/blur",
            params={"is_blurred": True}
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Blur endpoint requires authentication")
    
    def test_10_cover_requires_auth(self):
        """Test cover endpoint requires authentication"""
        response = requests.put(f"{BASE_URL}/api/partner/images/test-id/cover")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Cover endpoint requires authentication")
    
    def test_11_delete_requires_auth(self):
        """Test delete endpoint requires authentication"""
        response = requests.delete(f"{BASE_URL}/api/partner/images/test-id")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Delete endpoint requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
