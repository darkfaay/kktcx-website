"""Routers package"""
from routers.auth import router as auth_router
from routers.partners import router as partners_router
from routers.messages import router as messages_router
from routers.admin import router as admin_router
from routers.catalog import router as catalog_router
from routers.payments import router as payments_router
from routers.media import router as media_router

__all__ = [
    'auth_router',
    'partners_router', 
    'messages_router',
    'admin_router',
    'catalog_router',
    'payments_router',
    'media_router'
]
