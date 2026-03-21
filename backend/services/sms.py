"""SMS Service - Netgsm Integration"""
import logging
import requests
from typing import Optional, List, Dict, Any
from config import NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_HEADER
from database import db

logger = logging.getLogger(__name__)

class SMSService:
    """Netgsm SMS Service"""
    
    BASE_URL = "https://api.netgsm.com.tr/sms/send/get"
    
    def __init__(self):
        self.usercode = NETGSM_USERCODE
        self.password = NETGSM_PASSWORD
        self.header = NETGSM_HEADER
        self._enabled = bool(self.usercode and self.password)
    
    @property
    def is_enabled(self) -> bool:
        return self._enabled
    
    async def load_settings(self):
        """Load SMS settings from database"""
        try:
            settings = await db.settings.find_one({"key": "netgsm"}, {"_id": 0})
            if settings and settings.get("value"):
                config = settings["value"]
                self.usercode = config.get("usercode") or self.usercode
                self.password = config.get("password") or self.password
                self.header = config.get("header") or self.header
                self._enabled = bool(self.usercode and self.password)
        except Exception as e:
            logger.error(f"Failed to load SMS settings: {e}")
    
    async def send_sms(self, phone: str, message: str) -> Dict[str, Any]:
        """Send SMS via Netgsm"""
        if not self.is_enabled:
            logger.warning("SMS service not configured, skipping SMS")
            return {"success": False, "error": "SMS service not configured"}
        
        # Clean phone number
        phone = phone.replace(" ", "").replace("-", "").replace("+", "")
        if phone.startswith("0"):
            phone = "90" + phone[1:]
        elif not phone.startswith("90"):
            phone = "90" + phone
        
        try:
            params = {
                "usercode": self.usercode,
                "password": self.password,
                "gsmno": phone,
                "message": message,
                "msgheader": self.header,
                "dil": "TR"
            }
            
            response = requests.get(self.BASE_URL, params=params, timeout=30)
            result_code = response.text.strip()
            
            # Log the SMS
            await self._log_sms(phone, message, result_code)
            
            # Netgsm success codes start with "00" or are numeric job IDs
            if result_code.startswith("00") or result_code.isdigit():
                logger.info(f"SMS sent successfully to {phone}: {result_code}")
                return {"success": True, "code": result_code}
            else:
                logger.error(f"SMS failed to {phone}: {result_code}")
                return {"success": False, "error": result_code}
                
        except Exception as e:
            logger.error(f"SMS send error: {e}")
            return {"success": False, "error": str(e)}
    
    async def send_bulk_sms(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Send multiple SMS messages"""
        results = []
        for msg in messages:
            result = await self.send_sms(msg["phone"], msg["message"])
            results.append({"phone": msg["phone"], **result})
        return {"results": results}
    
    async def _log_sms(self, phone: str, message: str, result: str):
        """Log SMS to database"""
        try:
            from datetime import datetime, timezone
            await db.sms_logs.insert_one({
                "phone": phone,
                "message": message[:100],
                "result": result,
                "success": result.startswith("00") or result.isdigit(),
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        except Exception as e:
            logger.error(f"Failed to log SMS: {e}")
    
    async def get_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get SMS logs"""
        try:
            logs = await db.sms_logs.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
            return logs
        except Exception as e:
            logger.error(f"Failed to get SMS logs: {e}")
            return []

# Global SMS service instance
sms_service = SMSService()

async def send_notification_sms(phone: str, message: str) -> Dict[str, Any]:
    """Helper function to send notification SMS"""
    await sms_service.load_settings()
    return await sms_service.send_sms(phone, message)

async def send_new_message_notification(phone: str, sender_name: str = "Birisi"):
    """Send new message notification"""
    message = f"KKTCX: {sender_name} size yeni bir mesaj gonderdi. Gormek icin uygulamaya giris yapin."
    return await send_notification_sms(phone, message)

async def send_verification_code(phone: str, code: str):
    """Send verification code SMS"""
    message = f"KKTCX dogrulama kodunuz: {code}. Bu kodu kimseyle paylasmayın."
    return await send_notification_sms(phone, message)

async def send_profile_approved_notification(phone: str):
    """Send profile approved notification"""
    message = "KKTCX: Profiliniz onaylandi! Artik platformda gorunur durumdasiniz."
    return await send_notification_sms(phone, message)

async def send_profile_rejected_notification(phone: str, reason: str = ""):
    """Send profile rejected notification"""
    message = f"KKTCX: Profiliniz reddedildi. {reason[:50] if reason else 'Detaylar icin giris yapin.'}"
    return await send_notification_sms(phone, message)
