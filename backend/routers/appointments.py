"""
Appointment Routes
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid

from database import db
from models.schemas import AvailabilitySettings, DurationOption, AppointmentCreate
from utils.auth import get_current_user, require_partner

router = APIRouter(tags=["Appointments"])


# ==================== PUBLIC AVAILABILITY ====================

@router.get("/availability/{profile_id}")
async def get_public_availability(
    profile_id: str,
    month: str = Query(None, description="Month in YYYY-MM format")
):
    """Get partner's public availability for booking"""
    profile = await db.partner_profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if profile.get("status") != "approved":
        raise HTTPException(status_code=404, detail="Profile not available")
    
    settings = profile.get("availability_settings", {
        "working_hours_start": "09:00",
        "working_hours_end": "22:00",
        "slot_duration": 60,
        "break_between_slots": 30,
        "working_days": [1, 2, 3, 4, 5, 6, 7],
        "blocked_dates": [],
        "auto_confirm": False
    })
    
    durations = profile.get("duration_options", [
        {"id": "30min", "label": "30 Dakika", "minutes": 30, "price": 100, "is_active": True},
        {"id": "1hour", "label": "1 Saat", "minutes": 60, "price": 150, "is_active": True},
        {"id": "2hour", "label": "2 Saat", "minutes": 120, "price": 250, "is_active": True}
    ])
    
    # Filter only active durations
    active_durations = [d for d in durations if d.get("is_active", True)]
    
    # Get existing appointments to determine available slots
    blocked_slots = []
    if month:
        try:
            year, mon = month.split("-")
            start_date = datetime(int(year), int(mon), 1)
            if int(mon) == 12:
                end_date = datetime(int(year) + 1, 1, 1)
            else:
                end_date = datetime(int(year), int(mon) + 1, 1)
            
            appointments = await db.appointments.find({
                "partner_id": profile_id,
                "status": {"$in": ["pending", "confirmed"]},
                "date": {"$gte": start_date.isoformat(), "$lt": end_date.isoformat()}
            }, {"_id": 0, "date": 1, "time": 1, "duration_minutes": 1}).to_list(100)
            
            blocked_slots = [{"date": a["date"][:10], "time": a["time"]} for a in appointments]
        except:
            pass
    
    return {
        "settings": {
            "working_hours_start": settings.get("working_hours_start", "09:00"),
            "working_hours_end": settings.get("working_hours_end", "22:00"),
            "working_days": settings.get("working_days", [1, 2, 3, 4, 5, 6, 7]),
            "blocked_dates": settings.get("blocked_dates", []),
            "slot_duration": settings.get("slot_duration", 60),
            "break_between_slots": settings.get("break_between_slots", 30)
        },
        "durations": active_durations,
        "blocked_slots": blocked_slots
    }


# ==================== PARTNER AVAILABILITY ====================

@router.get("/partner/availability")
async def get_partner_availability(user: dict = Depends(require_partner)):
    """Get partner's availability settings"""
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    settings = profile.get("availability_settings", {
        "working_hours_start": "09:00",
        "working_hours_end": "22:00",
        "slot_duration": 60,
        "break_between_slots": 30,
        "working_days": [1, 2, 3, 4, 5, 6, 7],
        "blocked_dates": [],
        "auto_confirm": False
    })
    
    durations = profile.get("duration_options", [
        {"id": "30min", "label": "30 Dakika", "minutes": 30, "price": 100, "is_active": True},
        {"id": "1hour", "label": "1 Saat", "minutes": 60, "price": 150, "is_active": True},
        {"id": "2hour", "label": "2 Saat", "minutes": 120, "price": 250, "is_active": True}
    ])
    
    return {
        "settings": settings,
        "durations": durations
    }


@router.put("/partner/availability")
async def update_partner_availability(
    settings: AvailabilitySettings,
    user: dict = Depends(require_partner)
):
    """Update partner's availability settings"""
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.partner_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": {"availability_settings": settings.model_dump()}}
    )
    
    return {"success": True}


@router.put("/partner/durations")
async def update_duration_options(
    durations: List[DurationOption],
    user: dict = Depends(require_partner)
):
    """Update partner's duration options"""
    profile = await db.partner_profiles.find_one({"user_id": user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.partner_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": {"duration_options": [d.model_dump() for d in durations]}}
    )
    
    return {"success": True}


# ==================== APPOINTMENT BOOKING ====================

@router.get("/appointments/available-slots")
async def get_available_slots(
    partner_id: str,
    date: str,
    user: dict = Depends(get_current_user)
):
    """Get available time slots for a partner on a specific date"""
    profile = await db.partner_profiles.find_one({"id": partner_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    settings = profile.get("availability_settings", {})
    durations = profile.get("duration_options", [
        {"id": "30min", "label": "30 Dakika", "minutes": 30, "price": 100, "is_active": True},
        {"id": "1hour", "label": "1 Saat", "minutes": 60, "price": 150, "is_active": True}
    ])
    
    start_time = settings.get("working_hours_start", "09:00")
    end_time = settings.get("working_hours_end", "22:00")
    slot_duration = settings.get("slot_duration", 60)
    break_time = settings.get("break_between_slots", 30)
    
    # Generate time slots
    slots = []
    current = datetime.strptime(start_time, "%H:%M")
    end = datetime.strptime(end_time, "%H:%M")
    
    while current < end:
        slot_end = current + timedelta(minutes=slot_duration)
        if slot_end <= end:
            slots.append({
                "start": current.strftime("%H:%M"),
                "end": slot_end.strftime("%H:%M"),
                "available": True
            })
        current = slot_end + timedelta(minutes=break_time)
    
    # Check existing appointments
    existing = await db.appointments.find({
        "partner_id": partner_id,
        "date": date,
        "status": {"$in": ["pending", "confirmed"]}
    }, {"_id": 0}).to_list(100)
    
    booked_slots = {apt["time_slot"] for apt in existing}
    for slot in slots:
        if slot["start"] in booked_slots:
            slot["available"] = False
    
    return {
        "date": date,
        "slots": slots,
        "durations": [d for d in durations if d.get("is_active", True)]
    }


@router.post("/appointments")
async def create_appointment(
    data: AppointmentCreate,
    user: dict = Depends(get_current_user)
):
    """Book an appointment"""
    profile = await db.partner_profiles.find_one({"id": data.partner_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    # Check if slot is available
    existing = await db.appointments.find_one({
        "partner_id": data.partner_id,
        "date": data.date,
        "time_slot": data.time_slot,
        "status": {"$in": ["pending", "confirmed"]}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Time slot not available")
    
    # Get duration details - use defaults if not set
    durations = profile.get("duration_options") or [
        {"id": "30min", "label": "30 Dakika", "minutes": 30, "price": 100, "is_active": True},
        {"id": "1hour", "label": "1 Saat", "minutes": 60, "price": 150, "is_active": True},
        {"id": "2hour", "label": "2 Saat", "minutes": 120, "price": 250, "is_active": True}
    ]
    duration = next((d for d in durations if d["id"] == data.duration_id), None)
    if not duration:
        raise HTTPException(status_code=400, detail="Invalid duration")
    
    settings = profile.get("availability_settings", {})
    auto_confirm = settings.get("auto_confirm", False)
    
    appointment = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "partner_id": data.partner_id,
        "date": data.date,
        "time_slot": data.time_slot,
        "duration_id": data.duration_id,
        "duration_minutes": duration["minutes"],
        "duration_label": duration["label"],
        "price": duration["price"],
        "notes": data.notes,
        "status": "confirmed" if auto_confirm else "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.appointments.insert_one(appointment)
    
    return {"success": True, "appointment": {k: v for k, v in appointment.items() if k != "_id"}}


@router.get("/appointments")
async def get_user_appointments(
    status: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """Get user's appointments"""
    query = {"user_id": user["id"]}
    if status:
        query["status"] = status
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    
    # Enrich with partner info
    for apt in appointments:
        profile = await db.partner_profiles.find_one({"id": apt["partner_id"]}, {"_id": 0})
        if profile:
            apt["partner_name"] = profile.get("nickname")
            apt["partner_slug"] = profile.get("slug")
            if profile.get("cover_image"):
                apt["partner_photo"] = f"/api/files/{profile['cover_image'].get('path', '')}"
    
    return appointments


@router.put("/appointments/{appointment_id}/cancel")
async def cancel_appointment(appointment_id: str, user: dict = Depends(get_current_user)):
    """Cancel an appointment"""
    appointment = await db.appointments.find_one({
        "id": appointment_id,
        "user_id": user["id"]
    })
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment["status"] not in ["pending", "confirmed"]:
        raise HTTPException(status_code=400, detail="Cannot cancel this appointment")
    
    await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True}


# ==================== PARTNER APPOINTMENT MANAGEMENT ====================

@router.get("/partner/appointments")
async def get_partner_appointments(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    user: dict = Depends(require_partner)
):
    """Get partner's appointments"""
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    query = {"partner_id": profile["id"]}
    if status:
        query["status"] = status
    
    total = await db.appointments.count_documents(query)
    skip = (page - 1) * limit
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("date", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with user info
    for apt in appointments:
        apt_user = await db.users.find_one({"id": apt["user_id"]}, {"_id": 0, "password": 0})
        if apt_user:
            apt["user_name"] = apt_user.get("name", apt_user["email"].split("@")[0])
            apt["user_email"] = apt_user.get("email")
            apt["user_phone"] = apt_user.get("phone")
    
    return appointments


@router.put("/partner/appointments/{appointment_id}/status")
async def update_partner_appointment_status(
    appointment_id: str,
    status: str = Query(..., description="New status: confirmed, rejected, completed"),
    user: dict = Depends(require_partner)
):
    """Update appointment status (partner)"""
    profile = await db.partner_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    appointment = await db.appointments.find_one({
        "id": appointment_id,
        "partner_id": profile["id"]
    })
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    valid_statuses = ["confirmed", "rejected", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True}
