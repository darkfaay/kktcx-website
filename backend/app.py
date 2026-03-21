"""
Simple KKTCX Backend Server
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import bcrypt
import uuid
import os
from datetime import datetime, timezone
from pathlib import Path

# Configuration
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'kktcx')
JWT_SECRET = os.environ.get('JWT_SECRET', 'kktcx-secret-key')

# Frontend build path
FRONTEND_BUILD = Path(__file__).parent.parent / "frontend" / "build"

# Database
client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    print(f"Connected to database: {DB_NAME}")
    print(f"Frontend build path: {FRONTEND_BUILD}")
    print(f"Frontend exists: {FRONTEND_BUILD.exists()}")
    yield
    client.close()

app = FastAPI(title="KKTCX API", lifespan=lifespan)

# CORS
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != ['*'] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/api/health")
async def health():
    return {"status": "ok"}

# Get cities
@app.get("/api/catalog/cities")
async def get_cities():
    cities = await db.cities.find({}, {"_id": 0}).to_list(100)
    return cities

# Get categories  
@app.get("/api/catalog/categories")
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

# Get settings
@app.get("/api/settings/public")
async def get_public_settings():
    settings = {}
    async for s in db.settings.find({}, {"_id": 0}):
        settings[s["key"]] = s.get("value", {})
    
    # Default values if not set
    if "general" not in settings:
        settings["general"] = {"site_name": "KKTCX", "maintenance_mode": False}
    if "homepage" not in settings:
        settings["homepage"] = {"hero_title": "KKTCX", "show_vitrin": True, "vitrin_count": 6}
    if "social" not in settings:
        settings["social"] = {"instagram": "", "twitter": "", "telegram": ""}
    if "branding" not in settings:
        settings["branding"] = {"logo_url": "", "favicon_url": "", "primary_color": "#E91E63"}
    
    return settings

# Get SEO settings
@app.get("/api/seo")
async def get_seo_settings(page: str = "home", lang: str = "tr"):
    seo = await db.seo.find_one({"page": page, "lang": lang}, {"_id": 0})
    if not seo:
        # Default SEO
        seo = {
            "page": page,
            "lang": lang,
            "title": "KKTCX | Kıbrıs Eskort, Partner",
            "description": "Kıbrıs eskort, jigolo, masaj ve partner ilanları.",
            "keywords": "kıbrıs eskort, kıbrıs escort"
        }
    return seo

# Get partners
@app.get("/api/partners")
async def get_partners(limit: int = 20, skip: int = 0):
    profiles = await db.partner_profiles.find(
        {"status": "approved"},
        {"_id": 0}
    ).sort("priority_score", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.partner_profiles.count_documents({"status": "approved"})
    return {"profiles": profiles, "total": total}

# Seed database
@app.post("/api/seed-database")
async def seed_database(secret: str = ""):
    if secret != "kktcx-seed-2024":
        raise HTTPException(status_code=403, detail="Invalid secret")
    
    results = {"admin": False, "cities": 0, "categories": 0, "settings": 0}
    
    # Admin
    admin_exists = await db.users.find_one({"email": "admin@kktcx.com"})
    if not admin_exists:
        hashed = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": "admin@kktcx.com",
            "password": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        results["admin"] = True

    # Cities
    if await db.cities.count_documents({}) == 0:
        cities = [
            {"id": str(uuid.uuid4()), "slug": "girne", "region": "north", "names": {"tr": "Girne", "en": "Kyrenia"}, "active": True},
            {"id": str(uuid.uuid4()), "slug": "lefkosa", "region": "north", "names": {"tr": "Lefkoşa", "en": "Nicosia"}, "active": True},
            {"id": str(uuid.uuid4()), "slug": "gazimagusa", "region": "north", "names": {"tr": "Gazimağusa", "en": "Famagusta"}, "active": True},
            {"id": str(uuid.uuid4()), "slug": "guzelyurt", "region": "north", "names": {"tr": "Güzelyurt", "en": "Morphou"}, "active": True},
            {"id": str(uuid.uuid4()), "slug": "iskele", "region": "north", "names": {"tr": "İskele", "en": "Iskele"}, "active": True},
        ]
        await db.cities.insert_many(cities)
        results["cities"] = len(cities)

    # Categories
    if await db.categories.count_documents({}) == 0:
        categories = [
            {"id": str(uuid.uuid4()), "slug": "escort", "names": {"tr": "Eskort", "en": "Escort"}, "active": True},
            {"id": str(uuid.uuid4()), "slug": "massage", "names": {"tr": "Masaj", "en": "Massage"}, "active": True},
            {"id": str(uuid.uuid4()), "slug": "companion", "names": {"tr": "Eşlik", "en": "Companion"}, "active": True},
        ]
        await db.categories.insert_many(categories)
        results["categories"] = len(categories)

    # Settings
    settings = [
        {"key": "general", "value": {"site_name": "KKTCX", "maintenance_mode": False}},
        {"key": "homepage", "value": {"hero_title": "KKTCX", "show_vitrin": True, "vitrin_count": 6}},
        {"key": "social", "value": {"instagram": "", "twitter": "", "telegram": ""}},
    ]
    for s in settings:
        r = await db.settings.update_one({"key": s["key"]}, {"$set": s}, upsert=True)
        if r.upserted_id:
            results["settings"] += 1

    return {"success": True, "results": results}


# Serve static files from frontend build
if FRONTEND_BUILD.exists():
    # Serve static assets (js, css, images)
    app.mount("/static", StaticFiles(directory=FRONTEND_BUILD / "static"), name="static")
    
    # Catch-all route for React Router - must be last
    @app.get("/{full_path:path}")
    async def serve_react_app(request: Request, full_path: str):
        # If it's an API route, this won't match (already handled above)
        # Serve index.html for all other routes (React Router handles them)
        index_file = FRONTEND_BUILD / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return HTMLResponse(content="Frontend not found", status_code=404)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
