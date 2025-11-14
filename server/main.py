from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app : FastAPI):
    yield
    
app = FastAPI(title="AgroTerror",
              lifespan=lifespan,
              description="AI Tool which can predict crop growth and yield by alternating genes using CRISPR technology",
              version="1.0.0",
              docs_url="/docs",
              redoc_url="/redoc"
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message" : "Hello Agriculture"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
