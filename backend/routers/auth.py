"""Authentication routes"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from database import db
from models.user import UserCreate, UserLogin, UserResponse, TokenResponse, UserRole
from auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(user: UserCreate):
    """Register a new user"""
    # Check if user exists
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user.email,
        "password": hash_password(user.password),
        "name": user.name,
        "phone": user.phone,
        "role": user.role if user.role in [UserRole.USER, UserRole.PARTNER] else UserRole.USER,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_token(user_id, user_doc["role"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user.email,
            name=user.name,
            phone=user.phone,
            role=user_doc["role"],
            created_at=user_doc["created_at"]
        )
    )

@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    """Login user"""
    # Find user
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = create_token(db_user["id"], db_user["role"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=db_user["id"],
            email=db_user["email"],
            name=db_user.get("name"),
            phone=db_user.get("phone"),
            role=db_user["role"],
            created_at=db_user.get("created_at")
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user.get("name"),
        phone=user.get("phone"),
        role=user["role"],
        created_at=user.get("created_at")
    )

@router.put("/profile")
async def update_profile(
    name: str = None,
    phone: str = None,
    user: dict = Depends(get_current_user)
):
    """Update user profile"""
    updates = {}
    if name:
        updates["name"] = name
    if phone:
        updates["phone"] = phone
    
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    
    return {"success": True}
