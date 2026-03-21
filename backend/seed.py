"""
Seed script for KKTCX database
Run this to populate initial data
"""
import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import uuid

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb+srv://kktcevarkadasi_db_user:OnCrKrZYI0A7LVMs@kktcx-cluster.vee4bne.mongodb.net/kktcx?retryWrites=true&w=majority")
DB_NAME = os.environ.get("DB_NAME", "kktcx")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_database():
    print("🌱 Starting database seed...")
    
    # 1. Create Admin User
    print("📝 Creating admin user...")
    admin_exists = await db.users.find_one({"email": "admin@kktcx.com"})
    if not admin_exists:
        admin = {
            "id": str(uuid.uuid4()),
            "email": "admin@kktcx.com",
            "password": hash_password("admin123"),
            "name": "Admin",
            "role": "admin",
            "language": "tr",
            "orientations": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin)
        print("✅ Admin user created: admin@kktcx.com / admin123")
    else:
        print("ℹ️ Admin user already exists")

    # 2. Create Cities
    print("📝 Creating cities...")
    cities = [
        # Kuzey Kıbrıs
        {"id": str(uuid.uuid4()), "slug": "girne", "region": "north", "names": {"tr": "Girne", "en": "Kyrenia", "ru": "Кирения", "de": "Kyrenia", "el": "Κερύνεια"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "lefkosa-kuzey", "region": "north", "names": {"tr": "Lefkoşa (Kuzey)", "en": "Nicosia (North)", "ru": "Никосия (Север)", "de": "Nikosia (Nord)", "el": "Λευκωσία (Βόρεια)"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "gazimagusa", "region": "north", "names": {"tr": "Gazimağusa", "en": "Famagusta", "ru": "Фамагуста", "de": "Famagusta", "el": "Αμμόχωστος"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "guzelyurt", "region": "north", "names": {"tr": "Güzelyurt", "en": "Morphou", "ru": "Морфу", "de": "Morphou", "el": "Μόρφου"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "iskele", "region": "north", "names": {"tr": "İskele", "en": "Iskele", "ru": "Искеле", "de": "Iskele", "el": "Τρίκωμο"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "lefke", "region": "north", "names": {"tr": "Lefke", "en": "Lefke", "ru": "Лефке", "de": "Lefke", "el": "Λεύκα"}, "active": True},
        # Güney Kıbrıs
        {"id": str(uuid.uuid4()), "slug": "limasol", "region": "south", "names": {"tr": "Limasol", "en": "Limassol", "ru": "Лимассол", "de": "Limassol", "el": "Λεμεσός"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "larnaka", "region": "south", "names": {"tr": "Larnaka", "en": "Larnaca", "ru": "Ларнака", "de": "Larnaka", "el": "Λάρνακα"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "baf", "region": "south", "names": {"tr": "Baf", "en": "Paphos", "ru": "Пафос", "de": "Paphos", "el": "Πάφος"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "ayia-napa", "region": "south", "names": {"tr": "Ayia Napa", "en": "Ayia Napa", "ru": "Айя-Напа", "de": "Ayia Napa", "el": "Αγία Νάπα"}, "active": True},
    ]
    
    await db.cities.delete_many({})
    await db.cities.insert_many(cities)
    print(f"✅ Created {len(cities)} cities")

    # 3. Create Categories (Service Types)
    print("📝 Creating categories...")
    categories = [
        {"id": str(uuid.uuid4()), "slug": "dinner-companion", "names": {"tr": "Yemek Eşliği", "en": "Dinner Companion", "ru": "Компаньон на ужин", "de": "Dinner-Begleitung", "el": "Συνοδός δείπνου"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "event-companion", "names": {"tr": "Davet Eşliği", "en": "Event Companion", "ru": "Компаньон на мероприятие", "de": "Event-Begleitung", "el": "Συνοδός εκδηλώσεων"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "travel-companion", "names": {"tr": "Gezi Eşliği", "en": "Travel Companion", "ru": "Попутчик", "de": "Reisebegleitung", "el": "Συνοδός ταξιδιού"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "gf-bf-experience", "names": {"tr": "Sevgili Deneyimi", "en": "GF/BF Experience", "ru": "Опыт парня/девушки", "de": "Freund/in-Erlebnis", "el": "Εμπειρία συντρόφου"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "social-event", "names": {"tr": "Sosyal Etkinlik", "en": "Social Event", "ru": "Социальное мероприятие", "de": "Gesellschaftliches Event", "el": "Κοινωνική εκδήλωση"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "business-meeting", "names": {"tr": "İş Daveti", "en": "Business Meeting", "ru": "Деловая встреча", "de": "Geschäftstreffen", "el": "Επαγγελματική συνάντηση"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "culture-art", "names": {"tr": "Kültür & Sanat", "en": "Culture & Art", "ru": "Культура и искусство", "de": "Kultur & Kunst", "el": "Πολιτισμός & Τέχνη"}, "active": True},
        {"id": str(uuid.uuid4()), "slug": "sports-fitness", "names": {"tr": "Spor & Fitness", "en": "Sports & Fitness", "ru": "Спорт и фитнес", "de": "Sport & Fitness", "el": "Αθλητισμός & Γυμναστική"}, "active": True},
    ]
    
    await db.categories.delete_many({})
    await db.categories.insert_many(categories)
    print(f"✅ Created {len(categories)} categories")

    # 4. Create Default Settings
    print("📝 Creating default settings...")
    settings = [
        {
            "key": "general",
            "value": {
                "site_name": "KKTCX",
                "site_tagline": "Kıbrıs'ın Premium Eşlik Platformu",
                "contact_email": "info@kktcx.com",
                "contact_phone": "+90 548 000 0000",
                "contact_address": "Girne, Kuzey Kıbrıs",
                "maintenance_mode": False
            }
        },
        {
            "key": "homepage",
            "value": {
                "hero_title": "Tutkunun Adresi",
                "hero_subtitle": "Özel anlarınız için seçkin partnerler.",
                "hero_description": "Yemek eşliği, davet arkadaşlığı ve unutulmaz deneyimler.",
                "show_vitrin": True,
                "show_featured": True,
                "vitrin_count": 6,
                "featured_count": 8
            }
        },
        {
            "key": "social",
            "value": {
                "instagram": "https://instagram.com/kktcx",
                "twitter": "https://twitter.com/kktcx",
                "telegram": "https://t.me/kktcx",
                "facebook": ""
            }
        },
        {
            "key": "features",
            "value": {
                "messaging_enabled": True,
                "favorites_enabled": True,
                "reviews_enabled": True,
                "booking_enabled": True
            }
        }
    ]
    
    for setting in settings:
        await db.settings.update_one(
            {"key": setting["key"]},
            {"$set": setting},
            upsert=True
        )
    print(f"✅ Created {len(settings)} settings")

    # 5. Create indexes
    print("📝 Creating indexes...")
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.partner_profiles.create_index("user_id")
    await db.partner_profiles.create_index("slug", unique=True, sparse=True)
    await db.partner_profiles.create_index("status")
    await db.cities.create_index("slug", unique=True)
    await db.categories.create_index("slug", unique=True)
    print("✅ Indexes created")

    print("\n🎉 Database seed completed!")
    print("=" * 50)
    print("Admin Login: admin@kktcx.com / admin123")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(seed_database())
