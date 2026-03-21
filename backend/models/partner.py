"""Partner profile models"""
from pydantic import BaseModel
from typing import List, Optional

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
