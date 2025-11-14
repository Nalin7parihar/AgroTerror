"""
Rate limiting utilities for API endpoints
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status
from core.redis import get_redis
from core.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Create limiter instance
# Use Redis if available, otherwise fallback to in-memory
def get_limiter_key(request: Request) -> str:
    """Get a unique key for rate limiting based on user or IP"""
    # Try to get user ID from request state (set by auth dependency)
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return f"user:{user_id}"
    # Fallback to IP address
    return get_remote_address(request)

# Initialize limiter
# slowapi works with Redis URL string, not the client object
try:
    # Use Redis URL from settings if available
    redis_url = settings.REDIS_URL
    limiter = Limiter(
        key_func=get_limiter_key,
        storage_uri=redis_url,
        default_limits=["1000/hour"]  # Default limit if not specified
    )
    logger.info(f"Rate limiter initialized with Redis backend: {redis_url}")
except Exception as e:
    logger.warning(f"Failed to initialize Redis-backed limiter: {e}. Using in-memory limiter.")
    # Fallback to in-memory limiter if Redis is not available
    limiter = Limiter(
        key_func=get_limiter_key,
        default_limits=["1000/hour"]
    )
    logger.warning("Rate limiter initialized with in-memory backend (Redis not available)")

# Rate limit configurations for different endpoints
RATE_LIMITS = {
    # Authentication endpoints - stricter limits to prevent brute force
    "auth_register": "5/hour",  # 5 registrations per hour per IP
    "auth_login": "10/hour",    # 10 login attempts per hour per IP
    "auth_me": "100/hour",      # 100 requests per hour per user
    
    # LLM endpoints - moderate limits due to cost
    "llm_query": "30/hour",     # 30 queries per hour per user
    
    # Gene analysis endpoints - moderate limits due to ML processing cost
    "gene_analysis": "10/hour",      # 10 analyses per hour per user
    "gene_analysis_history": "100/hour",  # 100 history requests per hour per user
    "gene_analysis_detail": "100/hour",   # 100 detail requests per hour per user
    
    # General API limits
    "default": "1000/hour",     # Default limit for other endpoints
}

def get_rate_limit(limit_name: str) -> str:
    """Get rate limit string for a given limit name"""
    return RATE_LIMITS.get(limit_name, RATE_LIMITS["default"])

