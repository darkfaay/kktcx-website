"""
Messaging Routes
"""
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from typing import Optional
from datetime import datetime, timezone
import uuid
import jwt

from database import db
from models.schemas import MessageCreate
from utils.auth import get_current_user
from services.websocket import ws_manager
from config import JWT_SECRET, JWT_ALGORITHM

router = APIRouter(tags=["Messages"])


@router.get("/conversations")
async def get_conversations(user: dict = Depends(get_current_user)):
    """Get user's conversations"""
    conversations = await db.conversations.find(
        {"participants": user["id"]}, {"_id": 0}
    ).sort("updated_at", -1).to_list(100)
    
    for conv in conversations:
        other_id = next((p for p in conv["participants"] if p != user["id"]), None)
        if other_id:
            other_user = await db.users.find_one({"id": other_id}, {"_id": 0, "password": 0})
            if other_user:
                profile = await db.partner_profiles.find_one({"user_id": other_id}, {"_id": 0})
                
                # Get avatar - try cover_image first, then first image from gallery
                avatar = None
                if profile:
                    cover = profile.get("cover_image")
                    images = profile.get("images", [])
                    
                    if cover:
                        avatar = cover.get("url") or cover.get("path")
                    elif images and len(images) > 0:
                        avatar = images[0].get("url") or images[0].get("path")
                
                conv["other_user"] = {
                    "id": other_user["id"],
                    "name": profile.get("nickname") if profile else other_user.get("name", other_user["email"].split("@")[0]),
                    "avatar": avatar,
                    "is_partner": profile is not None
                }
        
        # Get last message - use find().sort().limit(1) instead of find_one().sort()
        last_msg_cursor = db.messages.find(
            {"conversation_id": conv["id"]}, {"_id": 0}
        ).sort("created_at", -1).limit(1)
        last_msgs = await last_msg_cursor.to_list(1)
        conv["last_message"] = last_msgs[0] if last_msgs else None
        
        unread = await db.messages.count_documents({
            "conversation_id": conv["id"],
            "sender_id": {"$ne": user["id"]},
            "read": False
        })
        conv["unread_count"] = unread
    
    return conversations


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, user: dict = Depends(get_current_user)):
    """Get conversation details"""
    conv = await db.conversations.find_one(
        {"id": conversation_id, "participants": user["id"]}, {"_id": 0}
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    other_id = next((p for p in conv["participants"] if p != user["id"]), None)
    if other_id:
        other_user = await db.users.find_one({"id": other_id}, {"_id": 0, "password": 0})
        if other_user:
            profile = await db.partner_profiles.find_one({"user_id": other_id}, {"_id": 0})
            conv["other_user"] = {
                "id": other_user["id"],
                "name": profile.get("nickname") if profile else other_user.get("name", other_user["email"].split("@")[0]),
                "avatar": profile.get("cover_image", {}).get("path") if profile else None,
                "is_partner": profile is not None
            }
    
    return conv


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    page: int = 1,
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    """Get messages in a conversation"""
    conv = await db.conversations.find_one(
        {"id": conversation_id, "participants": user["id"]}
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    skip = (page - 1) * limit
    messages = await db.messages.find(
        {"conversation_id": conversation_id}, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    messages.reverse()
    
    await db.messages.update_many(
        {"conversation_id": conversation_id, "sender_id": {"$ne": user["id"]}, "read": False},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return messages


@router.post("/messages")
async def send_message(data: MessageCreate, user: dict = Depends(get_current_user)):
    """Send a message"""
    receiver = await db.users.find_one({"id": data.receiver_id})
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    participants = sorted([user["id"], data.receiver_id])
    conv = await db.conversations.find_one({"participants": participants})
    
    if not conv:
        conv_id = str(uuid.uuid4())
        conv = {
            "id": conv_id,
            "participants": participants,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.conversations.insert_one(conv)
    else:
        conv_id = conv["id"]
        await db.conversations.update_one(
            {"id": conv_id},
            {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    message = {
        "id": str(uuid.uuid4()),
        "conversation_id": conv_id,
        "sender_id": user["id"],
        "receiver_id": data.receiver_id,
        "content": data.content,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(message)
    
    ws_message = {
        "type": "new_message",
        "message": {k: v for k, v in message.items() if k != "_id"},
        "conversation_id": conv_id
    }
    await ws_manager.send_personal_message(ws_message, data.receiver_id)
    
    return {"success": True, "message": {k: v for k, v in message.items() if k != "_id"}, "conversation_id": conv_id}


@router.get("/messages/unread-count")
async def get_unread_count(user: dict = Depends(get_current_user)):
    """Get total unread message count"""
    count = await db.messages.count_documents({
        "receiver_id": user["id"],
        "read": False
    })
    return {"count": count}


@router.post("/conversations/{conversation_id}/mark-read")
async def mark_conversation_read(conversation_id: str, user: dict = Depends(get_current_user)):
    """Mark all messages in conversation as read"""
    conv = await db.conversations.find_one(
        {"id": conversation_id, "participants": user["id"]}
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    await db.messages.update_many(
        {"conversation_id": conversation_id, "sender_id": {"$ne": user["id"]}, "read": False},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True}


# ==================== WEBSOCKET ====================

async def websocket_endpoint(websocket: WebSocket, token: str):
    """WebSocket endpoint for real-time messaging"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
        
        await ws_manager.connect(websocket, user_id)
        
        try:
            while True:
                data = await websocket.receive_json()
                if data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif data.get("type") == "typing":
                    conv_id = data.get("conversation_id")
                    conv = await db.conversations.find_one({"id": conv_id})
                    if conv:
                        other_id = next((p for p in conv["participants"] if p != user_id), None)
                        if other_id:
                            await ws_manager.send_personal_message(
                                {"type": "typing", "user_id": user_id, "conversation_id": conv_id},
                                other_id
                            )
        except WebSocketDisconnect:
            ws_manager.disconnect(websocket, user_id)
    except jwt.InvalidTokenError:
        await websocket.close(code=4001)
    except Exception:
        await websocket.close(code=4000)
