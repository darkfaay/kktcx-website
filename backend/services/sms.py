"""
SMS Service - Netgsm Integration
"""
import logging
from database import db
from datetime import datetime, timezone
import uuid

logger = logging.getLogger(__name__)


async def get_sms_settings():
    """Get SMS settings from database"""
    settings = await db.settings.find_one({"key": "netgsm"}, {"_id": 0})
    return settings.get("value", {}) if settings else {}


async def send_sms_notification(phone: str, message: str):
    """Send SMS via Netgsm if configured"""
    try:
        settings = await get_sms_settings()
        if not settings.get("enabled"):
            logger.info(f"SMS disabled, would send to {phone}: {message}")
            await db.sms_logs.insert_one({
                "id": str(uuid.uuid4()),
                "phone": phone,
                "message": message,
                "status": "skipped",
                "reason": "SMS disabled",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            return False
        
        usercode = settings.get("usercode")
        password = settings.get("password")
        msgheader = settings.get("msgheader")
        
        if not all([usercode, password, msgheader]):
            logger.warning("Netgsm credentials not configured")
            return False
        
        from netgsm import Netgsm
        netgsm = Netgsm(username=usercode, password=password)
        response = netgsm.sms.send(
            msgheader=msgheader,
            messages=[{"msg": message, "no": phone}]
        )
        
        await db.sms_logs.insert_one({
            "id": str(uuid.uuid4()),
            "phone": phone,
            "message": message,
            "status": "sent",
            "response": str(response),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return True
    except Exception as e:
        logger.error(f"SMS send failed: {e}")
        await db.sms_logs.insert_one({
            "id": str(uuid.uuid4()),
            "phone": phone,
            "message": message,
            "status": "failed",
            "error": str(e),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return False
