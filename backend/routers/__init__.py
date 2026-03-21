"""
Routers package
"""
from .auth import router as auth_router
from .partners import router as partners_router
from .catalog import router as catalog_router
from .messages import router as messages_router, websocket_endpoint
from .appointments import router as appointments_router
from .admin import router as admin_router
from .reviews import router as reviews_router
from .admin_messages import router as admin_messages_router

__all__ = [
    'auth_router',
    'partners_router', 
    'catalog_router',
    'messages_router',
    'websocket_endpoint',
    'appointments_router',
    'admin_router',
    'reviews_router',
    'admin_messages_router'
]
