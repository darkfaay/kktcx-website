"""
KKTCX Iteration 10 Tests
Testing: Admin menu restructuring and new pages (Appointments, Reports)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://partner-listing-demo.preview.emergentagent.com')

class TestAdminAuth:
    """Admin authentication tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kktcx.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        return data["access_token"]
    
    def test_admin_login(self):
        """Test admin login endpoint"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kktcx.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        print("Admin login: PASS")


class TestAdminAppointmentsAPI:
    """Admin Appointments API tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kktcx.com",
            "password": "admin123"
        })
        return response.json()["access_token"]
    
    def test_get_appointments_list(self, admin_token):
        """Test GET /api/admin/appointments returns appointments list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/appointments",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "appointments" in data
        assert "total" in data
        assert "page" in data
        assert "limit" in data
        assert "pages" in data
        
        # Verify appointments is a list
        assert isinstance(data["appointments"], list)
        print(f"Appointments list: PASS (total: {data['total']})")
    
    def test_get_appointments_with_status_filter(self, admin_token):
        """Test GET /api/admin/appointments with status filter"""
        response = requests.get(
            f"{BASE_URL}/api/admin/appointments?status=pending",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # All returned appointments should have pending status
        for appt in data["appointments"]:
            assert appt["status"] == "pending"
        print("Appointments filter by status: PASS")
    
    def test_get_appointments_stats(self, admin_token):
        """Test GET /api/admin/appointments/stats returns statistics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/appointments/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify all required stats fields
        required_fields = ["total", "pending", "confirmed", "completed", "cancelled"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
            assert isinstance(data[field], int), f"Field {field} should be integer"
        
        print(f"Appointments stats: PASS (total: {data['total']}, pending: {data['pending']})")
    
    def test_appointments_requires_admin(self):
        """Test that appointments endpoint requires admin authentication"""
        # Without token
        response = requests.get(f"{BASE_URL}/api/admin/appointments")
        assert response.status_code == 401
        
        # With invalid token
        response = requests.get(
            f"{BASE_URL}/api/admin/appointments",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401
        print("Appointments auth required: PASS")
    
    def test_appointment_enrichment(self, admin_token):
        """Test that appointments are enriched with partner and user info"""
        response = requests.get(
            f"{BASE_URL}/api/admin/appointments",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        if data["appointments"]:
            appt = data["appointments"][0]
            # Check enriched fields
            assert "partner_name" in appt or "partner_id" in appt
            assert "user_name" in appt or "user_id" in appt
            print("Appointment enrichment: PASS")
        else:
            print("Appointment enrichment: SKIPPED (no appointments)")


class TestAdminReportsAPI:
    """Admin Reports API tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kktcx.com",
            "password": "admin123"
        })
        return response.json()["access_token"]
    
    def test_get_reports_week(self, admin_token):
        """Test GET /api/admin/reports with week period"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reports?period=week",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "stats" in data
        assert "top_profiles" in data
        assert "chart_data" in data
        
        # Verify stats structure
        stats = data["stats"]
        required_stats = ["revenue", "views", "users", "appointments"]
        for stat in required_stats:
            assert stat in stats, f"Missing stat: {stat}"
            assert "total" in stats[stat], f"Missing total in {stat}"
        
        print(f"Reports (week): PASS (views: {stats['views']['total']})")
    
    def test_get_reports_month(self, admin_token):
        """Test GET /api/admin/reports with month period"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reports?period=month",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        print("Reports (month): PASS")
    
    def test_get_reports_year(self, admin_token):
        """Test GET /api/admin/reports with year period"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reports?period=year",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        print("Reports (year): PASS")
    
    def test_reports_top_profiles(self, admin_token):
        """Test that reports include top viewed profiles"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reports?period=week",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "top_profiles" in data
        assert isinstance(data["top_profiles"], list)
        
        if data["top_profiles"]:
            profile = data["top_profiles"][0]
            assert "nickname" in profile
            assert "view_count" in profile or "views" in profile
            print(f"Top profiles: PASS (count: {len(data['top_profiles'])})")
        else:
            print("Top profiles: PASS (empty list)")
    
    def test_reports_chart_data(self, admin_token):
        """Test that reports include chart data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reports?period=week",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "chart_data" in data
        chart_data = data["chart_data"]
        
        # Check for views and revenue charts
        assert "views" in chart_data
        assert "revenue" in chart_data
        
        # Verify chart data structure
        if chart_data["views"]:
            assert "label" in chart_data["views"][0]
            assert "value" in chart_data["views"][0]
        
        print("Chart data: PASS")
    
    def test_reports_requires_admin(self):
        """Test that reports endpoint requires admin authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/reports")
        assert response.status_code == 401
        print("Reports auth required: PASS")


class TestAdminDashboard:
    """Admin Dashboard API tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kktcx.com",
            "password": "admin123"
        })
        return response.json()["access_token"]
    
    def test_dashboard_stats(self, admin_token):
        """Test GET /api/admin/dashboard returns stats"""
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        required_fields = [
            "total_users", "total_partners", "active_partners",
            "pending_profiles", "approved_profiles"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"Dashboard stats: PASS (users: {data['total_users']}, partners: {data['total_partners']})")


class TestExistingAdminEndpoints:
    """Test existing admin endpoints still work"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kktcx.com",
            "password": "admin123"
        })
        return response.json()["access_token"]
    
    def test_admin_users(self, admin_token):
        """Test GET /api/admin/users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
        print(f"Admin users: PASS (total: {data['total']})")
    
    def test_admin_profiles(self, admin_token):
        """Test GET /api/admin/profiles"""
        response = requests.get(
            f"{BASE_URL}/api/admin/profiles",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "profiles" in data
        assert "total" in data
        print(f"Admin profiles: PASS (total: {data['total']})")
    
    def test_admin_settings(self, admin_token):
        """Test GET /api/admin/settings"""
        response = requests.get(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print("Admin settings: PASS")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
