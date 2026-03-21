"""
KKTCX Database Connection
"""
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URL, DB_NAME
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if not MONGO_URL:
    logger.error("MONGO_URL environment variable is not set!")
    raise ValueError("MONGO_URL environment variable is required")

logger.info(f"Connecting to MongoDB: {DB_NAME}")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
logger.info("MongoDB client initialized")

async def init_indexes():
    """Create database indexes"""
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.partner_profiles.create_index("user_id", unique=True)
    await db.partner_profiles.create_index("slug", unique=True)
    await db.partner_profiles.create_index([("status", 1), ("priority_score", -1)])
    await db.conversations.create_index("participants")
    await db.messages.create_index([("conversation_id", 1), ("created_at", -1)])
    await db.favorites.create_index([("user_id", 1), ("profile_id", 1)], unique=True)
    await db.appointments.create_index([("partner_id", 1), ("date", 1)])
    await db.appointments.create_index([("user_id", 1), ("date", 1)])
