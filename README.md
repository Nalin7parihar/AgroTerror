# AgroTerror

AI-powered platform for predicting crop growth and yield by alternating genes using CRISPR technology.

## Overview

AgroTerror is a comprehensive system that combines multiple AI models and services to provide gene editing analysis for agricultural applications. The platform integrates DNABERT for mutation validation, Graph-CRISPR for guide RNA suggestions, and HapMap3 SNP data for comprehensive analysis.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│              http://localhost:3000                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Main Server (FastAPI)                          │
│              http://localhost:8000                          │
│  - Authentication                                           │
│  - LLM Queries (Gemini)                                     │
│  - Gene Analysis Integration                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Gene Edit Service (FastAPI)                         │
│         http://localhost:8001                               │
│  - Graph-CRISPR Integration                                 │
│  - DNABERT Validation                                       │
│  - SNP Analysis                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐          ┌─────────▼────────┐
│  Graph-CRISPR  │          │     DNABERT      │
│     Model      │          │      Model       │
└────────────────┘          └──────────────────┘
```

## Project Structure

```
AgroTerror/
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js App Router pages
│   │   ├── dashboard/    # User dashboard
│   │   ├── home/         # Home pages
│   │   ├── analysis/     # Gene analysis interface
│   │   └── login/        # Authentication pages
│   ├── components/       # React components
│   │   ├── animations/   # 3D DNA animations
│   │   ├── chatbot/      # Chatbot widget
│   │   └── ui/           # UI components
│   ├── lib/              # Utility libraries
│   └── public/           # Static assets
├── server/               # Main FastAPI server
│   ├── core/             # Core configuration and utilities
│   ├── routers/          # API route handlers
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── llm.py        # LLM query endpoints
│   │   └── gene_analysis.py  # Gene analysis endpoints
│   ├── services/         # Business logic services
│   ├── schemas/          # Pydantic models
│   └── model/            # Database models
├── microservices/
│   ├── DNABERT/          # DNABERT model and tools
│   ├── Graph-CRISPR/     # Graph-CRISPR model
│   └── gene_edit_service/ # Gene edit microservice
│       ├── services/     # Service implementations
│       │   ├── bim_parser.py        # BIM file parser
│       │   ├── graph_crispr_service.py  # Graph-CRISPR integration
│       │   ├── dnabert_service.py   # DNABERT integration
│       │   ├── redis_cache.py       # Redis caching
│       │   └── dataset_manager.py   # Dataset management
│       ├── models.py     # Pydantic models
│       └── main.py       # FastAPI application
└── docs/                 # Documentation
    ├── README.md         # Documentation index
    ├── server.md         # Server documentation
    ├── frontend.md       # Frontend documentation
    ├── gene-edit-service.md  # Gene edit service documentation
    ├── dnabert.md        # DNABERT documentation
    └── graph-crispr.md   # Graph-CRISPR documentation
```

## Features

### 1. User Authentication
- JWT-based authentication
- User registration and login
- Protected routes and API endpoints

### 2. Gene Analysis
- DNA sequence analysis
- CRISPR guide RNA suggestions
- Edit efficiency prediction
- Mutation validation using DNABERT
- SNP analysis with HapMap3 data
- Multi-dataset support (maize, rice, soybean, etc.)

### 3. LLM Integration
- Google Gemini integration
- Multi-language support (English, Hindi, Kannada)
- Difficulty levels (Basic, Intermediate, Advanced)
- Educational chatbot for CRISPR and gene editing

### 4. 3D Visualizations
- Interactive 3D DNA models
- Real-time editing visualization
- Three.js integration

### 5. Analysis History
- Store analysis results
- View past analyses
- Comprehensive reporting

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB
- Redis (optional)
- CUDA-capable GPU (optional, for model inference)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AgroTerror
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. Setup Server

```bash
cd server
# Create .env file with configuration
cp .env.example .env
# Edit .env with your settings

# Install dependencies
pip install -r requirements.txt
# Or using uv
uv sync

# Run server
uvicorn main:app --reload
```

The server will be available at `http://localhost:8000`

### 4. Setup Gene Edit Service

```bash
cd microservices/gene_edit_service
# Create .env file with configuration
# Edit .env with your settings

# Install dependencies
pip install -r requirements.txt
# Or using uv
uv sync

# Run service
python main.py
```

The service will be available at `http://localhost:8001`

### 5. Setup MongoDB

```bash
# Install MongoDB
# Start MongoDB service
mongod
```

### 6. Setup Redis (Optional)

```bash
# Install Redis
# Start Redis service
redis-server

# Or using Docker
docker-compose up -d
```

## Configuration

### Server Configuration

Create a `.env` file in the `server/` directory:

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

### Gene Edit Service Configuration

Create a `.env` file in the `microservices/gene_edit_service/` directory:

```env
# Graph-CRISPR Configuration
GRAPH_CRISPR_CONFIG_PATH=/path/to/config_BE.json
GRAPH_CRISPR_MODEL_PATH=/path/to/model.pt

# DNABERT Configuration
DNABERT_MODEL_PATH=/path/to/dnabert_model
DNABERT_KMER=6

# BIM File Configuration
BIM_FILE_PATH=/path/to/maize.bim
DEFAULT_DATASET=maize

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=
REDIS_ENABLED=true

# Server Configuration
HOST=0.0.0.0
PORT=8001
LOG_LEVEL=INFO

# Device Configuration
DEVICE=cuda
```

### Frontend Configuration

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Documentation Index](docs/README.md)** - Overview of all documentation
- **[Server Documentation](docs/server.md)** - Server setup and API endpoints
- **[Frontend Documentation](docs/frontend.md)** - Frontend setup and features
- **[Gene Edit Service Documentation](docs/gene-edit-service.md)** - Microservice documentation
- **[DNABERT Documentation](docs/dnabert.md)** - DNABERT model documentation
- **[Graph-CRISPR Documentation](docs/graph-crispr.md)** - Graph-CRISPR model documentation

## API Documentation

Once the servers are running, interactive API documentation is available at:

- **Main Server**: `http://localhost:8000/docs`
- **Gene Edit Service**: `http://localhost:8001/docs`

## Development

### Running in Development Mode

1. **Frontend**: `cd frontend && npm run dev`
2. **Server**: `cd server && uvicorn main:app --reload`
3. **Gene Edit Service**: `cd microservices/gene_edit_service && python main.py`

### Testing

```bash
# Test server
cd server
pytest

# Test gene edit service
cd microservices/gene_edit_service
pytest

# Test frontend
cd frontend
npm test
```

## Deployment

### Docker Deployment

See individual service documentation for Docker deployment instructions.

### Production Deployment

1. Build frontend for production
2. Deploy server with proper configuration
3. Deploy gene edit service with model files
4. Configure MongoDB and Redis
5. Set up environment variables
6. Configure CORS and security settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

See LICENSE file for license information.

## Support

For issues or questions:
1. Check the documentation in `docs/`
2. Review the troubleshooting sections
3. Check the API documentation
4. Review code comments and examples

## Acknowledgments

- DNABERT: Pre-trained model for DNA sequence analysis
- Graph-CRISPR: Graph neural network for CRISPR guide RNA prediction
- HapMap3: SNP data for genetic analysis
- Google Gemini: LLM for educational queries

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [DNABERT Repository](https://github.com/jerryji1993/DNABERT)
- [Graph-CRISPR Repository](https://github.com/your-repo/graph-crispr)
- [HapMap3 Data](https://www.internationalgenome.org/data)
