# Gene Edit Microservice

A FastAPI microservice that provides AI-powered gene edit suggestions using Graph-CRISPR and validates them with DNABERT, integrated with HapMap3 SNP data.

## Features

- **Graph-CRISPR Integration**: Generates CRISPR guide RNA suggestions with efficiency predictions
- **DNABERT Validation**: Validates edit suggestions using DNABERT model
- **SNP Analysis**: Identifies affected SNPs from HapMap3 data (8652_Hybrid.bim)
- **Comprehensive Reporting**: Returns detailed metrics, SNP changes, and risk assessments

## Architecture

```
┌─────────────────┐
│  FastAPI App    │
│   (main.py)     │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬─────────────┐
    │         │              │             │
┌───▼───┐ ┌──▼──────┐  ┌────▼─────┐  ┌───▼────┐
│ Graph │ │ DNABERT │  │   BIM    │  │ Models │
│CRISPR │ │ Service │  │  Parser  │  │ (Pydantic)│
└───────┘ └─────────┘  └──────────┘  └────────┘
```

## Setup

### 1. Install Dependencies

```bash
cd microservices/gene_edit_service
pip install -r requirements.txt
```

### 2. Configure Model Paths

Edit `main.py` to set the paths to your trained models:

```python
# Graph-CRISPR model path
model_path = "/path/to/graph_crispr_model.pt"

# DNABERT model path
model_path = "/path/to/dnabert_model"
```

### 3. Verify BIM File

Ensure the BIM file is at:
```
microservices/8652_Hybrid.bim
```

## Running the Service

### Development

```bash
cd microservices/gene_edit_service
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Production

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4
```

## API Endpoints

### Health Check

```bash
GET /health
```

Returns service health status and availability of components.

### Gene Edit Suggestions

```bash
POST /api/v1/gene-edit/suggest
```

**Request Body:**
```json
{
  "dna_sequence": "ATCGATCGATCGATCGATCG",
  "target_trait": "plant_height",
  "target_region": "1:1000-2000",
  "max_suggestions": 5,
  "min_efficiency": 50.0
}
```

**Response:**
```json
{
  "request_id": "uuid",
  "edit_suggestions": [...],
  "dnabert_validations": [...],
  "snp_changes": [...],
  "summary": {...},
  "metrics": {...}
}
```

### Get SNP Information

```bash
GET /api/v1/snps/{chromosome}/{position}?window=1000
```

Returns SNPs near a specific genomic position.

### Get SNP by ID

```bash
GET /api/v1/snps/by-id/{snp_id}
```

Returns SNP information by SNP ID.

## API Documentation

Once the service is running, visit:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Workflow

1. **Input**: DNA sequence + target trait
2. **Graph-CRISPR**: Generates guide RNA suggestions with efficiency scores
3. **DNABERT**: Validates each suggestion by comparing original vs mutated sequences
4. **BIM Parser**: Identifies affected SNPs from HapMap3 data
5. **Analysis**: Compiles SNP changes, causal candidates, and risk assessment
6. **Output**: Comprehensive report with metrics and recommendations

## Example Usage

```python
import requests

url = "http://localhost:8001/api/v1/gene-edit/suggest"

payload = {
    "dna_sequence": "ATCGATCGATCGATCGATCGATCGATCG",
    "target_trait": "plant_height",
    "max_suggestions": 5,
    "min_efficiency": 60.0
}

response = requests.post(url, json=payload)
result = response.json()

print(f"Found {len(result['edit_suggestions'])} suggestions")
print(f"Validated: {result['metrics']['validated_suggestions']}")
print(f"SNPs affected: {result['summary']['total_snps_affected']}")
```

## Notes

- The service uses mock predictions if models are not loaded (for development/testing)
- BIM file parsing is optimized for large files using chunked reading
- All services are initialized at startup for better performance
- The service is designed to be stateless and horizontally scalable

## Troubleshooting

1. **Model not loading**: Check model paths and ensure models are compatible
2. **BIM file not found**: Verify the file path in `main.py`
3. **Memory issues**: Reduce chunk size in BIM parser or use a smaller subset
4. **CUDA errors**: Set device to "cpu" in service initialization

## License

See parent project license.

