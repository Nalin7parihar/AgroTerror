# Architecture Overview

## Service Structure

```
gene_edit_service/
├── main.py                 # FastAPI application and endpoints
├── models.py               # Pydantic models for requests/responses
├── config.py               # Configuration management
├── requirements.txt        # Python dependencies
├── README.md              # Main documentation
├── QUICKSTART.md          # Quick start guide
├── ARCHITECTURE.md        # This file
├── example_usage.py       # Example client code
├── run.sh                 # Startup script
└── services/
    ├── __init__.py
    ├── bim_parser.py      # BIM file parser for SNP data
    ├── graph_crispr_service.py  # Graph-CRISPR integration
    └── dnabert_service.py # DNABERT validation service
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Request                            │
│  POST /api/v1/gene-edit/suggest                             │
│  {                                                           │
│    "dna_sequence": "...",                                   │
│    "target_trait": "plant_height",                          │
│    "max_suggestions": 5                                     │
│  }                                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Endpoint Handler                        │
│              (main.py: suggest_gene_edits)                  │
└──────┬───────────────────────────────────────┬──────────────┘
       │                                       │
       ▼                                       ▼
┌──────────────────────┐          ┌──────────────────────────┐
│  Graph-CRISPR        │          │  DNABERT Service         │
│  Service             │          │                          │
│                      │          │  - Validate mutations    │
│  - Generate guide    │          │  - Calculate scores      │
│    RNA suggestions   │          │  - Compute metrics       │
│  - Predict efficiency│          │                          │
│  - Score edits       │          │                          │
└──────┬───────────────┘          └──────┬───────────────────┘
       │                                  │
       └──────────────┬───────────────────┘
                      │
                      ▼
       ┌──────────────────────────────┐
       │     BIM Parser Service       │
       │                              │
       │  - Load SNP data             │
       │  - Find affected SNPs        │
       │  - Identify causal candidates│
       └──────────────┬───────────────┘
                      │
                      ▼
       ┌──────────────────────────────┐
       │     Result Aggregation       │
       │                              │
       │  - Combine all results       │
       │  - Generate summary          │
       │  - Calculate metrics         │
       └──────────────┬───────────────┘
                      │
                      ▼
       ┌──────────────────────────────┐
       │      Response to Client      │
       │                              │
       │  - Edit suggestions          │
       │  - Validations               │
       │  - SNP changes               │
       │  - Summary & metrics         │
       └──────────────────────────────┘
```

## Components

### 1. FastAPI Application (`main.py`)

- **Endpoints:**
  - `GET /` - Root endpoint
  - `GET /health` - Health check
  - `POST /api/v1/gene-edit/suggest` - Main gene edit endpoint
  - `GET /api/v1/snps/{chromosome}/{position}` - Get SNPs by position
  - `GET /api/v1/snps/by-id/{snp_id}` - Get SNP by ID

- **Lifespan Management:**
  - Initializes all services at startup
  - Loads BIM file into memory
  - Loads ML models (if available)
  - Graceful shutdown handling

### 2. Graph-CRISPR Service

**Purpose:** Generate CRISPR guide RNA suggestions with efficiency predictions

**Key Methods:**
- `suggest_edits()` - Generate edit suggestions for a DNA sequence
- `predict_edit_efficiency()` - Predict editing efficiency for a guide RNA
- `load_model()` - Load trained Graph-CRISPR model

**Input:** DNA sequence, target region, parameters
**Output:** List of edit suggestions with efficiency scores

### 3. DNABERT Service

**Purpose:** Validate gene edits by comparing original vs mutated sequences

**Key Methods:**
- `validate_mutation()` - Validate a single mutation
- `validate_edits()` - Validate multiple edits
- `predict_sequence_score()` - Get prediction score for a sequence

**Input:** Original sequence, mutated sequence, mutation position
**Output:** Validation results with scores, differences, log odds ratios

### 4. BIM Parser Service

**Purpose:** Parse and query SNP data from HapMap3 BIM file

**Key Methods:**
- `load_bim_file()` - Load BIM file into memory
- `get_snp_at_position()` - Get SNP at specific position
- `find_snps_near_position()` - Find SNPs in a window
- `get_snps_in_region()` - Get SNPs in a genomic region

**Data Structure:**
- BIM format: chromosome, SNP ID, genetic distance, position, ref allele, alt allele
- Indexed by (chromosome, position) for fast lookup

### 5. Models (`models.py`)

**Request Models:**
- `GeneEditRequest` - Input request with DNA sequence and parameters

**Response Models:**
- `GeneEditResponse` - Complete response with all results
- `EditSuggestion` - Individual edit suggestion
- `DNABERTValidation` - Validation result
- `SNPChange` - SNP change information
- `EditSummary` - Summary of changes

## Integration Points

### Graph-CRISPR Integration

Located at: `../Graph-CRISPR/`

**Required Files:**
- Model checkpoint (`.pt` file)
- Config JSON file
- Dataset processing scripts (for graph conversion)

**Integration Method:**
- Direct Python import
- Model loading via PyTorch
- Graph data conversion (if needed)

### DNABERT Integration

Located at: `../DNABERT/`

**Required Files:**
- Model directory with weights
- Tokenizer files
- K-mer conversion utilities

**Integration Method:**
- Direct Python import from `src/transformers`
- Model loading via HuggingFace-style API
- K-mer sequence conversion

### BIM Data Integration

Located at: `../8652_Hybrid.bim`

**Format:** PLINK BIM format (tab-separated)
- Column 1: Chromosome
- Column 2: SNP ID
- Column 3: Genetic distance
- Column 4: Position
- Column 5: Reference allele
- Column 6: Alternate allele

**Integration Method:**
- Pandas DataFrame loading
- In-memory indexing for fast queries
- Chunked reading for large files

## Error Handling

- **Service Unavailable:** Returns 503 if required services not loaded
- **Invalid Input:** Returns 400 with validation errors
- **Internal Errors:** Returns 500 with error details (logged)
- **Graceful Degradation:** Uses mock predictions if models unavailable

## Performance Considerations

1. **BIM File Loading:**
   - Loaded once at startup
   - Indexed for O(1) lookups
   - Chunked reading for memory efficiency

2. **Model Inference:**
   - Models loaded at startup
   - Batch processing where possible
   - GPU acceleration (if available)

3. **Caching:**
   - SNP lookups are fast (in-memory index)
   - Consider caching frequent queries

4. **Scalability:**
   - Stateless design (except loaded models)
   - Can run multiple instances behind load balancer
   - Consider model serving separately for better scaling

## Security Considerations

- Input validation via Pydantic models
- CORS configured (adjust for production)
- No authentication (add if needed)
- File path validation
- Error message sanitization

## Future Enhancements

1. **Model Serving:**
   - Separate model serving service
   - Model versioning
   - A/B testing

2. **Caching:**
   - Redis for frequent queries
   - Result caching

3. **Async Processing:**
   - Background tasks for long-running operations
   - Job queue for batch processing

4. **Monitoring:**
   - Prometheus metrics
   - Health check endpoints
   - Performance monitoring

5. **Database:**
   - Store results in database
   - Query history
   - Analytics

