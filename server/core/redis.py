from redis.asyncio import Redis
from core.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class RedisClient:
    client: Optional[Redis] = None

redis_client = RedisClient()

async def connect_to_redis():
    """Create Redis connection"""
    try:
        redis_client.client = Redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        # Test connection
        await redis_client.client.ping()
        logger.info(f"Connected to Redis: {settings.REDIS_URL}")
    except Exception as e:
        logger.warning(f"Failed to connect to Redis: {str(e)}. Caching will be disabled.")
        # Set client to None so cache functions know Redis is unavailable
        redis_client.client = None

async def close_redis_connection():
    """Close Redis connection"""
    if redis_client.client:
        await redis_client.client.close()
        logger.info("Disconnected from Redis")

def get_redis() -> Optional[Redis]:
    """Get Redis client instance. Returns None if Redis is not available."""
    return redis_client.client

