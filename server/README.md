# AgroTerror Server

AI Tool which can predict crop growth and yield by alternating genes using CRISPR technology.

## Prerequisites

- Python 3.11+
- Docker and Docker Compose (for Redis)
- MongoDB (configured via environment variables)
- Google Gemini API Key

## Setup

### 1. Install Dependencies

Using `uv` (recommended):

```bash
uv sync
```

Or using `pip`:

```bash
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=agroterror

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
CORS_ORIGINS=["*"]

# Gemini LLM Configuration
GEMINI_API_KEY=your-gemini-api-key

# Redis Configuration (optional - defaults shown)
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=86400
```

### 3. Start Redis with Docker

Start Redis using Docker Compose:

```bash
docker-compose up -d
```

This will:

- Start Redis on port 6379
- Create a persistent volume for Redis data
- Enable AOF (Append Only File) persistence
- Set up health checks

To stop Redis:

```bash
docker-compose down
```

To stop and remove data:

```bash
docker-compose down -v
```

### 4. Run the Server

Using `uv run` (recommended - uses correct Python environment):

```bash
uv run uvicorn main:app --reload
```

Or using Python directly:

```bash
uv run python main.py
```

**Note:** Make sure to use `uv run` to ensure the server uses the correct Python environment with all dependencies installed.

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## Features

- **LLM Query Caching**: Redis caching for expensive LLM API calls
  - Cache TTL: 24 hours (configurable via `REDIS_CACHE_TTL`)
  - Automatic cache key generation based on query parameters
  - Graceful fallback if Redis is unavailable

## Docker Services

### Redis

- **Image**: `redis:7-alpine`
- **Port**: `6379`
- **Volume**: `redis-data` (persistent storage)
- **Persistence**: AOF enabled

## Development

The application will continue to work even if Redis is unavailable - caching will simply be disabled. Check logs for cache connection status.
