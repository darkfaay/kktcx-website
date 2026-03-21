"""
KKTCX Backend Server
Modular FastAPI Application
"""
from fastapi import FastAPI, WebSocket, Response, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from contextlib import asynccontextmanager
import logging

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
    admin_router
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
    
    # Get cities
    cities = await db.cities.find({}, {"_id": 0}).to_list(100)
    for city in cities:
        city["name"] = city.get(f"name_{lang}", city.get("name_en", ""))
        # Count profiles per city
        city["profile_count"] = await db.partner_profiles.count_documents({
            "status": "approved", 
            "$or": [{"city_id": city.get("id")}, {"city_id": city.get("slug")}]
        })
    
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


@app.get("/sitemap.xml", response_class=PlainTextResponse)
async def sitemap_xml():
    """Generate sitemap.xml"""
    base_url = "https://kktcx.com"
    
    urls = [
        {"loc": base_url, "priority": "1.0"},
        {"loc": f"{base_url}/hakkimizda", "priority": "0.8"},
        {"loc": f"{base_url}/iletisim", "priority": "0.7"},
        {"loc": f"{base_url}/partnerler", "priority": "0.9"},
    ]
    
    # Add city pages
    cities = await db.cities.find({}, {"_id": 0, "slug": 1}).to_list(100)
    for city in cities:
        urls.append({"loc": f"{base_url}/partnerler/{city['slug']}", "priority": "0.8"})
    
    # Add approved partner profiles
    profiles = await db.partner_profiles.find(
        {"status": "approved"},
        {"_id": 0, "slug": 1}
    ).to_list(1000)
    for profile in profiles:
        urls.append({"loc": f"{base_url}/partner/{profile['slug']}", "priority": "0.6"})
    
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for url in urls:
        xml_content += f'  <url>\n'
        xml_content += f'    <loc>{url["loc"]}</loc>\n'
        xml_content += f'    <priority>{url["priority"]}</priority>\n'
        xml_content += f'  </url>\n'
    
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
