from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import connect_to_mongo, close_mongo_connection
from core.config import settings
from routers import auth, llm

@asynccontextmanager
async def lifespan(app : FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()
    
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
