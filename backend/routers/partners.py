"""
Partner Profile Routes
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query, Header
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from database import db
from models.schemas import PartnerProfileCreate, PartnerProfileUpdate, UserRole
from utils.auth import get_current_user, require_partner, get_optional_user
from services.storage import put_object, get_object
from config import APP_NAME

router = APIRouter(tags=["Partners"])


# ==================== PUBLIC ROUTES ====================

@router.get("/partners")
async def get_partners(
    city: Optional[str] = None,
    category: Optional[str] = None,
    orientation: Optional[str] = None,
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
    """Get partner profiles with filters"""
    query = {"status": "approved"}
    and_conditions = []
    
    if city:
        city_doc = await db.cities.find_one({"$or": [{"id": city}, {"slug": city}]})
        if city_doc:
            # Match profiles by either the city UUID or slug (some profiles use old format)
            city_uuid = city_doc.get("id")
            city_slug = city_doc.get("slug")
            and_conditions.append({"$or": [{"city_id": city_uuid}, {"city_id": city_slug}]})
    
    if category:
        query["category_ids"] = {"$in": [category]}
    
    if orientation:
        query["orientations"] = {"$in": [orientation]}
    
    if gender:
        query["gender"] = gender
    
    # Service type filter - search in service_types array
    if service_type:
        query["service_types"] = {"$in": [service_type]}
    
    query["age"] = {"$gte": min_age, "$lte": max_age}
    
    # Availability filters
    if available_today:
        query["is_available_today"] = True
    
    if available_tonight:
        query["is_available_tonight"] = True
    
    # Featured and verified filters
    if featured_only:
        query["is_featured"] = True
    
    if verified_only:
        query["is_verified"] = True
    
    # Incall/Outcall filters
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
    
    # Combine all $and conditions
    if and_conditions:
        query["$and"] = and_conditions
    
    # Sorting
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
    
    profiles = await db.partner_profiles.find(
        query, {"_id": 0}
    ).sort(sort_key).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with city/category names
    cities_cache = {}
    for profile in profiles:
        city_id = profile.get("city_id")
        if city_id and city_id not in cities_cache:
            city_doc = await db.cities.find_one({"$or": [{"id": city_id}, {"slug": city_id}]}, {"_id": 0})
            cities_cache[city_id] = city_doc
        if city_id and cities_cache.get(city_id):
            profile["city_name"] = cities_cache[city_id].get(f"name_{lang}", cities_cache[city_id].get("name_en", ""))
    
    return {
        "profiles": profiles,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.get("/partners/{slug}")
async def get_partner_by_slug(
    slug: str, 
    lang: str = "tr",
    authorization: str = Header(None)
):
    """Get partner profile by slug"""
    profile = await db.partner_profiles.find_one(
        {"slug": slug, "status": "approved"}, {"_id": 0}
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Increment view count
    await db.partner_profiles.update_one(
        {"slug": slug}, {"$inc": {"view_count": 1}}
    )
    
    # Get city name
    if profile.get("city_id"):
        city = await db.cities.find_one({"$or": [{"id": profile["city_id"]}, {"slug": profile["city_id"]}]}, {"_id": 0})
        if city:
            profile["city_name"] = city.get(f"name_{lang}", city.get("name_en", ""))
    
    # Get category names
    if profile.get("category_ids"):
        categories = await db.categories.find(
            {"$or": [{"id": {"$in": profile["category_ids"]}}, {"slug": {"$in": profile["category_ids"]}}]},
            {"_id": 0}
        ).to_list(100)
        profile["categories"] = [
            {"id": c.get("id", c.get("slug")), "name": c.get(f"name_{lang}", c.get("name_en", ""))}
            for c in categories
        ]
    
    # Check if current user has favorited
    profile["is_favorited"] = False
    if authorization and authorization.startswith("Bearer "):
        try:
            from utils.auth import get_current_user
            user = await get_current_user(authorization)
            if user:
                fav = await db.favorites.find_one({"user_id": user["id"], "profile_id": profile["id"]})
                profile["is_favorited"] = fav is not None
        except Exception:
            pass
    
    return profile


# ==================== PARTNER MANAGEMENT ====================

@router.post("/partner/profile")
async def create_partner_profile(data: PartnerProfileCreate, user: dict = Depends(get_current_user)):
    """Create a new partner profile"""
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
        "slug": slug,
        "status": "pending",  # Directly set to pending for admin review
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
    await db.users.update_one({"id": user["id"]}, {"$set": {"role": UserRole.PARTNER}})
    
    return {"success": True, "profile": {k: v for k, v in profile.items() if k != "_id"}}


@router.put("/partner/profile")
async def update_partner_profile(data: PartnerProfileUpdate, user: dict = Depends(require_partner)):
    """Update partner profile"""
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


@router.get("/partner/profile")
async def get_own_partner_profile(user: dict = Depends(require_partner)):
    """Get own partner profile"""
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/partner/submit-for-review")
async def submit_for_review(user: dict = Depends(get_current_user)):
    """Submit profile for review"""
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


# ==================== IMAGE MANAGEMENT ====================

@router.post("/partner/upload-image")
async def upload_partner_image(
    file: UploadFile = File(...),
    is_cover: bool = False,
    is_blurred: bool = False,
    user: dict = Depends(require_partner)
):
    """Upload profile image"""
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


@router.delete("/partner/images/{image_id}")
async def delete_partner_image(image_id: str, user: dict = Depends(require_partner)):
    """Delete profile image"""
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.partner_profiles.update_one(
        {"user_id": user["id"]},
        {"$pull": {"images": {"id": image_id}}}
    )
    
    if profile.get("cover_image", {}).get("id") == image_id:
        await db.partner_profiles.update_one(
            {"user_id": user["id"]},
            {"$set": {"cover_image": None}}
        )
    
    return {"success": True}


@router.put("/partner/images/{image_id}/cover")
async def set_cover_image(image_id: str, user: dict = Depends(require_partner)):
    """Set image as cover"""
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    image = next((img for img in profile.get("images", []) if img.get("id") == image_id), None)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    await db.partner_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": {"cover_image": image}}
    )
    
    return {"success": True}


@router.put("/partner/images/{image_id}/blur")
async def toggle_image_blur(
    image_id: str, 
    is_blurred: bool = Query(...),
    user: dict = Depends(require_partner)
):
    """Toggle blur state of an image"""
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
    
    await db.partner_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": {"images": images}}
    )
    
    # Also update cover_image if this is the cover
    if profile.get("cover_image", {}).get("id") == image_id:
        await db.partner_profiles.update_one(
            {"user_id": user["id"]},
            {"$set": {"cover_image.is_blurred": is_blurred}}
        )
    
    return {"success": True}


# ==================== FAVORITES ====================

@router.post("/favorites/{profile_id}")
async def add_favorite(profile_id: str, user: dict = Depends(get_current_user)):
    """Add profile to favorites"""
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


@router.delete("/favorites/{profile_id}")
async def remove_favorite(profile_id: str, user: dict = Depends(get_current_user)):
    """Remove profile from favorites"""
    await db.favorites.delete_one({"user_id": user["id"], "profile_id": profile_id})
    return {"success": True}


@router.get("/favorites")
async def get_favorites(user: dict = Depends(get_current_user), lang: str = "tr"):
    """Get user's favorite profiles"""
    favorites = await db.favorites.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    profile_ids = [f["profile_id"] for f in favorites]
    
    profiles = await db.partner_profiles.find(
        {"id": {"$in": profile_ids}, "status": "approved"},
        {"_id": 0}
    ).to_list(100)
    
    for profile in profiles:
        profile["is_favorited"] = True
        if profile.get("city_id"):
            city = await db.cities.find_one({"$or": [{"id": profile["city_id"]}, {"slug": profile["city_id"]}]}, {"_id": 0})
            if city:
                profile["city_name"] = city.get(f"name_{lang}", city.get("name_en", ""))
    
    return profiles
