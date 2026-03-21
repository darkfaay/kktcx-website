"""
KKTCX Pydantic Models/Schemas
"""
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any


class UserRole:
    VISITOR = "visitor"
    USER = "user"
    PARTNER = "partner"
    ADMIN = "admin"


# ==================== USER MODELS ====================

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


# ==================== PARTNER PROFILE MODELS ====================

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


# ==================== MESSAGE MODELS ====================

class MessageCreate(BaseModel):
    receiver_id: str
    content: str


# ==================== CATALOG MODELS ====================

class CityCreate(BaseModel):
    name_tr: str
    name_en: str
    name_ru: str
    name_de: str
    name_el: str
    slug: str
    region: str = "north"


class CategoryCreate(BaseModel):
    name_tr: str
    name_en: str
    name_ru: str
    name_de: str
    name_el: str
    slug: str
    icon: Optional[str] = None


class PackageCreate(BaseModel):
    name_tr: str
    name_en: str
    name_ru: str
    name_de: str
    name_el: str
    package_type: str
    price: float
    duration_days: int
    priority_score: int = 0
    features: Dict[str, Any] = {}


# ==================== SETTINGS MODELS ====================

class SettingUpdate(BaseModel):
    key: str
    value: str


# ==================== APPOINTMENT MODELS ====================

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
