from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import connect_to_mongo, close_mongo_connection
from core.redis import connect_to_redis, close_redis_connection, get_redis
from core.config import settings
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

# Include routers
app.include_router(auth.router)
app.include_router(llm.router)

@app.get("/")
async def root():
    return {"message" : "Hello Agriculture"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
