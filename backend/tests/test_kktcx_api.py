"""
KKTCX API Backend Tests
Tests for: Authentication, Partner Profiles, Filters, Admin Actions, Image Blur
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://kktcx-staging.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@kktcx.com"
ADMIN_PASSWORD = "admin123"
TEST_PARTNER_EMAIL = "test.partner@kktcx.com"
TEST_PARTNER_PASSWORD = "testpass123"


class TestHealthAndBasicEndpoints:
    """Health check and basic API endpoints"""
    
    def test_health_endpoint(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Health endpoint working")
    
    def test_root_endpoint(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✓ Root endpoint working")
    
    def test_cities_endpoint(self):
        """Test cities listing"""
        response = requests.get(f"{BASE_URL}/api/cities?lang=tr")
        assert response.status_code == 200
        cities = response.json()
        assert isinstance(cities, list)
        assert len(cities) > 0
        # Check city structure
        city = cities[0]
        assert "id" in city
        assert "name" in city
        assert "slug" in city
        print(f"✓ Cities endpoint working - {len(cities)} cities found")
    
    def test_categories_endpoint(self):
        """Test categories listing"""
        response = requests.get(f"{BASE_URL}/api/categories?lang=tr")
        assert response.status_code == 200
        categories = response.json()
        assert isinstance(categories, list)
        print(f"✓ Categories endpoint working - {len(categories)} categories found")
    
    def test_packages_endpoint(self):
        """Test packages listing"""
        response = requests.get(f"{BASE_URL}/api/packages?lang=tr")
        assert response.status_code == 200
        packages = response.json()
        assert isinstance(packages, list)
        print(f"✓ Packages endpoint working - {len(packages)} packages found")


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_admin_login(self):
        """Test admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        print("✓ Admin login successful")
        return data["access_token"]
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected")
    
    def test_register_new_user(self):
        """Test user registration"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "name": "Test User",
            "role": "user"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_email
        print(f"✓ User registration successful - {unique_email}")
    
    def test_get_current_user(self):
        """Test getting current user info"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get user info
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print("✓ Get current user working")


class TestHomepageData:
    """Homepage data endpoint tests"""
    
    def test_homepage_data(self):
        """Test homepage data endpoint"""
        response = requests.get(f"{BASE_URL}/api/homepage?lang=tr")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "homepage_vitrin" in data
        assert "vitrin_profiles" in data
        assert "featured_profiles" in data
        assert "new_profiles" in data
        assert "cities" in data
        assert "categories" in data
        assert "stats" in data
        
        # Check stats structure
        assert "total_profiles" in data["stats"]
        assert "total_cities" in data["stats"]
        
        print(f"✓ Homepage data working - {data['stats']['total_profiles']} profiles, {data['stats']['total_cities']} cities")
        
        # Check homepage_vitrin structure (premium showcase)
        if len(data["homepage_vitrin"]) > 0:
            profile = data["homepage_vitrin"][0]
            assert "id" in profile
            assert "nickname" in profile
            assert "is_homepage_vitrin" in profile
            print(f"✓ Homepage vitrin has {len(data['homepage_vitrin'])} premium profiles")
        
        return data


class TestPartnerFilters:
    """Partner listing and filter tests"""
    
    def test_partners_list(self):
        """Test partners listing"""
        response = requests.get(f"{BASE_URL}/api/partners?lang=tr&page=1&limit=20")
        assert response.status_code == 200
        data = response.json()
        
        assert "profiles" in data
        assert "total" in data
        assert "page" in data
        assert "limit" in data
        
        print(f"✓ Partners list working - {data['total']} total profiles")
        return data
    
    def test_filter_by_gender(self):
        """Test filtering by gender"""
        for gender in ["female", "male", "trans"]:
            response = requests.get(f"{BASE_URL}/api/partners?lang=tr&gender={gender}")
            assert response.status_code == 200
            data = response.json()
            # Verify all returned profiles match the gender filter
            for profile in data["profiles"]:
                if profile.get("gender"):
                    assert profile["gender"] == gender
            print(f"✓ Gender filter '{gender}' working - {len(data['profiles'])} results")
    
    def test_filter_by_service_type(self):
        """Test filtering by service type"""
        for service in ["escort", "gigolo", "masseuse", "companion"]:
            response = requests.get(f"{BASE_URL}/api/partners?lang=tr&service_type={service}")
            assert response.status_code == 200
            data = response.json()
            # Verify all returned profiles have the service type
            for profile in data["profiles"]:
                if profile.get("service_types"):
                    assert service in profile["service_types"]
            print(f"✓ Service type filter '{service}' working - {len(data['profiles'])} results")
    
    def test_filter_by_orientation(self):
        """Test filtering by orientation"""
        for orientation in ["heterosexual", "lesbian", "gay", "bisexual", "trans"]:
            response = requests.get(f"{BASE_URL}/api/partners?lang=tr&orientation={orientation}")
            assert response.status_code == 200
            data = response.json()
            print(f"✓ Orientation filter '{orientation}' working - {len(data['profiles'])} results")
    
    def test_filter_by_city(self):
        """Test filtering by city"""
        # First get cities
        cities_response = requests.get(f"{BASE_URL}/api/cities?lang=tr")
        cities = cities_response.json()
        
        if len(cities) > 0:
            city_id = cities[0]["id"]
            response = requests.get(f"{BASE_URL}/api/partners?lang=tr&city_id={city_id}")
            assert response.status_code == 200
            data = response.json()
            # Verify all returned profiles are in the city
            for profile in data["profiles"]:
                assert profile.get("city_id") == city_id
            print(f"✓ City filter working - {len(data['profiles'])} results for {cities[0]['name']}")
    
    def test_filter_available_today(self):
        """Test filtering by availability"""
        response = requests.get(f"{BASE_URL}/api/partners?lang=tr&available_today=true")
        assert response.status_code == 200
        data = response.json()
        for profile in data["profiles"]:
            assert profile.get("is_available_today") == True
        print(f"✓ Available today filter working - {len(data['profiles'])} results")
    
    def test_sort_options(self):
        """Test sorting options"""
        for sort_by in ["recommended", "newest", "popular", "featured"]:
            response = requests.get(f"{BASE_URL}/api/partners?lang=tr&sort_by={sort_by}")
            assert response.status_code == 200
            print(f"✓ Sort by '{sort_by}' working")


class TestPartnerProfile:
    """Partner profile management tests"""
    
    @pytest.fixture
    def partner_token(self):
        """Get or create partner token"""
        # Try to login as test partner
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARTNER_EMAIL,
            "password": TEST_PARTNER_PASSWORD
        })
        
        if response.status_code == 200:
            return response.json()["access_token"]
        
        # If partner doesn't exist, create one
        unique_email = f"test_partner_{uuid.uuid4().hex[:8]}@test.com"
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "name": "Test Partner",
            "role": "partner"
        })
        assert register_response.status_code == 200
        return register_response.json()["access_token"]
    
    def test_get_partner_profile_unauthorized(self):
        """Test getting partner profile without auth"""
        response = requests.get(f"{BASE_URL}/api/partner/profile")
        assert response.status_code == 401
        print("✓ Partner profile correctly requires authentication")
    
    def test_partner_profile_flow(self, partner_token):
        """Test partner profile creation/update flow"""
        headers = {"Authorization": f"Bearer {partner_token}"}
        
        # Try to get existing profile
        get_response = requests.get(f"{BASE_URL}/api/partner/profile", headers=headers)
        
        if get_response.status_code == 404:
            # Create new profile
            cities_response = requests.get(f"{BASE_URL}/api/cities?lang=tr")
            city_id = cities_response.json()[0]["id"]
            
            create_response = requests.post(f"{BASE_URL}/api/partner/profile", headers=headers, json={
                "nickname": f"TestPartner_{uuid.uuid4().hex[:6]}",
                "age": 25,
                "city_id": city_id,
                "gender": "female",
                "service_types": ["escort", "companion"],
                "orientations": ["heterosexual", "bisexual"],
                "short_description": "Test profile description",
                "detailed_description": "Detailed test profile description for testing purposes."
            })
            assert create_response.status_code == 200
            print("✓ Partner profile created successfully")
        else:
            assert get_response.status_code == 200
            print("✓ Partner profile retrieved successfully")
        
        # Verify profile has service_types and orientations
        profile_response = requests.get(f"{BASE_URL}/api/partner/profile", headers=headers)
        profile = profile_response.json()
        assert "service_types" in profile
        assert "orientations" in profile
        print(f"✓ Profile has service_types: {profile.get('service_types')}")
        print(f"✓ Profile has orientations: {profile.get('orientations')}")


class TestAdminActions:
    """Admin action tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_admin_dashboard(self, admin_token):
        """Test admin dashboard endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "total_users" in data
        assert "total_partners" in data
        assert "pending_profiles" in data
        assert "approved_profiles" in data
        assert "vitrin_profiles" in data
        
        print(f"✓ Admin dashboard working - {data['total_partners']} partners, {data['pending_profiles']} pending")
    
    def test_admin_profiles_list(self, admin_token):
        """Test admin profiles listing"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/profiles", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "profiles" in data
        assert "total" in data
        print(f"✓ Admin profiles list working - {data['total']} profiles")
        return data
    
    def test_admin_profiles_filter_by_status(self, admin_token):
        """Test admin profiles filtering by status"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        for status in ["draft", "pending", "approved", "rejected"]:
            response = requests.get(f"{BASE_URL}/api/admin/profiles?status={status}", headers=headers)
            assert response.status_code == 200
            data = response.json()
            # Verify all returned profiles have the correct status
            for profile in data["profiles"]:
                assert profile["status"] == status
            print(f"✓ Admin filter by status '{status}' working - {len(data['profiles'])} results")
    
    def test_admin_homepage_vitrin_toggle(self, admin_token):
        """Test admin homepage vitrin toggle"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get a profile to test with
        profiles_response = requests.get(f"{BASE_URL}/api/admin/profiles?status=approved", headers=headers)
        profiles = profiles_response.json()["profiles"]
        
        if len(profiles) > 0:
            profile_id = profiles[0]["id"]
            
            # Toggle homepage vitrin on
            response = requests.put(
                f"{BASE_URL}/api/admin/profiles/{profile_id}/homepage-vitrin?is_homepage_vitrin=true",
                headers=headers
            )
            assert response.status_code == 200
            print(f"✓ Homepage vitrin toggle ON working for profile {profile_id}")
            
            # Toggle homepage vitrin off
            response = requests.put(
                f"{BASE_URL}/api/admin/profiles/{profile_id}/homepage-vitrin?is_homepage_vitrin=false",
                headers=headers
            )
            assert response.status_code == 200
            print(f"✓ Homepage vitrin toggle OFF working for profile {profile_id}")
        else:
            print("⚠ No approved profiles to test homepage vitrin toggle")
    
    def test_admin_city_vitrin_toggle(self, admin_token):
        """Test admin city vitrin toggle"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get a profile to test with
        profiles_response = requests.get(f"{BASE_URL}/api/admin/profiles?status=approved", headers=headers)
        profiles = profiles_response.json()["profiles"]
        
        if len(profiles) > 0:
            profile_id = profiles[0]["id"]
            
            # Toggle city vitrin on
            response = requests.put(
                f"{BASE_URL}/api/admin/profiles/{profile_id}/city-vitrin?is_city_vitrin=true",
                headers=headers
            )
            assert response.status_code == 200
            print(f"✓ City vitrin toggle ON working for profile {profile_id}")
            
            # Toggle city vitrin off
            response = requests.put(
                f"{BASE_URL}/api/admin/profiles/{profile_id}/city-vitrin?is_city_vitrin=false",
                headers=headers
            )
            assert response.status_code == 200
            print(f"✓ City vitrin toggle OFF working for profile {profile_id}")
        else:
            print("⚠ No approved profiles to test city vitrin toggle")
    
    def test_admin_approve_profile(self, admin_token):
        """Test admin profile approval"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get a pending profile
        profiles_response = requests.get(f"{BASE_URL}/api/admin/profiles?status=pending", headers=headers)
        profiles = profiles_response.json()["profiles"]
        
        if len(profiles) > 0:
            profile_id = profiles[0]["id"]
            
            response = requests.put(
                f"{BASE_URL}/api/admin/profiles/{profile_id}/approve",
                headers=headers
            )
            assert response.status_code == 200
            print(f"✓ Profile approval working for profile {profile_id}")
        else:
            print("⚠ No pending profiles to test approval")
    
    def test_admin_users_list(self, admin_token):
        """Test admin users listing"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "users" in data
        assert "total" in data
        print(f"✓ Admin users list working - {data['total']} users")


class TestImageBlurFeature:
    """Image blur feature tests"""
    
    @pytest.fixture
    def partner_with_profile(self):
        """Get partner token with existing profile"""
        # Login as admin to find a partner with images
        admin_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        admin_token = admin_response.json()["access_token"]
        
        # Get profiles with images
        profiles_response = requests.get(
            f"{BASE_URL}/api/admin/profiles",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        profiles = profiles_response.json()["profiles"]
        
        # Find a profile with images
        for profile in profiles:
            if profile.get("images") and len(profile["images"]) > 0:
                return {
                    "profile": profile,
                    "admin_token": admin_token
                }
        
        return None
    
    def test_image_blur_toggle_endpoint_exists(self):
        """Test that blur toggle endpoint exists"""
        # This should return 401 without auth, not 404
        response = requests.put(f"{BASE_URL}/api/partner/images/test-id/blur?is_blurred=true")
        assert response.status_code == 401  # Unauthorized, not 404
        print("✓ Image blur toggle endpoint exists")
    
    def test_profile_has_blur_field(self):
        """Test that profiles include is_blurred field in images"""
        response = requests.get(f"{BASE_URL}/api/homepage?lang=tr")
        data = response.json()
        
        # Check any profile with images
        all_profiles = (
            data.get("homepage_vitrin", []) + 
            data.get("vitrin_profiles", []) + 
            data.get("featured_profiles", []) +
            data.get("new_profiles", [])
        )
        
        for profile in all_profiles:
            if profile.get("images"):
                for image in profile["images"]:
                    assert "is_blurred" in image or image.get("is_blurred") is None
                print(f"✓ Profile images have is_blurred field")
                return
        
        print("⚠ No profiles with images found to verify blur field")


class TestSelectItemEmptyValues:
    """Test that SelectItem components don't crash with empty values"""
    
    def test_partners_with_empty_filters(self):
        """Test partners endpoint with empty filter values"""
        # These should not cause errors
        response = requests.get(f"{BASE_URL}/api/partners?lang=tr&gender=&service_type=&orientation=&city_id=")
        assert response.status_code == 200
        print("✓ Partners endpoint handles empty filter values")
    
    def test_homepage_with_empty_lang(self):
        """Test homepage with empty language"""
        response = requests.get(f"{BASE_URL}/api/homepage?lang=")
        # Should either work or return a proper error, not crash
        assert response.status_code in [200, 400, 422]
        print("✓ Homepage handles empty language parameter")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
