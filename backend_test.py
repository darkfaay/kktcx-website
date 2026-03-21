import requests
import sys
import json
from datetime import datetime

class KKTCXAPITester:
    def __init__(self, base_url="https://partner-hub-test.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        # Add auth token if available
        if use_admin and self.admin_token:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
            
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 200:
                        print(f"   Response: {response_data}")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response text: {response.text[:200]}")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'endpoint': endpoint
                })

            return success, response.json() if response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e),
                'endpoint': endpoint
            })
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test("Health Check", "GET", "", 200)

    def test_health_endpoint(self):
        """Test health endpoint"""
        return self.run_test("Health Endpoint", "GET", "health", 200)

    def test_cities_api(self):
        """Test cities API"""
        success, response = self.run_test("Cities API", "GET", "cities", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} cities")
            if len(response) > 0:
                print(f"   Sample city: {response[0].get('name', 'N/A')}")
        return success

    def test_categories_api(self):
        """Test categories API"""
        success, response = self.run_test("Categories API", "GET", "categories", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} categories")
            if len(response) > 0:
                print(f"   Sample category: {response[0].get('name', 'N/A')}")
        return success

    def test_packages_api(self):
        """Test packages API"""
        success, response = self.run_test("Packages API", "GET", "packages", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} packages")
            if len(response) > 0:
                print(f"   Sample package: {response[0].get('name', 'N/A')} - ${response[0].get('price', 0)}")
        return success

    def test_homepage_api(self):
        """Test homepage data API"""
        success, response = self.run_test("Homepage API", "GET", "homepage", 200)
        if success and isinstance(response, dict):
            vitrin_count = len(response.get('vitrin_profiles', []))
            featured_count = len(response.get('featured_profiles', []))
            cities_count = len(response.get('cities', []))
            print(f"   Vitrin profiles: {vitrin_count}")
            print(f"   Featured profiles: {featured_count}")
            print(f"   Cities: {cities_count}")
        return success

    def test_partners_listing(self):
        """Test partners listing API"""
        success, response = self.run_test("Partners Listing", "GET", "partners", 200)
        if success and isinstance(response, dict):
            total = response.get('total', 0)
            profiles = response.get('profiles', [])
            print(f"   Total partners: {total}")
            print(f"   Returned profiles: {len(profiles)}")
        return success

    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "email": "admin@kktcx.com",
            "password": "admin123"
        }
        success, response = self.run_test("Admin Login", "POST", "auth/login", 200, login_data)
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            user_info = response.get('user', {})
            print(f"   Admin logged in: {user_info.get('email')} (Role: {user_info.get('role')})")
            return True
        return False

    def test_admin_dashboard(self):
        """Test admin dashboard stats"""
        if not self.admin_token:
            print("❌ Admin dashboard test skipped - no admin token")
            return False
        
        success, response = self.run_test("Admin Dashboard", "GET", "admin/dashboard", 200, use_admin=True)
        if success and isinstance(response, dict):
            print(f"   Total users: {response.get('total_users', 0)}")
            print(f"   Total partners: {response.get('total_partners', 0)}")
            print(f"   Pending profiles: {response.get('pending_profiles', 0)}")
            print(f"   Approved profiles: {response.get('approved_profiles', 0)}")
        return success

    def test_admin_settings(self):
        """Test admin settings"""
        if not self.admin_token:
            print("❌ Admin settings test skipped - no admin token")
            return False
        
        success, response = self.run_test("Admin Settings", "GET", "admin/settings", 200, use_admin=True)
        if success and isinstance(response, dict):
            netgsm_enabled = response.get('netgsm', {}).get('enabled', False)
            stripe_test_mode = response.get('stripe', {}).get('test_mode', True)
            print(f"   Netgsm enabled: {netgsm_enabled}")
            print(f"   Stripe test mode: {stripe_test_mode}")
        return success

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"test_user_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}",
            "role": "user"
        }
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, user_data)
        if success and 'access_token' in response:
            self.token = response['access_token']
            user_info = response.get('user', {})
            print(f"   User registered: {user_info.get('email')} (Role: {user_info.get('role')})")
            return True
        return False

    def test_user_profile(self):
        """Test getting user profile"""
        if not self.token:
            print("❌ User profile test skipped - no user token")
            return False
        
        success, response = self.run_test("User Profile", "GET", "auth/me", 200)
        if success and isinstance(response, dict):
            print(f"   User email: {response.get('email')}")
            print(f"   User role: {response.get('role')}")
        return success

    def test_favorites_empty(self):
        """Test empty favorites list"""
        if not self.token:
            print("❌ Favorites test skipped - no user token")
            return False
        
        success, response = self.run_test("Empty Favorites", "GET", "favorites", 200)
        if success and isinstance(response, list):
            print(f"   Favorites count: {len(response)}")
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting KKTCX API Tests")
        print("=" * 50)
        
        # Basic API tests
        print("\n📋 Basic API Tests")
        self.test_health_check()
        self.test_health_endpoint()
        self.test_cities_api()
        self.test_categories_api()
        self.test_packages_api()
        self.test_homepage_api()
        self.test_partners_listing()
        
        # Authentication tests
        print("\n🔐 Authentication Tests")
        self.test_admin_login()
        self.test_user_registration()
        self.test_user_profile()
        
        # Admin tests
        print("\n👑 Admin Tests")
        self.test_admin_dashboard()
        self.test_admin_settings()
        
        # User feature tests
        print("\n👤 User Feature Tests")
        self.test_favorites_empty()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests ({len(self.failed_tests)}):")
            for test in self.failed_tests:
                error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
                print(f"   - {test['name']}: {error_msg}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n✨ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = KKTCXAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())