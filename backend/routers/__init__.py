"""
Routers package
"""
from routers.auth import router as auth_router
from routers.partners import router as partners_router
from routers.catalog import router as catalog_router
from routers.messages import router as messages_router, websocket_endpoint
from routers.appointments import router as appointments_router
from routers.admin import router as admin_router

__all__ = [
    'auth_router',
    'partners_router', 
    'catalog_router',
    'messages_router',
    'websocket_endpoint',
    'appointments_router',
    'admin_router'
]
