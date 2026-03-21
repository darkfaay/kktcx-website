"""Settings and other models"""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class CityCreate(BaseModel):
    name_tr: str
    name_en: str
    name_ru: Optional[str] = None
    name_de: Optional[str] = None
    name_el: Optional[str] = None
    slug: str
    region: Optional[str] = None

class CategoryCreate(BaseModel):
    name_tr: str
    name_en: str
    name_ru: Optional[str] = None
    name_de: Optional[str] = None
    name_el: Optional[str] = None
    slug: str
    icon: Optional[str] = None

class PackageCreate(BaseModel):
    name: str
    name_en: Optional[str] = None
    description: str
    description_en: Optional[str] = None
    price: float
    currency: str = "USD"
    duration_days: int
    features: List[str] = []
    package_type: str = "standard"
    is_active: bool = True

class SettingUpdate(BaseModel):
    value: Dict[str, Any]
