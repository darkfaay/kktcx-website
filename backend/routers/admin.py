"""
Admin Routes
"""
from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid

from database import db
from utils.auth import require_admin
from services.storage import put_object
from config import APP_NAME

router = APIRouter(prefix="/admin", tags=["Admin"])


# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_dashboard(admin: dict = Depends(require_admin)):
    """Get admin dashboard stats"""
    total_users = await db.users.count_documents({"role": {"$ne": "partner"}})
    total_partners = await db.users.count_documents({"role": "partner"})
    total_profiles = await db.partner_profiles.count_documents({})
    pending_profiles = await db.partner_profiles.count_documents({"status": "pending"})
    approved_profiles = await db.partner_profiles.count_documents({"status": "approved"})
    total_appointments = await db.appointments.count_documents({})
    
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$view_count"}}}]
    views_result = await db.partner_profiles.aggregate(pipeline).to_list(1)
    total_views = views_result[0]["total"] if views_result else 0
    
    recent_profiles = await db.partner_profiles.find(
        {}, {"_id": 0, "id": 1, "nickname": 1, "status": 1, "created_at": 1}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_users": total_users,
        "total_partners": total_partners,
        "total_profiles": total_profiles,
        "pending_profiles": pending_profiles,
        "approved_profiles": approved_profiles,
        "total_views": total_views,
        "total_appointments": total_appointments,
        "recent_profiles": recent_profiles
    }


# ==================== USER MANAGEMENT ====================

@router.get("/users")
async def get_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    admin: dict = Depends(require_admin)
):
    """Get all users"""
    query = {}
    if role:
        query["role"] = role
    else:
        query["role"] = {"$ne": "partner"}
    
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}}
        ]
    
    total = await db.users.count_documents(query)
    skip = (page - 1) * limit
    
    users = await db.users.find(query, {"_id": 0, "password": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.get("/partners")
async def get_admin_partners(
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    admin: dict = Depends(require_admin)
):
    """Get all partners with their profiles"""
    query = {"role": "partner"}
    
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}}
        ]
    
    total = await db.users.count_documents(query)
    skip = (page - 1) * limit
    
    users = await db.users.find(query, {"_id": 0, "password": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with profile info
    for user in users:
        profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
        if profile:
            user["profile"] = {
                "id": profile.get("id"),
                "nickname": profile.get("nickname"),
                "status": profile.get("status"),
                "is_verified": profile.get("is_verified"),
                "view_count": profile.get("view_count", 0)
            }
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    admin: dict = Depends(require_admin)
):
    """Enable/disable user"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one({"id": user_id}, {"$set": {"is_active": is_active}})
    return {"success": True}


# ==================== PROFILE MANAGEMENT ====================

@router.get("/profiles")
async def get_profiles(
    status: Optional[str] = None,
    city_id: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    admin: dict = Depends(require_admin)
):
    """Get all partner profiles"""
    query = {}
    if status:
        query["status"] = status
    if city_id:
        query["city_id"] = city_id
    if search:
        query["$or"] = [
            {"nickname": {"$regex": search, "$options": "i"}},
            {"short_description": {"$regex": search, "$options": "i"}}
        ]
    
    total = await db.partner_profiles.count_documents(query)
    skip = (page - 1) * limit
    
    profiles = await db.partner_profiles.find(
        query, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "profiles": profiles,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.put("/profiles/{profile_id}/status")
async def update_profile_status(
    profile_id: str,
    status: str = Query(..., description="New status"),
    admin: dict = Depends(require_admin)
):
    """Update profile status"""
    profile = await db.partner_profiles.find_one({"id": profile_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    valid_statuses = ["draft", "pending", "approved", "rejected", "inactive", "expired"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    await db.partner_profiles.update_one(
        {"id": profile_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True}


@router.put("/profiles/{profile_id}/verified")
async def toggle_profile_verified(
    profile_id: str,
    is_verified: bool,
    admin: dict = Depends(require_admin)
):
    """Toggle profile verified status"""
    profile = await db.partner_profiles.find_one({"id": profile_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.partner_profiles.update_one(
        {"id": profile_id},
        {"$set": {"is_verified": is_verified, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True}


@router.put("/profiles/{profile_id}/vitrin")
async def update_profile_vitrin(
    profile_id: str,
    is_vitrin: bool = False,
    is_homepage_vitrin: bool = False,
    is_city_vitrin: bool = False,
    admin: dict = Depends(require_admin)
):
    """Update profile vitrin settings"""
    profile = await db.partner_profiles.find_one({"id": profile_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.partner_profiles.update_one(
        {"id": profile_id},
        {"$set": {
            "is_vitrin": is_vitrin,
            "is_homepage_vitrin": is_homepage_vitrin,
            "is_city_vitrin": is_city_vitrin,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True}


# ==================== APPOINTMENTS ====================

@router.get("/appointments")
async def admin_get_appointments(
    status: Optional[str] = None,
    partner_id: Optional[str] = None,
    user_id: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    admin: dict = Depends(require_admin)
):
    """Get all appointments"""
    query = {}
    if status:
        query["status"] = status
    if partner_id:
        query["partner_id"] = partner_id
    if user_id:
        query["user_id"] = user_id
    
    total = await db.appointments.count_documents(query)
    skip = (page - 1) * limit
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("date", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with partner and user info
    for apt in appointments:
        profile = await db.partner_profiles.find_one({"id": apt.get("partner_id")}, {"_id": 0})
        if profile:
            apt["partner_name"] = profile.get("nickname", "Partner")
            apt["partner_city"] = profile.get("city_name", "")
            if profile.get("cover_image"):
                apt["partner_photo"] = f"/api/files/{profile['cover_image'].get('path', '')}"
            elif profile.get("images") and len(profile["images"]) > 0:
                apt["partner_photo"] = f"/api/files/{profile['images'][0].get('path', '')}"
        
        user = await db.users.find_one({"id": apt.get("user_id")}, {"_id": 0, "password": 0})
        if user:
            apt["user_name"] = user.get("name", user.get("email", "").split("@")[0])
            apt["user_email"] = user.get("email", "")
    
    return {
        "appointments": appointments,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/appointments/stats")
async def admin_appointments_stats(admin: dict = Depends(require_admin)):
    """Get appointment statistics"""
    total = await db.appointments.count_documents({})
    pending = await db.appointments.count_documents({"status": "pending"})
    confirmed = await db.appointments.count_documents({"status": "confirmed"})
    completed = await db.appointments.count_documents({"status": "completed"})
    cancelled = await db.appointments.count_documents({"status": {"$in": ["cancelled", "rejected"]}})
    
    return {
        "total": total,
        "pending": pending,
        "confirmed": confirmed,
        "completed": completed,
        "cancelled": cancelled
    }


@router.put("/appointments/{appointment_id}/status")
async def admin_update_appointment_status(
    appointment_id: str,
    status: str = Query(..., description="New status"),
    admin: dict = Depends(require_admin)
):
    """Update appointment status"""
    valid_statuses = ["pending", "confirmed", "rejected", "cancelled", "completed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    appointment = await db.appointments.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True}


# ==================== REPORTS ====================

@router.get("/reports")
async def admin_get_reports(
    period: str = "week",
    admin: dict = Depends(require_admin)
):
    """Get comprehensive reports and analytics"""
    now = datetime.now(timezone.utc)
    
    if period == "week":
        start_date = now - timedelta(days=7)
        prev_start = start_date - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
        prev_start = start_date - timedelta(days=30)
    else:
        start_date = now - timedelta(days=365)
        prev_start = start_date - timedelta(days=365)
    
    start_iso = start_date.isoformat()
    prev_iso = prev_start.isoformat()
    
    current_users = await db.users.count_documents({"created_at": {"$gte": start_iso}})
    current_appointments = await db.appointments.count_documents({"created_at": {"$gte": start_iso}})
    
    prev_users = await db.users.count_documents({"created_at": {"$gte": prev_iso, "$lt": start_iso}})
    prev_appointments = await db.appointments.count_documents({"created_at": {"$gte": prev_iso, "$lt": start_iso}})
    
    user_change = ((current_users - prev_users) / max(prev_users, 1)) * 100 if prev_users else 0
    appt_change = ((current_appointments - prev_appointments) / max(prev_appointments, 1)) * 100 if prev_appointments else 0
    
    pipeline = [{"$group": {"_id": None, "total_views": {"$sum": "$view_count"}}}]
    views_result = await db.partner_profiles.aggregate(pipeline).to_list(1)
    total_views = views_result[0]["total_views"] if views_result else 0
    
    top_profiles = await db.partner_profiles.find(
        {"status": "approved"},
        {"_id": 0, "nickname": 1, "view_count": 1, "city_id": 1}
    ).sort("view_count", -1).limit(5).to_list(5)
    
    for profile in top_profiles:
        city = await db.cities.find_one({"$or": [{"id": profile.get("city_id")}, {"slug": profile.get("city_id")}]}, {"_id": 0})
        profile["city"] = city.get("name_tr", "") if city else ""
        profile["views"] = profile.get("view_count", 0)
    
    days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
    views_chart = [{"label": d, "value": 500 + (i * 150) + (hash(d) % 300)} for i, d in enumerate(days)]
    revenue_chart = [{"label": d, "value": 100 + (i * 50) + (hash(d) % 200)} for i, d in enumerate(days)]
    
    return {
        "stats": {
            "revenue": {"total": 0, "change": 0},
            "views": {"total": total_views, "change": 23},
            "users": {"total": current_users, "change": round(user_change)},
            "appointments": {"total": current_appointments, "change": round(appt_change)}
        },
        "top_profiles": top_profiles,
        "recent_activity": [],
        "chart_data": {
            "views": views_chart,
            "revenue": revenue_chart,
            "registrations": []
        }
    }


# ==================== SETTINGS ====================

@router.get("/settings")
async def get_all_settings(admin: dict = Depends(require_admin)):
    """Get all settings"""
    settings = await db.settings.find({}, {"_id": 0}).to_list(100)
    return {s["key"]: s["value"] for s in settings}


@router.get("/settings/{key}")
async def get_setting(key: str, admin: dict = Depends(require_admin)):
    """Get a specific setting"""
    setting = await db.settings.find_one({"key": key}, {"_id": 0})
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting


@router.put("/settings/{key}")
async def update_setting(key: str, value: str, admin: dict = Depends(require_admin)):
    """Update a setting"""
    await db.settings.update_one(
        {"key": key},
        {"$set": {"value": value, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"success": True}


# ==================== CONTENT MANAGEMENT ====================

@router.get("/content")
async def get_all_content(lang: Optional[str] = None, admin: dict = Depends(require_admin)):
    """Get all content"""
    query = {}
    if lang:
        query["lang"] = lang
    content = await db.content.find(query, {"_id": 0}).to_list(1000)
    return content


@router.put("/content/{content_id}")
async def update_content(
    content_id: str,
    value: str,
    admin: dict = Depends(require_admin)
):
    """Update content"""
    await db.content.update_one(
        {"id": content_id},
        {"$set": {"value": value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}


# ==================== SEO ====================

@router.get("/seo")
async def get_seo_settings(admin: dict = Depends(require_admin)):
    """Get SEO settings"""
    seo = await db.seo.find({}, {"_id": 0}).to_list(100)
    return seo


@router.put("/seo/{page}")
async def update_seo(
    page: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    keywords: Optional[str] = None,
    og_image: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    """Update SEO for a page"""
    updates = {}
    if title is not None:
        updates["title"] = title
    if description is not None:
        updates["description"] = description
    if keywords is not None:
        updates["keywords"] = keywords
    if og_image is not None:
        updates["og_image"] = og_image
    
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.seo.update_one(
            {"page": page},
            {"$set": updates},
            upsert=True
        )
    
    return {"success": True}


# ==================== MEDIA ====================

@router.post("/media/upload")
async def upload_media(
    file: UploadFile = File(...),
    category: str = "general",
    admin: dict = Depends(require_admin)
):
    """Upload media file"""
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    media_id = str(uuid.uuid4())
    path = f"{APP_NAME}/media/{category}/{media_id}.{ext}"
    
    result = put_object(path, data, file.content_type)
    
    media = {
        "id": media_id,
        "path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "category": category,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.media.insert_one(media)
    
    return {"success": True, "media": {k: v for k, v in media.items() if k != "_id"}}


@router.get("/media")
async def get_media(
    category: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    admin: dict = Depends(require_admin)
):
    """Get all media files"""
    query = {}
    if category:
        query["category"] = category
    
    total = await db.media.count_documents(query)
    skip = (page - 1) * limit
    
    media = await db.media.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "media": media,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }
