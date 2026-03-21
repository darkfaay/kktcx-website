#!/usr/bin/env python3
"""
Create 50 partner profiles for KKTCX platform
Distribution: 70% female, 10% male, 20% trans
"""

import asyncio
import os
import sys
import random
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import hashlib

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'kktcx')

# Cities data
CITIES = [
    {'id': 'lefkosa', 'name': 'Lefkoşa', 'slug': 'lefkosa'},
    {'id': 'girne', 'name': 'Girne', 'slug': 'girne'},
    {'id': 'magusa', 'name': 'Gazimağusa', 'slug': 'magusa'},
    {'id': 'guzelyurt', 'name': 'Güzelyurt', 'slug': 'guzelyurt'},
    {'id': 'iskele', 'name': 'İskele', 'slug': 'iskele'},
    {'id': 'lefke', 'name': 'Lefke', 'slug': 'lefke'},
]

# Categories
CATEGORIES = [
    {'id': 'vip', 'name': 'VIP Escort'},
    {'id': 'premium', 'name': 'Premium'},
    {'id': 'standart', 'name': 'Standart'},
    {'id': 'model', 'name': 'Model'},
    {'id': 'independent', 'name': 'Bağımsız'},
]

# Service types
SERVICE_TYPES = [
    'dinner-companion', 'event-companion', 'sleep-companion', 
    'gf-bf-experience', 'spouse-roleplay', 'travel-companion',
    'social-event', 'business-event', 'culture-arts', 'sports-fitness'
]

# Orientations
ORIENTATIONS = ['heterosexual', 'lesbian', 'gay', 'bisexual']

# Female profile data
FEMALE_NAMES = [
    'Ayşe', 'Elif', 'Zeynep', 'Merve', 'Selin', 'Deniz', 'Ceren', 'Gizem',
    'Büşra', 'Aslı', 'Yasemin', 'Esra', 'Pınar', 'Burcu', 'Damla', 'Melis',
    'Cansu', 'İrem', 'Başak', 'Naz', 'Defne', 'Ece', 'Su', 'Ada', 'Nehir',
    'Dilara', 'Tuğba', 'Sude', 'Beren', 'Melisa', 'Derin', 'Ezgi', 'Ipek',
    'Nil', 'Sevgi', 'Sibel', 'Derya'
]

FEMALE_NICKNAMES = [
    'Princess', 'Diamond', 'Ruby', 'Pearl', 'Angel', 'Venus', 'Luna', 'Stella',
    'Scarlet', 'Amber', 'Crystal', 'Jade', 'Rose', 'Violet', 'Lily', 'Iris',
    'Sophia', 'Bella', 'Mia', 'Aria', 'Maya', 'Leyla', 'Nadia', 'Samira',
    'Elena', 'Aurora', 'Nova', 'Celeste', 'Luna', 'Esmeralda', 'Carmen', 'Valentina',
    'Isabella', 'Serena', 'Natasha', 'Monica'
]

# Male profile data
MALE_NAMES = ['Emre', 'Kaan', 'Cem', 'Burak', 'Mert', 'Can', 'Deniz', 'Arda']
MALE_NICKNAMES = ['Alex', 'Max', 'Leo', 'Lucas', 'Marco', 'Chris', 'Daniel', 'Adam']

# Trans profile data
TRANS_NAMES = ['Deniz', 'Derya', 'Evren', 'Özlem', 'Çağla', 'Nil', 'Esen', 'Umut', 'Lale', 'Rüzgar']
TRANS_NICKNAMES = ['Phoenix', 'Sky', 'Storm', 'River', 'Haven', 'Star', 'Angel', 'Heaven', 'Grace', 'Divine']

# Body types
BODY_TYPES = ['slim', 'athletic', 'curvy', 'average', 'petite', 'muscular']
ETHNICITIES = ['caucasian', 'latin', 'middle-eastern', 'mixed', 'asian', 'african']
SKIN_TONES = ['fair', 'light', 'medium', 'olive', 'tan', 'brown']
HAIR_COLORS = ['black', 'brown', 'blonde', 'red', 'auburn']
EYE_COLORS = ['brown', 'blue', 'green', 'hazel', 'black']

# Photo URLs - Unsplash photos for realistic profiles
# Female photos
FEMALE_PHOTOS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1502767089025-6572583495f9?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1496440737103-cd596325d314?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1485778303932-d3a27f8c7e3e?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1515023115894-1472d79f12f3?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1506956191951-7a88da4435e5?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1525879000488-bff3b1c387cf?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1503104834685-7205e8607eb9?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1513097633097-329a3a64e0d4?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1536896407451-6e3dd976edd1?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1526080652727-5b77f74eacd2?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1531123414780-f74242c2b052?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1533108344127-a586d2b02479?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1508326099804-190c33bd8274?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1524593689594-aae2f26b75ab?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1000&fit=crop",
]

# Male photos
MALE_PHOTOS = [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=800&h=1000&fit=crop",
]

# Trans photos (artistic/elegant)
TRANS_PHOTOS = [
    "https://images.unsplash.com/photo-1509868918748-a554ad25f858?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1528892952291-009c663ce843?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1515023115894-1472d79f12f3?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1525879000488-bff3b1c387cf?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?w=800&h=1000&fit=crop",
]

# Gallery photos for variety
GALLERY_PHOTOS = [
    "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1485778303932-d3a27f8c7e3e?w=600&h=800&fit=crop",
]

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_profile(index, gender, photos, names, nicknames):
    """Create a single profile with given parameters"""
    user_id = str(uuid.uuid4())
    profile_id = str(uuid.uuid4())
    
    # Select random data
    city = random.choice(CITIES)
    category = random.choice(CATEGORIES)
    name = names[index % len(names)]
    nickname = nicknames[index % len(nicknames)]
    
    # Add index suffix to make nicknames unique
    unique_nickname = f"{nickname}{index}"
    slug = f"{nickname.lower()}-{index}"
    
    # Select photos - ensure unique main photo
    main_photo = photos[index % len(photos)]
    
    # Create gallery with 3-6 photos
    gallery_count = random.randint(3, 6)
    gallery = []
    used_photos = {main_photo}
    all_photos = GALLERY_PHOTOS + photos
    
    while len(gallery) < gallery_count and len(used_photos) < len(all_photos):
        photo = random.choice(all_photos)
        if photo not in used_photos:
            used_photos.add(photo)
            gallery.append({'path': '', 'url': photo})
    
    # Random attributes
    age = random.randint(20, 38)
    height = random.randint(155, 178) if gender in ['female', 'trans'] else random.randint(170, 190)
    
    # Determine orientation based on gender
    if gender == 'female':
        orientation = random.choices(
            ['heterosexual', 'bisexual', 'lesbian'],
            weights=[0.6, 0.25, 0.15]
        )[0]
    elif gender == 'male':
        orientation = random.choices(
            ['heterosexual', 'bisexual', 'gay'],
            weights=[0.5, 0.3, 0.2]
        )[0]
    else:  # trans
        orientation = random.choices(
            ['bisexual', 'heterosexual', 'gay', 'lesbian'],
            weights=[0.4, 0.3, 0.15, 0.15]
        )[0]
    
    # Service types - 2-5 random services
    services = random.sample(SERVICE_TYPES, random.randint(2, 5))
    
    # Languages - Turkish always, plus 1-3 others
    languages = ['tr']
    extra_langs = random.sample(['en', 'ru', 'de'], random.randint(0, 2))
    languages.extend(extra_langs)
    
    # Descriptions
    descriptions = {
        'tr': f"Merhaba, ben {unique_nickname}. {city['name']}'da yaşıyorum. Kaliteli ve saygılı buluşmalar için buradayım.",
        'en': f"Hello, I'm {unique_nickname}. I live in {city['name']}. I'm here for quality and respectful meetings.",
        'ru': f"Привет, я {unique_nickname}. Живу в {city['name']}. Здесь для качественных встреч.",
        'de': f"Hallo, ich bin {unique_nickname}. Ich lebe in {city['name']}. Für qualitätsvolle Treffen.",
    }
    
    # Create user
    email = f"{nickname.lower()}.{index}@kktcx.test"
    user = {
        'id': user_id,
        'email': email,
        'password': hash_password('Test123!'),
        'phone': f'+90533{random.randint(1000000, 9999999)}',
        'name': name,
        'role': 'partner',
        'language': 'tr',
        'orientations': [orientation],
        'is_active': True,
        'is_verified': random.random() > 0.3,  # 70% verified
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    # Create profile
    profile = {
        'id': profile_id,
        'user_id': user_id,
        'nickname': unique_nickname,
        'slug': slug,
        'age': age,
        'gender': gender,
        'orientation': orientation,
        'city_id': city['id'],
        'city_name': city['name'],
        'category_id': category['id'],
        
        # Physical attributes
        'height': height,
        'body_type': random.choice(BODY_TYPES),
        'ethnicity': random.choice(ETHNICITIES),
        'skin_tone': random.choice(SKIN_TONES),
        'hair_color': random.choice(HAIR_COLORS),
        'eye_color': random.choice(EYE_COLORS),
        
        # Photos
        'photo_url': main_photo,
        'cover_url': main_photo,
        'gallery': gallery,
        'images': gallery,
        
        # Services
        'service_types': services,
        'hourly_rate': random.choice([150, 200, 250, 300, 400, 500]),
        'daily_rate': random.choice([800, 1000, 1500, 2000, 2500]),
        
        # Location options
        'incall': random.random() > 0.3,
        'outcall': random.random() > 0.2,
        
        # Availability
        'is_available_today': random.random() > 0.5,
        'is_available_tonight': random.random() > 0.4,
        
        # Status flags
        'is_featured': random.random() > 0.7,  # 30% featured
        'is_vitrin': random.random() > 0.8,  # 20% vitrin
        'is_homepage_vitrin': random.random() > 0.9,  # 10% homepage vitrin
        'is_verified': user['is_verified'],
        'is_approved': True,
        'status': 'approved',
        
        # Descriptions
        'descriptions': descriptions,
        'short_description': descriptions['tr'][:100],
        
        # Languages
        'languages': languages,
        
        # Contact (hidden from non-logged users)
        'whatsapp': f'+90533{random.randint(1000000, 9999999)}',
        'telegram': f'@{nickname.lower()}{index}',
        
        # Stats
        'view_count': random.randint(50, 500),
        'favorite_count': random.randint(10, 100),
        
        'created_at': datetime.now(timezone.utc).isoformat(),
        'updated_at': datetime.now(timezone.utc).isoformat(),
    }
    
    return user, profile

async def main():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing profiles and partner users (keep admin and regular users)
    print("Clearing existing partner profiles...")
    await db.partner_profiles.delete_many({})
    await db.users.delete_many({'role': 'partner'})
    
    # Distribution: 35 female (70%), 5 male (10%), 10 trans (20%)
    profiles_to_create = []
    users_to_create = []
    
    print("Creating 35 female profiles...")
    for i in range(35):
        user, profile = create_profile(i, 'female', FEMALE_PHOTOS, FEMALE_NAMES, FEMALE_NICKNAMES)
        users_to_create.append(user)
        profiles_to_create.append(profile)
    
    print("Creating 5 male profiles...")
    for i in range(5):
        user, profile = create_profile(i, 'male', MALE_PHOTOS, MALE_NAMES, MALE_NICKNAMES)
        users_to_create.append(user)
        profiles_to_create.append(profile)
    
    print("Creating 10 trans profiles...")
    for i in range(10):
        user, profile = create_profile(i, 'trans', TRANS_PHOTOS, TRANS_NAMES, TRANS_NICKNAMES)
        users_to_create.append(user)
        profiles_to_create.append(profile)
    
    # Insert all
    print(f"Inserting {len(users_to_create)} users...")
    await db.users.insert_many(users_to_create)
    
    print(f"Inserting {len(profiles_to_create)} profiles...")
    await db.partner_profiles.insert_many(profiles_to_create)
    
    # Summary
    print("\n" + "="*50)
    print("PROFILE CREATION COMPLETE")
    print("="*50)
    print(f"Total profiles created: {len(profiles_to_create)}")
    print(f"  - Female: 35 (70%)")
    print(f"  - Male: 5 (10%)")
    print(f"  - Trans: 10 (20%)")
    
    # Count by city
    print("\nBy City:")
    city_counts = {}
    for p in profiles_to_create:
        city_name = p['city_name']
        city_counts[city_name] = city_counts.get(city_name, 0) + 1
    for city, count in sorted(city_counts.items()):
        print(f"  - {city}: {count}")
    
    print("\nLogin credentials:")
    print("Password for all: Test123!")
    print("Example emails:")
    for i, u in enumerate(users_to_create[:5]):
        print(f"  - {u['email']}")
    
    print("\nDone!")

if __name__ == '__main__':
    asyncio.run(main())
