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
│   ├── llm.py            # LLM query endpoints
│   └── gene_analysis.py  # Gene analysis endpoints
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

### 3. Gene Analysis Service

- **Gene Edit Analysis**: Analyzes DNA sequences and generates edit suggestions
- **Microservice Integration**: Integrates with gene edit microservice
- **DNABERT Validation**: Validates edits using DNABERT model
- **Graph-CRISPR Integration**: Generates guide RNA suggestions
- **SNP Analysis**: Identifies affected SNPs from HapMap3 data
- **Analysis History**: Stores analysis results in MongoDB
- **Rate Limiting**: Configurable rate limiting for analysis requests

**Endpoints:**
- `POST /gene-analysis/analyze` - Analyze gene edits (protected)
- `GET /gene-analysis/history` - Get analysis history (protected)
- `GET /gene-analysis/history/{analysis_id}` - Get analysis detail (protected)

**Features:**
- Forwards requests to gene edit microservice
- Stores results in MongoDB
- Returns comprehensive analysis results
- Supports multiple datasets (maize, rice, soybean, etc.)
- Configurable rate limiting

### 4. Database Integration

- **MongoDB**: Primary database for user data, query history, and analysis results
- **Collections:**
  - `users`: User accounts and credentials
  - `llm_queries`: Historical LLM queries with metadata
  - `gene_analyses`: Gene analysis results and history

### 5. Caching System

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

# Gene Edit Service Configuration
GENE_EDIT_SERVICE_URL=http://localhost:8001

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

### 7. Gene Analysis Router (`routers/gene_analysis.py`)

Gene analysis integration:
- **Microservice Integration**: Forwards requests to gene edit microservice
- **Result Storage**: Saves analysis results to MongoDB
- **History Management**: Provides analysis history endpoints
- **Rate Limiting**: Configurable rate limiting for analysis requests

**Key Features:**
- Async HTTP client for microservice communication
- Error handling and timeout management
- Analysis result storage in MongoDB
- User-specific analysis history
- Comprehensive error responses

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

### Gene Analysis Endpoints

#### Analyze Gene Edits
```http
POST /gene-analysis/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "dna_sequence": "ATCGATCGATCGATCGATCG",
  "target_trait": "plant_height",
  "target_region": "1:1000-2000",
  "max_suggestions": 5,
  "min_efficiency": 50.0,
  "dataset_name": "maize",
  "dataset_category": "cereals"
}
```

**Request Parameters:**
- `dna_sequence` (string, required): DNA sequence to analyze (20-10000 characters)
- `target_trait` (enum, required): Target trait (`plant_height`, `yield`, `disease_resistance`, etc.)
- `target_region` (string, optional): Target region (chromosome:start-end)
- `max_suggestions` (integer, optional): Maximum number of suggestions (default: 5)
- `min_efficiency` (float, optional): Minimum efficiency threshold (default: 50.0)
- `dataset_name` (string, optional): Dataset name (e.g., "maize", "rice")
- `dataset_category` (string, optional): Dataset category (e.g., "cereals", "legumes")

**Response:**
```json
{
  "analysis_id": "uuid",
  "request_id": "uuid",
  "dna_sequence": "ATCGATCGATCGATCGATCG",
  "edit_suggestions": [
    {
      "guide_rna": "ATCGATCGATCGATCG",
      "target_position": 100,
      "edit_type": "substitution",
      "efficiency_score": 75.5,
      "confidence": 0.85,
      "original_base": "A",
      "target_base": "G"
    }
  ],
  "dnabert_validations": [
    {
      "original_score": 0.75,
      "mutated_score": 0.82,
      "difference": 0.07,
      "log_odds_ratio": 0.42,
      "validation_passed": true,
      "mutation_position": 100
    }
  ],
  "snp_changes": [
    {
      "snp_id": "rs12345",
      "chromosome": "1",
      "position": 105,
      "original_allele": "A",
      "new_allele": "G",
      "effect_size": 0.15,
      "is_causal_candidate": true,
      "nearby_genes": ["Gene1", "Gene2"],
      "dnabert_score": 0.82
    }
  ],
  "summary": {
    "total_snps_affected": 10,
    "high_impact_snps": 2,
    "causal_candidate_snps": [...],
    "trait_prediction_change": 0.25,
    "risk_assessment": "low",
    "overall_confidence": 0.80
  },
  "metrics": {
    "processing_time": 2.5,
    "validated_suggestions": 3,
    "total_suggestions": 5
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get Analysis History
```http
GET /gene-analysis/history?limit=20&skip=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (integer, optional): Number of results to return (default: 20)
- `skip` (integer, optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "analyses": [
    {
      "analysis_id": "uuid",
      "dna_sequence": "ATCGATCGATCG...",
      "target_trait": "plant_height",
      "dataset_name": "maize",
      "created_at": "2024-01-01T00:00:00Z",
      "summary": {
        "total_snps_affected": 10,
        "high_impact_snps": 2,
        "overall_confidence": 0.80
      }
    }
  ],
  "total": 100
}
```

#### Get Analysis Detail
```http
GET /gene-analysis/history/{analysis_id}
Authorization: Bearer <token>
```

**Path Parameters:**
- `analysis_id` (string, required): Analysis ID

**Response:**
```json
{
  "analysis_id": "uuid",
  "request_id": "uuid",
  "dna_sequence": "ATCGATCGATCGATCGATCG",
  "edit_suggestions": [...],
  "dnabert_validations": [...],
  "snp_changes": [...],
  "summary": {...},
  "metrics": {...},
  "created_at": "2024-01-01T00:00:00Z"
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

## Integration with Gene Edit Service

The server integrates with the gene edit microservice for gene analysis:

1. **Frontend** sends analysis request to server
2. **Server** forwards request to gene edit microservice
3. **Gene Edit Service** processes request and returns results
4. **Server** saves results to MongoDB
5. **Server** returns results to frontend

### Configuration

Set the gene edit service URL in environment variables:
```env
GENE_EDIT_SERVICE_URL=http://localhost:8001
```

### Error Handling

The server handles microservice errors gracefully:
- **Timeout Errors**: 5-minute timeout for analysis requests
- **Service Unavailable**: Returns 503 if microservice is unavailable
- **Connection Errors**: Returns 503 with error details
- **Validation Errors**: Returns 400 with validation errors

## Rate Limiting

The server implements rate limiting for API endpoints:

- **LLM Queries**: Configurable rate limit per user
- **Gene Analysis**: Configurable rate limit per user
- **Analysis History**: Configurable rate limit per user

### Configuration

Rate limits are configured in `core/rate_limit.py`:
```python
RATE_LIMITS = {
    "llm_query": "10/minute",
    "gene_analysis": "5/minute",
    "gene_analysis_history": "20/minute",
    "gene_analysis_detail": "20/minute"
}
```

## Future Enhancements

Potential improvements:
- WebSocket support for real-time queries
- Enhanced monitoring and metrics
- Batch query processing
- Query analytics dashboard
- Advanced caching strategies
- Model versioning support
- A/B testing for models
- Enhanced error handling and retry logic

