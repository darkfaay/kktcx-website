"""Object Storage Service"""
import logging
import requests
from typing import Optional, Tuple
from config import STORAGE_URL, EMERGENT_LLM_KEY
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class StorageService:
    """Emergent Object Storage Service"""
    
    def __init__(self):
        self.storage_key: Optional[str] = None
        self.base_url = STORAGE_URL
        self.emergent_key = EMERGENT_LLM_KEY
    
    def init(self) -> Optional[str]:
        """Initialize storage and get storage key"""
        if self.storage_key:
            return self.storage_key
        
        try:
            resp = requests.post(
                f"{self.base_url}/init",
                json={"emergent_key": self.emergent_key},
                timeout=30
            )
            resp.raise_for_status()
            self.storage_key = resp.json()["storage_key"]
            logger.info("Storage initialized successfully")
            return self.storage_key
        except Exception as e:
            logger.error(f"Storage init failed: {e}")
            return None
    
    def put_object(self, path: str, data: bytes, content_type: str) -> dict:
        """Upload object to storage"""
        key = self.init()
        if not key:
            raise HTTPException(status_code=500, detail="Storage not initialized")
        
        resp = requests.put(
            f"{self.base_url}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120
        )
        resp.raise_for_status()
        return resp.json()
    
    def get_object(self, path: str) -> Tuple[bytes, str]:
        """Get object from storage"""
        key = self.init()
        if not key:
            raise HTTPException(status_code=500, detail="Storage not initialized")
        
        resp = requests.get(
            f"{self.base_url}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=60
        )
        resp.raise_for_status()
        return resp.content, resp.headers.get("Content-Type", "application/octet-stream")
    
    def delete_object(self, path: str) -> bool:
        """Delete object from storage"""
        key = self.init()
        if not key:
            raise HTTPException(status_code=500, detail="Storage not initialized")
        
        try:
            resp = requests.delete(
                f"{self.base_url}/objects/{path}",
                headers={"X-Storage-Key": key},
                timeout=30
            )
            resp.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Failed to delete object {path}: {e}")
            return False

# Global storage service instance
storage_service = StorageService()

def init_storage() -> Optional[str]:
    """Initialize storage (backward compatible)"""
    return storage_service.init()

def put_object(path: str, data: bytes, content_type: str) -> dict:
    """Upload object (backward compatible)"""
    return storage_service.put_object(path, data, content_type)

def get_object(path: str) -> Tuple[bytes, str]:
    """Get object (backward compatible)"""
    return storage_service.get_object(path)
