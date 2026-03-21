"""Application configuration"""
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')

# Security
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# App
APP_NAME = os.environ.get('APP_NAME', 'kktcx')

# Integrations
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
NETGSM_USERCODE = os.environ.get('NETGSM_USERCODE')
NETGSM_PASSWORD = os.environ.get('NETGSM_PASSWORD')
NETGSM_HEADER = os.environ.get('NETGSM_HEADER', 'KKTCX')

# Storage
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
