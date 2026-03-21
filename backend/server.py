from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Header, Query, WebSocket, WebSocketDisconnect, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import json
import asyncio
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configuration
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret')
APP_NAME = os.environ.get('APP_NAME', 'kktcx')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Object Storage Configuration
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
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
        logging.error(f"Storage init failed: {e}")
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

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="KKTCX API")
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class UserRole:
    VISITOR = "visitor"
    USER = "user"
    PARTNER = "partner"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    name: Optional[str] = None
    role: str = UserRole.USER
    language: str = "tr"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phone: Optional[str] = None
    name: Optional[str] = None
    role: str = UserRole.USER
    language: str = "tr"

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
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PartnerProfileCreate(BaseModel):
    nickname: str
    age: int
    city_id: str
    district_id: Optional[str] = None
    languages: List[str] = []
    category_ids: List[str] = []
    service_types: List[str] = []  # dinner_companion, event_companion, sleep_companion, gf_bf_experience, spouse_roleplay, travel_companion
    orientations: List[str] = []  # heterosexual, lesbian, gay, bisexual, trans
    gender: str = "female"  # female, male, trans
    body_type: Optional[str] = None  # slim, athletic, curvy, plus-size
    height: Optional[int] = None
    hair_color: Optional[str] = None
    eye_color: Optional[str] = None
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

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class CityCreate(BaseModel):
    name_tr: str
    name_en: str
    name_ru: str
    name_de: str
    name_el: str  # Greek/Rumca
    slug: str
    region: str = "north"  # north (KKTC), south (Greek Cyprus)

class CategoryCreate(BaseModel):
    name_tr: str
    name_en: str
    name_ru: str
    name_de: str
    name_el: str  # Greek/Rumca
    slug: str
    icon: Optional[str] = None

class PackageCreate(BaseModel):
    name_tr: str
    name_en: str
    name_ru: str
    name_de: str
    name_el: str  # Greek/Rumca
    package_type: str  # standard, featured, city_vitrin, homepage_vitrin, premium
    price: float
    duration_days: int
    priority_score: int = 0
    features: Dict[str, Any] = {}

class SettingUpdate(BaseModel):
    key: str
    value: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
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
    except:
        return None

async def require_admin(user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def require_partner(user: dict = Depends(get_current_user)):
    if user["role"] not in [UserRole.PARTNER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Partner access required")
    return user

# ==================== SMS SERVICE ====================

async def get_sms_settings():
    settings = await db.settings.find_one({"key": "netgsm"}, {"_id": 0})
    return settings.get("value", {}) if settings else {}

async def send_sms_notification(phone: str, message: str):
    """Send SMS via Netgsm if configured"""
    try:
        settings = await get_sms_settings()
        if not settings.get("enabled"):
            logger.info(f"SMS disabled, would send to {phone}: {message}")
            # Log the SMS attempt
            await db.sms_logs.insert_one({
                "id": str(uuid.uuid4()),
                "phone": phone,
                "message": message,
                "status": "skipped",
                "reason": "SMS disabled",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            return False
        
        usercode = settings.get("usercode")
        password = settings.get("password")
        msgheader = settings.get("msgheader")
        
        if not all([usercode, password, msgheader]):
            logger.warning("Netgsm credentials not configured")
            return False
        
        from netgsm import Netgsm
        netgsm = Netgsm(username=usercode, password=password)
        response = netgsm.sms.send(
            msgheader=msgheader,
            messages=[{"msg": message, "no": phone}]
        )
        
        await db.sms_logs.insert_one({
            "id": str(uuid.uuid4()),
            "phone": phone,
            "message": message,
            "status": "sent",
            "response": str(response),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return True
    except Exception as e:
        logger.error(f"SMS send failed: {e}")
        await db.sms_logs.insert_one({
            "id": str(uuid.uuid4()),
            "phone": phone,
            "message": message,
            "status": "failed",
            "error": str(e),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return False

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
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
            created_at=user["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
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
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        phone=user.get("phone"),
        name=user.get("name"),
        role=user["role"],
        language=user.get("language", "tr"),
        created_at=user["created_at"]
    )

@api_router.put("/auth/profile")
async def update_profile(
    name: Optional[str] = None,
    phone: Optional[str] = None,
    language: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    updates = {}
    if name is not None:
        updates["name"] = name
    if phone is not None:
        updates["phone"] = phone
    if language is not None:
        updates["language"] = language
    
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    
    return {"success": True}

# ==================== CITIES & DISTRICTS ====================

@api_router.get("/cities")
async def get_cities(lang: str = "tr"):
    cities = await db.cities.find({}, {"_id": 0}).to_list(100)
    for city in cities:
        city["name"] = city.get(f"name_{lang}", city.get("name_en", ""))
    return cities

@api_router.post("/admin/cities")
async def create_city(data: CityCreate, admin: dict = Depends(require_admin)):
    city = {
        "id": str(uuid.uuid4()),
        "name_tr": data.name_tr,
        "name_en": data.name_en,
        "name_ru": data.name_ru,
        "name_de": data.name_de,
        "slug": data.slug,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.cities.insert_one(city)
    return {"success": True, "city": {k: v for k, v in city.items() if k != "_id"}}

@api_router.get("/cities/{city_id}/districts")
async def get_districts(city_id: str, lang: str = "tr"):
    districts = await db.districts.find({"city_id": city_id}, {"_id": 0}).to_list(100)
    for district in districts:
        district["name"] = district.get(f"name_{lang}", district.get("name_en", ""))
    return districts

@api_router.post("/admin/districts")
async def create_district(
    city_id: str,
    name_tr: str,
    name_en: str,
    name_ru: str = "",
    name_de: str = "",
    slug: str = "",
    admin: dict = Depends(require_admin)
):
    district = {
        "id": str(uuid.uuid4()),
        "city_id": city_id,
        "name_tr": name_tr,
        "name_en": name_en,
        "name_ru": name_ru or name_en,
        "name_de": name_de or name_en,
        "slug": slug or name_en.lower().replace(" ", "-"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.districts.insert_one(district)
    return {"success": True, "district": {k: v for k, v in district.items() if k != "_id"}}

# ==================== CATEGORIES ====================

@api_router.get("/categories")
async def get_categories(lang: str = "tr"):
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    for cat in categories:
        cat["name"] = cat.get(f"name_{lang}", cat.get("name_en", ""))
    return categories

@api_router.post("/admin/categories")
async def create_category(data: CategoryCreate, admin: dict = Depends(require_admin)):
    category = {
        "id": str(uuid.uuid4()),
        "name_tr": data.name_tr,
        "name_en": data.name_en,
        "name_ru": data.name_ru,
        "name_de": data.name_de,
        "slug": data.slug,
        "icon": data.icon,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.categories.insert_one(category)
    return {"success": True, "category": {k: v for k, v in category.items() if k != "_id"}}

# ==================== PARTNER PROFILES ====================

@api_router.post("/partner/profile")
async def create_partner_profile(data: PartnerProfileCreate, user: dict = Depends(get_current_user)):
    # Check if profile exists
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
        "slug": slug,
        "status": "draft",  # draft, pending, approved, rejected, inactive, expired
        "is_verified": False,
        "is_featured": False,
        "is_vitrin": False,
        "is_homepage_vitrin": False,  # New: For homepage premium showcase
        "is_city_vitrin": False,  # New: For city page premium showcase
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
    
    # Update user role to partner
    await db.users.update_one({"id": user["id"]}, {"$set": {"role": UserRole.PARTNER}})
    
    return {"success": True, "profile": {k: v for k, v in profile.items() if k != "_id"}}

@api_router.put("/partner/profile")
async def update_partner_profile(data: PartnerProfileUpdate, user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        # If significant changes, reset to pending review
        if any(k in updates for k in ["short_description", "detailed_description"]):
            if profile["status"] == "approved":
                updates["status"] = "pending"
        await db.partner_profiles.update_one({"user_id": user["id"]}, {"$set": updates})
    
    return {"success": True}

@api_router.get("/partner/profile")
async def get_own_partner_profile(user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@api_router.post("/partner/submit-for-review")
async def submit_for_review(user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if profile["status"] not in ["draft", "rejected"]:
        raise HTTPException(status_code=400, detail="Profile cannot be submitted")
    
    await db.partner_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": {"status": "pending", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

# ==================== IMAGE UPLOAD ====================

@api_router.post("/partner/upload-image")
async def upload_partner_image(
    file: UploadFile = File(...),
    is_cover: bool = False,
    is_blurred: bool = False,
    user: dict = Depends(require_partner)
):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Read file
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large")
    
    # Generate path
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    image_id = str(uuid.uuid4())
    path = f"{APP_NAME}/partners/{user['id']}/{image_id}.{ext}"
    
    # Upload to storage
    result = put_object(path, data, file.content_type)
    
    # Create image record with blur support
    image_record = {
        "id": image_id,
        "path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_cover": is_cover,
        "is_blurred": is_blurred,  # New field for blur feature
        "order": len(profile.get("images", [])),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Update profile
    update_ops = {"$push": {"images": image_record}}
    if is_cover:
        update_ops["$set"] = {"cover_image": image_record}
    
    await db.partner_profiles.update_one({"user_id": user["id"]}, update_ops)
    
    return {"success": True, "image": image_record}

@api_router.get("/files/{path:path}")
async def get_file(path: str, auth: str = Query(None), authorization: str = Header(None)):
    try:
        data, content_type = get_object(path)
        return Response(content=data, media_type=content_type)
    except Exception as e:
        raise HTTPException(status_code=404, detail="File not found")

@api_router.delete("/partner/images/{image_id}")
async def delete_partner_image(image_id: str, user: dict = Depends(require_partner)):
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Find and remove image
    images = [img for img in profile.get("images", []) if img["id"] != image_id]
    update_ops = {"$set": {"images": images}}
    
    # If cover was deleted, clear it
    if profile.get("cover_image", {}).get("id") == image_id:
        update_ops["$set"]["cover_image"] = None
    
    await db.partner_profiles.update_one({"user_id": user["id"]}, update_ops)
    return {"success": True}

@api_router.put("/partner/images/{image_id}/blur")
async def toggle_image_blur(image_id: str, is_blurred: bool, user: dict = Depends(require_partner)):
    """Toggle blur status of an image"""
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Find and update image blur status
    images = profile.get("images", [])
    updated = False
    for img in images:
        if img["id"] == image_id:
            img["is_blurred"] = is_blurred
            updated = True
            break
    
    if not updated:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Update cover image if it's the same
    cover_image = profile.get("cover_image")
    if cover_image and cover_image.get("id") == image_id:
        cover_image["is_blurred"] = is_blurred
        await db.partner_profiles.update_one(
            {"user_id": user["id"]},
            {"$set": {"images": images, "cover_image": cover_image}}
        )
    else:
        await db.partner_profiles.update_one(
            {"user_id": user["id"]},
            {"$set": {"images": images}}
        )
    
    return {"success": True}

@api_router.put("/partner/images/{image_id}/cover")
async def set_image_as_cover(image_id: str, user: dict = Depends(require_partner)):
    """Set an image as cover photo"""
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Find the image
    images = profile.get("images", [])
    cover_image = None
    for img in images:
        img["is_cover"] = img["id"] == image_id
        if img["id"] == image_id:
            cover_image = img
    
    if not cover_image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    await db.partner_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": {"images": images, "cover_image": cover_image}}
    )
    
    return {"success": True}

# ==================== PUBLIC PARTNER LISTINGS ====================

@api_router.get("/partners")
async def list_partners(
    city_id: Optional[str] = None,
    district_id: Optional[str] = None,
    category_id: Optional[str] = None,
    service_type: Optional[str] = None,
    orientation: Optional[str] = None,
    gender: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    language: Optional[str] = None,
    available_today: Optional[bool] = None,
    available_tonight: Optional[bool] = None,
    featured_only: Optional[bool] = None,
    verified_only: Optional[bool] = None,
    incall: Optional[bool] = None,
    outcall: Optional[bool] = None,
    sort_by: str = "recommended",
    page: int = 1,
    limit: int = 20,
    lang: str = "tr"
):
    # Build query
    query = {"status": "approved"}
    
    if city_id:
        query["city_id"] = city_id
    if district_id:
        query["district_id"] = district_id
    if category_id:
        query["category_ids"] = category_id
    if service_type:
        query["service_types"] = service_type
    if orientation:
        query["orientations"] = orientation
    if gender:
        query["gender"] = gender
    if min_age:
        query["age"] = {"$gte": min_age}
    if max_age:
        query.setdefault("age", {})["$lte"] = max_age
    if language:
        query["languages"] = language
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
    
    # Build sort
    sort_options = {
        "recommended": [("priority_score", -1), ("created_at", -1)],
        "newest": [("created_at", -1)],
        "popular": [("view_count", -1)],
        "featured": [("is_featured", -1), ("priority_score", -1)]
    }
    sort = sort_options.get(sort_by, sort_options["recommended"])
    
    # Get total count
    total = await db.partner_profiles.count_documents(query)
    
    # Get profiles
    skip = (page - 1) * limit
    profiles = await db.partner_profiles.find(query, {"_id": 0}).sort(sort).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with city/district names
    city_ids = list(set(p.get("city_id") for p in profiles if p.get("city_id")))
    cities = {c["id"]: c for c in await db.cities.find({"id": {"$in": city_ids}}, {"_id": 0}).to_list(100)}
    
    for profile in profiles:
        city = cities.get(profile.get("city_id"), {})
        profile["city_name"] = city.get(f"name_{lang}", city.get("name_en", ""))
    
    return {
        "profiles": profiles,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@api_router.get("/partners/{slug}")
async def get_partner_profile(slug: str, lang: str = "tr", user: dict = Depends(get_optional_user)):
    profile = await db.partner_profiles.find_one({"slug": slug, "status": "approved"}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Increment view count
    await db.partner_profiles.update_one({"slug": slug}, {"$inc": {"view_count": 1}})
    
    # Get city and district
    city = await db.cities.find_one({"id": profile.get("city_id")}, {"_id": 0})
    if city:
        profile["city_name"] = city.get(f"name_{lang}", city.get("name_en", ""))
    
    district = await db.districts.find_one({"id": profile.get("district_id")}, {"_id": 0})
    if district:
        profile["district_name"] = district.get(f"name_{lang}", district.get("name_en", ""))
    
    # Get categories
    if profile.get("category_ids"):
        categories = await db.categories.find({"id": {"$in": profile["category_ids"]}}, {"_id": 0}).to_list(100)
        profile["categories"] = [{"id": c["id"], "name": c.get(f"name_{lang}", c.get("name_en", ""))} for c in categories]
    
    # Check if favorited
    if user:
        favorite = await db.favorites.find_one({"user_id": user["id"], "profile_id": profile["id"]})
        profile["is_favorited"] = favorite is not None
    else:
        profile["is_favorited"] = False
    
    return profile

@api_router.get("/partners/city/{city_slug}")
async def get_partners_by_city(city_slug: str, page: int = 1, limit: int = 20, lang: str = "tr"):
    city = await db.cities.find_one({"slug": city_slug}, {"_id": 0})
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    
    return await list_partners(city_id=city["id"], page=page, limit=limit, lang=lang)

# ==================== FAVORITES ====================

@api_router.post("/favorites/{profile_id}")
async def add_favorite(profile_id: str, user: dict = Depends(get_current_user)):
    # Check if profile exists
    profile = await db.partner_profiles.find_one({"id": profile_id, "status": "approved"})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Check if already favorited
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

@api_router.delete("/favorites/{profile_id}")
async def remove_favorite(profile_id: str, user: dict = Depends(get_current_user)):
    await db.favorites.delete_one({"user_id": user["id"], "profile_id": profile_id})
    return {"success": True}

@api_router.get("/favorites")
async def get_favorites(user: dict = Depends(get_current_user), lang: str = "tr"):
    favorites = await db.favorites.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    profile_ids = [f["profile_id"] for f in favorites]
    
    profiles = await db.partner_profiles.find(
        {"id": {"$in": profile_ids}, "status": "approved"},
        {"_id": 0}
    ).to_list(100)
    
    # Enrich with city names
    city_ids = list(set(p.get("city_id") for p in profiles if p.get("city_id")))
    cities = {c["id"]: c for c in await db.cities.find({"id": {"$in": city_ids}}, {"_id": 0}).to_list(100)}
    
    for profile in profiles:
        city = cities.get(profile.get("city_id"), {})
        profile["city_name"] = city.get(f"name_{lang}", city.get("name_en", ""))
        profile["is_favorited"] = True
    
    return profiles

# ==================== MESSAGING ====================

@api_router.post("/messages")
async def send_message(data: MessageCreate, user: dict = Depends(get_current_user)):
    # Get receiver
    receiver = await db.users.find_one({"id": data.receiver_id}, {"_id": 0})
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    # Find or create conversation
    conversation = await db.conversations.find_one({
        "$or": [
            {"participants": [user["id"], data.receiver_id]},
            {"participants": [data.receiver_id, user["id"]]}
        ]
    }, {"_id": 0})
    
    if not conversation:
        conversation = {
            "id": str(uuid.uuid4()),
            "participants": [user["id"], data.receiver_id],
            "last_message": None,
            "last_message_at": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.conversations.insert_one(conversation)
    
    # Create message
    message = {
        "id": str(uuid.uuid4()),
        "conversation_id": conversation["id"],
        "sender_id": user["id"],
        "receiver_id": data.receiver_id,
        "content": data.content,
        "status": "sent",  # sent, delivered, read
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(message)
    
    # Update conversation
    await db.conversations.update_one(
        {"id": conversation["id"]},
        {"$set": {
            "last_message": data.content[:100],
            "last_message_at": message["created_at"]
        }}
    )
    
    # Send SMS notification
    if receiver.get("phone"):
        await send_sms_notification(
            receiver["phone"],
            "KKTCX üzerinde yeni bir mesajınız var. Giriş yaparak görüntüleyin."
        )
    
    return {"success": True, "message": {k: v for k, v in message.items() if k != "_id"}}

@api_router.get("/conversations")
async def get_conversations(user: dict = Depends(get_current_user)):
    conversations = await db.conversations.find(
        {"participants": user["id"]},
        {"_id": 0}
    ).sort("last_message_at", -1).to_list(100)
    
    # Get other participants' info
    for conv in conversations:
        other_id = [p for p in conv["participants"] if p != user["id"]][0]
        other_user = await db.users.find_one({"id": other_id}, {"_id": 0, "password": 0})
        
        # Get partner profile if exists
        partner_profile = await db.partner_profiles.find_one({"user_id": other_id}, {"_id": 0})
        
        conv["other_user"] = {
            "id": other_user["id"] if other_user else other_id,
            "name": partner_profile.get("nickname") if partner_profile else (other_user.get("name") if other_user else "Unknown"),
            "avatar": partner_profile.get("cover_image", {}).get("path") if partner_profile else None
        }
        
        # Get unread count
        unread = await db.messages.count_documents({
            "conversation_id": conv["id"],
            "receiver_id": user["id"],
            "status": {"$ne": "read"}
        })
        conv["unread_count"] = unread
    
    return conversations

@api_router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, page: int = 1, limit: int = 50, user: dict = Depends(get_current_user)):
    # Verify user is participant
    conversation = await db.conversations.find_one({"id": conversation_id, "participants": user["id"]})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    skip = (page - 1) * limit
    messages = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Mark as read
    await db.messages.update_many(
        {"conversation_id": conversation_id, "receiver_id": user["id"], "status": {"$ne": "read"}},
        {"$set": {"status": "read"}}
    )
    
    return list(reversed(messages))

# ==================== PACKAGES ====================

@api_router.get("/packages")
async def get_packages(lang: str = "tr"):
    packages = await db.packages.find({"is_active": True}, {"_id": 0}).to_list(100)
    for pkg in packages:
        pkg["name"] = pkg.get(f"name_{lang}", pkg.get("name_en", ""))
    return packages

@api_router.post("/admin/packages")
async def create_package(data: PackageCreate, admin: dict = Depends(require_admin)):
    package = {
        "id": str(uuid.uuid4()),
        "name_tr": data.name_tr,
        "name_en": data.name_en,
        "name_ru": data.name_ru,
        "name_de": data.name_de,
        "package_type": data.package_type,
        "price": data.price,
        "duration_days": data.duration_days,
        "priority_score": data.priority_score,
        "features": data.features,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.packages.insert_one(package)
    return {"success": True, "package": {k: v for k, v in package.items() if k != "_id"}}

@api_router.put("/admin/packages/{package_id}")
async def update_package(
    package_id: str,
    price: Optional[float] = None,
    duration_days: Optional[int] = None,
    priority_score: Optional[int] = None,
    is_active: Optional[bool] = None,
    name_tr: Optional[str] = None,
    name_en: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    package = await db.packages.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    updates = {}
    if price is not None:
        updates["price"] = price
    if duration_days is not None:
        updates["duration_days"] = duration_days
    if priority_score is not None:
        updates["priority_score"] = priority_score
    if is_active is not None:
        updates["is_active"] = is_active
    if name_tr is not None:
        updates["name_tr"] = name_tr
    if name_en is not None:
        updates["name_en"] = name_en
    
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.packages.update_one({"id": package_id}, {"$set": updates})
    
    return {"success": True}

# ==================== STRIPE PAYMENTS ====================

@api_router.post("/payments/checkout")
async def create_checkout(
    package_id: str,
    origin_url: str,
    user: dict = Depends(require_partner)
):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    # Get package
    package = await db.packages.find_one({"id": package_id, "is_active": True})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Get Stripe settings
    stripe_settings = await db.settings.find_one({"key": "stripe"}, {"_id": 0})
    api_key = stripe_settings.get("value", {}).get("api_key", STRIPE_API_KEY) if stripe_settings else STRIPE_API_KEY
    
    success_url = f"{origin_url}/partner/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/partner/packages"
    
    stripe_checkout = StripeCheckout(
        api_key=api_key,
        webhook_url=f"{origin_url}/api/webhook/stripe"
    )
    
    checkout_request = CheckoutSessionRequest(
        amount=float(package["price"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["id"],
            "package_id": package_id,
            "package_type": package["package_type"]
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "package_id": package_id,
        "session_id": session.session_id,
        "amount": float(package["price"]),
        "currency": "usd",
        "status": "pending",
        "payment_status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, user: dict = Depends(get_current_user)):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Get Stripe settings
    stripe_settings = await db.settings.find_one({"key": "stripe"}, {"_id": 0})
    api_key = stripe_settings.get("value", {}).get("api_key", STRIPE_API_KEY) if stripe_settings else STRIPE_API_KEY
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction
    if status.payment_status == "paid" and transaction["payment_status"] != "paid":
        # Apply package to profile
        package = await db.packages.find_one({"id": transaction["package_id"]})
        if package:
            expires_at = (datetime.now(timezone.utc) + timedelta(days=package["duration_days"])).isoformat()
            await db.partner_profiles.update_one(
                {"user_id": transaction["user_id"]},
                {"$set": {
                    "package_type": package["package_type"],
                    "package_expires_at": expires_at,
                    "is_featured": package["package_type"] in ["featured", "premium"],
                    "is_vitrin": package["package_type"] in ["city_vitrin", "homepage_vitrin", "premium"],
                    "priority_score": package["priority_score"]
                }}
            )
        
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"status": "completed", "payment_status": "paid"}}
        )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount": status.amount_total / 100,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    stripe_settings = await db.settings.find_one({"key": "stripe"}, {"_id": 0})
    api_key = stripe_settings.get("value", {}).get("api_key", STRIPE_API_KEY) if stripe_settings else STRIPE_API_KEY
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    try:
        event = await stripe_checkout.handle_webhook(body, signature)
        
        if event.payment_status == "paid":
            transaction = await db.payment_transactions.find_one({"session_id": event.session_id})
            if transaction and transaction["payment_status"] != "paid":
                package = await db.packages.find_one({"id": transaction["package_id"]})
                if package:
                    expires_at = (datetime.now(timezone.utc) + timedelta(days=package["duration_days"])).isoformat()
                    await db.partner_profiles.update_one(
                        {"user_id": transaction["user_id"]},
                        {"$set": {
                            "package_type": package["package_type"],
                            "package_expires_at": expires_at,
                            "is_featured": package["package_type"] in ["featured", "premium"],
                            "is_vitrin": package["package_type"] in ["city_vitrin", "homepage_vitrin", "premium"],
                            "priority_score": package["priority_score"]
                        }}
                    )
                
                await db.payment_transactions.update_one(
                    {"session_id": event.session_id},
                    {"$set": {"status": "completed", "payment_status": "paid"}}
                )
        
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"received": True, "error": str(e)}

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/dashboard")
async def admin_dashboard(admin: dict = Depends(require_admin)):
    total_users = await db.users.count_documents({"role": "user"})
    total_partners = await db.users.count_documents({"role": "partner"})
    pending_profiles = await db.partner_profiles.count_documents({"status": "pending"})
    approved_profiles = await db.partner_profiles.count_documents({"status": "approved"})
    vitrin_profiles = await db.partner_profiles.count_documents({"is_vitrin": True})
    total_messages = await db.messages.count_documents({})
    total_sms = await db.sms_logs.count_documents({})
    failed_sms = await db.sms_logs.count_documents({"status": "failed"})
    
    return {
        "total_users": total_users,
        "total_partners": total_partners,
        "pending_profiles": pending_profiles,
        "approved_profiles": approved_profiles,
        "vitrin_profiles": vitrin_profiles,
        "total_messages": total_messages,
        "total_sms": total_sms,
        "failed_sms": failed_sms
    }

@api_router.get("/admin/users")
async def admin_get_users(
    role: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    admin: dict = Depends(require_admin)
):
    query = {}
    if role:
        query["role"] = role
    
    total = await db.users.count_documents(query)
    skip = (page - 1) * limit
    users = await db.users.find(query, {"_id": 0, "password": 0}).skip(skip).limit(limit).to_list(limit)
    
    return {"users": users, "total": total, "page": page, "limit": limit}

@api_router.put("/admin/users/{user_id}")
async def admin_update_user(
    user_id: str,
    is_active: Optional[bool] = None,
    role: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    updates = {}
    if is_active is not None:
        updates["is_active"] = is_active
    if role:
        updates["role"] = role
    
    if updates:
        await db.users.update_one({"id": user_id}, {"$set": updates})
    
    return {"success": True}

@api_router.get("/admin/profiles")
async def admin_get_profiles(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    admin: dict = Depends(require_admin)
):
    query = {}
    if status:
        query["status"] = status
    
    total = await db.partner_profiles.count_documents(query)
    skip = (page - 1) * limit
    profiles = await db.partner_profiles.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    return {"profiles": profiles, "total": total, "page": page, "limit": limit}

@api_router.put("/admin/profiles/{profile_id}/approve")
async def admin_approve_profile(profile_id: str, admin: dict = Depends(require_admin)):
    await db.partner_profiles.update_one(
        {"id": profile_id},
        {"$set": {"status": "approved", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

@api_router.put("/admin/profiles/{profile_id}/reject")
async def admin_reject_profile(profile_id: str, reason: str = "", admin: dict = Depends(require_admin)):
    await db.partner_profiles.update_one(
        {"id": profile_id},
        {"$set": {
            "status": "rejected",
            "rejection_reason": reason,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"success": True}

@api_router.put("/admin/profiles/{profile_id}/vitrin")
async def admin_toggle_vitrin(profile_id: str, is_vitrin: bool, admin: dict = Depends(require_admin)):
    await db.partner_profiles.update_one(
        {"id": profile_id},
        {"$set": {"is_vitrin": is_vitrin, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

@api_router.put("/admin/profiles/{profile_id}/featured")
async def admin_toggle_featured(profile_id: str, is_featured: bool, admin: dict = Depends(require_admin)):
    await db.partner_profiles.update_one(
        {"id": profile_id},
        {"$set": {"is_featured": is_featured, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

@api_router.put("/admin/profiles/{profile_id}/homepage-vitrin")
async def admin_toggle_homepage_vitrin(profile_id: str, is_homepage_vitrin: bool, admin: dict = Depends(require_admin)):
    """Toggle homepage premium vitrin status"""
    await db.partner_profiles.update_one(
        {"id": profile_id},
        {"$set": {"is_homepage_vitrin": is_homepage_vitrin, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

@api_router.put("/admin/profiles/{profile_id}/city-vitrin")
async def admin_toggle_city_vitrin(profile_id: str, is_city_vitrin: bool, admin: dict = Depends(require_admin)):
    """Toggle city page premium vitrin status"""
    await db.partner_profiles.update_one(
        {"id": profile_id},
        {"$set": {"is_city_vitrin": is_city_vitrin, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

# ==================== SETTINGS ====================

@api_router.get("/admin/settings")
async def admin_get_settings(admin: dict = Depends(require_admin)):
    settings = await db.settings.find({}, {"_id": 0}).to_list(100)
    return {s["key"]: s.get("value", {}) for s in settings}

@api_router.put("/admin/settings/{key}")
async def admin_update_setting(key: str, value: Dict[str, Any], admin: dict = Depends(require_admin)):
    await db.settings.update_one(
        {"key": key},
        {"$set": {"key": key, "value": value, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"success": True}

@api_router.get("/admin/sms-logs")
async def admin_get_sms_logs(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    admin: dict = Depends(require_admin)
):
    query = {}
    if status:
        query["status"] = status
    
    total = await db.sms_logs.count_documents(query)
    skip = (page - 1) * limit
    logs = await db.sms_logs.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {"logs": logs, "total": total, "page": page, "limit": limit}

# ==================== TRANSLATIONS ====================

@api_router.get("/translations/{lang}")
async def get_translations(lang: str):
    translations = await db.translations.find_one({"lang": lang}, {"_id": 0})
    return translations.get("data", {}) if translations else {}

@api_router.put("/admin/translations/{lang}")
async def update_translations(lang: str, data: Dict[str, str], admin: dict = Depends(require_admin)):
    await db.translations.update_one(
        {"lang": lang},
        {"$set": {"lang": lang, "data": data, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"success": True}

# ==================== SEO ====================

@api_router.get("/seo/{page_slug}")
async def get_seo(page_slug: str, lang: str = "tr"):
    seo = await db.seo_pages.find_one({"slug": page_slug}, {"_id": 0})
    if not seo:
        return {}
    
    return {
        "title": seo.get(f"title_{lang}", seo.get("title_en", "")),
        "description": seo.get(f"description_{lang}", seo.get("description_en", "")),
        "keywords": seo.get(f"keywords_{lang}", seo.get("keywords_en", "")),
        "og_image": seo.get("og_image", "")
    }

@api_router.get("/admin/seo")
async def admin_get_seo(admin: dict = Depends(require_admin)):
    """Get all SEO settings"""
    global_seo = await db.settings.find_one({"key": "seo_global"}, {"_id": 0})
    pages_seo = await db.seo_pages.find({}, {"_id": 0}).to_list(100)
    robots_seo = await db.settings.find_one({"key": "seo_robots"}, {"_id": 0})
    
    return {
        "global": global_seo.get("value", {}) if global_seo else {},
        "pages": pages_seo or [],
        "robots": robots_seo.get("value", {}) if robots_seo else {}
    }

@api_router.put("/admin/seo/{section}")
async def admin_update_seo(
    section: str,
    data: Dict[str, Any],
    admin: dict = Depends(require_admin)
):
    """Update SEO settings by section (global, pages, robots)"""
    if section == "global":
        await db.settings.update_one(
            {"key": "seo_global"},
            {"$set": {"key": "seo_global", "value": data, "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
    elif section == "pages":
        # Update each page's SEO
        for page in data:
            await db.seo_pages.update_one(
                {"slug": page.get("slug")},
                {"$set": {**page, "updated_at": datetime.now(timezone.utc).isoformat()}},
                upsert=True
            )
    elif section == "robots":
        await db.settings.update_one(
            {"key": "seo_robots"},
            {"$set": {"key": "seo_robots", "value": data, "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
    return {"success": True}

# ==================== CONTENT MANAGEMENT ====================

@api_router.get("/admin/content")
async def admin_get_content(admin: dict = Depends(require_admin)):
    """Get all page content"""
    contents = await db.page_content.find({}, {"_id": 0}).to_list(100)
    result = {}
    for content in contents:
        page = content.get("page")
        lang = content.get("lang")
        if page not in result:
            result[page] = {}
        result[page][lang] = content.get("data", {})
    return result

@api_router.put("/admin/content/{page}")
async def admin_update_content(
    page: str,
    data: Dict[str, Any],
    admin: dict = Depends(require_admin)
):
    """Update page content for all languages"""
    for lang, content in data.items():
        await db.page_content.update_one(
            {"page": page, "lang": lang},
            {"$set": {
                "page": page,
                "lang": lang,
                "data": content,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
    return {"success": True}

@api_router.get("/content/{page}")
async def get_page_content(page: str, lang: str = "tr"):
    """Get content for a specific page and language"""
    content = await db.page_content.find_one(
        {"page": page, "lang": lang}, 
        {"_id": 0}
    )
    if not content:
        # Fallback to English
        content = await db.page_content.find_one(
            {"page": page, "lang": "en"}, 
            {"_id": 0}
        )
    return content.get("data", {}) if content else {}

# ==================== VITRIN / HOMEPAGE DATA ====================

@api_router.get("/homepage")
async def get_homepage_data(lang: str = "tr"):
    # Get homepage vitrin profiles (Premium - Highest tier)
    homepage_vitrin = await db.partner_profiles.find(
        {"status": "approved", "is_homepage_vitrin": True},
        {"_id": 0}
    ).sort("priority_score", -1).limit(4).to_list(4)
    
    # Get regular vitrin profiles
    vitrin_profiles = await db.partner_profiles.find(
        {"status": "approved", "is_vitrin": True},
        {"_id": 0}
    ).sort("priority_score", -1).limit(8).to_list(8)
    
    # Get featured profiles
    featured_profiles = await db.partner_profiles.find(
        {"status": "approved", "is_featured": True},
        {"_id": 0}
    ).sort("priority_score", -1).limit(8).to_list(8)
    
    # Get today available
    today_available = await db.partner_profiles.find(
        {"status": "approved", "is_available_today": True},
        {"_id": 0}
    ).sort("priority_score", -1).limit(8).to_list(8)
    
    # Get new profiles (recently approved)
    new_profiles = await db.partner_profiles.find(
        {"status": "approved"},
        {"_id": 0}
    ).sort("created_at", -1).limit(8).to_list(8)
    
    # Get cities with partner counts
    cities = await db.cities.find({}, {"_id": 0}).to_list(100)
    for city in cities:
        city["name"] = city.get(f"name_{lang}", city.get("name_en", ""))
        city["partner_count"] = await db.partner_profiles.count_documents(
            {"city_id": city["id"], "status": "approved"}
        )
        # Get city vitrin profiles
        city["vitrin_profiles"] = await db.partner_profiles.find(
            {"city_id": city["id"], "status": "approved", "is_city_vitrin": True},
            {"_id": 0}
        ).sort("priority_score", -1).limit(4).to_list(4)
    
    # Enrich profiles with city names
    city_map = {c["id"]: c for c in cities}
    for profiles in [homepage_vitrin, vitrin_profiles, featured_profiles, today_available, new_profiles]:
        for p in profiles:
            city = city_map.get(p.get("city_id"), {})
            p["city_name"] = city.get("name", "")
    
    # Also enrich city vitrin profiles
    for city in cities:
        for p in city.get("vitrin_profiles", []):
            p["city_name"] = city.get("name", "")
    
    # Get categories
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    for cat in categories:
        cat["name"] = cat.get(f"name_{lang}", cat.get("name_en", ""))
    
    # Get total counts for stats
    total_profiles = await db.partner_profiles.count_documents({"status": "approved"})
    total_cities = len([c for c in cities if c["partner_count"] > 0])
    
    return {
        "homepage_vitrin": homepage_vitrin,  # Premium showcase (top tier)
        "vitrin_profiles": vitrin_profiles,
        "featured_profiles": featured_profiles,
        "today_available": today_available,
        "new_profiles": new_profiles,
        "cities": cities,  # Return all cities (both North and South Cyprus)
        "categories": categories,
        "stats": {
            "total_profiles": total_profiles,
            "total_cities": len(cities)
        }
    }

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "KKTCX API v1.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.partner_profiles.create_index("user_id", unique=True)
    await db.partner_profiles.create_index("slug", unique=True)
    await db.partner_profiles.create_index([("status", 1), ("priority_score", -1)])
    await db.conversations.create_index("participants")
    await db.messages.create_index([("conversation_id", 1), ("created_at", -1)])
    await db.favorites.create_index([("user_id", 1), ("profile_id", 1)], unique=True)
    
    # Seed initial data if empty
    if await db.cities.count_documents({}) == 0:
        await seed_initial_data()

async def seed_initial_data():
    """Seed initial cities, categories, packages"""
    
    # ==================== CITIES ====================
    # North Cyprus (KKTC)
    north_cities = [
        {"id": str(uuid.uuid4()), "name_tr": "Girne", "name_en": "Kyrenia", "name_ru": "Кирения", "name_de": "Kyrenia", "name_el": "Κερύνεια", "slug": "girne", "region": "north"},
        {"id": str(uuid.uuid4()), "name_tr": "Lefkoşa (Kuzey)", "name_en": "North Nicosia", "name_ru": "Северная Никосия", "name_de": "Nord-Nikosia", "name_el": "Βόρεια Λευκωσία", "slug": "lefkosa-kuzey", "region": "north"},
        {"id": str(uuid.uuid4()), "name_tr": "Gazimağusa", "name_en": "Famagusta", "name_ru": "Фамагуста", "name_de": "Famagusta", "name_el": "Αμμόχωστος", "slug": "gazimagusa", "region": "north"},
        {"id": str(uuid.uuid4()), "name_tr": "Güzelyurt", "name_en": "Morphou", "name_ru": "Морфу", "name_de": "Morphou", "name_el": "Μόρφου", "slug": "guzelyurt", "region": "north"},
        {"id": str(uuid.uuid4()), "name_tr": "İskele", "name_en": "Iskele", "name_ru": "Искеле", "name_de": "Iskele", "name_el": "Τρίκωμο", "slug": "iskele", "region": "north"},
        {"id": str(uuid.uuid4()), "name_tr": "Lefke", "name_en": "Lefke", "name_ru": "Лефке", "name_de": "Lefke", "name_el": "Λεύκα", "slug": "lefke", "region": "north"},
        {"id": str(uuid.uuid4()), "name_tr": "Dipkarpaz", "name_en": "Rizokarpaso", "name_ru": "Дипкарпаз", "name_de": "Rizokarpaso", "name_el": "Ριζοκάρπασο", "slug": "dipkarpaz", "region": "north"},
        {"id": str(uuid.uuid4()), "name_tr": "Alsancak", "name_en": "Alsancak", "name_ru": "Алсанджак", "name_de": "Alsancak", "name_el": "Καραβάς", "slug": "alsancak", "region": "north"},
        {"id": str(uuid.uuid4()), "name_tr": "Lapta", "name_en": "Lapithos", "name_ru": "Лапта", "name_de": "Lapithos", "name_el": "Λάπηθος", "slug": "lapta", "region": "north"},
        {"id": str(uuid.uuid4()), "name_tr": "Çatalköy", "name_en": "Catalköy", "name_ru": "Чаталкёй", "name_de": "Catalköy", "name_el": "Άγιος Επίκτητος", "slug": "catalkoy", "region": "north"},
    ]
    
    # South Cyprus (Greek Cyprus - Rum Kesimi)
    south_cities = [
        {"id": str(uuid.uuid4()), "name_tr": "Lefkoşa (Güney)", "name_en": "Nicosia", "name_ru": "Никосия", "name_de": "Nikosia", "name_el": "Λευκωσία", "slug": "lefkosa-guney", "region": "south"},
        {"id": str(uuid.uuid4()), "name_tr": "Limasol", "name_en": "Limassol", "name_ru": "Лимасол", "name_de": "Limassol", "name_el": "Λεμεσός", "slug": "limasol", "region": "south"},
        {"id": str(uuid.uuid4()), "name_tr": "Larnaka", "name_en": "Larnaca", "name_ru": "Ларнака", "name_de": "Larnaka", "name_el": "Λάρνακα", "slug": "larnaka", "region": "south"},
        {"id": str(uuid.uuid4()), "name_tr": "Baf", "name_en": "Paphos", "name_ru": "Пафос", "name_de": "Paphos", "name_el": "Πάφος", "slug": "baf", "region": "south"},
        {"id": str(uuid.uuid4()), "name_tr": "Ayia Napa", "name_en": "Ayia Napa", "name_ru": "Айя-Напа", "name_de": "Ayia Napa", "name_el": "Αγία Νάπα", "slug": "ayia-napa", "region": "south"},
        {"id": str(uuid.uuid4()), "name_tr": "Protaras", "name_en": "Protaras", "name_ru": "Протарас", "name_de": "Protaras", "name_el": "Πρωταράς", "slug": "protaras", "region": "south"},
        {"id": str(uuid.uuid4()), "name_tr": "Paralimni", "name_en": "Paralimni", "name_ru": "Паралимни", "name_de": "Paralimni", "name_el": "Παραλίμνι", "slug": "paralimni", "region": "south"},
        {"id": str(uuid.uuid4()), "name_tr": "Polis", "name_en": "Polis Chrysochous", "name_ru": "Полис", "name_de": "Polis", "name_el": "Πόλις Χρυσοχούς", "slug": "polis", "region": "south"},
    ]
    
    all_cities = north_cities + south_cities
    await db.cities.insert_many(all_cities)
    
    # ==================== CATEGORIES (Service Types) ====================
    categories = [
        {"id": str(uuid.uuid4()), "name_tr": "Yemek Eşliği", "name_en": "Dinner Companion", "name_ru": "Компаньон за ужином", "name_de": "Essensbegleitung", "name_el": "Σύντροφος για δείπνο", "slug": "dinner-companion", "icon": "utensils", "type": "service"},
        {"id": str(uuid.uuid4()), "name_tr": "Davet Eşliği", "name_en": "Event Companion", "name_ru": "Компаньон на мероприятие", "name_de": "Veranstaltungsbegleitung", "name_el": "Σύντροφος σε εκδήλωση", "slug": "event-companion", "icon": "calendar", "type": "service"},
        {"id": str(uuid.uuid4()), "name_tr": "Uyku Arkadaşlığı", "name_en": "Sleep Companion", "name_ru": "Партнер для сна", "name_de": "Schlafbegleitung", "name_el": "Σύντροφος για ύπνο", "slug": "sleep-companion", "icon": "moon", "type": "service"},
        {"id": str(uuid.uuid4()), "name_tr": "Sevgili Deneyimi", "name_en": "GF/BF Experience", "name_ru": "Опыт отношений", "name_de": "Freund/in Erlebnis", "name_el": "Εμπειρία σχέσης", "slug": "gf-bf-experience", "icon": "heart", "type": "service"},
        {"id": str(uuid.uuid4()), "name_tr": "Eş Rolleri", "name_en": "Spouse Roleplay", "name_ru": "Роль супруга", "name_de": "Ehepartner Rollenspiel", "name_el": "Ρόλοι συζύγου", "slug": "spouse-roleplay", "icon": "users", "type": "service"},
        {"id": str(uuid.uuid4()), "name_tr": "Gezi Eşliği", "name_en": "Travel Companion", "name_ru": "Компаньон в путешествии", "name_de": "Reisebegleitung", "name_el": "Σύντροφος ταξιδιού", "slug": "travel-companion", "icon": "plane", "type": "service"},
        {"id": str(uuid.uuid4()), "name_tr": "Sosyal Etkinlik", "name_en": "Social Event", "name_ru": "Социальное мероприятие", "name_de": "Gesellschaftsveranstaltung", "name_el": "Κοινωνική εκδήλωση", "slug": "social-event", "icon": "users", "type": "service"},
        {"id": str(uuid.uuid4()), "name_tr": "İş Daveti", "name_en": "Business Event", "name_ru": "Деловое мероприятие", "name_de": "Geschäftsveranstaltung", "name_el": "Επαγγελματική εκδήλωση", "slug": "business-event", "icon": "briefcase", "type": "service"},
        {"id": str(uuid.uuid4()), "name_tr": "Kültür & Sanat", "name_en": "Culture & Arts", "name_ru": "Культура и искусство", "name_de": "Kultur & Kunst", "name_el": "Πολιτισμός & Τέχνη", "slug": "culture-arts", "icon": "palette", "type": "service"},
        {"id": str(uuid.uuid4()), "name_tr": "Spor & Fitness", "name_en": "Sports & Fitness", "name_ru": "Спорт и фитнес", "name_de": "Sport & Fitness", "name_el": "Αθλητισμός & Γυμναστική", "slug": "sports-fitness", "icon": "dumbbell", "type": "service"},
    ]
    await db.categories.insert_many(categories)
    
    # ==================== PACKAGES ====================
    packages = [
        {"id": str(uuid.uuid4()), "name_tr": "Standart", "name_en": "Standard", "name_ru": "Стандарт", "name_de": "Standard", "name_el": "Κανονικό", "package_type": "standard", "price": 0.0, "duration_days": 30, "priority_score": 0, "is_active": True, "features": {}},
        {"id": str(uuid.uuid4()), "name_tr": "Öne Çıkan", "name_en": "Featured", "name_ru": "Рекомендуемый", "name_de": "Empfohlen", "name_el": "Προτεινόμενο", "package_type": "featured", "price": 29.99, "duration_days": 30, "priority_score": 50, "is_active": True, "features": {"badge": "featured"}},
        {"id": str(uuid.uuid4()), "name_tr": "Şehir Vitrini", "name_en": "City Showcase", "name_ru": "Городская витрина", "name_de": "Stadt-Schaufenster", "name_el": "Βιτρίνα πόλης", "package_type": "city_vitrin", "price": 49.99, "duration_days": 30, "priority_score": 75, "is_active": True, "features": {"badge": "vitrin", "city_featured": True}},
        {"id": str(uuid.uuid4()), "name_tr": "Ana Sayfa Vitrini", "name_en": "Homepage Showcase", "name_ru": "Главная витрина", "name_de": "Homepage-Schaufenster", "name_el": "Βιτρίνα αρχικής", "package_type": "homepage_vitrin", "price": 79.99, "duration_days": 30, "priority_score": 90, "is_active": True, "features": {"badge": "vitrin", "homepage_featured": True}},
        {"id": str(uuid.uuid4()), "name_tr": "Premium", "name_en": "Premium", "name_ru": "Премиум", "name_de": "Premium", "name_el": "Πριμιουμ", "package_type": "premium", "price": 99.99, "duration_days": 30, "priority_score": 100, "is_active": True, "features": {"badge": "premium", "homepage_featured": True, "city_featured": True, "verified_badge": True}},
    ]
    await db.packages.insert_many(packages)
    
    # ==================== SETTINGS ====================
    await db.settings.insert_many([
        {"key": "netgsm", "value": {"enabled": False, "usercode": "", "password": "", "msgheader": ""}},
        {"key": "stripe", "value": {"api_key": "", "test_mode": True}},
        {"key": "site", "value": {"name": "KKTCX", "default_language": "tr", "languages": ["tr", "en", "ru", "de", "el"]}}
    ])
    
    # ==================== ADMIN USER (only if not exists) ====================
    existing_admin = await db.users.find_one({"email": "admin@kktcx.com"})
    if not existing_admin:
        admin_id = str(uuid.uuid4())
        await db.users.insert_one({
            "id": admin_id,
            "email": "admin@kktcx.com",
            "password": hash_password("admin123"),
            "name": "Admin",
            "role": "admin",
            "language": "tr",
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    logger.info("Initial data seeded with all Cyprus cities and new service types")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
