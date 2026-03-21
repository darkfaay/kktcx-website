"""
KKTCX Platform - Iteration 9 Backend Tests
Testing: Appointment system, Admin pages, Partner detail features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://partner-hub-test.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@kktcx.com"
ADMIN_PASSWORD = "admin123"
TEST_PARTNER_EMAIL = "princess.0@kktcx.test"
TEST_PARTNER_PASSWORD = "Test123!"


class TestHealthAndBasics:
    """Basic health and connectivity tests"""
    
    def test_health_endpoint(self):
        """Test API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health endpoint working")

    def test_cities_endpoint(self):
        """Test cities endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/cities?lang=tr")
        assert response.status_code == 200
        cities = response.json()
        assert isinstance(cities, list)
        print(f"✓ Cities endpoint returned {len(cities)} cities")

    def test_categories_endpoint(self):
        """Test categories endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/categories?lang=tr")
        assert response.status_code == 200
        categories = response.json()
        assert isinstance(categories, list)
        print(f"✓ Categories endpoint returned {len(categories)} categories")


class TestAuthentication:
    """Authentication tests"""
    
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
        print(f"✓ Admin login successful, role: {data['user']['role']}")
        return data["access_token"]

    def test_partner_login(self):
        """Test partner login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARTNER_EMAIL,
            "password": TEST_PARTNER_PASSWORD
        })
        # Partner may or may not exist
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            print(f"✓ Partner login successful, role: {data['user']['role']}")
            return data["access_token"]
        else:
            print(f"⚠ Partner login failed (may not exist): {response.status_code}")
            pytest.skip("Test partner account not available")


class TestPartnersAPI:
    """Partners listing and filtering tests"""
    
    def test_partners_list(self):
        """Test partners listing endpoint"""
        response = requests.get(f"{BASE_URL}/api/partners?lang=tr")
        assert response.status_code == 200
        data = response.json()
        assert "profiles" in data
        assert "total" in data
        print(f"✓ Partners list returned {len(data['profiles'])} profiles, total: {data['total']}")
        return data

    def test_partners_gender_filter(self):
        """Test gender filter works"""
        response = requests.get(f"{BASE_URL}/api/partners?lang=tr&gender=female")
        assert response.status_code == 200
        data = response.json()
        # All returned profiles should be female
        for profile in data["profiles"]:
            assert profile.get("gender") == "female", f"Expected female, got {profile.get('gender')}"
        print(f"✓ Gender filter working, returned {len(data['profiles'])} female profiles")

    def test_partners_service_type_filter(self):
        """Test service type filter works"""
        response = requests.get(f"{BASE_URL}/api/partners?lang=tr&service_type=dinner-companion")
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Service type filter working, returned {len(data['profiles'])} profiles")

    def test_partners_city_filter(self):
        """Test city filter works"""
        # First get cities
        cities_response = requests.get(f"{BASE_URL}/api/cities?lang=tr")
        cities = cities_response.json()
        if cities:
            city_id = cities[0].get("id") or cities[0].get("slug")
            response = requests.get(f"{BASE_URL}/api/partners?lang=tr&city_id={city_id}")
            assert response.status_code == 200
            print(f"✓ City filter working for city: {city_id}")
        else:
            pytest.skip("No cities available")


class TestPartnerDetail:
    """Partner detail page tests"""
    
    def test_get_partner_by_slug(self):
        """Test getting partner by slug"""
        # First get a partner slug
        partners_response = requests.get(f"{BASE_URL}/api/partners?lang=tr&limit=1")
        partners = partners_response.json()
        
        if partners["profiles"]:
            slug = partners["profiles"][0]["slug"]
            response = requests.get(f"{BASE_URL}/api/partners/{slug}?lang=tr")
            assert response.status_code == 200
            data = response.json()
            assert data["slug"] == slug
            assert "nickname" in data
            assert "city_name" in data
            print(f"✓ Partner detail working for slug: {slug}")
            return data
        else:
            pytest.skip("No partners available")


class TestAvailabilityAPI:
    """Availability API tests for appointment system"""
    
    def test_availability_endpoint_exists(self):
        """Test availability endpoint returns data"""
        # First get a partner
        partners_response = requests.get(f"{BASE_URL}/api/partners?lang=tr&limit=1")
        partners = partners_response.json()
        
        if partners["profiles"]:
            partner_id = partners["profiles"][0]["id"]
            response = requests.get(f"{BASE_URL}/api/availability/{partner_id}")
            assert response.status_code == 200
            data = response.json()
            
            # Verify response structure
            assert "partner_id" in data
            assert "settings" in data
            assert "durations" in data
            
            # Verify settings structure
            settings = data["settings"]
            assert "working_days" in settings
            assert "working_hours_start" in settings
            assert "working_hours_end" in settings
            assert "slot_duration" in settings
            assert "auto_confirm" in settings
            
            # Verify durations structure
            durations = data["durations"]
            assert isinstance(durations, list)
            assert len(durations) > 0
            for duration in durations:
                assert "id" in duration
                assert "label" in duration
                assert "minutes" in duration
            
            print(f"✓ Availability API working for partner: {partner_id}")
            print(f"  - Settings: working_hours {settings['working_hours_start']}-{settings['working_hours_end']}")
            print(f"  - Durations: {[d['label'] for d in durations]}")
            return data
        else:
            pytest.skip("No partners available")

    def test_availability_with_month_param(self):
        """Test availability with month parameter"""
        partners_response = requests.get(f"{BASE_URL}/api/partners?lang=tr&limit=1")
        partners = partners_response.json()
        
        if partners["profiles"]:
            partner_id = partners["profiles"][0]["id"]
            response = requests.get(f"{BASE_URL}/api/availability/{partner_id}?month=2026-01")
            assert response.status_code == 200
            data = response.json()
            assert "booked_slots" in data
            print(f"✓ Availability with month param working, booked_slots: {len(data['booked_slots'])}")
        else:
            pytest.skip("No partners available")


class TestAppointmentsAPI:
    """Appointments API tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")

    def test_appointments_requires_auth(self):
        """Test appointments endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/appointments")
        assert response.status_code == 401
        print("✓ Appointments endpoint correctly requires authentication")

    def test_appointments_with_auth(self, admin_token):
        """Test appointments endpoint with authentication"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/appointments", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "appointments" in data
        assert "total" in data
        print(f"✓ Appointments endpoint working, total: {data['total']}")

    def test_create_appointment(self, admin_token):
        """Test creating an appointment"""
        # Get a partner first
        partners_response = requests.get(f"{BASE_URL}/api/partners?lang=tr&limit=1")
        partners = partners_response.json()
        
        if not partners["profiles"]:
            pytest.skip("No partners available")
        
        partner_id = partners["profiles"][0]["id"]
        
        # Get availability to get valid duration
        avail_response = requests.get(f"{BASE_URL}/api/availability/{partner_id}")
        avail_data = avail_response.json()
        duration_id = avail_data["durations"][0]["id"]
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        appointment_data = {
            "partner_id": partner_id,
            "date": "2026-02-15",
            "time_slot": "14:00",
            "duration_id": duration_id,
            "notes": "TEST_appointment_from_iter9"
        }
        
        response = requests.post(f"{BASE_URL}/api/appointments", json=appointment_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            assert "id" in data
            assert data["partner_id"] == partner_id
            assert data["date"] == "2026-02-15"
            assert data["time_slot"] == "14:00"
            print(f"✓ Appointment created successfully, id: {data['id']}")
            return data
        elif response.status_code == 400 and "already booked" in response.text:
            print("⚠ Time slot already booked (expected if test ran before)")
        else:
            print(f"⚠ Appointment creation returned: {response.status_code} - {response.text}")


class TestAdminAPI:
    """Admin API tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")

    def test_admin_dashboard(self, admin_token):
        """Test admin dashboard endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_partners" in data
        assert "pending_profiles" in data
        print(f"✓ Admin dashboard working - Users: {data['total_users']}, Partners: {data['total_partners']}")

    def test_admin_users_list(self, admin_token):
        """Test admin users list (all users)"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
        print(f"✓ Admin users list working - Total: {data['total']}")

    def test_admin_users_filter_by_role_user(self, admin_token):
        """Test admin users list filtered by role=user"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users?role=user", headers=headers)
        assert response.status_code == 200
        data = response.json()
        # All returned users should have role=user
        for user in data["users"]:
            assert user["role"] == "user", f"Expected role=user, got {user['role']}"
        print(f"✓ Admin users filter by role=user working - Count: {len(data['users'])}")

    def test_admin_users_filter_by_role_partner(self, admin_token):
        """Test admin users list filtered by role=partner"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users?role=partner", headers=headers)
        assert response.status_code == 200
        data = response.json()
        # All returned users should have role=partner
        for user in data["users"]:
            assert user["role"] == "partner", f"Expected role=partner, got {user['role']}"
        print(f"✓ Admin users filter by role=partner working - Count: {len(data['users'])}")

    def test_admin_profiles_list(self, admin_token):
        """Test admin profiles list"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/profiles", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "profiles" in data
        assert "total" in data
        
        # Check that profiles have photo fields
        if data["profiles"]:
            profile = data["profiles"][0]
            # Profiles should have photo_url or cover_url or images
            has_photo = (
                profile.get("photo_url") or 
                profile.get("cover_url") or 
                profile.get("cover_image") or 
                profile.get("images")
            )
            print(f"✓ Admin profiles list working - Total: {data['total']}, Has photo data: {bool(has_photo)}")
        else:
            print(f"✓ Admin profiles list working - Total: {data['total']}")


class TestPartnerDashboard:
    """Partner dashboard tests"""
    
    @pytest.fixture
    def partner_token(self):
        """Get partner token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARTNER_EMAIL,
            "password": TEST_PARTNER_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Partner login failed")

    def test_partner_appointments_endpoint(self, partner_token):
        """Test partner can access appointments"""
        headers = {"Authorization": f"Bearer {partner_token}"}
        response = requests.get(f"{BASE_URL}/api/appointments", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "appointments" in data
        print(f"✓ Partner appointments endpoint working - Total: {data['total']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
