"""
KKTCX Backend Modularization Regression Tests
Tests all API endpoints after refactoring from monolithic server.py to modular structure
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoints:
    """Health check endpoints - verify basic server functionality"""
    
    def test_health_endpoint(self):
        """GET /api/health - Health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("PASS: /api/health returns healthy status")
    
    def test_api_root(self):
        """GET /api - API info endpoint"""
        response = requests.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        print("PASS: /api returns API info")


class TestAuthEndpoints:
    """Authentication endpoints - login, register, me"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kktcx.com",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed - skipping authenticated tests")
    
    def test_login_success(self):
        """POST /api/auth/login - Admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kktcx.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "admin@kktcx.com"
        assert data["user"]["role"] == "admin"
        print("PASS: Admin login successful")
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login - Invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print("PASS: Invalid credentials returns 401")
    
    def test_register_new_user(self):
        """POST /api/auth/register - Register new user"""
        import uuid
        unique_email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "Test123!",
            "name": "Test User",
            "role": "user"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_email
        print(f"PASS: User registration successful for {unique_email}")
    
    def test_get_me_authenticated(self, admin_token):
        """GET /api/auth/me - Get current user"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "admin@kktcx.com"
        assert data["role"] == "admin"
        print("PASS: /api/auth/me returns current user")
    
    def test_get_me_unauthenticated(self):
        """GET /api/auth/me - Unauthenticated request"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("PASS: /api/auth/me returns 401 without token")


class TestPartnerEndpoints:
    """Partner profile endpoints"""
    
    def test_get_partners_list(self):
        """GET /api/partners - List partners"""
        response = requests.get(f"{BASE_URL}/api/partners")
        assert response.status_code == 200
        data = response.json()
        assert "profiles" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        print(f"PASS: /api/partners returns {data['total']} profiles")
    
    def test_get_partners_with_filters(self):
        """GET /api/partners - With filters"""
        response = requests.get(f"{BASE_URL}/api/partners", params={
            "min_age": 18,
            "max_age": 30,
            "sort_by": "newest",
            "page": 1,
            "limit": 10
        })
        assert response.status_code == 200
        data = response.json()
        assert "profiles" in data
        print("PASS: /api/partners with filters works")
    
    def test_get_partner_by_slug_not_found(self):
        """GET /api/partners/{slug} - Non-existent slug"""
        response = requests.get(f"{BASE_URL}/api/partners/non-existent-slug-12345")
        assert response.status_code == 404
        print("PASS: /api/partners/{slug} returns 404 for non-existent")


class TestCatalogEndpoints:
    """Catalog endpoints - cities, categories"""
    
    def test_get_cities(self):
        """GET /api/cities - List all cities"""
        response = requests.get(f"{BASE_URL}/api/cities")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/cities returns {len(data)} cities")
    
    def test_get_cities_with_lang(self):
        """GET /api/cities - With language parameter"""
        response = requests.get(f"{BASE_URL}/api/cities", params={"lang": "en"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print("PASS: /api/cities with lang=en works")
    
    def test_get_categories(self):
        """GET /api/categories - List all categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/categories returns {len(data)} categories")


class TestAdminEndpoints:
    """Admin endpoints - require admin authentication"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kktcx.com",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed - skipping admin tests")
    
    def test_admin_dashboard(self, admin_token):
        """GET /api/admin/dashboard - Admin dashboard stats"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_partners" in data
        assert "total_profiles" in data
        assert "pending_profiles" in data
        assert "approved_profiles" in data
        assert "total_views" in data
        assert "total_appointments" in data
        print(f"PASS: /api/admin/dashboard - Users: {data['total_users']}, Partners: {data['total_partners']}")
    
    def test_admin_users(self, admin_token):
        """GET /api/admin/users - List users"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
        assert "page" in data
        print(f"PASS: /api/admin/users returns {data['total']} users")
    
    def test_admin_partners(self, admin_token):
        """GET /api/admin/partners - List partners"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/partners", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
        print(f"PASS: /api/admin/partners returns {data['total']} partners")
    
    def test_admin_profiles(self, admin_token):
        """GET /api/admin/profiles - List profiles"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/profiles", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "profiles" in data
        assert "total" in data
        print(f"PASS: /api/admin/profiles returns {data['total']} profiles")
    
    def test_admin_appointments(self, admin_token):
        """GET /api/admin/appointments - List appointments"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/appointments", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "appointments" in data
        assert "total" in data
        print(f"PASS: /api/admin/appointments returns {data['total']} appointments")
    
    def test_admin_appointments_stats(self, admin_token):
        """GET /api/admin/appointments/stats - Appointment statistics"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/appointments/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "pending" in data
        assert "confirmed" in data
        assert "completed" in data
        assert "cancelled" in data
        print(f"PASS: /api/admin/appointments/stats - Total: {data['total']}")
    
    def test_admin_reports(self, admin_token):
        """GET /api/admin/reports - Analytics reports"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/reports", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        assert "top_profiles" in data
        assert "chart_data" in data
        print("PASS: /api/admin/reports returns analytics data")
    
    def test_admin_reports_with_period(self, admin_token):
        """GET /api/admin/reports - With period parameter"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/reports", headers=headers, params={"period": "month"})
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        print("PASS: /api/admin/reports with period=month works")
    
    def test_admin_unauthorized(self):
        """Admin endpoints without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard")
        assert response.status_code == 401
        print("PASS: Admin endpoints return 401 without auth")


class TestContentEndpoints:
    """Content and SEO endpoints"""
    
    def test_get_page_content(self):
        """GET /api/content/{page} - Get page content"""
        response = requests.get(f"{BASE_URL}/api/content/home")
        assert response.status_code == 200
        print("PASS: /api/content/{page} works")
    
    def test_get_page_seo(self):
        """GET /api/seo/{page} - Get page SEO"""
        response = requests.get(f"{BASE_URL}/api/seo/home")
        assert response.status_code == 200
        print("PASS: /api/seo/{page} works")


class TestSEOEndpoints:
    """SEO-related endpoints"""
    
    def test_robots_txt(self):
        """GET /robots.txt - Robots file"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        assert "User-agent" in response.text
        print("PASS: /robots.txt returns valid content")
    
    def test_sitemap_xml(self):
        """GET /sitemap.xml - Sitemap"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200
        assert "<?xml" in response.text
        assert "urlset" in response.text
        print("PASS: /sitemap.xml returns valid XML")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
