# Quick Start Guide

## Prerequisites

- Python 3.11+
- CUDA-capable GPU (optional, but recommended for model inference)
- ~10GB free disk space for models and data

## Installation

1. **Navigate to the service directory:**
   ```bash
   cd microservices/gene_edit_service
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

1. **Copy environment template (optional):**
   ```bash
   cp .env.example .env
   ```

2. **Edit configuration in `config.py` or set environment variables:**
   - `GRAPH_CRISPR_MODEL_PATH`: Path to your trained Graph-CRISPR model
   - `DNABERT_MODEL_PATH`: Path to your DNABERT model directory
   - `BIM_FILE_PATH`: Path to 8652_Hybrid.bim (default: ../8652_Hybrid.bim)

## Running the Service

### Option 1: Using the startup script
```bash
./run.sh
```

### Option 2: Direct Python execution
```bash
python main.py
```

### Option 3: Using uvicorn directly
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The service will start on `http://localhost:8001`

## Testing the Service

1. **Check health:**
   ```bash
   curl http://localhost:8001/health
   ```

2. **Run example script:**
   ```bash
   python example_usage.py
   ```

3. **Access API documentation:**
   - Swagger UI: http://localhost:8001/docs
   - ReDoc: http://localhost:8001/redoc

## Example API Call

```bash
curl -X POST "http://localhost:8001/api/v1/gene-edit/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "dna_sequence": "ATCGATCGATCGATCGATCGATCGATCG",
    "target_trait": "plant_height",
    "max_suggestions": 5,
    "min_efficiency": 50.0
  }'
```

## Notes

- The service will work with **mock predictions** if models are not loaded (for testing)
- BIM file loading may take a few minutes on first startup (4.5M+ SNPs)
- For production, consider using a process manager like `gunicorn` or `supervisor`

## Troubleshooting

**Issue: Models not loading**
- Check model paths in `config.py`
- Ensure models are compatible with the codebase versions
- Check logs for specific error messages

**Issue: BIM file not found**
- Verify the file exists at the configured path
- Check file permissions

**Issue: CUDA out of memory**
- Set `DEVICE=cpu` in config
- Reduce batch sizes in model inference

**Issue: Import errors**
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check that Graph-CRISPR and DNABERT directories are in the correct location

