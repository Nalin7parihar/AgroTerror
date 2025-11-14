from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi.errors import RateLimitExceeded
from core.database import connect_to_mongo, close_mongo_connection
from core.redis import connect_to_redis, close_redis_connection, get_redis
from core.config import settings
from core.rate_limit import limiter
from routers import auth, llm
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app : FastAPI):
    # Startup
    logger.info("Starting application...")
    await connect_to_mongo()
    await connect_to_redis()
    
    # Check Redis connection status
    redis_client = get_redis()
    if redis_client is not None:
        try:
            await redis_client.ping()
            logger.info("✓ Redis is connected and ready for caching")
        except Exception as e:
            logger.warning(f"✗ Redis connection check failed: {str(e)}")
    else:
        logger.warning("✗ Redis is not available - caching is disabled")
    
    yield
    # Shutdown
    logger.info("Shutting down application...")
    await close_redis_connection()
    await close_mongo_connection()
    logger.info("Application shutdown complete")
    
app = FastAPI(title="AgroTerror",
              lifespan=lifespan,
              description="AI Tool which can predict crop growth and yield by alternating genes using CRISPR technology",
              version="1.0.0",
              docs_url="/docs",
              redoc_url="/redoc"
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting exception handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded errors"""
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": f"Rate limit exceeded: {exc.detail}. Please try again later.",
            "retry_after": exc.retry_after if hasattr(exc, 'retry_after') else 60
        },
        headers={"Retry-After": str(exc.retry_after) if hasattr(exc, 'retry_after') else "60"}
    )

# Add limiter to app state
app.state.limiter = limiter

# Include routers
app.include_router(auth.router)
app.include_router(llm.router)

@app.get("/")
async def root():
    return {"message" : "Hello Agriculture"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
