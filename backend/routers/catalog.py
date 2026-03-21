"""
Catalog Routes - Cities, Categories, Packages
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
import uuid

from database import db
from models.schemas import CityCreate, CategoryCreate, PackageCreate
from utils.auth import require_admin

router = APIRouter(tags=["Catalog"])


# ==================== CITIES ====================

@router.get("/cities")
async def get_cities(lang: str = "tr"):
    """Get all cities"""
    cities = await db.cities.find({}, {"_id": 0}).to_list(100)
    for city in cities:
        city["name"] = city.get(f"name_{lang}", city.get("name_en", ""))
    return cities


@router.post("/admin/cities")
async def create_city(data: CityCreate, admin: dict = Depends(require_admin)):
    """Create a new city (admin only)"""
    city = {
        "id": str(uuid.uuid4()),
        "name_tr": data.name_tr,
        "name_en": data.name_en,
        "name_ru": data.name_ru,
        "name_de": data.name_de,
        "name_el": data.name_el,
        "slug": data.slug,
        "region": data.region,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.cities.insert_one(city)
    return {"success": True, "city": {k: v for k, v in city.items() if k != "_id"}}


@router.get("/cities/{city_id}/districts")
async def get_districts(city_id: str, lang: str = "tr"):
    """Get districts for a city"""
    districts = await db.districts.find({"city_id": city_id}, {"_id": 0}).to_list(100)
    for district in districts:
        district["name"] = district.get(f"name_{lang}", district.get("name_en", ""))
    return districts


@router.post("/admin/districts")
async def create_district(
    city_id: str,
    name_tr: str,
    name_en: str,
    name_ru: str = "",
    name_de: str = "",
    name_el: str = "",
    slug: str = "",
    admin: dict = Depends(require_admin)
):
    """Create a new district (admin only)"""
    district = {
        "id": str(uuid.uuid4()),
        "city_id": city_id,
        "name_tr": name_tr,
        "name_en": name_en,
        "name_ru": name_ru or name_en,
        "name_de": name_de or name_en,
        "name_el": name_el or name_en,
        "slug": slug or name_en.lower().replace(" ", "-"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.districts.insert_one(district)
    return {"success": True, "district": {k: v for k, v in district.items() if k != "_id"}}


# ==================== CATEGORIES ====================

@router.get("/categories")
async def get_categories(lang: str = "tr"):
    """Get all categories"""
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    for cat in categories:
        cat["name"] = cat.get(f"name_{lang}", cat.get("name_en", ""))
    return categories


@router.post("/admin/categories")
async def create_category(data: CategoryCreate, admin: dict = Depends(require_admin)):
    """Create a new category (admin only)"""
    category = {
        "id": str(uuid.uuid4()),
        "name_tr": data.name_tr,
        "name_en": data.name_en,
        "name_ru": data.name_ru,
        "name_de": data.name_de,
        "name_el": data.name_el,
        "slug": data.slug,
        "icon": data.icon,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.categories.insert_one(category)
    return {"success": True, "category": {k: v for k, v in category.items() if k != "_id"}}


# ==================== PACKAGES ====================

@router.get("/packages")
async def get_packages(lang: str = "tr"):
    """Get all active packages"""
    packages = await db.packages.find({"is_active": True}, {"_id": 0}).to_list(100)
    for pkg in packages:
        pkg["name"] = pkg.get(f"name_{lang}", pkg.get("name_en", ""))
    return packages


@router.post("/admin/packages")
async def create_package(data: PackageCreate, admin: dict = Depends(require_admin)):
    """Create a new package (admin only)"""
    package = {
        "id": str(uuid.uuid4()),
        "name_tr": data.name_tr,
        "name_en": data.name_en,
        "name_ru": data.name_ru,
        "name_de": data.name_de,
        "name_el": data.name_el,
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


@router.put("/admin/packages/{package_id}")
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
    """Update a package (admin only)"""
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
