"""
Simple KKTCX Backend Server
"""
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
from pydantic import BaseModel
from jose import jwt, JWTError
import bcrypt
import uuid
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Configuration
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'kktcx')
JWT_SECRET = os.environ.get('JWT_SECRET', 'kktcx-secret-key')
JWT_ALGORITHM = "HS256"

# Frontend build path
FRONTEND_BUILD = Path(__file__).parent.parent / "frontend" / "build"

# Database
client = None
db = None

# Security
security = HTTPBearer()

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str = ""
    role: str = "user"

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

# Helper functions
def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth endpoints
@app.post("/api/auth/login")
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(request.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user.get("role", "user"))
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name", ""),
            "role": user.get("role", "user")
        }
    }

@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    existing = await db.users.find_one({"email": request.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = bcrypt.hashpw(request.password.encode(), bcrypt.gensalt()).decode()
    user = {
        "id": str(uuid.uuid4()),
        "email": request.email,
        "password": hashed,
        "name": request.name,
        "role": request.role if request.role in ["user", "partner"] else "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    token = create_token(user["id"], user["role"])
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        }
    }

@app.get("/api/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

# Health check
@app.get("/api/health")
async def health():
    return {"status": "ok"}

# Get cities
@app.get("/api/catalog/cities")
async def get_catalog_cities(lang: str = "tr"):
    cities = await db.cities.find({}, {"_id": 0}).to_list(100)
    # Transform to frontend expected format
    result = []
    for city in cities:
        result.append({
            "id": city.get("id"),
            "slug": city.get("slug"),
            "name": city.get("names", {}).get(lang, city.get("names", {}).get("tr", "")),
            "region": city.get("region")
        })
    return result

@app.get("/api/cities")
async def get_cities(lang: str = "tr"):
    cities = await db.cities.find({}, {"_id": 0}).to_list(100)
    result = []
    for city in cities:
        result.append({
            "id": city.get("id"),
            "slug": city.get("slug"),
            "name": city.get("names", {}).get(lang, city.get("names", {}).get("tr", "")),
            "region": city.get("region")
        })
    return result

# Get categories  
@app.get("/api/catalog/categories")
async def get_catalog_categories(lang: str = "tr"):
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    result = []
    for cat in categories:
        result.append({
            "id": cat.get("id"),
            "slug": cat.get("slug"),
            "name": cat.get("names", {}).get(lang, cat.get("names", {}).get("tr", ""))
        })
    return result

@app.get("/api/categories")
async def get_categories(lang: str = "tr"):
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    result = []
    for cat in categories:
        result.append({
            "id": cat.get("id"),
            "slug": cat.get("slug"),
            "name": cat.get("names", {}).get(lang, cat.get("names", {}).get("tr", ""))
        })
    return result

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
async def get_partners(
    lang: str = "tr",
    page: int = 1, 
    limit: int = 20,
    city: str = None,
    category: str = None,
    gender: str = None,
    sort_by: str = "recommended"
):
    query = {"status": "approved"}
    if city:
        query["city_id"] = city
    if category:
        query["category_id"] = category
    if gender:
        query["gender"] = gender
    
    skip = (page - 1) * limit
    profiles = await db.partner_profiles.find(
        query,
        {"_id": 0}
    ).sort("priority_score", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.partner_profiles.count_documents(query)
    return {"profiles": profiles or [], "total": total}

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

    # Cities - Delete and recreate with all cities
    await db.cities.delete_many({})
    cities = [
        # Kuzey Kıbrıs
        {"id": str(uuid.uuid4()), "slug": "girne", "region": "north", "names": {"tr": "Girne", "en": "Kyrenia", "ru": "Кирения", "de": "Kyrenia", "el": "Κερύνεια"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "lefkosa-kuzey", "region": "north", "names": {"tr": "Lefkoşa (Kuzey)", "en": "Nicosia (North)", "ru": "Никосия (Север)", "de": "Nikosia (Nord)", "el": "Λευκωσία (Βόρεια)"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "gazimagusa", "region": "north", "names": {"tr": "Gazimağusa", "en": "Famagusta", "ru": "Фамагуста", "de": "Famagusta", "el": "Αμμόχωστος"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "guzelyurt", "region": "north", "names": {"tr": "Güzelyurt", "en": "Morphou", "ru": "Морфу", "de": "Morphou", "el": "Μόρφου"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "iskele", "region": "north", "names": {"tr": "İskele", "en": "Iskele", "ru": "Искеле", "de": "Iskele", "el": "Τρίκωμο"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "lefke", "region": "north", "names": {"tr": "Lefke", "en": "Lefke", "ru": "Лефке", "de": "Lefke", "el": "Λεύκα"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "alsancak", "region": "north", "names": {"tr": "Alsancak", "en": "Alsancak", "ru": "Алсанджак", "de": "Alsancak", "el": "Καραβάς"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "lapta", "region": "north", "names": {"tr": "Lapta", "en": "Lapithos", "ru": "Лапта", "de": "Lapta", "el": "Λάπηθος"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "catalkoy", "region": "north", "names": {"tr": "Çatalköy", "en": "Çatalköy", "ru": "Чаталкёй", "de": "Çatalköy", "el": "Αγιος Επίκτητος"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "karakum", "region": "north", "names": {"tr": "Karakum", "en": "Karakum", "ru": "Каракум", "de": "Karakum", "el": "Καράκουμι"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "bogaz", "region": "north", "names": {"tr": "Boğaz", "en": "Bogaz", "ru": "Богаз", "de": "Bogaz", "el": "Μπογάζ"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "yeni-iskele", "region": "north", "names": {"tr": "Yeni İskele", "en": "New Iskele", "ru": "Новая Искеле", "de": "Neu Iskele", "el": "Νέα Τρίκωμο"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "tatlisu", "region": "north", "names": {"tr": "Tatlısu", "en": "Tatlisu", "ru": "Татлысу", "de": "Tatlısu", "el": "Ακανθού"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "karpaz", "region": "north", "names": {"tr": "Karpaz", "en": "Karpaz", "ru": "Карпаз", "de": "Karpaz", "el": "Καρπασία"}, "active": True},
        # Güney Kıbrıs
        {"id": str(uuid.uuid4()), "slug": "lefkosa-guney", "region": "south", "names": {"tr": "Lefkoşa (Güney)", "en": "Nicosia (South)", "ru": "Никосия (Юг)", "de": "Nikosia (Süd)", "el": "Λευκωσία (Νότια)"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "limasol", "region": "south", "names": {"tr": "Limasol", "en": "Limassol", "ru": "Лимассол", "de": "Limassol", "el": "Λεμεσός"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "larnaka", "region": "south", "names": {"tr": "Larnaka", "en": "Larnaca", "ru": "Ларнака", "de": "Larnaka", "el": "Λάρνακα"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "baf", "region": "south", "names": {"tr": "Baf (Paphos)", "en": "Paphos", "ru": "Пафос", "de": "Paphos", "el": "Πάφος"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "ayia-napa", "region": "south", "names": {"tr": "Ayia Napa", "en": "Ayia Napa", "ru": "Айя-Напа", "de": "Ayia Napa", "el": "Αγία Νάπα"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "protaras", "region": "south", "names": {"tr": "Protaras", "en": "Protaras", "ru": "Протарас", "de": "Protaras", "el": "Πρωταράς"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "paralimni", "region": "south", "names": {"tr": "Paralimni", "en": "Paralimni", "ru": "Паралимни", "de": "Paralimni", "el": "Παραλίμνι"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "polis", "region": "south", "names": {"tr": "Polis", "en": "Polis", "ru": "Полис", "de": "Polis", "el": "Πόλις Χρυσοχούς"}, "active": True},
    ]
    await db.cities.insert_many(cities)
    results["cities"] = len(cities)

    # Categories - Delete and recreate with all categories
    await db.categories.delete_many({})
    categories = [
        {"id": str(uuid.uuid4()), "slug": "escort", "names": {"tr": "Eskort", "en": "Escort", "ru": "Эскорт", "de": "Escort", "el": "Συνοδός"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "massage", "names": {"tr": "Masaj", "en": "Massage", "ru": "Массаж", "de": "Massage", "el": "Μασάζ"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "companion", "names": {"tr": "Eşlik", "en": "Companion", "ru": "Компаньон", "de": "Begleitung", "el": "Σύντροφος"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "gigolo", "names": {"tr": "Jigolo", "en": "Gigolo", "ru": "Жиголо", "de": "Gigolo", "el": "Ζιγκολό"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "trans", "names": {"tr": "Trans", "en": "Trans", "ru": "Транс", "de": "Trans", "el": "Τρανς"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "vip", "names": {"tr": "VIP", "en": "VIP", "ru": "VIP", "de": "VIP", "el": "VIP"}, "active": True},
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
