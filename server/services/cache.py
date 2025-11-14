import hashlib
import json
from typing import Optional
from schemas.llm import LLMQueryRequest, LLMQueryResponse
from core.redis import get_redis
from core.config import settings
import logging

logger = logging.getLogger(__name__)

CACHE_KEY_PREFIX = "llm:query:"


def generate_cache_key(request: LLMQueryRequest) -> str:
    """
    Generate a cache key from LLM query request.
    The key is based on question (normalized), difficulty, language, and allow_code_mixing.
    """
    # Normalize question: lowercase and strip whitespace
    normalized_question = request.question.lower().strip()
    
    # Create a dictionary with all relevant parameters
    cache_data = {
        "question": normalized_question,
        "difficulty": request.difficulty.value,
        "language": request.language.value,
        "allow_code_mixing": request.allow_code_mixing
    }
    
    # Create a JSON string and hash it for a consistent key
    cache_string = json.dumps(cache_data, sort_keys=True)
    cache_hash = hashlib.sha256(cache_string.encode()).hexdigest()
    
    return f"{CACHE_KEY_PREFIX}{cache_hash}"


async def get_cached_response(request: LLMQueryRequest) -> Optional[LLMQueryResponse]:
    """
    Retrieve cached LLM response if available.
    Returns None if not found or on error.
    """
    try:
        redis = get_redis()
        if redis is None:
            return None
            
        cache_key = generate_cache_key(request)
        
        cached_data = await redis.get(cache_key)
        
        if cached_data:
            logger.info(f"Cache hit for key: {cache_key[:50]}...")
            response_dict = json.loads(cached_data)
            return LLMQueryResponse(**response_dict)
        
        logger.debug(f"Cache miss for key: {cache_key[:50]}...")
        return None
    
    except RuntimeError:
        # Redis not initialized
        return None
    except Exception as e:
        logger.warning(f"Error retrieving from cache: {str(e)}")
        # Don't fail the request if cache fails, just return None
        return None


async def cache_response(request: LLMQueryRequest, response: LLMQueryResponse) -> None:
    """
    Cache LLM response for future requests.
    Silently fails if caching is unavailable.
    """
    try:
        redis = get_redis()
        if redis is None:
            return
            
        cache_key = generate_cache_key(request)
        
        # Convert response to dict and serialize
        response_dict = response.model_dump()
        cache_data = json.dumps(response_dict)
        
        # Store with TTL
        await redis.setex(
            cache_key,
            settings.REDIS_CACHE_TTL,
            cache_data
        )
        
        logger.info(f"Cached response for key: {cache_key[:50]}... (TTL: {settings.REDIS_CACHE_TTL}s)")
    
    except RuntimeError:
        # Redis not initialized, silently skip caching
        pass
    except Exception as e:
        logger.warning(f"Error caching response: {str(e)}")
        # Don't fail the request if caching fails

