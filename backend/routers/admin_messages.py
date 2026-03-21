"""
Admin Messages Routes
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime, timezone

from database import db
from utils.auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin Messages"])


@router.get("/messages")
async def admin_get_all_messages(
    page: int = 1,
    limit: int = 50,
    search: Optional[str] = None,
    flagged_only: bool = False,
    admin: dict = Depends(require_admin)
):
    """Get all messages for moderation"""
    query = {}
    
    if search:
        query["content"] = {"$regex": search, "$options": "i"}
    
    if flagged_only:
        query["is_flagged"] = True
    
    total = await db.messages.count_documents(query)
    skip = (page - 1) * limit
    
    messages = await db.messages.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with user info
    for msg in messages:
        # Sender info
        sender = await db.users.find_one({"id": msg.get("sender_id")}, {"_id": 0, "email": 1, "name": 1})
        if sender:
            sender_profile = await db.partner_profiles.find_one({"user_id": msg.get("sender_id")}, {"_id": 0, "nickname": 1})
            msg["sender_name"] = sender_profile.get("nickname") if sender_profile else sender.get("name") or sender.get("email", "").split("@")[0]
            msg["sender_email"] = sender.get("email")
            msg["sender_is_partner"] = sender_profile is not None
        
        # Receiver info
        receiver = await db.users.find_one({"id": msg.get("receiver_id")}, {"_id": 0, "email": 1, "name": 1})
        if receiver:
            receiver_profile = await db.partner_profiles.find_one({"user_id": msg.get("receiver_id")}, {"_id": 0, "nickname": 1})
            msg["receiver_name"] = receiver_profile.get("nickname") if receiver_profile else receiver.get("name") or receiver.get("email", "").split("@")[0]
            msg["receiver_email"] = receiver.get("email")
            msg["receiver_is_partner"] = receiver_profile is not None
    
    return {
        "messages": messages,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.get("/messages/stats")
async def admin_messages_stats(admin: dict = Depends(require_admin)):
    """Get message statistics"""
    total = await db.messages.count_documents({})
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    today = await db.messages.count_documents({"created_at": {"$gte": today_start}})
    flagged = await db.messages.count_documents({"is_flagged": True})
    
    # Count unique conversations
    conversations = await db.conversations.count_documents({})
    
    return {
        "total_messages": total,
        "today_messages": today,
        "flagged_messages": flagged,
        "total_conversations": conversations
    }


@router.get("/conversations")
async def admin_get_conversations(
    page: int = 1,
    limit: int = 20,
    admin: dict = Depends(require_admin)
):
    """Get all conversations"""
    total = await db.conversations.count_documents({})
    skip = (page - 1) * limit
    
    conversations = await db.conversations.find({}, {"_id": 0}).sort("updated_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with user info and message count
    for conv in conversations:
        participants_info = []
        for user_id in conv.get("participants", []):
            user = await db.users.find_one({"id": user_id}, {"_id": 0, "email": 1, "name": 1})
            if user:
                profile = await db.partner_profiles.find_one({"user_id": user_id}, {"_id": 0, "nickname": 1})
                participants_info.append({
                    "id": user_id,
                    "name": profile.get("nickname") if profile else user.get("name") or user.get("email", "").split("@")[0],
                    "email": user.get("email"),
                    "is_partner": profile is not None
                })
        conv["participants_info"] = participants_info
        
        # Message count
        conv["message_count"] = await db.messages.count_documents({"conversation_id": conv["id"]})
        
        # Last message - use find().sort().limit(1) instead of find_one().sort()
        last_msg_cursor = db.messages.find(
            {"conversation_id": conv["id"]}, {"_id": 0}
        ).sort("created_at", -1).limit(1)
        last_msgs = await last_msg_cursor.to_list(1)
        conv["last_message"] = last_msgs[0] if last_msgs else None
    
    return {
        "conversations": conversations,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.get("/conversations/{conversation_id}/messages")
async def admin_get_conversation_messages(
    conversation_id: str,
    page: int = 1,
    limit: int = 50,
    admin: dict = Depends(require_admin)
):
    """Get messages in a specific conversation"""
    conv = await db.conversations.find_one({"id": conversation_id})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    total = await db.messages.count_documents({"conversation_id": conversation_id})
    skip = (page - 1) * limit
    
    messages = await db.messages.find(
        {"conversation_id": conversation_id}, {"_id": 0}
    ).sort("created_at", 1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with user info
    for msg in messages:
        sender = await db.users.find_one({"id": msg.get("sender_id")}, {"_id": 0, "email": 1, "name": 1})
        if sender:
            profile = await db.partner_profiles.find_one({"user_id": msg.get("sender_id")}, {"_id": 0, "nickname": 1})
            msg["sender_name"] = profile.get("nickname") if profile else sender.get("name") or sender.get("email", "").split("@")[0]
    
    # Get participants info
    participants_info = []
    for user_id in conv.get("participants", []):
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "email": 1, "name": 1})
        if user:
            profile = await db.partner_profiles.find_one({"user_id": user_id}, {"_id": 0, "nickname": 1})
            participants_info.append({
                "id": user_id,
                "name": profile.get("nickname") if profile else user.get("name") or user.get("email", "").split("@")[0],
                "email": user.get("email"),
                "is_partner": profile is not None
            })
    
    return {
        "messages": messages,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
        "participants": participants_info
    }


@router.put("/messages/{message_id}/flag")
async def admin_flag_message(
    message_id: str,
    is_flagged: bool = True,
    admin: dict = Depends(require_admin)
):
    """Flag or unflag a message"""
    message = await db.messages.find_one({"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    await db.messages.update_one(
        {"id": message_id},
        {"$set": {"is_flagged": is_flagged, "flagged_at": datetime.now(timezone.utc).isoformat() if is_flagged else None}}
    )
    
    return {"success": True}


@router.delete("/messages/{message_id}")
async def admin_delete_message(message_id: str, admin: dict = Depends(require_admin)):
    """Delete a message"""
    message = await db.messages.find_one({"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    await db.messages.delete_one({"id": message_id})
    return {"success": True}


@router.delete("/conversations/{conversation_id}")
async def admin_delete_conversation(conversation_id: str, admin: dict = Depends(require_admin)):
    """Delete a conversation and all its messages"""
    conv = await db.conversations.find_one({"id": conversation_id})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Delete all messages in conversation
    await db.messages.delete_many({"conversation_id": conversation_id})
    # Delete conversation
    await db.conversations.delete_one({"id": conversation_id})
    
    return {"success": True}
