from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
from typing import Optional

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None

db = MongoDB()

async def connect_to_mongo():
    """Create database connection"""
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")

def get_database():
    """Get database instance"""
    return db.client[settings.DATABASE_NAME]

async def get_db():
    """Dependency to get database instance"""
    return db.client[settings.DATABASE_NAME]

