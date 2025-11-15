# Gene Edit Service Documentation

## Overview

The Gene Edit Service is a FastAPI microservice that integrates DNABERT and Graph-CRISPR to provide AI-powered gene edit suggestions for agricultural applications. It analyzes DNA sequences, generates CRISPR guide RNA suggestions, validates edits using DNABERT, and identifies affected SNPs from HapMap3 data.

## Architecture

```
┌─────────────────────────────────────┐
│      FastAPI Application            │
│         (main.py)                   │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐          ┌─────▼─────┐
│ Graph  │          │  DNABERT  │
│CRISPR  │          │  Service  │
│Service │          │           │
└───┬────┘          └─────┬─────┘
    │                     │
    └──────────┬──────────┘
               │
       ┌───────▼────────┐
       │  BIM Parser    │
       │   Service      │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │  Dataset       │
       │  Manager       │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │  Redis Cache   │
       │   (Optional)   │
       └────────────────┘
```

## Project Structure

```
microservices/gene_edit_service/
├── main.py                 # FastAPI application and endpoints
├── models.py               # Pydantic models for requests/responses
├── config.py               # Configuration management
├── requirements.txt        # Python dependencies
├── pyproject.toml          # Project configuration
├── README.md               # Main documentation
├── QUICKSTART.md           # Quick start guide
├── ARCHITECTURE.md         # Architecture documentation
├── TESTING.md              # Testing guide
├── example_usage.py        # Example client code
├── demo_curl_commands.sh   # Example curl commands
├── demo_inputs.json        # Example input data
├── run.sh                  # Startup script
├── test_setup.sh           # Test setup script
├── test_setup.bat          # Test setup script (Windows)
└── services/
    ├── __init__.py
    ├── bim_parser.py              # BIM file parser for SNP data
    ├── graph_crispr_service.py    # Graph-CRISPR integration
    ├── dnabert_service.py         # DNABERT validation service
    ├── redis_cache.py             # Redis caching service
    └── dataset_manager.py         # Dataset management service
```

## Features

### 1. Graph-CRISPR Integration

- **Guide RNA Generation**: Generates CRISPR guide RNA suggestions for DNA sequences
- **Efficiency Prediction**: Predicts editing efficiency for each suggestion
- **Confidence Scoring**: Provides confidence scores for predictions
- **Model Loading**: Supports loading trained Graph-CRISPR models

### 2. DNABERT Validation

- **Mutation Validation**: Validates gene edits by comparing original vs mutated sequences
- **Score Calculation**: Calculates prediction scores for sequences
- **Log Odds Ratio**: Computes log odds ratios for mutation effects
- **Threshold Validation**: Validates edits against configurable thresholds

### 3. SNP Analysis

- **HapMap3 Integration**: Identifies affected SNPs from HapMap3 data
- **Position-based Lookup**: Fast SNP lookup by chromosome and position
- **Window-based Search**: Finds SNPs within a genomic window
- **Causal Candidate Identification**: Identifies potential causal SNPs

### 4. Dataset Management

- **Multi-dataset Support**: Supports multiple plant datasets (maize, rice, soybean, etc.)
- **Automatic Detection**: Auto-detects dataset from request parameters
- **Dataset Switching**: Dynamic dataset loading and switching
- **BIM File Management**: Manages BIM files for different datasets

### 5. Caching

- **Redis Integration**: Optional Redis caching for performance
- **Result Caching**: Caches analysis results
- **Graceful Degradation**: Works without Redis if unavailable

## Setup and Installation

### Prerequisites

- Python 3.11+
- FastAPI and dependencies
- DNABERT model (optional)
- Graph-CRISPR model (optional)
- Redis (optional, for caching)
- BIM file(s) for SNP data

### Installation

1. **Install dependencies:**
   ```bash
   cd microservices/gene_edit_service
   pip install -r requirements.txt
   ```

   Or using `uv`:
   ```bash
   uv sync
   ```

2. **Configure environment variables:**
   Create a `.env` file:
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

3. **Prepare data files:**
   - Place BIM file(s) in `microservices/data/` directory
   - Ensure Graph-CRISPR model files are accessible
   - Ensure DNABERT model files are accessible

4. **Run the service:**
   ```bash
   python main.py
   ```

   Or with uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

   Or using the startup script:
   ```bash
   ./run.sh
   ```

The service will be available at `http://localhost:8001`

## API Endpoints

### Health Check

```http
GET /health
```

Returns service health status and availability of components.

**Response:**
```json
{
  "status": "healthy",
  "graph_crispr_available": true,
  "dnabert_available": true,
  "bim_parser_available": true,
  "redis_available": true,
  "datasets": ["maize", "rice", "soybean"]
}
```

### Gene Edit Suggestions

```http
POST /api/v1/gene-edit/suggest
```

**Request Body:**
```json
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

**Response:**
```json
{
  "request_id": "uuid",
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
  }
}
```

### Get SNP Information

```http
GET /api/v1/snps/{chromosome}/{position}?window=1000
```

Returns SNPs near a specific genomic position.

**Parameters:**
- `chromosome`: Chromosome number (e.g., "1", "2")
- `position`: Genomic position
- `window`: Window size in base pairs (default: 1000)

**Response:**
```json
{
  "chromosome": "1",
  "position": 1000,
  "window": 1000,
  "snps": [
    {
      "snp_id": "rs12345",
      "chromosome": "1",
      "position": 105,
      "ref_allele": "A",
      "alt_allele": "G",
      "importance_score": 0.75
    }
  ]
}
```

### Get SNP by ID

```http
GET /api/v1/snps/by-id/{snp_id}
```

Returns SNP information by SNP ID.

**Response:**
```json
{
  "snp_id": "rs12345",
  "chromosome": "1",
  "position": 105,
  "ref_allele": "A",
  "alt_allele": "G",
  "importance_score": 0.75
}
```

### List Datasets

```http
GET /api/v1/datasets
```

Returns list of available datasets.

**Response:**
```json
{
  "datasets": [
    {
      "name": "maize",
      "display_name": "Maize",
      "category": "cereals",
      "plant_type": "corn",
      "bim_file_path": "/path/to/maize.bim",
      "snp_count": 8652
    }
  ]
}
```

### Switch Dataset

```http
POST /api/v1/datasets/switch
```

Switches the active dataset.

**Request Body:**
```json
{
  "dataset_name": "rice"
}
```

**Response:**
```json
{
  "status": "success",
  "current_dataset": "rice",
  "message": "Dataset switched successfully"
}
```

## API Documentation

Once the service is running, interactive API documentation is available at:
- **Swagger UI**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`

## Workflow

### Gene Edit Analysis Workflow

1. **Input**: DNA sequence + target trait
2. **Graph-CRISPR**: Generates guide RNA suggestions with efficiency scores
3. **DNABERT**: Validates each suggestion by comparing original vs mutated sequences
4. **BIM Parser**: Identifies affected SNPs from HapMap3 data
5. **Analysis**: Compiles SNP changes, causal candidates, and risk assessment
6. **Output**: Comprehensive report with metrics and recommendations

### Detailed Flow

```
1. Receive request with DNA sequence and target trait
   ↓
2. Load appropriate dataset (maize, rice, etc.)
   ↓
3. Graph-CRISPR Service:
   - Generate guide RNA suggestions
   - Predict editing efficiency
   - Score each suggestion
   ↓
4. DNABERT Service:
   - For each suggestion:
     - Get original sequence score
     - Apply mutation
     - Get mutated sequence score
     - Calculate difference and log odds ratio
     - Validate against threshold
   ↓
5. BIM Parser Service:
   - For each validated suggestion:
     - Find affected SNPs in target region
     - Identify causal candidates
     - Calculate effect sizes
     - Find nearby genes
   ↓
6. Aggregation:
   - Combine all results
   - Generate summary
   - Calculate metrics
   - Assess risk
   ↓
7. Return comprehensive response
```

## Configuration

### Environment Variables

#### Graph-CRISPR Configuration

- `GRAPH_CRISPR_CONFIG_PATH`: Path to Graph-CRISPR config JSON file
- `GRAPH_CRISPR_MODEL_PATH`: Path to Graph-CRISPR model checkpoint

#### DNABERT Configuration

- `DNABERT_MODEL_PATH`: Path to DNABERT model directory
- `DNABERT_KMER`: K-mer size for DNABERT (default: 6)

#### BIM File Configuration

- `BIM_FILE_PATH`: Path to BIM file (default: `microservices/data/maize.bim`)
- `DEFAULT_DATASET`: Default dataset name (default: "maize")

#### Redis Configuration

- `REDIS_HOST`: Redis host (default: "localhost")
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_DB`: Redis database number (default: 0)
- `REDIS_PASSWORD`: Redis password (optional)
- `REDIS_ENABLED`: Enable Redis caching (default: "true")

#### Server Configuration

- `HOST`: Server host (default: "0.0.0.0")
- `PORT`: Server port (default: 8001)
- `LOG_LEVEL`: Logging level (default: "INFO")

#### Device Configuration

- `DEVICE`: Device for model inference ("cuda" or "cpu", default: "cuda" if CUDA available)

## Services

### 1. Graph-CRISPR Service

**Location**: `services/graph_crispr_service.py`

**Key Methods:**
- `load_model()`: Load Graph-CRISPR model from checkpoint
- `suggest_edits()`: Generate edit suggestions for a DNA sequence
- `predict_edit_efficiency()`: Predict editing efficiency for a guide RNA

**Usage:**
```python
from services.graph_crispr_service import GraphCRISPRService

service = GraphCRISPRService(
    config_path="/path/to/config.json",
    model_path="/path/to/model.pt",
    device="cuda"
)

service.load_model()
suggestions = service.suggest_edits(
    dna_sequence="ATCGATCGATCG",
    target_region="1:1000-2000",
    max_suggestions=5
)
```

### 2. DNABERT Service

**Location**: `services/dnabert_service.py`

**Key Methods:**
- `load_model()`: Load DNABERT model from path
- `validate_mutation()`: Validate a single mutation
- `predict_sequence_score()`: Get prediction score for a sequence

**Usage:**
```python
from services.dnabert_service import DNABERTService

service = DNABERTService(
    model_path="/path/to/dnabert_model",
    kmer=6,
    device="cuda"
)

service.load_model()
result = service.validate_mutation(
    original_sequence="ATCGATCGATCG",
    mutated_sequence="ATCGATCGATCA",
    mutation_position=11,
    threshold=0.1
)
```

### 3. BIM Parser Service

**Location**: `services/bim_parser.py`

**Key Methods:**
- `load_bim_file()`: Load BIM file into memory
- `get_snp_at_position()`: Get SNP at specific position
- `find_snps_near_position()`: Find SNPs in a window
- `get_snps_in_region()`: Get SNPs in a genomic region

**Usage:**
```python
from services.bim_parser import BIMParser

parser = BIMParser(bim_file_path="/path/to/maize.bim")
parser.load_bim_file()

snps = parser.find_snps_near_position(
    chromosome="1",
    position=1000,
    window=1000
)
```

### 4. Dataset Manager Service

**Location**: `services/dataset_manager.py`

**Key Methods:**
- `list_all_datasets()`: List all available datasets
- `get_dataset_info()`: Get information about a dataset
- `load_dataset()`: Load a dataset
- `switch_dataset()`: Switch active dataset

**Usage:**
```python
from services.dataset_manager import DatasetManager

manager = DatasetManager(data_dir="/path/to/data")
datasets = manager.list_all_datasets()
info = manager.get_dataset_info("maize")
```

### 5. Redis Cache Service

**Location**: `services/redis_cache.py`

**Key Methods:**
- `get()`: Get value from cache
- `set()`: Set value in cache
- `delete()`: Delete value from cache
- `is_connected()`: Check Redis connection

**Usage:**
```python
from services.redis_cache import RedisCache

cache = RedisCache(
    host="localhost",
    port=6379,
    db=0
)

if cache.is_connected():
    cache.set("key", "value", ttl=3600)
    value = cache.get("key")
```

## Models

### Request Models

#### GeneEditRequest

```python
class GeneEditRequest(BaseModel):
    dna_sequence: str
    target_trait: TraitType
    target_region: Optional[str] = None
    max_suggestions: int = 5
    min_efficiency: float = 50.0
    dataset_name: Optional[str] = None
    dataset_category: Optional[str] = None
```

#### TraitType

```python
class TraitType(str, Enum):
    PLANT_HEIGHT = "plant_height"
    LEAF_COLOR = "leaf_color"
    FLOWERING_TIME = "flowering_time"
    YIELD = "yield"
    DISEASE_RESISTANCE = "disease_resistance"
    DROUGHT_TOLERANCE = "drought_tolerance"
    CUSTOM = "custom"
```

### Response Models

#### GeneEditResponse

```python
class GeneEditResponse(BaseModel):
    request_id: str
    edit_suggestions: List[EditSuggestion]
    dnabert_validations: List[DNABERTValidation]
    snp_changes: List[SNPChange]
    summary: EditSummary
    metrics: Dict[str, Any]
```

#### EditSuggestion

```python
class EditSuggestion(BaseModel):
    guide_rna: str
    target_position: int
    edit_type: str
    efficiency_score: float
    confidence: float
    original_base: Optional[str] = None
    target_base: Optional[str] = None
```

#### DNABERTValidation

```python
class DNABERTValidation(BaseModel):
    original_score: float
    mutated_score: float
    difference: float
    log_odds_ratio: float
    validation_passed: bool
    mutation_position: int
```

#### SNPChange

```python
class SNPChange(BaseModel):
    snp_id: str
    chromosome: str
    position: int
    original_allele: str
    new_allele: str
    effect_size: float
    is_causal_candidate: bool
    nearby_genes: List[str]
    dnabert_score: Optional[float] = None
```

#### EditSummary

```python
class EditSummary(BaseModel):
    total_snps_affected: int
    high_impact_snps: int
    causal_candidate_snps: List[SNPChange]
    trait_prediction_change: float
    risk_assessment: str
    overall_confidence: float
```

## Integration with AgroTerror

### Server Integration

The gene edit service is integrated with the main AgroTerror server:

1. **Frontend** → **Server** (`/gene-analysis/analyze`)
2. **Server** → **Gene Edit Service** (`/api/v1/gene-edit/suggest`)
3. **Gene Edit Service** → **Server** (response)
4. **Server** → **Frontend** (saved to MongoDB)

### Service URL

The service URL is configured in the server's environment variables:
```env
GENE_EDIT_SERVICE_URL=http://localhost:8001
```

## Example Usage

### Python Client

```python
import requests

url = "http://localhost:8001/api/v1/gene-edit/suggest"

payload = {
    "dna_sequence": "ATCGATCGATCGATCGATCGATCGATCG",
    "target_trait": "plant_height",
    "max_suggestions": 5,
    "min_efficiency": 60.0,
    "dataset_name": "maize"
}

response = requests.post(url, json=payload)
result = response.json()

print(f"Found {len(result['edit_suggestions'])} suggestions")
print(f"Validated: {result['metrics']['validated_suggestions']}")
print(f"SNPs affected: {result['summary']['total_snps_affected']}")
```

### cURL

```bash
curl -X POST "http://localhost:8001/api/v1/gene-edit/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "dna_sequence": "ATCGATCGATCGATCGATCGATCGATCG",
    "target_trait": "plant_height",
    "max_suggestions": 5,
    "min_efficiency": 60.0,
    "dataset_name": "maize"
  }'
```

## Error Handling

The service implements comprehensive error handling:

- **HTTP Exceptions**: Proper status codes and error messages
- **Validation Errors**: Pydantic validation with detailed error messages
- **Service Errors**: Graceful handling of service unavailability
- **Model Errors**: Fallback to mock predictions if models unavailable

## Performance Optimization

### Caching

- **Redis Caching**: Optional Redis caching for frequent queries
- **Result Caching**: Cache analysis results
- **SNP Lookup Caching**: Cache SNP lookups

### Model Loading

- **Lazy Loading**: Models loaded at startup
- **GPU Acceleration**: GPU support for faster inference
- **Batch Processing**: Batch processing where possible

### BIM File Optimization

- **Indexed Lookup**: O(1) SNP lookups using indexed data structures
- **Chunked Reading**: Memory-efficient file reading
- **In-Memory Caching**: BIM data loaded into memory

## Troubleshooting

### Common Issues

1. **Model Not Loading**:
   - Check model paths in configuration
   - Verify model files are accessible
   - Check device availability (CUDA)

2. **BIM File Not Found**:
   - Verify BIM file path in configuration
   - Check file permissions
   - Ensure file format is correct

3. **Redis Connection Issues**:
   - Check Redis is running
   - Verify Redis host and port
   - Check Redis password (if set)
   - Service works without Redis (caching disabled)

4. **Memory Issues**:
   - Reduce chunk size in BIM parser
   - Use smaller datasets
   - Increase available memory

5. **CUDA Errors**:
   - Set device to "cpu" in configuration
   - Check CUDA installation
   - Verify GPU availability

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run specific test
pytest tests/test_bim_parser.py

# Run with coverage
pytest --cov=services
```

### Test Setup

```bash
# Setup test environment
./test_setup.sh

# Or on Windows
test_setup.bat
```

## Deployment

### Docker Deployment

Create a Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  gene-edit-service:
    build: .
    ports:
      - "8001:8001"
    environment:
      - GRAPH_CRISPR_MODEL_PATH=/models/graph_crispr.pt
      - DNABERT_MODEL_PATH=/models/dnabert
      - BIM_FILE_PATH=/data/maize.bim
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    volumes:
      - ./models:/models
      - ./data:/data
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## Security Considerations

1. **Input Validation**: All inputs validated via Pydantic models
2. **CORS Configuration**: Configure CORS for production
3. **Authentication**: Add authentication if needed
4. **Rate Limiting**: Implement rate limiting for production
5. **Error Messages**: Sanitize error messages
6. **File Path Validation**: Validate file paths to prevent directory traversal

## Future Enhancements

Potential improvements:
- Model versioning and A/B testing
- Advanced caching strategies
- Async processing for long-running operations
- Job queue for batch processing
- Prometheus metrics and monitoring
- Database integration for result storage
- Enhanced error handling and retry logic
- Support for more datasets
- Real-time updates via WebSockets

## Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **DNABERT Documentation**: See [DNABERT Documentation](./dnabert.md)
- **Graph-CRISPR Documentation**: See [Graph-CRISPR Documentation](./graph-crispr.md)
- **Pydantic Documentation**: https://docs.pydantic.dev
- **Redis Documentation**: https://redis.io/docs

