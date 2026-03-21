"""
Authentication Routes
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from database import db
from models.schemas import UserCreate, UserLogin, UserResponse, TokenResponse, UserRole
from utils.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate):
    """Register a new user"""
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


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    """Login with email and password"""
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


@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user profile"""
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


@router.put("/profile")
async def update_profile(
    name: Optional[str] = None,
    phone: Optional[str] = None,
    language: Optional[str] = None,
    orientations: Optional[List[str]] = Query(None),
    user: dict = Depends(get_current_user)
):
    """Update user profile"""
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
