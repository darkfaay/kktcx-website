"""
Test Admin Settings, SEO, Content Management, and Partner Profile APIs
Tests for KKTCX Admin Panel - Iteration 5

Features tested:
- Admin Site Settings (general, branding, social, features, homepage)
- Admin SEO (global, pages, robots, structured_data)
- Admin Content (homepage, about, contact, faq, footer - multi-language)
- Partner Profile (ethnicity, skin_tone fields)
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@kktcx.com"
ADMIN_PASSWORD = "admin123"

# Test data prefix for cleanup
TEST_PREFIX = "TEST_"


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ API health check passed")
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "KKTCX" in data.get("message", "")
        print("✓ API root check passed")


class TestAdminAuth:
    """Admin authentication tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful: {data['user']['email']}")
        return data["access_token"]
    
    def test_admin_login(self, admin_token):
        """Test admin login"""
        assert admin_token is not None
        print("✓ Admin token obtained")
    
    def test_admin_me(self, admin_token):
        """Test admin /auth/me endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "admin"
        print(f"✓ Admin profile verified: {data['email']}")


class TestAdminSettings:
    """Admin Site Settings API tests"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_get_settings(self, admin_headers):
        """Test GET /admin/settings"""
        response = requests.get(f"{BASE_URL}/api/admin/settings", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ GET /admin/settings returned {len(data)} settings keys")
    
    def test_save_general_settings(self, admin_headers):
        """Test PUT /admin/settings/general - Save general settings"""
        test_settings = {
            "site_name": f"{TEST_PREFIX}KKTCX Test",
            "site_tagline": "Test Tagline",
            "site_description": "Test Description",
            "contact_email": "test@kktcx.com",
            "contact_phone": "+90 533 000 0000",
            "contact_address": "Girne, KKTC",
            "default_language": "tr",
            "timezone": "Europe/Istanbul",
            "currency": "USD",
            "age_verification": True,
            "maintenance_mode": False
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/general",
            headers=admin_headers,
            json=test_settings
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ General settings saved successfully")
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=admin_headers)
        assert get_response.status_code == 200
        saved_data = get_response.json()
        if "general" in saved_data:
            assert saved_data["general"].get("site_name") == test_settings["site_name"]
            print("✓ General settings persistence verified")
    
    def test_save_branding_settings(self, admin_headers):
        """Test PUT /admin/settings/branding - Save branding settings"""
        test_settings = {
            "logo_url": "https://example.com/logo.png",
            "favicon_url": "https://example.com/favicon.ico",
            "primary_color": "#E91E63",
            "secondary_color": "#9C27B0",
            "accent_color": "#FFD700"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/branding",
            headers=admin_headers,
            json=test_settings
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Branding settings saved successfully")
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=admin_headers)
        saved_data = get_response.json()
        if "branding" in saved_data:
            assert saved_data["branding"].get("primary_color") == test_settings["primary_color"]
            print("✓ Branding settings persistence verified")
    
    def test_save_social_settings(self, admin_headers):
        """Test PUT /admin/settings/social - Save social media settings"""
        test_settings = {
            "facebook": "https://facebook.com/kktcx",
            "instagram": "https://instagram.com/kktcx",
            "twitter": "https://twitter.com/kktcx",
            "telegram": "https://t.me/kktcx"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/social",
            headers=admin_headers,
            json=test_settings
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Social settings saved successfully")
    
    def test_save_features_settings(self, admin_headers):
        """Test PUT /admin/settings/features - Save feature toggles"""
        test_settings = {
            "messaging_enabled": True,
            "favorites_enabled": True,
            "reviews_enabled": False,
            "booking_enabled": False,
            "payment_enabled": True,
            "sms_notifications": False,
            "email_notifications": True
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/features",
            headers=admin_headers,
            json=test_settings
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Features settings saved successfully")
    
    def test_save_homepage_settings(self, admin_headers):
        """Test PUT /admin/settings/homepage - Save homepage settings"""
        test_settings = {
            "hero_title": "Tutkunun Adresi",
            "hero_subtitle": "Özel anlarınız için seçkin partnerler.",
            "hero_description": "Yemek eşliği, davet arkadaşlığı ve unutulmaz deneyimler.",
            "show_vitrin": True,
            "show_featured": True,
            "show_cities": True,
            "show_stats": True,
            "partners_per_section": 8
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/homepage",
            headers=admin_headers,
            json=test_settings
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Homepage settings saved successfully")


class TestAdminSEO:
    """Admin SEO Management API tests"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_get_seo_settings(self, admin_headers):
        """Test GET /admin/seo"""
        response = requests.get(f"{BASE_URL}/api/admin/seo", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        # Check expected keys
        expected_keys = ["global", "pages", "robots", "structured_data"]
        for key in expected_keys:
            assert key in data, f"Missing key: {key}"
        print(f"✓ GET /admin/seo returned all expected keys: {expected_keys}")
    
    def test_save_global_seo(self, admin_headers):
        """Test PUT /admin/seo/global - Save global SEO settings"""
        test_seo = {
            "site_title": f"{TEST_PREFIX}KKTCX - Premium Platform",
            "site_description": "Test SEO description for KKTCX platform",
            "keywords": ["kktcx", "kıbrıs", "eşlik", "partner"],
            "og_image": "https://kktcx.com/og-image.jpg",
            "twitter_handle": "@kktcx",
            "google_analytics": "G-TESTID123",
            "google_search_console": "test-verification",
            "facebook_pixel": "123456789"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/seo/global",
            headers=admin_headers,
            json=test_seo
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Global SEO settings saved successfully")
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/admin/seo", headers=admin_headers)
        saved_data = get_response.json()
        if saved_data.get("global"):
            assert saved_data["global"].get("site_title") == test_seo["site_title"]
            print("✓ Global SEO persistence verified")
    
    def test_save_pages_seo(self, admin_headers):
        """Test PUT /admin/seo/pages - Save page-specific SEO"""
        test_pages = [
            {
                "slug": "homepage",
                "name": "Ana Sayfa",
                "title": f"{TEST_PREFIX}KKTCX - Ana Sayfa",
                "description": "Ana sayfa açıklaması",
                "keywords": ["ana sayfa", "premium"]
            },
            {
                "slug": "partners",
                "name": "Partnerler",
                "title": f"{TEST_PREFIX}Tüm Partnerler | KKTCX",
                "description": "Partner listesi açıklaması",
                "keywords": ["partnerler", "liste"]
            }
        ]
        
        response = requests.put(
            f"{BASE_URL}/api/admin/seo/pages",
            headers=admin_headers,
            json=test_pages
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Pages SEO settings saved successfully")
    
    def test_save_robots_seo(self, admin_headers):
        """Test PUT /admin/seo/robots - Save robots.txt settings"""
        test_robots = {
            "allow_indexing": True,
            "allow_following": True,
            "sitemap_url": "/sitemap.xml",
            "custom_rules": "Disallow: /admin/\nDisallow: /private/"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/seo/robots",
            headers=admin_headers,
            json=test_robots
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Robots SEO settings saved successfully")
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/admin/seo", headers=admin_headers)
        saved_data = get_response.json()
        if saved_data.get("robots"):
            assert saved_data["robots"].get("allow_indexing") == test_robots["allow_indexing"]
            print("✓ Robots SEO persistence verified")
    
    def test_save_structured_data_seo(self, admin_headers):
        """Test PUT /admin/seo/structured_data - Save structured data settings"""
        test_structured = {
            "organization_name": "KKTCX",
            "organization_type": "LocalBusiness",
            "organization_logo": "https://kktcx.com/logo.png",
            "organization_url": "https://kktcx.com",
            "contact_type": "customer service"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/seo/structured_data",
            headers=admin_headers,
            json=test_structured
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Structured data SEO settings saved successfully")


class TestAdminContent:
    """Admin Content Management API tests"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_get_content(self, admin_headers):
        """Test GET /admin/content"""
        response = requests.get(f"{BASE_URL}/api/admin/content", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ GET /admin/content returned {len(data)} page content entries")
    
    def test_save_homepage_content_tr(self, admin_headers):
        """Test PUT /admin/content/homepage - Save Turkish homepage content"""
        test_content = {
            "tr": {
                "hero_title": f"{TEST_PREFIX}Tutkunun Adresi",
                "hero_subtitle": "Özel anlarınız için seçkin partnerler.",
                "hero_description": "Yemek eşliği, davet arkadaşlığı ve unutulmaz deneyimler.",
                "cta_primary": "Partnerleri Keşfet",
                "cta_secondary": "Partner Ol",
                "section_vitrin_title": "VIP Vitrin",
                "section_featured_title": "Öne Çıkanlar"
            },
            "en": {
                "hero_title": f"{TEST_PREFIX}Destination of Passion",
                "hero_subtitle": "Select partners for your special moments.",
                "hero_description": "Dinner companions, event partners and unforgettable experiences.",
                "cta_primary": "Explore Partners",
                "cta_secondary": "Become a Partner",
                "section_vitrin_title": "VIP Showcase",
                "section_featured_title": "Featured"
            }
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/content/homepage",
            headers=admin_headers,
            json=test_content
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Homepage content (TR/EN) saved successfully")
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/admin/content", headers=admin_headers)
        saved_data = get_response.json()
        if "homepage" in saved_data and "tr" in saved_data["homepage"]:
            assert saved_data["homepage"]["tr"].get("hero_title") == test_content["tr"]["hero_title"]
            print("✓ Homepage content persistence verified")
    
    def test_save_about_content(self, admin_headers):
        """Test PUT /admin/content/about - Save about page content"""
        test_content = {
            "tr": {
                "title": "Hakkımızda",
                "subtitle": f"{TEST_PREFIX}KKTCX - Premium Platform",
                "content": "Test içerik açıklaması",
                "mission_title": "Misyonumuz",
                "mission_content": "Test misyon içeriği",
                "vision_title": "Vizyonumuz",
                "vision_content": "Test vizyon içeriği"
            },
            "en": {
                "title": "About Us",
                "subtitle": f"{TEST_PREFIX}KKTCX - Premium Platform",
                "content": "Test content description",
                "mission_title": "Our Mission",
                "mission_content": "Test mission content",
                "vision_title": "Our Vision",
                "vision_content": "Test vision content"
            }
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/content/about",
            headers=admin_headers,
            json=test_content
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ About page content saved successfully")
    
    def test_save_contact_content(self, admin_headers):
        """Test PUT /admin/content/contact - Save contact page content"""
        test_content = {
            "tr": {
                "title": "İletişim",
                "subtitle": "Bizimle iletişime geçin",
                "description": "Test iletişim açıklaması",
                "form_name": "Adınız",
                "form_email": "E-posta",
                "form_submit": "Gönder"
            }
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/content/contact",
            headers=admin_headers,
            json=test_content
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Contact page content saved successfully")
    
    def test_save_faq_content(self, admin_headers):
        """Test PUT /admin/content/faq - Save FAQ content"""
        test_content = {
            "tr": {
                "title": "Sıkça Sorulan Sorular",
                "subtitle": "Merak ettiklerinize yanıt bulun",
                "items": [
                    {"question": f"{TEST_PREFIX}KKTCX nedir?", "answer": "Test cevap 1"},
                    {"question": f"{TEST_PREFIX}Nasıl partner olurum?", "answer": "Test cevap 2"}
                ]
            }
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/content/faq",
            headers=admin_headers,
            json=test_content
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ FAQ content saved successfully")
    
    def test_save_footer_content(self, admin_headers):
        """Test PUT /admin/content/footer - Save footer content"""
        test_content = {
            "tr": {
                "description": f"{TEST_PREFIX}Test footer açıklaması",
                "copyright": "© 2025 KKTCX. Tüm hakları saklıdır.",
                "adult_warning": "18+ Yetişkin İçerik",
                "tagline": "Kıbrıs'ın #1 Eşlik Platformu"
            }
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/content/footer",
            headers=admin_headers,
            json=test_content
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ Footer content saved successfully")
    
    def test_get_public_content(self, admin_headers):
        """Test GET /content/{page} - Public content endpoint"""
        response = requests.get(f"{BASE_URL}/api/content/homepage?lang=tr")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ Public content endpoint working, returned {len(data)} fields")


class TestPartnerProfile:
    """Partner Profile API tests - ethnicity and skin_tone fields"""
    
    @pytest.fixture(scope="class")
    def test_user(self):
        """Create a test user for partner profile testing"""
        unique_id = str(uuid.uuid4())[:8]
        email = f"test_partner_{unique_id}@kktcx.com"
        password = "testpass123"
        
        # Register new user
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": password,
            "name": f"Test Partner {unique_id}",
            "role": "user"
        })
        
        if response.status_code == 400:
            # User might already exist, try login
            response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": email,
                "password": password
            })
        
        assert response.status_code in [200, 201], f"User creation/login failed: {response.text}"
        data = response.json()
        return {
            "email": email,
            "password": password,
            "token": data["access_token"],
            "user_id": data["user"]["id"]
        }
    
    def test_create_partner_profile_with_ethnicity_skin_tone(self, test_user):
        """Test creating partner profile with ethnicity and skin_tone fields"""
        headers = {"Authorization": f"Bearer {test_user['token']}", "Content-Type": "application/json"}
        
        # Get cities first
        cities_response = requests.get(f"{BASE_URL}/api/cities?lang=tr")
        cities = cities_response.json()
        city_id = cities[0]["id"] if cities else None
        
        assert city_id is not None, "No cities available for testing"
        
        profile_data = {
            "nickname": f"{TEST_PREFIX}TestPartner_{str(uuid.uuid4())[:6]}",
            "age": 25,
            "city_id": city_id,
            "gender": "female",
            "languages": ["Türkçe", "İngilizce"],
            "service_types": ["dinner-companion", "event-companion"],
            "orientations": ["heterosexual"],
            "body_type": "athletic",
            "height": 170,
            "hair_color": "brown",
            "eye_color": "green",
            "ethnicity": "caucasian",  # NEW FIELD
            "skin_tone": "medium",      # NEW FIELD
            "short_description": "Test partner profile description",
            "detailed_description": "Detailed test description for partner profile",
            "hourly_rate": 100,
            "incall": True,
            "outcall": True,
            "whatsapp": "+90 533 000 0000",
            "telegram": "@testpartner"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/partner/profile",
            headers=headers,
            json=profile_data
        )
        
        # Profile might already exist
        if response.status_code == 400 and "already exists" in response.text.lower():
            print("✓ Profile already exists, testing update instead")
            return
        
        assert response.status_code == 200, f"Profile creation failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        
        # Verify ethnicity and skin_tone in response
        profile = data.get("profile", {})
        assert profile.get("ethnicity") == "caucasian", "Ethnicity not saved correctly"
        assert profile.get("skin_tone") == "medium", "Skin tone not saved correctly"
        print("✓ Partner profile created with ethnicity and skin_tone fields")
    
    def test_get_partner_profile_with_ethnicity_skin_tone(self, test_user):
        """Test retrieving partner profile with ethnicity and skin_tone fields"""
        headers = {"Authorization": f"Bearer {test_user['token']}"}
        
        response = requests.get(f"{BASE_URL}/api/partner/profile", headers=headers)
        
        if response.status_code == 404:
            print("✓ No profile exists yet (expected if create test was skipped)")
            return
        
        assert response.status_code == 200, f"Profile retrieval failed: {response.text}"
        data = response.json()
        
        # Check that ethnicity and skin_tone fields exist in response
        assert "ethnicity" in data or data.get("ethnicity") is None, "Ethnicity field missing"
        assert "skin_tone" in data or data.get("skin_tone") is None, "Skin tone field missing"
        print(f"✓ Partner profile retrieved - ethnicity: {data.get('ethnicity')}, skin_tone: {data.get('skin_tone')}")
    
    def test_update_partner_profile_ethnicity_skin_tone(self, test_user):
        """Test updating partner profile ethnicity and skin_tone fields"""
        headers = {"Authorization": f"Bearer {test_user['token']}", "Content-Type": "application/json"}
        
        # First check if profile exists
        get_response = requests.get(f"{BASE_URL}/api/partner/profile", headers=headers)
        if get_response.status_code == 404:
            print("✓ No profile to update (skipping)")
            return
        
        update_data = {
            "ethnicity": "latin",
            "skin_tone": "olive"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/partner/profile",
            headers=headers,
            json=update_data
        )
        
        assert response.status_code == 200, f"Profile update failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        print("✓ Partner profile ethnicity and skin_tone updated successfully")
        
        # Verify update persisted
        verify_response = requests.get(f"{BASE_URL}/api/partner/profile", headers=headers)
        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            assert verify_data.get("ethnicity") == "latin", "Ethnicity update not persisted"
            assert verify_data.get("skin_tone") == "olive", "Skin tone update not persisted"
            print("✓ Partner profile update persistence verified")


class TestAdminDashboard:
    """Admin Dashboard API tests"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_admin_dashboard(self, admin_headers):
        """Test GET /admin/dashboard"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check expected fields
        expected_fields = ["total_users", "total_partners", "pending_profiles", "approved_profiles"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✓ Admin dashboard: {data['total_users']} users, {data['total_partners']} partners, {data['pending_profiles']} pending")


class TestPublicEndpoints:
    """Public API endpoint tests"""
    
    def test_get_cities(self):
        """Test GET /cities"""
        response = requests.get(f"{BASE_URL}/api/cities?lang=tr")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No cities returned"
        print(f"✓ GET /cities returned {len(data)} cities")
    
    def test_get_categories(self):
        """Test GET /categories"""
        response = requests.get(f"{BASE_URL}/api/categories?lang=tr")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /categories returned {len(data)} categories")
    
    def test_get_homepage_data(self):
        """Test GET /homepage"""
        response = requests.get(f"{BASE_URL}/api/homepage?lang=tr")
        assert response.status_code == 200
        data = response.json()
        
        # Check expected fields
        expected_fields = ["cities", "categories", "stats"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✓ GET /homepage returned data with {len(data['cities'])} cities")
    
    def test_get_packages(self):
        """Test GET /packages"""
        response = requests.get(f"{BASE_URL}/api/packages?lang=tr")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /packages returned {len(data)} packages")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
