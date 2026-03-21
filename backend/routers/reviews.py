"""
Reviews/Ratings Routes
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel

from database import db
from utils.auth import get_current_user, require_admin

router = APIRouter(tags=["Reviews"])


class ReviewCreate(BaseModel):
    partner_id: str
    rating: int  # 1-5
    comment: Optional[str] = None
    is_anonymous: bool = False


class ReviewResponse(BaseModel):
    success: bool
    review_id: Optional[str] = None


# ==================== PUBLIC ROUTES ====================

@router.get("/partners/{partner_id}/reviews")
async def get_partner_reviews(
    partner_id: str,
    page: int = 1,
    limit: int = 10
):
    """Get reviews for a partner profile"""
    # Find partner by id or slug
    profile = await db.partner_profiles.find_one(
        {"$or": [{"id": partner_id}, {"slug": partner_id}]},
        {"_id": 0, "id": 1}
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    profile_id = profile["id"]
    
    # Get approved reviews only
    query = {"partner_id": profile_id, "status": "approved"}
    total = await db.reviews.count_documents(query)
    skip = (page - 1) * limit
    
    reviews = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Get average rating
    pipeline = [
        {"$match": {"partner_id": profile_id, "status": "approved"}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    stats = await db.reviews.aggregate(pipeline).to_list(1)
    avg_rating = round(stats[0]["avg_rating"], 1) if stats else 0
    review_count = stats[0]["count"] if stats else 0
    
    # Enrich reviews with user info (if not anonymous)
    for review in reviews:
        if not review.get("is_anonymous"):
            user = await db.users.find_one({"id": review.get("user_id")}, {"_id": 0, "name": 1, "email": 1})
            if user:
                review["user_name"] = user.get("name") or user.get("email", "").split("@")[0]
            else:
                review["user_name"] = "Kullanıcı"
        else:
            review["user_name"] = "Anonim"
        # Remove user_id from response for privacy
        review.pop("user_id", None)
    
    return {
        "reviews": reviews,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
        "stats": {
            "average_rating": avg_rating,
            "review_count": review_count
        }
    }


@router.get("/partners/{partner_id}/rating")
async def get_partner_rating(partner_id: str):
    """Get average rating for a partner"""
    profile = await db.partner_profiles.find_one(
        {"$or": [{"id": partner_id}, {"slug": partner_id}]},
        {"_id": 0, "id": 1}
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    pipeline = [
        {"$match": {"partner_id": profile["id"], "status": "approved"}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    stats = await db.reviews.aggregate(pipeline).to_list(1)
    
    return {
        "average_rating": round(stats[0]["avg_rating"], 1) if stats else 0,
        "review_count": stats[0]["count"] if stats else 0
    }


# ==================== USER ROUTES ====================

@router.post("/reviews")
async def create_review(data: ReviewCreate, user: dict = Depends(get_current_user)):
    """Create a new review"""
    # Check if partner exists
    profile = await db.partner_profiles.find_one({"id": data.partner_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    # Can't review yourself
    if profile.get("user_id") == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot review yourself")
    
    # Check if user already reviewed this partner
    existing = await db.reviews.find_one({
        "user_id": user["id"],
        "partner_id": data.partner_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this partner")
    
    # Validate rating
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    review_id = str(uuid.uuid4())
    review = {
        "id": review_id,
        "user_id": user["id"],
        "partner_id": data.partner_id,
        "rating": data.rating,
        "comment": data.comment,
        "is_anonymous": data.is_anonymous,
        "status": "pending",  # pending, approved, rejected
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review)
    
    return {"success": True, "review_id": review_id, "message": "Değerlendirmeniz onay bekliyor"}


@router.get("/my-reviews")
async def get_my_reviews(user: dict = Depends(get_current_user)):
    """Get current user's reviews"""
    reviews = await db.reviews.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Enrich with partner info
    for review in reviews:
        profile = await db.partner_profiles.find_one({"id": review["partner_id"]}, {"_id": 0, "nickname": 1, "slug": 1})
        if profile:
            review["partner_name"] = profile.get("nickname")
            review["partner_slug"] = profile.get("slug")
    
    return reviews


@router.delete("/reviews/{review_id}")
async def delete_my_review(review_id: str, user: dict = Depends(get_current_user)):
    """Delete own review"""
    review = await db.reviews.find_one({"id": review_id, "user_id": user["id"]})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    await db.reviews.delete_one({"id": review_id})
    return {"success": True}


# ==================== ADMIN ROUTES ====================

@router.get("/admin/reviews")
async def admin_get_reviews(
    status: Optional[str] = None,
    partner_id: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    admin: dict = Depends(require_admin)
):
    """Get all reviews (admin only)"""
    query = {}
    if status:
        query["status"] = status
    if partner_id:
        query["partner_id"] = partner_id
    
    total = await db.reviews.count_documents(query)
    skip = (page - 1) * limit
    
    reviews = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with user and partner info
    for review in reviews:
        user = await db.users.find_one({"id": review.get("user_id")}, {"_id": 0, "name": 1, "email": 1})
        if user:
            review["user_name"] = user.get("name") or user.get("email", "").split("@")[0]
            review["user_email"] = user.get("email")
        
        profile = await db.partner_profiles.find_one({"id": review.get("partner_id")}, {"_id": 0, "nickname": 1})
        if profile:
            review["partner_name"] = profile.get("nickname")
    
    return {
        "reviews": reviews,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.get("/admin/reviews/stats")
async def admin_reviews_stats(admin: dict = Depends(require_admin)):
    """Get review statistics"""
    total = await db.reviews.count_documents({})
    pending = await db.reviews.count_documents({"status": "pending"})
    approved = await db.reviews.count_documents({"status": "approved"})
    rejected = await db.reviews.count_documents({"status": "rejected"})
    
    # Average rating
    pipeline = [
        {"$match": {"status": "approved"}},
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}}}
    ]
    avg_result = await db.reviews.aggregate(pipeline).to_list(1)
    avg_rating = round(avg_result[0]["avg"], 1) if avg_result else 0
    
    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "average_rating": avg_rating
    }


@router.put("/admin/reviews/{review_id}/status")
async def admin_update_review_status(
    review_id: str,
    status: str = Query(..., description="New status: approved, rejected"),
    admin: dict = Depends(require_admin)
):
    """Update review status"""
    valid_statuses = ["pending", "approved", "rejected"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True}


@router.delete("/admin/reviews/{review_id}")
async def admin_delete_review(review_id: str, admin: dict = Depends(require_admin)):
    """Delete a review (admin only)"""
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    await db.reviews.delete_one({"id": review_id})
    return {"success": True}
