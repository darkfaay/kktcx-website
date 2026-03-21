"""
KKTCX Backend Configuration
"""
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent

# Try to load .env file if exists (development)
try:
    from dotenv import load_dotenv
    env_file = ROOT_DIR / '.env'
    if env_file.exists():
        load_dotenv(env_file)
except ImportError:
    pass

# Database
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'kktcx')

# JWT
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

# App
APP_NAME = os.environ.get('APP_NAME', 'kktcx')

# External Services
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Object Storage
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"

# CORS
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
