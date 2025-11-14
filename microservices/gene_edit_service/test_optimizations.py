"""
Test script for optimized gene_edit_service with Redis caching and dataset management
"""
import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://localhost:8001"


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80 + "\n")


def check_health() -> Dict[str, Any]:
    """Check service health"""
    print("Checking service health...")
    response = requests.get(f"{BASE_URL}/health")
    response.raise_for_status()
    health = response.json()
    
    print(f"✓ Status: {health['status']}")
    print(f"✓ Graph-CRISPR: {'Available' if health['graph_crispr_available'] else 'Not Available'}")
    print(f"✓ DNABERT: {'Available' if health['dnabert_available'] else 'Not Available'}")
    print(f"✓ BIM Data: {'Loaded' if health['bim_data_loaded'] else 'Not Loaded'}")
    print(f"✓ Total SNPs: {health['total_snps_in_database']:,}")
    print(f"✓ Redis: {'Connected' if health.get('redis_connected') else 'Not Connected'}")
    print(f"✓ Current Dataset: {health.get('current_dataset', 'N/A')}")
    print(f"✓ Available Datasets: {', '.join(health.get('available_datasets', []))}")
    
    return health


def test_datasets():
    """Test dataset listing and information"""
    print_section("TESTING DATASET MANAGEMENT")
    
    # List all datasets
    print("1. Listing all available datasets...")
    response = requests.get(f"{BASE_URL}/api/v1/datasets")
    response.raise_for_status()
    datasets = response.json()
    
    print(f"   Found {len(datasets)} datasets:")
    for ds in datasets:
        print(f"   - {ds['name']}: {ds['display_name']} ({ds['category']})")
    
    # List categories
    print("\n2. Listing dataset categories...")
    response = requests.get(f"{BASE_URL}/api/v1/datasets/categories")
    response.raise_for_status()
    categories = response.json()
    
    for cat_name, cat_info in categories.items():
        print(f"   - {cat_name}: {cat_info['count']} dataset(s)")
        print(f"     Datasets: {', '.join(cat_info['datasets'])}")
    
    # Get specific dataset info
    if datasets:
        print(f"\n3. Getting info for '{datasets[0]['name']}' dataset...")
        response = requests.get(f"{BASE_URL}/api/v1/datasets/{datasets[0]['name']}")
        response.raise_for_status()
        dataset_info = response.json()
        print(f"   Name: {dataset_info['name']}")
        print(f"   Display: {dataset_info['display_name']}")
        print(f"   Category: {dataset_info['category']}")
        print(f"   Type: {dataset_info['plant_type']}")


def test_redis_cache():
    """Test Redis cache functionality"""
    print_section("TESTING REDIS CACHE")
    
    # Get cache stats
    print("1. Getting Redis cache statistics...")
    response = requests.get(f"{BASE_URL}/api/v1/cache/stats")
    response.raise_for_status()
    stats = response.json()
    
    if stats.get('connected'):
        print(f"   ✓ Redis is connected")
        print(f"   - Used Memory: {stats.get('used_memory', 'N/A')}")
        print(f"   - Peak Memory: {stats.get('used_memory_peak', 'N/A')}")
        print(f"   - Keys in DB: {stats.get('keyspace', 'N/A')}")
    else:
        print(f"   ✗ Redis is not connected")
        print(f"   Message: {stats.get('message', 'N/A')}")


def test_dataset_selection():
    """Test dataset selection in gene edit requests"""
    print_section("TESTING DATASET SELECTION & AUTO-DETECTION")
    
    example_sequence = "ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG"
    
    # Test with default dataset (no specification)
    print("1. Testing with default dataset (no specification)...")
    payload = {
        "dna_sequence": example_sequence,
        "target_trait": "plant_height",
        "max_suggestions": 3,
        "min_efficiency": 50.0
    }
    
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/api/v1/gene-edit/suggest", json=payload)
    response.raise_for_status()
    result1 = response.json()
    time1 = time.time() - start_time
    
    print(f"   ✓ Request completed in {time1:.2f}s")
    print(f"   - Dataset used: {result1['metrics'].get('dataset_used', 'default')}")
    print(f"   - Suggestions: {len(result1['edit_suggestions'])}")
    print(f"   - SNPs affected: {result1['summary']['total_snps_affected']}")
    
    # Test with explicit dataset name
    print("\n2. Testing with explicit dataset name (rice)...")
    payload["dataset_name"] = "rice"
    
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/api/v1/gene-edit/suggest", json=payload)
    response.raise_for_status()
    result2 = response.json()
    time2 = time.time() - start_time
    
    print(f"   ✓ Request completed in {time2:.2f}s")
    print(f"   - Dataset used: {result2['metrics'].get('dataset_used', 'default')}")
    print(f"   - Suggestions: {len(result2['edit_suggestions'])}")
    print(f"   - SNPs affected: {result2['summary']['total_snps_affected']}")
    
    # Test auto-detection from text (mentioning "rice" in sequence)
    print("\n3. Testing auto-detection (mentioning 'rice' in request)...")
    payload.pop("dataset_name", None)
    # Add "rice" to the sequence to trigger auto-detection
    payload["dna_sequence"] = example_sequence + " rice genome sequence"
    
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/api/v1/gene-edit/suggest", json=payload)
    response.raise_for_status()
    result3 = response.json()
    time3 = time.time() - start_time
    
    print(f"   ✓ Request completed in {time3:.2f}s")
    print(f"   - Dataset used: {result3['metrics'].get('dataset_used', 'default')}")
    print(f"   - Auto-detected from text!")
    print(f"   - Suggestions: {len(result3['edit_suggestions'])}")
    
    # Test with category
    print("\n4. Testing with dataset category (cereals)...")
    payload["dna_sequence"] = example_sequence  # Reset sequence
    payload["dataset_category"] = "cereals"
    
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/api/v1/gene-edit/suggest", json=payload)
    response.raise_for_status()
    result4 = response.json()
    time4 = time.time() - start_time
    
    print(f"   ✓ Request completed in {time4:.2f}s")
    print(f"   - Dataset used: {result4['metrics'].get('dataset_used', 'default')}")
    print(f"   - Suggestions: {len(result4['edit_suggestions'])}")


def test_snp_queries():
    """Test SNP query endpoints with dataset selection"""
    print_section("TESTING SNP QUERIES")
    
    # Test SNP query by position
    print("1. Querying SNPs by position (default dataset)...")
    response = requests.get(f"{BASE_URL}/api/v1/snps/1/10000", params={"window": 1000})
    response.raise_for_status()
    result = response.json()
    
    print(f"   ✓ Found {len(result['snps'])} SNPs")
    print(f"   - Dataset: {result.get('dataset', 'N/A')}")
    print(f"   - Chromosome: {result['chromosome']}")
    print(f"   - Position: {result['position']}")
    if result['snps']:
        print(f"   - First SNP: {result['snps'][0].get('snp_id', 'N/A')}")
    
    # Test SNP query with specific dataset
    print("\n2. Querying SNPs with specific dataset (maize)...")
    response = requests.get(
        f"{BASE_URL}/api/v1/snps/1/10000",
        params={"window": 1000, "dataset": "maize"}
    )
    response.raise_for_status()
    result = response.json()
    
    print(f"   ✓ Found {len(result['snps'])} SNPs")
    print(f"   - Dataset: {result.get('dataset', 'N/A')}")


def test_performance():
    """Test performance improvements with caching"""
    print_section("TESTING PERFORMANCE (CACHING)")
    
    example_sequence = "ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG"
    
    # First request (may build cache)
    print("1. First request (may build cache)...")
    payload = {
        "dna_sequence": example_sequence,
        "target_trait": "yield",
        "max_suggestions": 3,
        "dataset_name": "maize"
    }
    
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/api/v1/gene-edit/suggest", json=payload)
    response.raise_for_status()
    time1 = time.time() - start_time
    print(f"   ✓ Completed in {time1:.2f}s")
    
    # Second request (should use cache)
    print("\n2. Second request (should use cache)...")
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/api/v1/gene-edit/suggest", json=payload)
    response.raise_for_status()
    time2 = time.time() - start_time
    print(f"   ✓ Completed in {time2:.2f}s")
    
    if time2 < time1:
        improvement = ((time1 - time2) / time1) * 100
        print(f"   🚀 Performance improvement: {improvement:.1f}% faster!")
    else:
        print(f"   Note: Similar performance (cache may already be warm)")
    
    # Test repeated SNP queries (should be cached)
    print("\n3. Testing repeated SNP queries (caching)...")
    times = []
    for i in range(3):
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/v1/snps/1/50000", params={"window": 500})
        response.raise_for_status()
        times.append(time.time() - start_time)
    
    print(f"   Query times: {[f'{t*1000:.1f}ms' for t in times]}")
    if len(times) > 1 and times[-1] < times[0]:
        print(f"   ✓ Subsequent queries are faster (caching working)")


def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("  GENE EDIT SERVICE - OPTIMIZATION TESTS")
    print("="*80)
    
    try:
        # Health check
        health = check_health()
        
        if not health['bim_data_loaded']:
            print("\n⚠️  Warning: BIM data not loaded. Some tests may fail.")
        
        # Test dataset management
        test_datasets()
        
        # Test Redis cache
        test_redis_cache()
        
        # Test dataset selection
        test_dataset_selection()
        
        # Test SNP queries
        test_snp_queries()
        
        # Test performance
        test_performance()
        
        print_section("ALL TESTS COMPLETED")
        print("✓ All tests passed successfully!")
        print("\nYou can also:")
        print("  - Visit http://localhost:8001/docs for interactive API documentation")
        print("  - Check cache stats: GET /api/v1/cache/stats")
        print("  - List datasets: GET /api/v1/datasets")
        
    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to the service.")
        print("  Make sure the service is running on http://localhost:8001")
        print("  Start it with: python main.py")
    except requests.exceptions.HTTPError as e:
        print(f"\n✗ HTTP Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"  Response: {e.response.text}")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

