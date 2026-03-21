"""Catalog routes - Cities, Districts, Categories"""
from fastapi import APIRouter, Depends
from typing import Optional
from datetime import datetime, timezone
import uuid

from database import db
from models.settings import CityCreate, CategoryCreate
from auth import require_admin

router = APIRouter(tags=["Catalog"])

# ==================== CITIES & DISTRICTS ====================

@router.get("/cities")
async def get_cities():
    """Get all cities"""
    cities = await db.cities.find({}, {"_id": 0}).to_list(100)
    return {"cities": cities}

@router.post("/admin/cities")
async def create_city(city: CityCreate, admin: dict = Depends(require_admin)):
    """Create a new city (admin only)"""
    city_doc = {
        "id": str(uuid.uuid4()),
        **city.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.cities.insert_one(city_doc)
    return {"success": True, "city": {k: v for k, v in city_doc.items() if k != "_id"}}

@router.get("/cities/{city_id}/districts")
async def get_districts(city_id: str):
    """Get districts for a city"""
    districts = await db.districts.find({"city_id": city_id}, {"_id": 0}).to_list(100)
    return {"districts": districts}

@router.post("/admin/districts")
async def create_district(
    city_id: str,
    name_tr: str,
    name_en: str,
    name_ru: Optional[str] = None,
    name_de: Optional[str] = None,
    name_el: Optional[str] = None,
    slug: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    """Create a new district (admin only)"""
    district_doc = {
        "id": str(uuid.uuid4()),
        "city_id": city_id,
        "name_tr": name_tr,
        "name_en": name_en,
        "name_ru": name_ru,
        "name_de": name_de,
        "name_el": name_el,
        "slug": slug or name_en.lower().replace(" ", "-"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.districts.insert_one(district_doc)
    return {"success": True, "district": {k: v for k, v in district_doc.items() if k != "_id"}}

# ==================== CATEGORIES ====================

@router.get("/categories")
async def get_categories():
    """Get all categories"""
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return {"categories": categories}

@router.post("/admin/categories")
async def create_category(category: CategoryCreate, admin: dict = Depends(require_admin)):
    """Create a new category (admin only)"""
    category_doc = {
        "id": str(uuid.uuid4()),
        **category.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.categories.insert_one(category_doc)
    return {"success": True, "category": {k: v for k, v in category_doc.items() if k != "_id"}}
