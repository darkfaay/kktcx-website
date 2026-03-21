"""
KKTCX Backend Server
Modular FastAPI Application
"""
from fastapi import FastAPI, WebSocket, Response, Query, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import logging
import uuid

# Configuration
from config import CORS_ORIGINS, APP_NAME

# Database
from database import db, init_indexes

# Routers
from routers import (
    auth_router,
    partners_router,
    catalog_router,
    messages_router,
    websocket_endpoint,
    appointments_router,
    admin_router,
    reviews_router,
    admin_messages_router
)

# Services
from services.storage import get_object

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting KKTCX Backend...")
    await init_indexes()
    yield
    logger.info("Shutting down KKTCX Backend...")


# Create FastAPI app
app = FastAPI(
    title="KKTCX API",
    description="Partner Listing Platform API",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != ['*'] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(partners_router, prefix="/api")
app.include_router(catalog_router, prefix="/api")
app.include_router(messages_router, prefix="/api")
app.include_router(appointments_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(admin_messages_router, prefix="/api")


# ==================== ROOT ENDPOINTS ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "app": APP_NAME, "version": "2.0.0"}


@app.get("/api")
async def api_root():
    """API info endpoint"""
    return {"status": "healthy", "app": APP_NAME, "version": "2.0.0"}


@app.get("/api/health")
async def health():
    """Health check"""
    return {"status": "healthy"}


@app.get("/api/settings/public")
async def get_public_settings():
    """Get public site settings (no auth required)"""
    settings = await db.settings.find({}, {"_id": 0}).to_list(100)
    result = {}
    for s in settings:
        result[s["key"]] = s["value"]
    
    # SEO ayarlarını da ekle
    seo_settings = await db.seo.find({}, {"_id": 0}).to_list(100)
    seo_dict = {}
    for seo in seo_settings:
        page = seo.get("page", "global")
        seo_dict[page] = {k: v for k, v in seo.items() if k != "page"}
    result["seo"] = seo_dict
    
    return result


# ==================== FILE SERVING ====================

@app.get("/api/files/{path:path}")
async def get_file(path: str, auth: str = Query(None), authorization: str = Header(None)):
    """Serve files from object storage"""
    try:
        data, content_type = get_object(path)
        return Response(content=data, media_type=content_type)
    except Exception as e:
        logger.error(f"File retrieval error: {e}")
        return Response(status_code=404)


# ==================== HOMEPAGE ENDPOINT ====================

@app.get("/api/homepage")
async def get_homepage_data(lang: str = "tr"):
    """Get homepage data including vitrin profiles, cities, and categories"""
    # Get homepage vitrin profiles
    homepage_vitrin = await db.partner_profiles.find(
        {"status": "approved", "is_homepage_vitrin": True},
        {"_id": 0}
    ).sort("priority_score", -1).limit(8).to_list(8)
    
    # Get regular vitrin profiles
    vitrin_profiles = await db.partner_profiles.find(
        {"status": "approved", "is_vitrin": True, "is_homepage_vitrin": {"$ne": True}},
        {"_id": 0}
    ).sort("priority_score", -1).limit(12).to_list(12)
    
    # Get latest approved profiles
    latest_profiles = await db.partner_profiles.find(
        {"status": "approved"},
        {"_id": 0}
    ).sort("created_at", -1).limit(12).to_list(12)
    
    # City ID mapping for mismatches between profile city_id and city slugs
    city_id_mapping = {
        "gazimagusa": ["magusa", "famagusta", "gazimagusa"],
        "lefkosa-kuzey": ["lefkosa", "nicosia", "lefkosa-kuzey"],
        "girne": ["girne", "kyrenia"],
        "guzelyurt": ["guzelyurt", "morphou"],
        "iskele": ["iskele", "trikomo"],
        "lefke": ["lefke", "lefka"],
    }
    
    # Get cities
    cities = await db.cities.find({}, {"_id": 0}).to_list(100)
    for city in cities:
        city["name"] = city.get(f"name_{lang}", city.get("name_en", ""))
        city_slug = city.get("slug", "")
        
        # Get all possible city_id values for this city
        possible_ids = [city.get("id"), city_slug]
        if city_slug in city_id_mapping:
            possible_ids.extend(city_id_mapping[city_slug])
        
        # Count profiles matching any of the possible IDs
        city["profile_count"] = await db.partner_profiles.count_documents({
            "status": "approved",
            "city_id": {"$in": possible_ids}
        })
        city["partner_count"] = city["profile_count"]  # Frontend uses partner_count
    
    # Get categories
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    for cat in categories:
        cat["name"] = cat.get(f"name_{lang}", cat.get("name_en", ""))
    
    # Enrich profiles with city names
    for profile_list in [homepage_vitrin, vitrin_profiles, latest_profiles]:
        for profile in profile_list:
            if profile.get("city_id"):
                city = await db.cities.find_one(
                    {"$or": [{"id": profile["city_id"]}, {"slug": profile["city_id"]}]}, 
                    {"_id": 0}
                )
                if city:
                    profile["city_name"] = city.get(f"name_{lang}", city.get("name_en", ""))
    
    # Get stats
    total_partners = await db.partner_profiles.count_documents({"status": "approved"})
    total_cities = len([c for c in cities if c.get("profile_count", 0) > 0])
    
    return {
        "homepage_vitrin": homepage_vitrin,
        "vitrin_profiles": vitrin_profiles,
        "latest_profiles": latest_profiles,
        "cities": cities,
        "categories": categories,
        "stats": {
            "total_partners": total_partners,
            "total_cities": total_cities
        }
    }


# ==================== CONTACT FORM ====================

@app.post("/api/contact")
async def submit_contact_form(data: dict):
    """Submit contact form message"""
    if not data.get("name") or not data.get("email") or not data.get("message"):
        raise HTTPException(status_code=400, detail="Name, email, and message are required")
    
    message = {
        "id": str(uuid.uuid4()),
        "name": data["name"],
        "email": data["email"],
        "subject": data.get("subject", ""),
        "message": data["message"],
        "status": "unread",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    
    await db.contact_messages.insert_one(message)
    
    return {"success": True, "message": "Mesajınız başarıyla gönderildi"}


# ==================== SEO ENDPOINTS ====================

@app.get("/robots.txt", response_class=PlainTextResponse)
async def robots_txt():
    """Generate robots.txt"""
    settings = await db.seo.find_one({"page": "robots"}, {"_id": 0})
    
    if settings and settings.get("custom_robots"):
        return settings["custom_robots"]
    
    return """User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /partner/

Sitemap: https://kktcx.com/sitemap.xml
"""


@app.get("/api/sitemap.xml", response_class=PlainTextResponse)
@app.get("/sitemap.xml", response_class=PlainTextResponse)
async def sitemap_xml():
    """Generate comprehensive multilingual sitemap.xml"""
    base_url = "https://kktcx.com"
    languages = ["tr", "en", "ru", "de", "el"]
    today = datetime.now().strftime("%Y-%m-%d")
    
    urls = []
    
    # Static pages for all languages
    static_pages = [
        {"path": "", "priority": "1.0", "changefreq": "daily"},
        {"path": "partnerler", "priority": "0.9", "changefreq": "hourly"},
        {"path": "hakkimizda", "priority": "0.6", "changefreq": "monthly"},
        {"path": "iletisim", "priority": "0.6", "changefreq": "monthly"},
    ]
    
    for page in static_pages:
        for lang in languages:
            path = f"/{lang}/{page['path']}" if page['path'] else f"/{lang}"
            urls.append({
                "loc": f"{base_url}{path}",
                "lastmod": today,
                "priority": page['priority'],
                "changefreq": page['changefreq']
            })
    
    # Add city pages for all languages
    cities = await db.cities.find({}, {"_id": 0, "slug": 1}).to_list(100)
    for city in cities:
        for lang in languages:
            urls.append({
                "loc": f"{base_url}/{lang}/partnerler?city={city['slug']}",
                "lastmod": today,
                "priority": "0.8",
                "changefreq": "daily"
            })
    
    # Add approved partner profiles for all languages
    profiles = await db.partner_profiles.find(
        {"status": "approved"},
        {"_id": 0, "slug": 1, "updated_at": 1}
    ).to_list(1000)
    
    for profile in profiles:
        lastmod = profile.get('updated_at', today)
        if isinstance(lastmod, str):
            lastmod = lastmod[:10]
        else:
            lastmod = today
            
        for lang in languages:
            urls.append({
                "loc": f"{base_url}/{lang}/partner/{profile['slug']}",
                "lastmod": lastmod,
                "priority": "0.7",
                "changefreq": "weekly"
            })
    
    # Generate XML
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
    xml_content += 'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    
    for url in urls:
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{url["loc"]}</loc>\n'
        xml_content += f'    <lastmod>{url["lastmod"]}</lastmod>\n'
        xml_content += f'    <changefreq>{url["changefreq"]}</changefreq>\n'
        xml_content += f'    <priority>{url["priority"]}</priority>\n'
        xml_content += '  </url>\n'
    
    xml_content += '</urlset>'
    
    return xml_content


# ==================== WEBSOCKET ====================

@app.websocket("/ws/{token}")
async def websocket_route(websocket: WebSocket, token: str):
    """WebSocket endpoint for real-time messaging"""
    await websocket_endpoint(websocket, token)


# ==================== SMS ENDPOINTS ====================

@app.get("/api/admin/sms/settings")
async def get_sms_settings_endpoint():
    """Get SMS settings"""
    from utils.auth import require_admin
    settings = await db.settings.find_one({"key": "netgsm"}, {"_id": 0})
    return settings.get("value", {}) if settings else {}


@app.put("/api/admin/sms/settings")
async def update_sms_settings_endpoint(
    enabled: bool = False,
    usercode: str = "",
    password: str = "",
    msgheader: str = ""
):
    """Update SMS settings"""
    from datetime import datetime, timezone
    settings = {
        "enabled": enabled,
        "usercode": usercode,
        "password": password,
        "msgheader": msgheader
    }
    await db.settings.update_one(
        {"key": "netgsm"},
        {"$set": {"value": settings, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"success": True}


@app.get("/api/admin/sms/logs")
async def get_sms_logs(page: int = 1, limit: int = 50):
    """Get SMS logs"""
    total = await db.sms_logs.count_documents({})
    skip = (page - 1) * limit
    logs = await db.sms_logs.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return {"logs": logs, "total": total, "page": page, "pages": (total + limit - 1) // limit}


# ==================== CONTENT API ====================

@app.get("/api/content/{page}")
async def get_page_content(page: str, lang: str = "tr"):
    """Get content for a specific page"""
    content = await db.content.find({"page": page, "lang": lang}, {"_id": 0}).to_list(100)
    return {c["key"]: c["value"] for c in content}


@app.get("/api/seo/{page}")
async def get_page_seo(page: str, lang: str = "tr"):
    """Get SEO data for a page"""
    seo = await db.seo.find_one({"page": page}, {"_id": 0})
    if seo:
        return {
            "title": seo.get(f"title_{lang}", seo.get("title_en", "")),
            "description": seo.get(f"description_{lang}", seo.get("description_en", "")),
            "keywords": seo.get(f"keywords_{lang}", seo.get("keywords_en", "")),
            "og_image": seo.get("og_image", "")
        }
    return {}


# ==================== STRIPE ENDPOINTS ====================

@app.post("/api/stripe/create-checkout")
async def create_stripe_checkout(
    package_id: str,
    success_url: str,
    cancel_url: str,
    authorization: str = Header(None)
):
    """Create Stripe checkout session"""
    from utils.auth import get_current_user
    from config import STRIPE_API_KEY
    
    user = await get_current_user(authorization)
    
    package = await db.packages.find_one({"id": package_id}, {"_id": 0})
    if not package:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Package not found")
    
    if not STRIPE_API_KEY:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    import stripe
    stripe.api_key = STRIPE_API_KEY
    
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": package.get("name_en", "Package"),
                    "description": str(package.get('duration_days', 30)) + " days"
                },
                "unit_amount": int(package["price"] * 100)
            },
            "quantity": 1
        }],
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["id"],
            "package_id": package_id
        }
    )
    
    return {"session_id": session.id, "url": session.url}


@app.post("/api/stripe/webhook")
async def stripe_webhook(request):
    """Handle Stripe webhook"""
    from config import STRIPE_API_KEY
    import stripe
    from datetime import datetime, timezone, timedelta
    
    stripe.api_key = STRIPE_API_KEY
    payload = await request.body()
    
    event = stripe.Event.construct_from(
        stripe.util.convert_to_dict(stripe.util.json.loads(payload)),
        stripe.api_key
    )
    
    if event.type == "checkout.session.completed":
        session = event.data.object
        user_id = session.metadata.get("user_id")
        package_id = session.metadata.get("package_id")
        
        if user_id and package_id:
            package = await db.packages.find_one({"id": package_id}, {"_id": 0})
            if package:
                expires_at = datetime.now(timezone.utc) + timedelta(days=package["duration_days"])
                
                await db.partner_profiles.update_one(
                    {"user_id": user_id},
                    {"$set": {
                        "package_type": package["package_type"],
                        "package_expires_at": expires_at.isoformat(),
                        "priority_score": package.get("priority_score", 0)
                    }}
                )
    
    return {"received": True}


# Seed endpoint (one-time use)
@app.post("/api/seed-database")
async def seed_database_endpoint(secret: str = ""):
    """One-time seed endpoint - use secret key to run"""
    if secret != "kktcx-seed-2024":
        raise HTTPException(status_code=403, detail="Invalid secret")
    
    import bcrypt
    
    def hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    results = {"admin": False, "cities": 0, "categories": 0, "settings": 0}
    
    # 1. Create Admin User
    admin_exists = await db.users.find_one({"email": "admin@kktcx.com"})
    if not admin_exists:
        admin = {
            "id": str(uuid.uuid4()),
            "email": "admin@kktcx.com",
            "password": hash_password("admin123"),
            "name": "Admin",
            "role": "admin",
            "language": "tr",
            "orientations": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin)
        results["admin"] = True

    # 2. Create Cities
    cities = [
        {"id": str(uuid.uuid4()), "slug": "girne", "region": "north", "names": {"tr": "Girne", "en": "Kyrenia", "ru": "Кирения", "de": "Kyrenia", "el": "Κερύνεια"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "lefkosa-kuzey", "region": "north", "names": {"tr": "Lefkoşa (Kuzey)", "en": "Nicosia (North)", "ru": "Никосия (Север)", "de": "Nikosia (Nord)", "el": "Λευκωσία (Βόρεια)"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "gazimagusa", "region": "north", "names": {"tr": "Gazimağusa", "en": "Famagusta", "ru": "Фамагуста", "de": "Famagusta", "el": "Αμμόχωστος"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "guzelyurt", "region": "north", "names": {"tr": "Güzelyurt", "en": "Morphou", "ru": "Морфу", "de": "Morphou", "el": "Μόρφου"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "iskele", "region": "north", "names": {"tr": "İskele", "en": "Iskele", "ru": "Искеле", "de": "Iskele", "el": "Τρίκωμο"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "lefke", "region": "north", "names": {"tr": "Lefke", "en": "Lefke", "ru": "Лефке", "de": "Lefke", "el": "Λεύκα"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "limasol", "region": "south", "names": {"tr": "Limasol", "en": "Limassol", "ru": "Лимассол", "de": "Limassol", "el": "Λεμεσός"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "larnaka", "region": "south", "names": {"tr": "Larnaka", "en": "Larnaca", "ru": "Ларнака", "de": "Larnaka", "el": "Λάρνακα"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "baf", "region": "south", "names": {"tr": "Baf", "en": "Paphos", "ru": "Пафос", "de": "Paphos", "el": "Πάφος"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "ayia-napa", "region": "south", "names": {"tr": "Ayia Napa", "en": "Ayia Napa", "ru": "Айя-Напа", "de": "Ayia Napa", "el": "Αγία Νάπα"}, "active": True},
    ]
    
    existing_cities = await db.cities.count_documents({})
    if existing_cities == 0:
        await db.cities.insert_many(cities)
        results["cities"] = len(cities)

    # 3. Create Categories
    categories = [
        {"id": str(uuid.uuid4()), "slug": "dinner-companion", "names": {"tr": "Yemek Eşliği", "en": "Dinner Companion", "ru": "Компаньон на ужин", "de": "Dinner-Begleitung", "el": "Συνοδός δείπνου"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "event-companion", "names": {"tr": "Davet Eşliği", "en": "Event Companion", "ru": "Компаньон на мероприятие", "de": "Event-Begleitung", "el": "Συνοδός εκδηλώσεων"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "travel-companion", "names": {"tr": "Gezi Eşliği", "en": "Travel Companion", "ru": "Попутчик", "de": "Reisebegleitung", "el": "Συνοδός ταξιδιού"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "gf-bf-experience", "names": {"tr": "Sevgili Deneyimi", "en": "GF/BF Experience", "ru": "Опыт парня/девушки", "de": "Freund/in-Erlebnis", "el": "Εμπειρία συντρόφου"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "social-event", "names": {"tr": "Sosyal Etkinlik", "en": "Social Event", "ru": "Социальное мероприятие", "de": "Gesellschaftliches Event", "el": "Κοινωνική εκδήλωση"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "business-meeting", "names": {"tr": "İş Daveti", "en": "Business Meeting", "ru": "Деловая встреча", "de": "Geschäftstreffen", "el": "Επαγγελματική συνάντηση"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "culture-art", "names": {"tr": "Kültür & Sanat", "en": "Culture & Art", "ru": "Культура и искусство", "de": "Kultur & Kunst", "el": "Πολιτισμός & Τέχνη"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "sports-fitness", "names": {"tr": "Spor & Fitness", "en": "Sports & Fitness", "ru": "Спорт и фитнес", "de": "Sport & Fitness", "el": "Αθλητισμός & Γυμναστική"}, "active": True},
    ]
    
    existing_categories = await db.categories.count_documents({})
    if existing_categories == 0:
        await db.categories.insert_many(categories)
        results["categories"] = len(categories)

    # 4. Create Settings
    settings = [
        {"key": "general", "value": {"site_name": "KKTCX", "site_tagline": "Kıbrıs'ın Premium Eşlik Platformu", "contact_email": "info@kktcx.com", "contact_phone": "+90 548 000 0000", "maintenance_mode": False}},
        {"key": "homepage", "value": {"hero_title": "Tutkunun Adresi", "hero_subtitle": "Özel anlarınız için seçkin partnerler.", "hero_description": "Yemek eşliği, davet arkadaşlığı ve unutulmaz deneyimler.", "show_vitrin": True, "vitrin_count": 6}},
        {"key": "social", "value": {"instagram": "https://instagram.com/kktcx", "twitter": "https://twitter.com/kktcx", "telegram": "https://t.me/kktcx"}},
        {"key": "features", "value": {"messaging_enabled": True, "favorites_enabled": True, "reviews_enabled": True, "booking_enabled": True}},
    ]
    
    for setting in settings:
        result = await db.settings.update_one({"key": setting["key"]}, {"$set": setting}, upsert=True)
        if result.upserted_id:
            results["settings"] += 1
    
    return {"success": True, "message": "Database seeded!", "results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
