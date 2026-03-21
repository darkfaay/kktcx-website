"""
KKTCX Backend Server - Full Featured
Modular FastAPI Application for Render.com Deployment
"""
from fastapi import FastAPI, WebSocket, Response, Query, Header, HTTPException, Request, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse, PlainTextResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from pathlib import Path
import logging
import uuid
import bcrypt
import jwt
import os
import requests

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== CONFIGURATION ====================

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'kktcx')
JWT_SECRET = os.environ.get('JWT_SECRET', 'kktcx-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7
APP_NAME = os.environ.get('APP_NAME', 'kktcx')
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"

# Frontend build path (for Render deployment)
FRONTEND_BUILD = Path(__file__).parent.parent / "frontend" / "build"

# ==================== DATABASE ====================

client = None
db = None

async def init_indexes():
    """Create database indexes"""
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.partner_profiles.create_index("user_id", unique=True)
    await db.partner_profiles.create_index("slug", unique=True)
    await db.partner_profiles.create_index([("status", 1), ("priority_score", -1)])
    await db.conversations.create_index("participants")
    await db.messages.create_index([("conversation_id", 1), ("created_at", -1)])
    await db.favorites.create_index([("user_id", 1), ("profile_id", 1)], unique=True)
    await db.appointments.create_index([("partner_id", 1), ("date", 1)])

# ==================== PYDANTIC MODELS ====================

class UserRole:
    VISITOR = "visitor"
    USER = "user"
    PARTNER = "partner"
    ADMIN = "admin"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phone: Optional[str] = None
    name: Optional[str] = None
    role: str = UserRole.USER
    language: str = "tr"
    orientations: List[str] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    phone: Optional[str] = None
    name: Optional[str] = None
    role: str
    language: str
    orientations: List[str] = []
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class PartnerProfileCreate(BaseModel):
    nickname: str
    age: int
    city_id: str
    district_id: Optional[str] = None
    languages: List[str] = []
    category_ids: List[str] = []
    service_types: List[str] = []
    orientations: List[str] = []
    gender: str = "female"
    body_type: Optional[str] = None
    height: Optional[int] = None
    hair_color: Optional[str] = None
    eye_color: Optional[str] = None
    ethnicity: Optional[str] = None
    skin_tone: Optional[str] = None
    short_description: str
    detailed_description: str
    availability: Dict[str, Any] = {}
    is_available_today: bool = False
    is_available_tonight: bool = False
    hourly_rate: Optional[float] = None
    incall: bool = False
    outcall: bool = False
    whatsapp: Optional[str] = None
    telegram: Optional[str] = None
    serves: str = "everyone"  # men, women, everyone

class PartnerProfileUpdate(BaseModel):
    nickname: Optional[str] = None
    age: Optional[int] = None
    city_id: Optional[str] = None
    district_id: Optional[str] = None
    languages: Optional[List[str]] = None
    category_ids: Optional[List[str]] = None
    service_types: Optional[List[str]] = None
    orientations: Optional[List[str]] = None
    gender: Optional[str] = None
    body_type: Optional[str] = None
    height: Optional[int] = None
    hair_color: Optional[str] = None
    eye_color: Optional[str] = None
    ethnicity: Optional[str] = None
    skin_tone: Optional[str] = None
    short_description: Optional[str] = None
    detailed_description: Optional[str] = None
    availability: Optional[Dict[str, Any]] = None
    is_available_today: Optional[bool] = None
    is_available_tonight: Optional[bool] = None
    hourly_rate: Optional[float] = None
    incall: Optional[bool] = None
    outcall: Optional[bool] = None
    whatsapp: Optional[str] = None
    telegram: Optional[str] = None
    serves: Optional[str] = None  # men, women, everyone

class AvailabilitySettings(BaseModel):
    working_hours_start: str = "09:00"
    working_hours_end: str = "22:00"
    slot_duration: int = 60
    break_between_slots: int = 30
    working_days: List[int] = [1, 2, 3, 4, 5, 6, 7]
    blocked_dates: List[str] = []
    auto_confirm: bool = False

class DurationOption(BaseModel):
    id: str
    label: str
    minutes: int
    price: float
    is_active: bool = True

class AppointmentCreate(BaseModel):
    partner_id: str
    date: str
    time_slot: str
    duration_id: str
    notes: Optional[str] = None

class ReviewCreate(BaseModel):
    partner_id: str
    rating: int
    comment: Optional[str] = None
    is_anonymous: bool = False

# ==================== WEBSOCKET MANAGER ====================

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WebSocket connected for user: {user_id}")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WebSocket disconnected for user: {user_id}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to {user_id}: {e}")
    
    def is_user_online(self, user_id: str) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

ws_manager = ConnectionManager()

# ==================== STORAGE SERVICE ====================

storage_key = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ==================== AUTH HELPERS ====================

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user(authorization)
    except Exception:
        return None

async def require_admin(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    if user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def require_partner(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    if user["role"] not in [UserRole.PARTNER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Partner access required")
    return user

# ==================== LIFESPAN ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    logger.info("Starting KKTCX Backend...")
    logger.info(f"Connecting to MongoDB: {DB_NAME}")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    await init_indexes()
    logger.info(f"Frontend build path: {FRONTEND_BUILD}")
    logger.info(f"Frontend exists: {FRONTEND_BUILD.exists()}")
    yield
    logger.info("Shutting down KKTCX Backend...")
    client.close()

# ==================== APP SETUP ====================

app = FastAPI(
    title="KKTCX API",
    description="Partner Listing Platform API",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != ['*'] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== ROOT ENDPOINTS ====================

@app.get("/")
async def root():
    return {"status": "healthy", "app": APP_NAME, "version": "2.0.0"}

@app.get("/api")
async def api_root():
    return {"status": "healthy", "app": APP_NAME, "version": "2.0.0"}

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "phone": data.phone,
        "name": data.name,
        "role": data.role,
        "language": data.language,
        "orientations": data.orientations,
        "is_active": True,
        "is_verified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    token = create_token(user_id, data.role)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=data.email,
            phone=data.phone,
            name=data.name,
            role=data.role,
            language=data.language,
            orientations=data.orientations,
            created_at=user["created_at"]
        )
    )

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is disabled")
    
    token = create_token(user["id"], user["role"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            phone=user.get("phone"),
            name=user.get("name"),
            role=user["role"],
            language=user.get("language", "tr"),
            orientations=user.get("orientations", []),
            created_at=user["created_at"]
        )
    )

@app.get("/api/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        phone=user.get("phone"),
        name=user.get("name"),
        role=user["role"],
        language=user.get("language", "tr"),
        orientations=user.get("orientations", []),
        created_at=user["created_at"]
    )

@app.put("/api/auth/profile")
async def update_profile(
    name: Optional[str] = None,
    phone: Optional[str] = None,
    language: Optional[str] = None,
    orientations: Optional[List[str]] = Query(None),
    user: dict = Depends(get_current_user)
):
    updates = {}
    if name is not None:
        updates["name"] = name
    if phone is not None:
        updates["phone"] = phone
    if language is not None:
        updates["language"] = language
    if orientations is not None:
        updates["orientations"] = orientations
    
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    
    return {"success": True}

# ==================== CATALOG ENDPOINTS ====================

@app.get("/api/cities")
async def get_cities(lang: str = "tr"):
    cities = await db.cities.find({}, {"_id": 0}).to_list(100)
    result = []
    for city in cities:
        names = city.get("names", {})
        result.append({
            "id": city.get("id"),
            "slug": city.get("slug"),
            "name": names.get(lang, names.get("tr", city.get("name_tr", ""))),
            "region": city.get("region")
        })
    return result

@app.get("/api/catalog/cities")
async def get_catalog_cities(lang: str = "tr"):
    return await get_cities(lang)

@app.get("/api/categories")
async def get_categories(lang: str = "tr"):
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    result = []
    for cat in categories:
        names = cat.get("names", {})
        # Return all language fields for admin panel compatibility
        result.append({
            "id": cat.get("id"),
            "slug": cat.get("slug"),
            "name": names.get(lang, names.get("tr", cat.get("name_tr", ""))),
            "name_tr": names.get("tr", cat.get("name_tr", "")),
            "name_en": names.get("en", cat.get("name_en", "")),
            "name_ru": names.get("ru", cat.get("name_ru", "")),
            "name_de": names.get("de", cat.get("name_de", "")),
            "name_el": names.get("el", cat.get("name_el", "")),
            "type": cat.get("type", "service"),
            "icon": cat.get("icon", ""),
            "color": cat.get("color", "#E91E63"),
            "active": cat.get("active", True)
        })
    return result

@app.get("/api/catalog/categories")
async def get_catalog_categories(lang: str = "tr"):
    return await get_categories(lang)

@app.get("/api/packages")
async def get_packages(lang: str = "tr"):
    packages = await db.packages.find({"is_active": True}, {"_id": 0}).to_list(100)
    for pkg in packages:
        pkg["name"] = pkg.get(f"name_{lang}", pkg.get("name_en", ""))
    return packages

# ==================== SETTINGS ENDPOINTS ====================

@app.get("/api/settings/public")
async def get_public_settings():
    settings = await db.settings.find({}, {"_id": 0}).to_list(100)
    result = {}
    for s in settings:
        result[s["key"]] = s.get("value", {})
    
    # Default values
    if "general" not in result:
        result["general"] = {"site_name": "KKTCX", "maintenance_mode": False}
    if "homepage" not in result:
        result["homepage"] = {"hero_title": "KKTCX", "show_vitrin": True, "vitrin_count": 6}
    if "social" not in result:
        result["social"] = {"instagram": "", "twitter": "", "telegram": ""}
    if "branding" not in result:
        result["branding"] = {"logo_url": "", "favicon_url": "", "primary_color": "#E91E63"}
    
    # SEO
    seo_settings = await db.seo.find({}, {"_id": 0}).to_list(100)
    seo_dict = {}
    for seo in seo_settings:
        page = seo.get("page", "global")
        seo_dict[page] = {k: v for k, v in seo.items() if k != "page"}
    result["seo"] = seo_dict
    
    return result

@app.get("/api/seo/{page}")
async def get_page_seo(page: str, lang: str = "tr"):
    seo = await db.seo.find_one({"page": page}, {"_id": 0})
    if seo:
        return {
            "title": seo.get(f"title_{lang}", seo.get("title_en", seo.get("title", ""))),
            "description": seo.get(f"description_{lang}", seo.get("description_en", seo.get("description", ""))),
            "keywords": seo.get(f"keywords_{lang}", seo.get("keywords_en", seo.get("keywords", ""))),
            "og_image": seo.get("og_image", "")
        }
    return {}

# ==================== HOMEPAGE ENDPOINT ====================

@app.get("/api/homepage")
async def get_homepage_data(lang: str = "tr"):
    # Homepage vitrin profiles
    homepage_vitrin = await db.partner_profiles.find(
        {"status": "approved", "is_homepage_vitrin": True}, {"_id": 0}
    ).sort("priority_score", -1).limit(8).to_list(8)
    
    # Regular vitrin profiles
    vitrin_profiles = await db.partner_profiles.find(
        {"status": "approved", "is_vitrin": True, "is_homepage_vitrin": {"$ne": True}}, {"_id": 0}
    ).sort("priority_score", -1).limit(12).to_list(12)
    
    # Latest profiles
    latest_profiles = await db.partner_profiles.find(
        {"status": "approved"}, {"_id": 0}
    ).sort("created_at", -1).limit(12).to_list(12)
    
    # Cities
    cities = await db.cities.find({}, {"_id": 0}).to_list(100)
    for city in cities:
        names = city.get("names", {})
        city["name"] = names.get(lang, names.get("tr", city.get("name_tr", "")))
        city["partner_count"] = await db.partner_profiles.count_documents({
            "status": "approved",
            "$or": [{"city_id": city.get("id")}, {"city_id": city.get("slug")}]
        })
    
    # Categories
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    for cat in categories:
        names = cat.get("names", {})
        cat["name"] = names.get(lang, names.get("tr", cat.get("name_tr", "")))
    
    # Enrich profiles with city names
    for profile_list in [homepage_vitrin, vitrin_profiles, latest_profiles]:
        for profile in profile_list:
            if profile.get("city_id"):
                city = await db.cities.find_one(
                    {"$or": [{"id": profile["city_id"]}, {"slug": profile["city_id"]}]}, {"_id": 0}
                )
                if city:
                    names = city.get("names", {})
                    profile["city_name"] = names.get(lang, names.get("tr", city.get("name_tr", "")))
    
    # Stats
    total_partners = await db.partner_profiles.count_documents({"status": "approved"})
    total_cities = len([c for c in cities if c.get("partner_count", 0) > 0])
    
    return {
        "homepage_vitrin": homepage_vitrin,
        "vitrin_profiles": vitrin_profiles,
        "latest_profiles": latest_profiles,
        "cities": cities,
        "categories": categories,
        "stats": {"total_partners": total_partners, "total_cities": total_cities}
    }

# ==================== PARTNERS ENDPOINTS ====================

@app.get("/api/partners")
async def get_partners(
    city: Optional[str] = None,
    category: Optional[str] = None,
    serves: Optional[str] = None,
    gender: Optional[str] = None,
    service_type: Optional[str] = None,
    min_age: int = 18,
    max_age: int = 99,
    vitrin_only: bool = False,
    homepage_vitrin: bool = False,
    city_vitrin: bool = False,
    available_today: bool = False,
    available_tonight: bool = False,
    featured_only: bool = False,
    verified_only: bool = False,
    incall: bool = False,
    outcall: bool = False,
    search: Optional[str] = None,
    sort_by: str = "priority",
    page: int = 1,
    limit: int = 20,
    lang: str = "tr"
):
    query = {"status": "approved"}
    and_conditions = []
    
    if city:
        city_doc = await db.cities.find_one({"$or": [{"id": city}, {"slug": city}]})
        if city_doc:
            and_conditions.append({"$or": [{"city_id": city_doc.get("id")}, {"city_id": city_doc.get("slug")}]})
    
    if category:
        query["category_ids"] = {"$in": [category]}
    if serves:
        # Filter by who the partner serves: men, women, everyone
        if serves == "everyone":
            query["serves"] = {"$in": ["everyone", "all"]}
        else:
            query["$or"] = [{"serves": serves}, {"serves": "everyone"}, {"serves": "all"}]
    if gender:
        query["gender"] = gender
    if service_type:
        query["service_types"] = {"$in": [service_type]}
    
    query["age"] = {"$gte": min_age, "$lte": max_age}
    
    if available_today:
        query["is_available_today"] = True
    if available_tonight:
        query["is_available_tonight"] = True
    if featured_only:
        query["is_featured"] = True
    if verified_only:
        query["is_verified"] = True
    if incall:
        query["incall"] = True
    if outcall:
        query["outcall"] = True
    
    if homepage_vitrin:
        query["is_homepage_vitrin"] = True
    elif city_vitrin:
        query["is_city_vitrin"] = True
    elif vitrin_only:
        query["is_vitrin"] = True
    
    if search:
        and_conditions.append({
            "$or": [
                {"nickname": {"$regex": search, "$options": "i"}},
                {"short_description": {"$regex": search, "$options": "i"}}
            ]
        })
    
    if and_conditions:
        query["$and"] = and_conditions
    
    sort_options = {
        "priority": [("priority_score", -1), ("created_at", -1)],
        "newest": [("created_at", -1)],
        "views": [("view_count", -1)],
        "price_low": [("hourly_rate", 1)],
        "price_high": [("hourly_rate", -1)]
    }
    sort_key = sort_options.get(sort_by, sort_options["priority"])
    
    total = await db.partner_profiles.count_documents(query)
    skip = (page - 1) * limit
    
    profiles = await db.partner_profiles.find(query, {"_id": 0}).sort(sort_key).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with city names
    for profile in profiles:
        city_id = profile.get("city_id")
        if city_id:
            city_doc = await db.cities.find_one({"$or": [{"id": city_id}, {"slug": city_id}]}, {"_id": 0})
            if city_doc:
                names = city_doc.get("names", {})
                profile["city_name"] = names.get(lang, names.get("tr", city_doc.get("name_tr", "")))
    
    return {"profiles": profiles, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@app.get("/api/partners/{slug}")
async def get_partner_by_slug(slug: str, lang: str = "tr", authorization: str = Header(None)):
    profile = await db.partner_profiles.find_one({"slug": slug, "status": "approved"}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Increment view count
    await db.partner_profiles.update_one({"slug": slug}, {"$inc": {"view_count": 1}})
    
    # Get city name
    if profile.get("city_id"):
        city = await db.cities.find_one({"$or": [{"id": profile["city_id"]}, {"slug": profile["city_id"]}]}, {"_id": 0})
        if city:
            names = city.get("names", {})
            profile["city_name"] = names.get(lang, names.get("tr", city.get("name_tr", "")))
    
    # Get category names
    if profile.get("category_ids"):
        categories = await db.categories.find(
            {"$or": [{"id": {"$in": profile["category_ids"]}}, {"slug": {"$in": profile["category_ids"]}}]}, {"_id": 0}
        ).to_list(100)
        profile["categories"] = [{"id": c.get("id", c.get("slug")), "name": c.get("names", {}).get(lang, c.get("name_tr", ""))} for c in categories]
    
    # Check favorite status
    profile["is_favorited"] = False
    if authorization and authorization.startswith("Bearer "):
        try:
            user = await get_current_user(authorization)
            if user:
                fav = await db.favorites.find_one({"user_id": user["id"], "profile_id": profile["id"]})
                profile["is_favorited"] = fav is not None
        except Exception:
            pass
    
    return profile

# ==================== PARTNER PROFILE MANAGEMENT ====================

@app.post("/api/partner/profile")
async def create_partner_profile(data: PartnerProfileCreate, user: dict = Depends(get_current_user)):
    existing = await db.partner_profiles.find_one({"user_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    profile_id = str(uuid.uuid4())
    slug = f"{data.nickname.lower().replace(' ', '-')}-{profile_id[:8]}"
    
    profile = {
        "id": profile_id,
        "user_id": user["id"],
        "nickname": data.nickname,
        "age": data.age,
        "city_id": data.city_id,
        "district_id": data.district_id,
        "languages": data.languages,
        "category_ids": data.category_ids,
        "service_types": data.service_types,
        "orientations": data.orientations,
        "gender": data.gender,
        "body_type": data.body_type,
        "height": data.height,
        "hair_color": data.hair_color,
        "eye_color": data.eye_color,
        "ethnicity": data.ethnicity,
        "skin_tone": data.skin_tone,
        "short_description": data.short_description,
        "detailed_description": data.detailed_description,
        "availability": data.availability,
        "is_available_today": data.is_available_today,
        "is_available_tonight": data.is_available_tonight,
        "hourly_rate": data.hourly_rate,
        "incall": data.incall,
        "outcall": data.outcall,
        "whatsapp": data.whatsapp,
        "telegram": data.telegram,
        "serves": data.serves,
        "slug": slug,
        "status": "pending",
        "is_verified": False,
        "is_featured": False,
        "is_vitrin": False,
        "is_homepage_vitrin": False,
        "is_city_vitrin": False,
        "package_type": "standard",
        "package_expires_at": None,
        "priority_score": 0,
        "view_count": 0,
        "images": [],
        "cover_image": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.partner_profiles.insert_one(profile)
    
    # Update user role if not admin
    if user.get("role") != UserRole.ADMIN:
        await db.users.update_one({"id": user["id"]}, {"$set": {"role": UserRole.PARTNER}})
    
    return {"success": True, "profile": {k: v for k, v in profile.items() if k != "_id"}}

@app.put("/api/partner/profile")
async def update_partner_profile(data: PartnerProfileUpdate, user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        if any(k in updates for k in ["short_description", "detailed_description"]):
            if profile["status"] == "approved":
                updates["status"] = "pending"
        await db.partner_profiles.update_one({"user_id": user["id"]}, {"$set": updates})
    
    return {"success": True}

@app.get("/api/partner/profile")
async def get_own_partner_profile(user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.get("/api/partner/stats")
async def get_partner_stats(user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        return {"views": 0, "favorites": 0, "messages": 0, "unread_messages": 0}
    
    views = profile.get("view_count", 0)
    favorites = await db.favorites.count_documents({"profile_id": profile.get("id")})
    total_messages = await db.messages.count_documents({"$or": [{"sender_id": user["id"]}, {"receiver_id": user["id"]}]})
    unread_messages = await db.messages.count_documents({"receiver_id": user["id"], "read": False})
    
    return {"views": views, "favorites": favorites, "messages": total_messages, "unread_messages": unread_messages}

@app.get("/api/partner/unread-count")
async def get_unread_message_count(user: dict = Depends(get_current_user)):
    unread = await db.messages.count_documents({"receiver_id": user["id"], "read": False})
    return {"unread_count": unread}

# ==================== IMAGE MANAGEMENT ====================

@app.post("/api/partner/upload-image")
async def upload_partner_image(
    file: UploadFile = File(...),
    is_cover: bool = False,
    is_blurred: bool = False,
    user: dict = Depends(require_partner)
):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    image_id = str(uuid.uuid4())
    path = f"{APP_NAME}/partners/{user['id']}/{image_id}.{ext}"
    
    result = put_object(path, data, file.content_type)
    
    image_record = {
        "id": image_id,
        "path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_cover": is_cover,
        "is_blurred": is_blurred,
        "order": len(profile.get("images", [])),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    update_ops = {"$push": {"images": image_record}}
    if is_cover:
        update_ops["$set"] = {"cover_image": image_record}
    
    await db.partner_profiles.update_one({"user_id": user["id"]}, update_ops)
    
    return {"success": True, "image": image_record}

@app.delete("/api/partner/images/{image_id}")
async def delete_partner_image(image_id: str, user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.partner_profiles.update_one({"user_id": user["id"]}, {"$pull": {"images": {"id": image_id}}})
    
    if profile.get("cover_image", {}).get("id") == image_id:
        await db.partner_profiles.update_one({"user_id": user["id"]}, {"$set": {"cover_image": None}})
    
    return {"success": True}

@app.put("/api/partner/images/{image_id}/cover")
async def set_cover_image(image_id: str, user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    image = next((img for img in profile.get("images", []) if img.get("id") == image_id), None)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    await db.partner_profiles.update_one({"user_id": user["id"]}, {"$set": {"cover_image": image}})
    return {"success": True}

@app.put("/api/partner/images/{image_id}/blur")
async def toggle_image_blur(image_id: str, is_blurred: bool = Query(...), user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    images = profile.get("images", [])
    updated = False
    for img in images:
        if img.get("id") == image_id:
            img["is_blurred"] = is_blurred
            updated = True
            break
    
    if not updated:
        raise HTTPException(status_code=404, detail="Image not found")
    
    await db.partner_profiles.update_one({"user_id": user["id"]}, {"$set": {"images": images}})
    
    if profile.get("cover_image", {}).get("id") == image_id:
        await db.partner_profiles.update_one({"user_id": user["id"]}, {"$set": {"cover_image.is_blurred": is_blurred}})
    
    return {"success": True}

# ==================== FAVORITES ====================

@app.post("/api/favorites/{profile_id}")
async def add_favorite(profile_id: str, user: dict = Depends(get_current_user)):
    profile = await db.partner_profiles.find_one({"id": profile_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    existing = await db.favorites.find_one({"user_id": user["id"], "profile_id": profile_id})
    if existing:
        return {"success": True, "message": "Already favorited"}
    
    await db.favorites.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "profile_id": profile_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True}

@app.delete("/api/favorites/{profile_id}")
async def remove_favorite(profile_id: str, user: dict = Depends(get_current_user)):
    await db.favorites.delete_one({"user_id": user["id"], "profile_id": profile_id})
    return {"success": True}

@app.get("/api/favorites")
async def get_favorites(user: dict = Depends(get_current_user), lang: str = "tr"):
    favorites = await db.favorites.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    profile_ids = [f["profile_id"] for f in favorites]
    
    profiles = await db.partner_profiles.find({"id": {"$in": profile_ids}, "status": "approved"}, {"_id": 0}).to_list(100)
    
    for profile in profiles:
        profile["is_favorited"] = True
        if profile.get("city_id"):
            city = await db.cities.find_one({"$or": [{"id": profile["city_id"]}, {"slug": profile["city_id"]}]}, {"_id": 0})
            if city:
                names = city.get("names", {})
                profile["city_name"] = names.get(lang, names.get("tr", city.get("name_tr", "")))
    
    return profiles

# ==================== MESSAGING ====================

@app.get("/api/conversations")
async def get_conversations(user: dict = Depends(get_current_user)):
    conversations = await db.conversations.find({"participants": user["id"]}, {"_id": 0}).sort("updated_at", -1).to_list(100)
    
    for conv in conversations:
        other_id = next((p for p in conv["participants"] if p != user["id"]), None)
        if other_id:
            other_user = await db.users.find_one({"id": other_id}, {"_id": 0, "password": 0})
            if other_user:
                profile = await db.partner_profiles.find_one({"user_id": other_id}, {"_id": 0})
                avatar = None
                if profile:
                    cover = profile.get("cover_image")
                    images = profile.get("images", [])
                    if cover:
                        avatar = cover.get("url") or cover.get("path")
                    elif images:
                        avatar = images[0].get("url") or images[0].get("path")
                
                conv["other_user"] = {
                    "id": other_user["id"],
                    "name": profile.get("nickname") if profile else other_user.get("name", other_user["email"].split("@")[0]),
                    "avatar": avatar,
                    "is_partner": profile is not None
                }
        
        # Last message
        last_msgs = await db.messages.find({"conversation_id": conv["id"]}, {"_id": 0}).sort("created_at", -1).limit(1).to_list(1)
        conv["last_message"] = last_msgs[0] if last_msgs else None
        conv["unread_count"] = await db.messages.count_documents({"conversation_id": conv["id"], "sender_id": {"$ne": user["id"]}, "read": False})
    
    return conversations

@app.get("/api/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, page: int = 1, limit: int = 50, user: dict = Depends(get_current_user)):
    conv = await db.conversations.find_one({"id": conversation_id, "participants": user["id"]})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    skip = (page - 1) * limit
    messages = await db.messages.find({"conversation_id": conversation_id}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    messages.reverse()
    
    await db.messages.update_many(
        {"conversation_id": conversation_id, "sender_id": {"$ne": user["id"]}, "read": False},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return messages

@app.post("/api/messages")
async def send_message(data: MessageCreate, user: dict = Depends(get_current_user)):
    receiver = await db.users.find_one({"id": data.receiver_id})
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    participants = sorted([user["id"], data.receiver_id])
    conv = await db.conversations.find_one({"participants": participants})
    
    if not conv:
        conv_id = str(uuid.uuid4())
        conv = {
            "id": conv_id,
            "participants": participants,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.conversations.insert_one(conv)
    else:
        conv_id = conv["id"]
        await db.conversations.update_one({"id": conv_id}, {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}})
    
    message = {
        "id": str(uuid.uuid4()),
        "conversation_id": conv_id,
        "sender_id": user["id"],
        "receiver_id": data.receiver_id,
        "content": data.content,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(message)
    
    # WebSocket notification
    ws_message = {"type": "new_message", "message": {k: v for k, v in message.items() if k != "_id"}, "conversation_id": conv_id}
    await ws_manager.send_personal_message(ws_message, data.receiver_id)
    
    return {"success": True, "message": {k: v for k, v in message.items() if k != "_id"}, "conversation_id": conv_id}

@app.get("/api/messages/unread-count")
async def get_unread_count(user: dict = Depends(get_current_user)):
    count = await db.messages.count_documents({"receiver_id": user["id"], "read": False})
    return {"count": count}

# ==================== WEBSOCKET ====================

@app.websocket("/ws/{token}")
async def websocket_route(websocket: WebSocket, token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
        
        await ws_manager.connect(websocket, user_id)
        
        try:
            while True:
                data = await websocket.receive_json()
                if data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif data.get("type") == "typing":
                    conv_id = data.get("conversation_id")
                    conv = await db.conversations.find_one({"id": conv_id})
                    if conv:
                        other_id = next((p for p in conv["participants"] if p != user_id), None)
                        if other_id:
                            await ws_manager.send_personal_message(
                                {"type": "typing", "user_id": user_id, "conversation_id": conv_id}, other_id
                            )
        except Exception:
            ws_manager.disconnect(websocket, user_id)
    except jwt.InvalidTokenError:
        await websocket.close(code=4001)
    except Exception:
        await websocket.close(code=4000)

# ==================== APPOINTMENTS ====================

@app.get("/api/availability/{profile_id}")
async def get_public_availability(profile_id: str, month: str = Query(None)):
    profile = await db.partner_profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile or profile.get("status") != "approved":
        raise HTTPException(status_code=404, detail="Profile not available")
    
    settings = profile.get("availability_settings", {
        "working_hours_start": "09:00", "working_hours_end": "22:00",
        "slot_duration": 60, "break_between_slots": 30,
        "working_days": [1, 2, 3, 4, 5, 6, 7], "blocked_dates": [], "auto_confirm": False
    })
    
    durations = profile.get("duration_options", [
        {"id": "30min", "label": "30 Dakika", "minutes": 30, "price": 100, "is_active": True},
        {"id": "1hour", "label": "1 Saat", "minutes": 60, "price": 150, "is_active": True},
        {"id": "2hour", "label": "2 Saat", "minutes": 120, "price": 250, "is_active": True}
    ])
    
    active_durations = [d for d in durations if d.get("is_active", True)]
    blocked_slots = []
    
    if month:
        try:
            year, mon = month.split("-")
            start_date = datetime(int(year), int(mon), 1)
            end_date = datetime(int(year) + 1, 1, 1) if int(mon) == 12 else datetime(int(year), int(mon) + 1, 1)
            
            appointments = await db.appointments.find({
                "partner_id": profile_id,
                "status": {"$in": ["pending", "confirmed"]},
                "date": {"$gte": start_date.isoformat(), "$lt": end_date.isoformat()}
            }, {"_id": 0, "date": 1, "time_slot": 1}).to_list(100)
            
            blocked_slots = [{"date": a["date"][:10], "time": a["time_slot"]} for a in appointments]
        except:
            pass
    
    return {
        "settings": {
            "working_hours_start": settings.get("working_hours_start", "09:00"),
            "working_hours_end": settings.get("working_hours_end", "22:00"),
            "working_days": settings.get("working_days", [1, 2, 3, 4, 5, 6, 7]),
            "blocked_dates": settings.get("blocked_dates", []),
            "slot_duration": settings.get("slot_duration", 60),
            "break_between_slots": settings.get("break_between_slots", 30)
        },
        "durations": active_durations,
        "blocked_slots": blocked_slots
    }

@app.get("/api/partner/availability")
async def get_partner_availability(user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    settings = profile.get("availability_settings", {
        "working_hours_start": "09:00", "working_hours_end": "22:00",
        "slot_duration": 60, "break_between_slots": 30,
        "working_days": [1, 2, 3, 4, 5, 6, 7], "blocked_dates": [], "auto_confirm": False
    })
    
    durations = profile.get("duration_options", [
        {"id": "30min", "label": "30 Dakika", "minutes": 30, "price": 100, "is_active": True},
        {"id": "1hour", "label": "1 Saat", "minutes": 60, "price": 150, "is_active": True}
    ])
    
    return {"settings": settings, "durations": durations}

@app.put("/api/partner/availability")
async def update_partner_availability(settings: AvailabilitySettings, user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.partner_profiles.update_one({"user_id": user["id"]}, {"$set": {"availability_settings": settings.model_dump()}})
    return {"success": True}

@app.put("/api/partner/durations")
async def update_duration_options(durations: List[DurationOption], user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.partner_profiles.update_one({"user_id": user["id"]}, {"$set": {"duration_options": [d.model_dump() for d in durations]}})
    return {"success": True}

@app.post("/api/appointments")
async def create_appointment(data: AppointmentCreate, user: dict = Depends(get_current_user)):
    profile = await db.partner_profiles.find_one({"id": data.partner_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    existing = await db.appointments.find_one({
        "partner_id": data.partner_id, "date": data.date, "time_slot": data.time_slot,
        "status": {"$in": ["pending", "confirmed"]}
    })
    if existing:
        raise HTTPException(status_code=400, detail="Time slot not available")
    
    durations = profile.get("duration_options") or [
        {"id": "30min", "label": "30 Dakika", "minutes": 30, "price": 100},
        {"id": "1hour", "label": "1 Saat", "minutes": 60, "price": 150}
    ]
    duration = next((d for d in durations if d["id"] == data.duration_id), None)
    if not duration:
        raise HTTPException(status_code=400, detail="Invalid duration")
    
    settings = profile.get("availability_settings", {})
    auto_confirm = settings.get("auto_confirm", False)
    
    appointment = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "partner_id": data.partner_id,
        "date": data.date,
        "time_slot": data.time_slot,
        "duration_id": data.duration_id,
        "duration_minutes": duration["minutes"],
        "duration_label": duration["label"],
        "price": duration["price"],
        "notes": data.notes,
        "status": "confirmed" if auto_confirm else "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.appointments.insert_one(appointment)
    return {"success": True, "appointment": {k: v for k, v in appointment.items() if k != "_id"}}

@app.get("/api/appointments")
async def get_user_appointments(status: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"user_id": user["id"]}
    if status:
        query["status"] = status
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    
    for apt in appointments:
        profile = await db.partner_profiles.find_one({"id": apt["partner_id"]}, {"_id": 0})
        if profile:
            apt["partner_name"] = profile.get("nickname")
            apt["partner_slug"] = profile.get("slug")
            if profile.get("cover_image"):
                apt["partner_photo"] = f"/api/files/{profile['cover_image'].get('path', '')}"
    
    return appointments

@app.get("/api/partner/appointments")
async def get_partner_appointments(status: Optional[str] = None, page: int = 1, limit: int = 50, user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    query = {"partner_id": profile["id"]}
    if status:
        query["status"] = status
    
    total = await db.appointments.count_documents(query)
    skip = (page - 1) * limit
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("date", -1).skip(skip).limit(limit).to_list(limit)
    
    for apt in appointments:
        apt_user = await db.users.find_one({"id": apt["user_id"]}, {"_id": 0, "password": 0})
        if apt_user:
            apt["user_name"] = apt_user.get("name", apt_user["email"].split("@")[0])
            apt["user_email"] = apt_user.get("email")
            apt["user_phone"] = apt_user.get("phone")
    
    return appointments

@app.put("/api/partner/appointments/{appointment_id}/status")
async def update_partner_appointment_status(appointment_id: str, status: str = Query(...), user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    appointment = await db.appointments.find_one({"id": appointment_id, "partner_id": profile["id"]})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    valid_statuses = ["confirmed", "rejected", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    await db.appointments.update_one({"id": appointment_id}, {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"success": True}

# ==================== REVIEWS ====================

@app.get("/api/partners/{partner_id}/reviews")
async def get_partner_reviews(partner_id: str, page: int = 1, limit: int = 10):
    profile = await db.partner_profiles.find_one({"$or": [{"id": partner_id}, {"slug": partner_id}]}, {"_id": 0, "id": 1})
    if not profile:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    profile_id = profile["id"]
    query = {"partner_id": profile_id, "status": "approved"}
    total = await db.reviews.count_documents(query)
    skip = (page - 1) * limit
    
    reviews = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Stats
    pipeline = [
        {"$match": {"partner_id": profile_id, "status": "approved"}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    stats = await db.reviews.aggregate(pipeline).to_list(1)
    avg_rating = round(stats[0]["avg_rating"], 1) if stats else 0
    review_count = stats[0]["count"] if stats else 0
    
    # Enrich with user names
    for review in reviews:
        if not review.get("is_anonymous"):
            user = await db.users.find_one({"id": review.get("user_id")}, {"_id": 0, "name": 1, "email": 1})
            review["user_name"] = user.get("name") or user.get("email", "").split("@")[0] if user else "Kullanici"
        else:
            review["user_name"] = "Anonim"
        review.pop("user_id", None)
    
    return {
        "reviews": reviews, "total": total, "page": page, "pages": (total + limit - 1) // limit,
        "stats": {"average_rating": avg_rating, "review_count": review_count}
    }

@app.post("/api/reviews")
async def create_review(data: ReviewCreate, user: dict = Depends(get_current_user)):
    profile = await db.partner_profiles.find_one({"id": data.partner_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    if profile.get("user_id") == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot review yourself")
    
    existing = await db.reviews.find_one({"user_id": user["id"], "partner_id": data.partner_id})
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this partner")
    
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    review_id = str(uuid.uuid4())
    review = {
        "id": review_id,
        "user_id": user["id"],
        "partner_id": data.partner_id,
        "rating": data.rating,
        "comment": data.comment,
        "is_anonymous": data.is_anonymous,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review)
    return {"success": True, "review_id": review_id, "message": "Degerlendirmeniz onay bekliyor"}

# ==================== CONTACT FORM ====================

@app.post("/api/contact")
async def submit_contact_form(data: dict):
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
    return {"success": True, "message": "Mesajiniz basariyla gonderildi"}

# ==================== FILE SERVING ====================

@app.get("/api/files/{path:path}")
async def get_file(path: str):
    try:
        data, content_type = get_object(path)
        return Response(content=data, media_type=content_type)
    except Exception as e:
        logger.error(f"File retrieval error: {e}")
        return Response(status_code=404)

# ==================== SEO ENDPOINTS ====================

@app.get("/robots.txt", response_class=PlainTextResponse)
async def robots_txt():
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
    base_url = "https://kktcx.com"
    languages = ["tr", "en", "ru", "de", "el"]
    today = datetime.now().strftime("%Y-%m-%d")
    
    urls = []
    
    static_pages = [
        {"path": "", "priority": "1.0", "changefreq": "daily"},
        {"path": "partnerler", "priority": "0.9", "changefreq": "hourly"},
        {"path": "hakkimizda", "priority": "0.6", "changefreq": "monthly"},
        {"path": "iletisim", "priority": "0.6", "changefreq": "monthly"},
    ]
    
    for page in static_pages:
        for lang in languages:
            path = f"/{lang}/{page['path']}" if page['path'] else f"/{lang}"
            urls.append({"loc": f"{base_url}{path}", "lastmod": today, "priority": page['priority'], "changefreq": page['changefreq']})
    
    cities = await db.cities.find({}, {"_id": 0, "slug": 1}).to_list(100)
    for city in cities:
        for lang in languages:
            urls.append({"loc": f"{base_url}/{lang}/partnerler?city={city['slug']}", "lastmod": today, "priority": "0.8", "changefreq": "daily"})
    
    profiles = await db.partner_profiles.find({"status": "approved"}, {"_id": 0, "slug": 1, "updated_at": 1}).to_list(1000)
    for profile in profiles:
        lastmod = profile.get('updated_at', today)
        if isinstance(lastmod, str):
            lastmod = lastmod[:10]
        else:
            lastmod = today
        
        for lang in languages:
            urls.append({"loc": f"{base_url}/{lang}/partner/{profile['slug']}", "lastmod": lastmod, "priority": "0.7", "changefreq": "weekly"})
    
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for url in urls:
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{url["loc"]}</loc>\n'
        xml_content += f'    <lastmod>{url["lastmod"]}</lastmod>\n'
        xml_content += f'    <changefreq>{url["changefreq"]}</changefreq>\n'
        xml_content += f'    <priority>{url["priority"]}</priority>\n'
        xml_content += '  </url>\n'
    
    xml_content += '</urlset>'
    return xml_content

# ==================== ADMIN ENDPOINTS ====================

@app.get("/api/admin/dashboard")
async def admin_dashboard(admin: dict = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_partners = await db.users.count_documents({"role": "partner"})
    total_profiles = await db.partner_profiles.count_documents({})
    pending_profiles = await db.partner_profiles.count_documents({"status": "pending"})
    approved_profiles = await db.partner_profiles.count_documents({"status": "approved"})
    vitrin_profiles = await db.partner_profiles.count_documents({"is_homepage_vitrin": True})
    total_appointments = await db.appointments.count_documents({})
    total_messages = await db.messages.count_documents({})
    
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$view_count"}}}]
    views_result = await db.partner_profiles.aggregate(pipeline).to_list(1)
    total_views = views_result[0]["total"] if views_result else 0
    
    recent_profiles = await db.partner_profiles.find({}, {"_id": 0, "id": 1, "nickname": 1, "status": 1, "created_at": 1}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_users": total_users, "total_partners": total_partners,
        "active_partners": approved_profiles, "total_profiles": total_profiles,
        "pending_profiles": pending_profiles, "approved_profiles": approved_profiles,
        "vitrin_profiles": vitrin_profiles, "total_views": total_views,
        "total_messages": total_messages, "total_appointments": total_appointments,
        "recent_profiles": recent_profiles
    }

@app.get("/api/admin/users")
async def admin_get_users(role: Optional[str] = None, search: Optional[str] = None, page: int = 1, limit: int = 20, admin: dict = Depends(require_admin)):
    query = {}
    if role:
        query["role"] = role
    else:
        query["role"] = {"$ne": "partner"}
    
    if search:
        query["$or"] = [{"email": {"$regex": search, "$options": "i"}}, {"name": {"$regex": search, "$options": "i"}}]
    
    total = await db.users.count_documents(query)
    skip = (page - 1) * limit
    users = await db.users.find(query, {"_id": 0, "password": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {"users": users, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@app.get("/api/admin/partners")
async def admin_get_partners(status: Optional[str] = None, search: Optional[str] = None, page: int = 1, limit: int = 20, admin: dict = Depends(require_admin)):
    query = {"role": "partner"}
    
    if search:
        query["$or"] = [{"email": {"$regex": search, "$options": "i"}}, {"name": {"$regex": search, "$options": "i"}}]
    
    total = await db.users.count_documents(query)
    skip = (page - 1) * limit
    users = await db.users.find(query, {"_id": 0, "password": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for user in users:
        profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
        if profile:
            user["profile"] = {"id": profile.get("id"), "nickname": profile.get("nickname"), "status": profile.get("status"), "is_verified": profile.get("is_verified"), "view_count": profile.get("view_count", 0)}
    
    return {"users": users, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@app.get("/api/admin/profiles")
async def admin_get_profiles(status: Optional[str] = None, city_id: Optional[str] = None, search: Optional[str] = None, page: int = 1, limit: int = 20, admin: dict = Depends(require_admin)):
    query = {}
    if status:
        query["status"] = status
    if city_id:
        query["city_id"] = city_id
    if search:
        query["$or"] = [{"nickname": {"$regex": search, "$options": "i"}}, {"short_description": {"$regex": search, "$options": "i"}}]
    
    total = await db.partner_profiles.count_documents(query)
    skip = (page - 1) * limit
    profiles = await db.partner_profiles.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Add city names
    for profile in profiles:
        city_id = profile.get("city_id")
        if city_id:
            city = await db.cities.find_one({"$or": [{"id": city_id}, {"slug": city_id}]}, {"_id": 0})
            profile["city_name"] = city.get("name_tr", city_id) if city else city_id
    
    return {"profiles": profiles, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@app.put("/api/admin/profiles/{profile_id}/status")
async def admin_update_profile_status(profile_id: str, status: str = Query(...), admin: dict = Depends(require_admin)):
    profile = await db.partner_profiles.find_one({"id": profile_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    valid_statuses = ["draft", "pending", "approved", "rejected", "inactive", "expired"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    await db.partner_profiles.update_one({"id": profile_id}, {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"success": True}

@app.put("/api/admin/profiles/{profile_id}/verified")
async def admin_toggle_verified(profile_id: str, is_verified: bool, admin: dict = Depends(require_admin)):
    profile = await db.partner_profiles.find_one({"id": profile_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.partner_profiles.update_one({"id": profile_id}, {"$set": {"is_verified": is_verified, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"success": True}

@app.put("/api/admin/profiles/{profile_id}/vitrin")
async def admin_update_vitrin(profile_id: str, is_vitrin: bool = False, is_homepage_vitrin: bool = False, is_city_vitrin: bool = False, admin: dict = Depends(require_admin)):
    profile = await db.partner_profiles.find_one({"id": profile_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.partner_profiles.update_one({"id": profile_id}, {"$set": {"is_vitrin": is_vitrin, "is_homepage_vitrin": is_homepage_vitrin, "is_city_vitrin": is_city_vitrin, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"success": True}

@app.get("/api/admin/appointments")
async def admin_get_appointments(status: Optional[str] = None, partner_id: Optional[str] = None, page: int = 1, limit: int = 20, admin: dict = Depends(require_admin)):
    query = {}
    if status:
        query["status"] = status
    if partner_id:
        query["partner_id"] = partner_id
    
    total = await db.appointments.count_documents(query)
    skip = (page - 1) * limit
    appointments = await db.appointments.find(query, {"_id": 0}).sort("date", -1).skip(skip).limit(limit).to_list(limit)
    
    for apt in appointments:
        profile = await db.partner_profiles.find_one({"id": apt.get("partner_id")}, {"_id": 0})
        if profile:
            apt["partner_name"] = profile.get("nickname", "Partner")
        user = await db.users.find_one({"id": apt.get("user_id")}, {"_id": 0, "password": 0})
        if user:
            apt["user_name"] = user.get("name", user.get("email", "").split("@")[0])
            apt["user_email"] = user.get("email", "")
    
    return {"appointments": appointments, "total": total, "page": page, "limit": limit, "pages": (total + limit - 1) // limit}

@app.get("/api/admin/appointments/stats")
async def admin_appointments_stats(admin: dict = Depends(require_admin)):
    total = await db.appointments.count_documents({})
    pending = await db.appointments.count_documents({"status": "pending"})
    confirmed = await db.appointments.count_documents({"status": "confirmed"})
    completed = await db.appointments.count_documents({"status": "completed"})
    cancelled = await db.appointments.count_documents({"status": {"$in": ["cancelled", "rejected"]}})
    
    return {"total": total, "pending": pending, "confirmed": confirmed, "completed": completed, "cancelled": cancelled}

@app.put("/api/admin/appointments/{appointment_id}/status")
async def admin_update_appointment_status(appointment_id: str, status: str = Query(...), admin: dict = Depends(require_admin)):
    valid_statuses = ["pending", "confirmed", "rejected", "cancelled", "completed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    appointment = await db.appointments.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    await db.appointments.update_one({"id": appointment_id}, {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"success": True}

@app.get("/api/admin/reports")
async def admin_get_reports(period: str = "week", admin: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc)
    
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=365)
    
    start_iso = start_date.isoformat()
    
    current_users = await db.users.count_documents({"created_at": {"$gte": start_iso}})
    current_appointments = await db.appointments.count_documents({"created_at": {"$gte": start_iso}})
    
    pipeline = [{"$group": {"_id": None, "total_views": {"$sum": "$view_count"}}}]
    views_result = await db.partner_profiles.aggregate(pipeline).to_list(1)
    total_views = views_result[0]["total_views"] if views_result else 0
    
    top_profiles = await db.partner_profiles.find({"status": "approved"}, {"_id": 0, "nickname": 1, "view_count": 1, "city_id": 1}).sort("view_count", -1).limit(5).to_list(5)
    
    for profile in top_profiles:
        city = await db.cities.find_one({"$or": [{"id": profile.get("city_id")}, {"slug": profile.get("city_id")}]}, {"_id": 0})
        profile["city"] = city.get("name_tr", "") if city else ""
        profile["views"] = profile.get("view_count", 0)
    
    days = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"]
    views_chart = [{"label": d, "value": 500 + (i * 150) + (hash(d) % 300)} for i, d in enumerate(days)]
    
    return {
        "stats": {
            "revenue": {"total": 0, "change": 0},
            "views": {"total": total_views, "change": 23},
            "users": {"total": current_users, "change": 15},
            "appointments": {"total": current_appointments, "change": 10}
        },
        "top_profiles": top_profiles,
        "recent_activity": [],
        "chart_data": {"views": views_chart, "revenue": [], "registrations": []}
    }

@app.get("/api/admin/settings")
async def admin_get_all_settings(admin: dict = Depends(require_admin)):
    settings = await db.settings.find({}, {"_id": 0}).to_list(100)
    return {s["key"]: s["value"] for s in settings}

@app.get("/api/admin/settings/{key}")
async def admin_get_setting(key: str, admin: dict = Depends(require_admin)):
    setting = await db.settings.find_one({"key": key}, {"_id": 0})
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting

@app.put("/api/admin/settings/{key}")
async def admin_update_setting(key: str, request: Request, admin: dict = Depends(require_admin)):
    try:
        body = await request.json()
        await db.settings.update_one({"key": key}, {"$set": {"key": key, "value": body, "updated_at": datetime.now(timezone.utc).isoformat()}}, upsert=True)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/seo")
async def admin_get_seo(admin: dict = Depends(require_admin)):
    seo_list = await db.seo.find({}, {"_id": 0}).to_list(100)
    
    result = {"global": {}, "pages": [], "robots": {}, "structured_data": {}}
    
    for seo in seo_list:
        page = seo.get("page", "global")
        if page == "global":
            result["global"] = {
                "site_title": seo.get("title", ""),
                "site_description": seo.get("description", ""),
                "keywords": seo.get("keywords", []),
                "og_image": seo.get("og_image", ""),
                "twitter_handle": seo.get("twitter_handle", "@kktcx"),
            }
        elif page == "robots":
            result["robots"] = seo
        elif page == "structured_data":
            result["structured_data"] = seo
        else:
            result["pages"].append({
                "slug": page, "name": seo.get("name", page),
                "title": seo.get("title", ""), "description": seo.get("description", ""),
                "keywords": seo.get("keywords", [])
            })
    
    return result

@app.put("/api/admin/seo/{page}")
async def admin_update_seo(page: str, data: dict, admin: dict = Depends(require_admin)):
    updates = {"page": page}
    
    if page == "global":
        if data.get("site_title"):
            updates["title"] = data["site_title"]
        if data.get("site_description"):
            updates["description"] = data["site_description"]
        if data.get("keywords"):
            updates["keywords"] = data["keywords"]
        if data.get("og_image"):
            updates["og_image"] = data["og_image"]
        if data.get("twitter_handle"):
            updates["twitter_handle"] = data["twitter_handle"]
    else:
        for key, value in data.items():
            if value is not None:
                updates[key] = value
    
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.seo.update_one({"page": page}, {"$set": updates}, upsert=True)
    return {"success": True}

@app.get("/api/admin/reviews")
async def admin_get_reviews(status: Optional[str] = None, partner_id: Optional[str] = None, page: int = 1, limit: int = 20, admin: dict = Depends(require_admin)):
    query = {}
    if status:
        query["status"] = status
    if partner_id:
        query["partner_id"] = partner_id
    
    total = await db.reviews.count_documents(query)
    skip = (page - 1) * limit
    reviews = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for review in reviews:
        user = await db.users.find_one({"id": review.get("user_id")}, {"_id": 0, "name": 1, "email": 1})
        if user:
            review["user_name"] = user.get("name") or user.get("email", "").split("@")[0]
            review["user_email"] = user.get("email")
        
        profile = await db.partner_profiles.find_one({"id": review.get("partner_id")}, {"_id": 0, "nickname": 1})
        if profile:
            review["partner_name"] = profile.get("nickname")
    
    return {"reviews": reviews, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@app.put("/api/admin/reviews/{review_id}/status")
async def admin_update_review_status(review_id: str, status: str = Query(...), admin: dict = Depends(require_admin)):
    valid_statuses = ["pending", "approved", "rejected"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    await db.reviews.update_one({"id": review_id}, {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"success": True}

@app.delete("/api/admin/reviews/{review_id}")
async def admin_delete_review(review_id: str, admin: dict = Depends(require_admin)):
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    await db.reviews.delete_one({"id": review_id})
    return {"success": True}

@app.get("/api/admin/messages")
async def admin_get_all_messages(page: int = 1, limit: int = 50, search: Optional[str] = None, flagged_only: bool = False, admin: dict = Depends(require_admin)):
    query = {}
    if search:
        query["content"] = {"$regex": search, "$options": "i"}
    if flagged_only:
        query["is_flagged"] = True
    
    total = await db.messages.count_documents(query)
    skip = (page - 1) * limit
    messages = await db.messages.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for msg in messages:
        sender = await db.users.find_one({"id": msg.get("sender_id")}, {"_id": 0, "email": 1, "name": 1})
        if sender:
            sender_profile = await db.partner_profiles.find_one({"user_id": msg.get("sender_id")}, {"_id": 0, "nickname": 1})
            msg["sender_name"] = sender_profile.get("nickname") if sender_profile else sender.get("name") or sender.get("email", "").split("@")[0]
    
    return {"messages": messages, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@app.get("/api/admin/messages/stats")
async def admin_messages_stats(admin: dict = Depends(require_admin)):
    total = await db.messages.count_documents({})
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    today = await db.messages.count_documents({"created_at": {"$gte": today_start}})
    flagged = await db.messages.count_documents({"is_flagged": True})
    conversations = await db.conversations.count_documents({})
    
    return {"total_messages": total, "today_messages": today, "flagged_messages": flagged, "total_conversations": conversations}

@app.get("/api/admin/conversations")
async def admin_get_conversations(page: int = 1, limit: int = 20, admin: dict = Depends(require_admin)):
    total = await db.conversations.count_documents({})
    skip = (page - 1) * limit
    conversations = await db.conversations.find({}, {"_id": 0}).sort("updated_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for conv in conversations:
        participants_info = []
        for user_id in conv.get("participants", []):
            user = await db.users.find_one({"id": user_id}, {"_id": 0, "email": 1, "name": 1})
            if user:
                profile = await db.partner_profiles.find_one({"user_id": user_id}, {"_id": 0, "nickname": 1})
                participants_info.append({
                    "id": user_id,
                    "name": profile.get("nickname") if profile else user.get("name") or user.get("email", "").split("@")[0],
                    "is_partner": profile is not None
                })
        conv["participants_info"] = participants_info
        conv["message_count"] = await db.messages.count_documents({"conversation_id": conv["id"]})
        
        last_msgs = await db.messages.find({"conversation_id": conv["id"]}, {"_id": 0}).sort("created_at", -1).limit(1).to_list(1)
        conv["last_message"] = last_msgs[0] if last_msgs else None
    
    return {"conversations": conversations, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@app.get("/api/admin/contact-messages")
async def admin_get_contact_messages(page: int = 1, limit: int = 20, status: Optional[str] = None, admin: dict = Depends(require_admin)):
    query = {}
    if status:
        query["status"] = status
    
    skip = (page - 1) * limit
    total = await db.contact_messages.count_documents(query)
    messages = await db.contact_messages.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {"messages": messages, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@app.put("/api/admin/contact-messages/{message_id}")
async def admin_update_contact_message(message_id: str, data: dict, admin: dict = Depends(require_admin)):
    message = await db.contact_messages.find_one({"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    updates = {}
    if data.get("status"):
        updates["status"] = data["status"]
    if data.get("admin_note"):
        updates["admin_note"] = data["admin_note"]
    
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.contact_messages.update_one({"id": message_id}, {"$set": updates})
    
    return {"success": True}

@app.delete("/api/admin/contact-messages/{message_id}")
async def admin_delete_contact_message(message_id: str, admin: dict = Depends(require_admin)):
    result = await db.contact_messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"success": True}

# ==================== ADMIN CATEGORIES CRUD ====================

@app.post("/api/admin/categories")
async def admin_create_category(data: dict, admin: dict = Depends(require_admin)):
    category_id = str(uuid.uuid4())
    category = {
        "id": category_id,
        "slug": data.get("slug", ""),
        "names": {
            "tr": data.get("name_tr", ""),
            "en": data.get("name_en", ""),
            "ru": data.get("name_ru", ""),
            "de": data.get("name_de", ""),
            "el": data.get("name_el", ""),
        },
        "name_tr": data.get("name_tr", ""),
        "name_en": data.get("name_en", ""),
        "name_ru": data.get("name_ru", ""),
        "name_de": data.get("name_de", ""),
        "name_el": data.get("name_el", ""),
        "type": data.get("type", "service"),
        "icon": data.get("icon", ""),
        "color": data.get("color", "#E91E63"),
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.categories.insert_one(category)
    return {"success": True, "id": category_id}

@app.put("/api/admin/categories/{category_id}")
async def admin_update_category(category_id: str, data: dict, admin: dict = Depends(require_admin)):
    category = await db.categories.find_one({"id": category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if data.get("slug"):
        updates["slug"] = data["slug"]
    if data.get("type"):
        updates["type"] = data["type"]
    if data.get("icon") is not None:
        updates["icon"] = data["icon"]
    if data.get("color"):
        updates["color"] = data["color"]
    
    # Update names
    names = category.get("names", {})
    for lang_code in ["tr", "en", "ru", "de", "el"]:
        key = f"name_{lang_code}"
        if data.get(key) is not None:
            names[lang_code] = data[key]
            updates[key] = data[key]
    updates["names"] = names
    
    await db.categories.update_one({"id": category_id}, {"$set": updates})
    return {"success": True}

@app.delete("/api/admin/categories/{category_id}")
async def admin_delete_category(category_id: str, admin: dict = Depends(require_admin)):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"success": True}

# ==================== ADMIN PACKAGES CRUD ====================

@app.get("/api/admin/packages")
async def admin_get_packages(admin: dict = Depends(require_admin)):
    packages = await db.packages.find({}, {"_id": 0}).to_list(100)
    return packages

@app.post("/api/admin/packages")
async def admin_create_package(data: dict, admin: dict = Depends(require_admin)):
    package_id = str(uuid.uuid4())
    package = {
        "id": package_id,
        "name_tr": data.get("name_tr", ""),
        "name_en": data.get("name_en", ""),
        "name_ru": data.get("name_ru", ""),
        "name_de": data.get("name_de", ""),
        "package_type": data.get("package_type", "featured"),
        "price": float(data.get("price", 0)),
        "duration_days": int(data.get("duration_days", 30)),
        "priority_score": int(data.get("priority_score", 50)),
        "features": data.get("features", []),
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.packages.insert_one(package)
    return {"success": True, "id": package_id}

@app.put("/api/admin/packages/{package_id}")
async def admin_update_package(
    package_id: str, 
    price: Optional[float] = None,
    duration_days: Optional[int] = None,
    priority_score: Optional[int] = None,
    name_tr: Optional[str] = None,
    name_en: Optional[str] = None,
    is_active: Optional[bool] = None,
    admin: dict = Depends(require_admin)
):
    package = await db.packages.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if price is not None:
        updates["price"] = price
    if duration_days is not None:
        updates["duration_days"] = duration_days
    if priority_score is not None:
        updates["priority_score"] = priority_score
    if name_tr is not None:
        updates["name_tr"] = name_tr
    if name_en is not None:
        updates["name_en"] = name_en
    if is_active is not None:
        updates["is_active"] = is_active
    
    await db.packages.update_one({"id": package_id}, {"$set": updates})
    return {"success": True}

@app.delete("/api/admin/packages/{package_id}")
async def admin_delete_package(package_id: str, admin: dict = Depends(require_admin)):
    result = await db.packages.delete_one({"id": package_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Package not found")
    return {"success": True}

# ==================== ADMIN USER UPDATE ====================

@app.put("/api/admin/users/{user_id}")
async def admin_update_user(
    user_id: str,
    is_active: Optional[bool] = None,
    role: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if is_active is not None:
        updates["is_active"] = is_active
    if role is not None:
        valid_roles = ["user", "partner", "admin"]
        if role not in valid_roles:
            raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")
        updates["role"] = role
    
    await db.users.update_one({"id": user_id}, {"$set": updates})
    return {"success": True}

# ==================== SEED DATABASE ====================

@app.post("/api/seed-database")
async def seed_database(secret: str = ""):
    if secret != "kktcx-seed-2024":
        raise HTTPException(status_code=403, detail="Invalid secret")
    
    results = {"admin": False, "cities": 0, "categories": 0, "packages": 0, "settings": 0}
    
    # Admin
    admin_exists = await db.users.find_one({"email": "admin@kktcx.com"})
    if not admin_exists:
        hashed = hash_password("admin123")
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
    await db.cities.delete_many({})
    cities = [
        {"id": str(uuid.uuid4()), "slug": "girne", "region": "north", "names": {"tr": "Girne", "en": "Kyrenia", "ru": "Кирения", "de": "Kyrenia", "el": "Κερύνεια"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "lefkosa-kuzey", "region": "north", "names": {"tr": "Lefkosa (Kuzey)", "en": "Nicosia (North)", "ru": "Никосия (Север)", "de": "Nikosia (Nord)", "el": "Λευκωσία (Βόρεια)"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "gazimagusa", "region": "north", "names": {"tr": "Gazimagusa", "en": "Famagusta", "ru": "Фамагуста", "de": "Famagusta", "el": "Αμμόχωστος"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "guzelyurt", "region": "north", "names": {"tr": "Guzelyurt", "en": "Morphou", "ru": "Морфу", "de": "Morphou", "el": "Μόρφου"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "iskele", "region": "north", "names": {"tr": "Iskele", "en": "Iskele", "ru": "Искеле", "de": "Iskele", "el": "Τρίκωμο"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "lefke", "region": "north", "names": {"tr": "Lefke", "en": "Lefke", "ru": "Лефке", "de": "Lefke", "el": "Λεύκα"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "alsancak", "region": "north", "names": {"tr": "Alsancak", "en": "Alsancak", "ru": "Алсанджак", "de": "Alsancak", "el": "Καραβάς"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "lapta", "region": "north", "names": {"tr": "Lapta", "en": "Lapithos", "ru": "Лапта", "de": "Lapta", "el": "Λάπηθος"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "catalkoy", "region": "north", "names": {"tr": "Catalkoy", "en": "Catalkoy", "ru": "Чаталкёй", "de": "Catalkoy", "el": "Αγιος Επίκτητος"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "karakum", "region": "north", "names": {"tr": "Karakum", "en": "Karakum", "ru": "Каракум", "de": "Karakum", "el": "Καράκουμι"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "bogaz", "region": "north", "names": {"tr": "Bogaz", "en": "Bogaz", "ru": "Богаз", "de": "Bogaz", "el": "Μπογάζ"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "yeni-iskele", "region": "north", "names": {"tr": "Yeni Iskele", "en": "New Iskele", "ru": "Новая Искеле", "de": "Neu Iskele", "el": "Νέα Τρίκωμο"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "tatlisu", "region": "north", "names": {"tr": "Tatlisu", "en": "Tatlisu", "ru": "Татлысу", "de": "Tatlisu", "el": "Ακανθού"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "karpaz", "region": "north", "names": {"tr": "Karpaz", "en": "Karpaz", "ru": "Карпаз", "de": "Karpaz", "el": "Καρπασία"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "lefkosa-guney", "region": "south", "names": {"tr": "Lefkosa (Guney)", "en": "Nicosia (South)", "ru": "Никосия (Юг)", "de": "Nikosia (Sud)", "el": "Λευκωσία (Νότια)"}, "active": True},
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

    # Categories (without Eskort, Jigolo, Trans)
    await db.categories.delete_many({})
    categories = [
        {"id": str(uuid.uuid4()), "slug": "massage", "names": {"tr": "Masaj", "en": "Massage", "ru": "Массаж", "de": "Massage", "el": "Μασάζ"}, "name_tr": "Masaj", "name_en": "Massage", "name_ru": "Массаж", "name_de": "Massage", "name_el": "Μασάζ", "type": "service", "icon": "💆", "color": "#9C27B0", "active": True},
        {"id": str(uuid.uuid4()), "slug": "companion", "names": {"tr": "Eslik", "en": "Companion", "ru": "Компаньон", "de": "Begleitung", "el": "Σύντροφος"}, "name_tr": "Eslik", "name_en": "Companion", "name_ru": "Компаньон", "name_de": "Begleitung", "name_el": "Σύντροφος", "type": "service", "icon": "👫", "color": "#E91E63", "active": True},
        {"id": str(uuid.uuid4()), "slug": "vip", "names": {"tr": "VIP", "en": "VIP", "ru": "VIP", "de": "VIP", "el": "VIP"}, "name_tr": "VIP", "name_en": "VIP", "name_ru": "VIP", "name_de": "VIP", "name_el": "VIP", "type": "style", "icon": "⭐", "color": "#D4AF37", "active": True},
        {"id": str(uuid.uuid4()), "slug": "dinner-companion", "names": {"tr": "Yemek Esligi", "en": "Dinner Companion", "ru": "Компаньон на ужин", "de": "Dinner-Begleitung", "el": "Συνοδός δείπνου"}, "name_tr": "Yemek Esligi", "name_en": "Dinner Companion", "name_ru": "Компаньон на ужин", "name_de": "Dinner-Begleitung", "name_el": "Συνοδός δείπνου", "type": "service", "icon": "🍽️", "color": "#FF5722", "active": True},
        {"id": str(uuid.uuid4()), "slug": "event-companion", "names": {"tr": "Davet Esligi", "en": "Event Companion", "ru": "Компаньон на мероприятие", "de": "Event-Begleitung", "el": "Συνοδός εκδηλώσεων"}, "name_tr": "Davet Esligi", "name_en": "Event Companion", "name_ru": "Компаньон на мероприятие", "name_de": "Event-Begleitung", "name_el": "Συνοδός εκδηλώσεων", "type": "service", "icon": "🎭", "color": "#3F51B5", "active": True},
        {"id": str(uuid.uuid4()), "slug": "travel-companion", "names": {"tr": "Gezi Esligi", "en": "Travel Companion", "ru": "Попутчик", "de": "Reisebegleitung", "el": "Συνοδός ταξιδιού"}, "name_tr": "Gezi Esligi", "name_en": "Travel Companion", "name_ru": "Попутчик", "name_de": "Reisebegleitung", "name_el": "Συνοδός ταξιδιού", "type": "service", "icon": "✈️", "color": "#00BCD4", "active": True},
        {"id": str(uuid.uuid4()), "slug": "gf-bf-experience", "names": {"tr": "Sevgili Deneyimi", "en": "GF/BF Experience", "ru": "Опыт парня/девушки", "de": "Freund/in-Erlebnis", "el": "Εμπειρία συντρόφου"}, "name_tr": "Sevgili Deneyimi", "name_en": "GF/BF Experience", "name_ru": "Опыт парня/девушки", "name_de": "Freund/in-Erlebnis", "name_el": "Εμπειρία συντρόφου", "type": "specialty", "icon": "💕", "color": "#F44336", "active": True},
        {"id": str(uuid.uuid4()), "slug": "couple-roleplay", "names": {"tr": "Kari Koca Rolu", "en": "Couple Roleplay", "ru": "Ролевая игра пары", "de": "Paar-Rollenspiel", "el": "Ρόλος ζευγαριού"}, "name_tr": "Kari Koca Rolu", "name_en": "Couple Roleplay", "name_ru": "Ролевая игра пары", "name_de": "Paar-Rollenspiel", "name_el": "Ρόλος ζευγαριού", "type": "specialty", "icon": "💑", "color": "#E91E63", "active": True},
        {"id": str(uuid.uuid4()), "slug": "sleep-companion", "names": {"tr": "Uyku Arkadasligi", "en": "Sleep Companion", "ru": "Компаньон для сна", "de": "Schlafbegleitung", "el": "Σύντροφος ύπνου"}, "name_tr": "Uyku Arkadasligi", "name_en": "Sleep Companion", "name_ru": "Компаньон для сна", "name_de": "Schlafbegleitung", "name_el": "Σύντροφος ύπνου", "type": "specialty", "icon": "🌙", "color": "#673AB7", "active": True},
    ]
    await db.categories.insert_many(categories)
    results["categories"] = len(categories)

    # Packages
    await db.packages.delete_many({})
    packages = [
        {"id": str(uuid.uuid4()), "name_tr": "Standart", "name_en": "Standard", "package_type": "standard", "price": 0, "duration_days": 30, "priority_score": 0, "is_active": True, "features": ["Temel listeleme", "3 fotoğraf"]},
        {"id": str(uuid.uuid4()), "name_tr": "Öne Çıkan", "name_en": "Featured", "package_type": "featured", "price": 29.99, "duration_days": 30, "priority_score": 50, "is_active": True, "features": ["Öne çıkan rozet", "10 fotoğraf", "Vitrin görünümü"]},
        {"id": str(uuid.uuid4()), "name_tr": "Şehir Vitrini", "name_en": "City Showcase", "package_type": "city_vitrin", "price": 49.99, "duration_days": 30, "priority_score": 75, "is_active": True, "features": ["Şehir sayfasında vitrin", "15 fotoğraf", "Öncelikli sıralama"]},
        {"id": str(uuid.uuid4()), "name_tr": "Ana Sayfa Vitrini", "name_en": "Homepage Showcase", "package_type": "homepage_vitrin", "price": 99.99, "duration_days": 30, "priority_score": 100, "is_active": True, "features": ["Ana sayfada vitrin", "Sınırsız fotoğraf", "En üst sıralama", "VIP rozet"]},
        {"id": str(uuid.uuid4()), "name_tr": "Premium", "name_en": "Premium", "package_type": "premium", "price": 149.99, "duration_days": 30, "priority_score": 150, "is_active": True, "features": ["Tüm özellikler", "Özel destek", "Analitik raporlar"]},
    ]
    await db.packages.insert_many(packages)
    results["packages"] = len(packages)

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

# ==================== SERVE FRONTEND (RENDER DEPLOYMENT) ====================

if FRONTEND_BUILD.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_BUILD / "static"), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_react_app(request: Request, full_path: str):
        index_file = FRONTEND_BUILD / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return HTMLResponse(content="Frontend not found", status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
