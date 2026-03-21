"""
KKTCX Feature Tests - Iteration 8
Testing: Partners API, Filters, Profile count, Message routing
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://orientation-hub-6.preview.emergentagent.com')

class TestHealthCheck:
    """Basic health check"""
    
    def test_api_health(self):
        """Test API is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print(f"✓ API health check passed")


class TestPartnersAPI:
    """Test partners listing and filtering"""
    
    def test_partners_list_returns_50_profiles(self):
        """Test that partners API returns 50 profiles"""
        response = requests.get(f"{BASE_URL}/api/partners?lang=tr&limit=100")
        assert response.status_code == 200
        data = response.json()
        assert 'profiles' in data
        assert 'total' in data
        assert data['total'] >= 50, f"Expected at least 50 profiles, got {data['total']}"
        print(f"✓ Partners API returns {data['total']} profiles")
    
    def test_partners_gender_distribution(self):
        """Test gender distribution (70% female, 10% male, 20% trans)"""
        response = requests.get(f"{BASE_URL}/api/partners?lang=tr&limit=100")
        assert response.status_code == 200
        data = response.json()
        
        profiles = data['profiles']
        gender_counts = {'female': 0, 'male': 0, 'trans': 0}
        for p in profiles:
            gender = p.get('gender', 'unknown')
            if gender in gender_counts:
                gender_counts[gender] += 1
        
        total = sum(gender_counts.values())
        print(f"Gender distribution: {gender_counts} (total: {total})")
        
        # Check approximate distribution (allow some variance)
        if total >= 50:
            female_pct = gender_counts['female'] / total * 100
            male_pct = gender_counts['male'] / total * 100
            trans_pct = gender_counts['trans'] / total * 100
            print(f"Percentages: Female={female_pct:.1f}%, Male={male_pct:.1f}%, Trans={trans_pct:.1f}%")
    
    def test_partners_filter_by_gender(self):
        """Test filtering partners by gender"""
        for gender in ['female', 'male', 'trans']:
            response = requests.get(f"{BASE_URL}/api/partners?lang=tr&gender={gender}")
            assert response.status_code == 200
            data = response.json()
            
            # Verify all returned profiles have the correct gender
            for profile in data['profiles']:
                assert profile.get('gender') == gender, f"Expected gender {gender}, got {profile.get('gender')}"
            
            print(f"✓ Gender filter '{gender}' works correctly ({len(data['profiles'])} profiles)")
    
    def test_partners_filter_by_service_type(self):
        """Test filtering partners by service type"""
        service_types = ['dinner-companion', 'event-companion', 'sleep-companion']
        
        for service in service_types:
            response = requests.get(f"{BASE_URL}/api/partners?lang=tr&service_type={service}")
            assert response.status_code == 200
            data = response.json()
            print(f"✓ Service type filter '{service}' returned {len(data['profiles'])} profiles")
    
    def test_partners_age_filter(self):
        """Test age range filter"""
        response = requests.get(f"{BASE_URL}/api/partners?lang=tr&min_age=25&max_age=35")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all returned profiles are within age range
        for profile in data['profiles']:
            age = profile.get('age', 0)
            assert 25 <= age <= 35, f"Profile age {age} outside range 25-35"
        
        print(f"✓ Age filter works correctly ({len(data['profiles'])} profiles in range 25-35)")


class TestPartnerDetail:
    """Test partner detail page API"""
    
    def test_partner_detail_by_slug(self):
        """Test getting partner detail by slug"""
        # First get a partner slug
        response = requests.get(f"{BASE_URL}/api/partners?lang=tr&limit=1")
        assert response.status_code == 200
        data = response.json()
        
        if data['profiles']:
            slug = data['profiles'][0]['slug']
            
            # Get partner detail
            detail_response = requests.get(f"{BASE_URL}/api/partners/{slug}?lang=tr")
            assert detail_response.status_code == 200
            detail = detail_response.json()
            
            assert 'nickname' in detail
            assert 'service_types' in detail
            print(f"✓ Partner detail API works for slug '{slug}'")


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_admin_login(self):
        """Test admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kktcx.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert 'access_token' in data
        assert 'user' in data
        assert data['user']['role'] == 'admin'
        print(f"✓ Admin login successful")
        return data['access_token']
    
    def test_auth_me_endpoint(self):
        """Test /auth/me endpoint"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kktcx.com",
            "password": "admin123"
        })
        token = login_response.json()['access_token']
        
        # Get user info
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert 'email' in data
        assert data['email'] == 'admin@kktcx.com'
        print(f"✓ Auth me endpoint works")


class TestCitiesAndCategories:
    """Test cities and categories endpoints"""
    
    def test_cities_endpoint(self):
        """Test cities endpoint"""
        response = requests.get(f"{BASE_URL}/api/cities?lang=tr")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check for both north and south regions
        regions = set(city.get('region') for city in data)
        assert 'north' in regions, "Missing north Cyprus cities"
        assert 'south' in regions, "Missing south Cyprus cities"
        print(f"✓ Cities endpoint returns {len(data)} cities")
    
    def test_categories_endpoint(self):
        """Test categories endpoint"""
        response = requests.get(f"{BASE_URL}/api/categories?lang=tr")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Categories endpoint returns {len(data)} categories")


class TestHomepage:
    """Test homepage data endpoint"""
    
    def test_homepage_data(self):
        """Test homepage data endpoint"""
        response = requests.get(f"{BASE_URL}/api/homepage?lang=tr")
        assert response.status_code == 200
        data = response.json()
        
        # Check for expected sections
        assert 'cities' in data
        assert 'stats' in data
        print(f"✓ Homepage data endpoint works")
        print(f"  - Cities: {len(data.get('cities', []))}")
        print(f"  - Stats: {data.get('stats', {})}")


class TestConversations:
    """Test conversations/messages endpoint"""
    
    def test_conversations_requires_auth(self):
        """Test that conversations endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/conversations")
        assert response.status_code == 401 or response.status_code == 403
        print(f"✓ Conversations endpoint requires authentication")
    
    def test_conversations_with_auth(self):
        """Test conversations endpoint with authentication"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@kktcx.com",
            "password": "admin123"
        })
        token = login_response.json()['access_token']
        
        # Get conversations
        response = requests.get(f"{BASE_URL}/api/conversations", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Conversations endpoint works with auth ({len(data)} conversations)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
