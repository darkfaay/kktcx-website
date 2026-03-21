"""
Minimal KKTCX Backend Server for Testing
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Starting minimal server...")

# Check environment variables
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'kktcx')
JWT_SECRET = os.environ.get('JWT_SECRET', 'default')

logger.info(f"MONGO_URL set: {bool(MONGO_URL)}")
logger.info(f"DB_NAME: {DB_NAME}")
logger.info(f"JWT_SECRET set: {bool(JWT_SECRET)}")

app = FastAPI(title="KKTCX API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    return {"status": "ok", "db_configured": bool(MONGO_URL)}

@app.get("/api/test")
async def test():
    return {"message": "Backend is working!"}

logger.info("Minimal server ready!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
