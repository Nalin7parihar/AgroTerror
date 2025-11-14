# Testing Guide for Optimized Gene Edit Service

This guide explains how to test the optimized gene_edit_service with Redis caching and dataset management features.

## Prerequisites

### 1. Install Dependencies

```bash
cd microservices/gene_edit_service
pip install -r requirements.txt
```

### 2. Setup Redis (Optional but Recommended)

Redis is optional - the service will work without it, but caching won't be available.

#### Option A: Using Docker (Easiest)
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

#### Option B: Install Redis Locally

**Windows:**
- Download from: https://github.com/microsoftarchive/redis/releases
- Or use WSL: `sudo apt-get install redis-server`

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis
brew services start redis

# Or run manually
redis-server
```

#### Verify Redis is Running
```bash
redis-cli ping
# Should return: PONG
```

### 3. Configure Environment (Optional)

Create a `.env` file in `microservices/gene_edit_service/`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=
REDIS_ENABLED=true

# Default Dataset
DEFAULT_DATASET=maize

# Server Configuration
HOST=0.0.0.0
PORT=8001
LOG_LEVEL=INFO
```

## Running the Service

### Start the Service

```bash
cd microservices/gene_edit_service
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

You should see output like:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Dataset manager initialized with 6 datasets
INFO:     Connected to Redis at localhost:6379
INFO:     Loaded 4,549,808 SNPs from maize dataset
INFO:     Application startup complete.
```

## Testing Methods

### Method 1: Automated Test Script

Run the comprehensive test script:

```bash
python test_optimizations.py
```

This will test:
- Service health and Redis connection
- Dataset listing and categorization
- Dataset selection in requests
- SNP queries with different datasets
- Performance improvements with caching

### Method 2: Manual API Testing

#### 1. Check Health

```bash
curl http://localhost:8001/health | python -m json.tool
```

Expected response includes:
- `redis_connected`: true/false
- `current_dataset`: name of loaded dataset
- `available_datasets`: list of all datasets

#### 2. List Available Datasets

```bash
curl http://localhost:8001/api/v1/datasets | python -m json.tool
```

#### 3. List Categories

```bash
curl http://localhost:8001/api/v1/datasets/categories | python -m json.tool
```

#### 4. Check Redis Cache Stats

```bash
curl http://localhost:8001/api/v1/cache/stats | python -m json.tool
```

#### 5. Test Gene Edit with Specific Dataset

```bash
curl -X POST "http://localhost:8001/api/v1/gene-edit/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "dna_sequence": "ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG",
    "target_trait": "plant_height",
    "dataset_name": "rice",
    "max_suggestions": 5,
    "min_efficiency": 50.0
  }' | python -m json.tool
```

#### 6. Test Gene Edit with Category

```bash
curl -X POST "http://localhost:8001/api/v1/gene-edit/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "dna_sequence": "ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG",
    "target_trait": "yield",
    "dataset_category": "cereals",
    "max_suggestions": 5
  }' | python -m json.tool
```

#### 7. Query SNPs with Dataset Selection

```bash
curl "http://localhost:8001/api/v1/snps/1/10000?window=1000&dataset=maize" | python -m json.tool
```

### Method 3: Interactive API Documentation

Visit the Swagger UI for interactive testing:

```
http://localhost:8001/docs
```

This provides:
- Interactive API documentation
- Try-it-out functionality
- Request/response examples

## Verifying Optimizations

### 1. Verify Redis Caching

**First Request (Builds Cache):**
```bash
time curl -X POST "http://localhost:8001/api/v1/gene-edit/suggest" \
  -H "Content-Type: application/json" \
  -d '{"dna_sequence": "ATCGATCGATCGATCGATCGATCGATCG", "target_trait": "yield", "dataset_name": "maize"}' > /dev/null
```

**Second Request (Uses Cache):**
```bash
time curl -X POST "http://localhost:8001/api/v1/gene-edit/suggest" \
  -H "Content-Type: application/json" \
  -d '{"dna_sequence": "ATCGATCGATCGATCGATCGATCGATCG", "target_trait": "yield", "dataset_name": "maize"}' > /dev/null
```

The second request should be faster if caching is working.

**Check Cache Contents:**
```bash
redis-cli
> KEYS snp:*
> HGETALL snp:meta:maize
> EXIT
```

### 2. Verify Dataset Switching

1. Make a request with `dataset_name: "maize"`
2. Check logs - should see "Switched to dataset: maize"
3. Make a request with `dataset_name: "rice"`
4. Check logs - should see "Switched to dataset: rice"
5. Verify different SNP counts in responses

### 3. Verify Index Caching

**First Load (Builds Index):**
- Start service
- Check logs for "Building SNP index..."
- Check logs for "Cached SNP index for [dataset]"

**Restart Service (Uses Cached Index):**
- Restart service
- Check logs for "Loading SNP index from Redis cache"
- Should be much faster than first load

## Expected Behavior

### With Redis Enabled

1. **First Startup:**
   - Service loads dataset
   - Builds SNP index (may take 1-2 minutes for large datasets)
   - Caches index in Redis
   - Logs: "Cached SNP index for [dataset]"

2. **Subsequent Requests:**
   - Index loaded from Redis (fast)
   - Region queries cached
   - Logs: "Loading SNP index from Redis cache"

3. **Dataset Switching:**
   - New dataset loaded
   - Index checked in Redis first
   - If not cached, builds and caches it

### Without Redis

1. **Every Startup:**
   - Service loads dataset
   - Builds SNP index (takes time)
   - No caching available

2. **Requests:**
   - Uses in-memory index only
   - No cross-request caching

## Troubleshooting

### Redis Connection Issues

**Error: "Redis connection failed"**
- Check if Redis is running: `redis-cli ping`
- Verify host/port in config
- Check firewall settings

**Solution:**
```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Or disable Redis
export REDIS_ENABLED=false
```

### Dataset Not Found

**Error: "Dataset [name] not found"**
- Check available datasets: `GET /api/v1/datasets`
- Verify .bim files exist in `microservices/data/`
- Check dataset name spelling (case-sensitive)

### Slow Performance

**If still slow with Redis:**
- Check Redis is actually connected: `GET /health`
- Verify cache is being used: `GET /api/v1/cache/stats`
- Check Redis memory: `redis-cli INFO memory`

**If without Redis:**
- Consider enabling Redis for better performance
- First load will always be slow (index building)

### Memory Issues

**If running out of memory:**
- Reduce number of datasets loaded
- Use smaller window sizes in SNP queries
- Consider using Redis with persistence disabled for testing

## Performance Benchmarks

Expected performance improvements:

| Operation | Without Redis | With Redis (First) | With Redis (Cached) |
|-----------|--------------|-------------------|---------------------|
| Service Startup | 2-5 min | 2-5 min | 10-30 sec |
| Dataset Switch | 1-3 min | 1-3 min | 5-15 sec |
| SNP Query | 50-200ms | 50-200ms | 5-20ms |
| Region Query (repeated) | 50-200ms | 50-200ms | 5-20ms |

*Times vary based on dataset size and hardware*

## Next Steps

1. ✅ Verify all tests pass
2. ✅ Check Redis caching is working
3. ✅ Test dataset switching
4. ✅ Monitor performance improvements
5. ✅ Review logs for any warnings

For production deployment, consider:
- Redis persistence configuration
- Redis clustering for high availability
- Monitoring and alerting
- Load testing with multiple concurrent requests

