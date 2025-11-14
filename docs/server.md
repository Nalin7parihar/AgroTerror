# Server Documentation

## Overview

The AgroTerror server is a FastAPI-based backend application that provides authentication, LLM query services, and integration with gene editing microservices. It serves as the main API gateway for the AgroTerror platform, which predicts crop growth and yield by alternating genes using CRISPR technology.

## Architecture

```
┌─────────────────────────────────────┐
│         FastAPI Application         │
│            (main.py)                │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐          ┌─────▼─────┐
│ Auth   │          │   LLM     │
│ Router │          │  Router   │
└───┬────┘          └─────┬─────┘
    │                     │
    │                     │
┌───▼──────────┐   ┌──────▼──────────┐
│  Security    │   │   Gemini        │
│  Service     │   │   Service       │
└──────────────┘   └──────┬──────────┘
                          │
                    ┌─────▼─────┐
                    │   Cache   │
                    │  Service  │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │   Redis   │
                    └───────────┘
```

## Project Structure

```
server/
├── main.py                 # FastAPI application entry point
├── core/                   # Core configuration and utilities
│   ├── config.py          # Application settings and environment variables
│   ├── database.py        # MongoDB connection management
│   ├── redis.py           # Redis connection management
│   ├── security.py        # JWT and password hashing utilities
│   └── dependencies.py    # FastAPI dependencies
├── routers/               # API route handlers
│   ├── auth.py           # Authentication endpoints
│   └── llm.py            # LLM query endpoints
├── services/              # Business logic services
│   ├── auth.py           # Authentication service
│   ├── gemini.py         # Google Gemini LLM integration
│   └── cache.py          # Redis caching service
├── schemas/               # Pydantic models for request/response
│   ├── auth.py           # Authentication schemas
│   └── llm.py            # LLM query schemas
├── model/                 # Database models
│   ├── user.py           # User model
│   └── llm_query.py      # LLM query model
├── docker-compose.yml     # Docker Compose for Redis
└── pyproject.toml         # Project dependencies
```

## Features

### 1. Authentication System

- **User Registration**: Create new user accounts with email and username
- **User Login**: JWT-based authentication
- **Password Security**: Bcrypt hashing with 72-byte limit handling
- **Token Management**: Configurable token expiration (default: 30 minutes)

**Endpoints:**
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive access token
- `GET /auth/me` - Get current user information (protected)

### 2. LLM Query Service

- **Google Gemini Integration**: Uses Gemini 2.5 Flash model
- **Multi-language Support**: English, Hindi, and Kannada
- **Difficulty Levels**: Basic, Intermediate, and Advanced
- **Code-mixing Support**: Allows mixing languages for better explanations
- **Response Caching**: Redis-based caching to reduce API costs
- **Query History**: Stores all queries in MongoDB

**Endpoints:**
- `POST /llm/query` - Submit a query to the LLM (protected)

**Features:**
- Automatic cache checking before API calls
- 24-hour cache TTL (configurable)
- Graceful fallback if Redis is unavailable
- Query logging to database

### 3. Database Integration

- **MongoDB**: Primary database for user data and query history
- **Collections:**
  - `users`: User accounts and credentials
  - `llm_queries`: Historical LLM queries with metadata

### 4. Caching System

- **Redis**: In-memory cache for LLM responses
- **Features:**
  - Automatic cache key generation based on query parameters
  - Configurable TTL (default: 86400 seconds / 24 hours)
  - Graceful degradation if Redis is unavailable
  - Docker Compose setup included

## Configuration

### Environment Variables

Create a `.env` file in the server root directory:

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

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=86400
```

## Setup and Installation

### Prerequisites

- Python 3.11+
- MongoDB (running locally or remote)
- Docker and Docker Compose (for Redis)
- Google Gemini API Key

### Installation

1. **Install dependencies using `uv` (recommended):**
   ```bash
   cd server
   uv sync
   ```

   Or using `pip`:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create a `.env` file with the required configuration (see above).

3. **Start Redis with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Start Redis on port 6379
   - Create a persistent volume for Redis data
   - Enable AOF (Append Only File) persistence
   - Set up health checks

4. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

   Or using Python directly:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, interactive API documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Core Components

### 1. Configuration (`core/config.py`)

Uses Pydantic Settings for type-safe configuration management:
- Environment variable loading
- Default values
- Field aliases for compatibility

### 2. Database (`core/database.py`)

MongoDB connection management using Motor (async MongoDB driver):
- Async connection handling
- Database instance getter
- Connection lifecycle management

### 3. Security (`core/security.py`)

Security utilities:
- **Password Hashing**: Bcrypt with 72-byte limit handling
- **JWT Tokens**: Access token creation and validation
- **Token Expiration**: Configurable expiration times

### 4. Redis (`core/redis.py`)

Redis connection management:
- Async Redis client
- Connection status checking
- Graceful error handling

### 5. Gemini Service (`services/gemini.py`)

LLM integration service:
- **System Prompts**: Dynamic prompt generation based on difficulty and language
- **Response Generation**: Async API calls to Gemini
- **Caching Integration**: Automatic cache checking and storage

**Prompt Customization:**
- Difficulty-based explanations (Basic/Intermediate/Advanced)
- Language-specific responses
- Code-mixing support for multilingual contexts
- Adaptive response length based on user requests

### 6. Cache Service (`services/cache.py`)

Redis caching layer:
- Cache key generation from request parameters
- TTL management
- Cache hit/miss handling

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### LLM Query Endpoints

#### Query LLM
```http
POST /llm/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "What is CRISPR?",
  "difficulty": "intermediate",
  "language": "english",
  "allow_code_mixing": false
}
```

**Request Parameters:**
- `question` (string, required): The question to ask
- `difficulty` (enum, optional): `basic`, `intermediate`, or `advanced` (default: `intermediate`)
- `language` (enum, optional): `english`, `hindi`, or `kannada` (default: `english`)
- `allow_code_mixing` (boolean, optional): Allow mixing languages (default: `false`)

**Response:**
```json
{
  "answer": "CRISPR (Clustered Regularly Interspaced Short Palindromic Repeats) is...",
  "question": "What is CRISPR?",
  "difficulty": "intermediate",
  "language": "english"
}
```

## Error Handling

The server implements comprehensive error handling:
- **HTTP Exceptions**: Proper status codes and error messages
- **Validation Errors**: Pydantic validation with detailed error messages
- **Database Errors**: Graceful handling of connection issues
- **Cache Errors**: Fallback behavior when Redis is unavailable

## Security Considerations

1. **Password Security:**
   - Bcrypt hashing with salt
   - 72-byte limit handling for long passwords
   - No plaintext password storage

2. **JWT Tokens:**
   - HS256 algorithm
   - Configurable expiration
   - Token validation on protected routes

3. **CORS:**
   - Configurable allowed origins
   - Credential support
   - Flexible header and method configuration

4. **API Keys:**
   - Environment variable storage
   - No hardcoded secrets

## Development

### Running in Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Testing

The application continues to work even if Redis is unavailable - caching will simply be disabled. Check logs for cache connection status.

### Logging

Logging is configured with:
- INFO level by default
- Timestamp and level formatting
- Module name identification

## Docker Services

### Redis

- **Image**: `redis:7-alpine`
- **Port**: `6379`
- **Volume**: `redis-data` (persistent storage)
- **Persistence**: AOF enabled

**Commands:**
```bash
# Start Redis
docker-compose up -d

# Stop Redis
docker-compose down

# Stop and remove data
docker-compose down -v
```

## Dependencies

Key dependencies:
- **FastAPI**: Web framework
- **Motor**: Async MongoDB driver
- **Pydantic**: Data validation and settings
- **JWT**: Token authentication
- **Passlib**: Password hashing
- **Google Generative AI**: Gemini LLM integration
- **Redis**: Caching (via aioredis)
- **Uvicorn**: ASGI server

## Future Enhancements

Potential improvements:
- Rate limiting
- API versioning
- WebSocket support for real-time queries
- Enhanced monitoring and metrics
- Integration with gene editing microservices
- Batch query processing
- Query analytics dashboard

