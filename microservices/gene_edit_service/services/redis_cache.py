"""
Redis cache service for SNP index caching
"""
import json
import logging
import hashlib
from typing import Dict, List, Optional, Tuple, Any
import redis
from redis.exceptions import ConnectionError, TimeoutError

logger = logging.getLogger(__name__)


class RedisCache:
    """Redis cache service for SNP indices and queries"""
    
    def __init__(self, host: str = "localhost", port: int = 6379, db: int = 0, 
                 password: Optional[str] = None, decode_responses: bool = True,
                 socket_timeout: int = 5, socket_connect_timeout: int = 5):
        """
        Initialize Redis cache
        
        Args:
            host: Redis host
            port: Redis port
            db: Redis database number
            password: Redis password (if required)
            decode_responses: Whether to decode responses as strings
            socket_timeout: Socket timeout in seconds
            socket_connect_timeout: Connection timeout in seconds
        """
        self.host = host
        self.port = port
        self.db = db
        self.password = password
        self.decode_responses = decode_responses
        
        try:
            self.client = redis.Redis(
                host=host,
                port=port,
                db=db,
                password=password,
                decode_responses=decode_responses,
                socket_timeout=socket_timeout,
                socket_connect_timeout=socket_connect_timeout,
                health_check_interval=30
            )
            # Test connection
            self.client.ping()
            self.connected = True
            logger.info(f"Connected to Redis at {host}:{port}")
        except (ConnectionError, TimeoutError) as e:
            logger.warning(f"Redis connection failed: {e}. Cache will be disabled.")
            self.client = None
            self.connected = False
    
    def is_connected(self) -> bool:
        """Check if Redis is connected"""
        if not self.client:
            return False
        try:
            self.client.ping()
            return True
        except:
            return False
    
    def _get_index_key(self, dataset_name: str) -> str:
        """Get Redis key for SNP index"""
        return f"snp:index:{dataset_name}"
    
    def _get_snp_key(self, dataset_name: str, chromosome: str, position: int) -> str:
        """Get Redis key for a specific SNP"""
        return f"snp:data:{dataset_name}:{chromosome}:{position}"
    
    def _get_region_key(self, dataset_name: str, chromosome: str, start: int, end: int) -> str:
        """Get Redis key for a region query"""
        return f"snp:region:{dataset_name}:{chromosome}:{start}:{end}"
    
    def _get_metadata_key(self, dataset_name: str) -> str:
        """Get Redis key for dataset metadata"""
        return f"snp:meta:{dataset_name}"
    
    def cache_index_exists(self, dataset_name: str) -> bool:
        """Check if SNP index is cached"""
        if not self.is_connected():
            return False
        try:
            key = self._get_index_key(dataset_name)
            return self.client.exists(key) > 0
        except Exception as e:
            logger.error(f"Error checking index cache: {e}")
            return False
    
    def cache_index(self, dataset_name: str, index_data: Dict[Tuple[str, int], Dict], 
                   metadata: Optional[Dict] = None, ttl: int = 86400 * 7):
        """
        Cache SNP index in Redis
        
        Args:
            dataset_name: Name of the dataset
            index_data: Dictionary mapping (chromosome, position) -> SNP info
            metadata: Optional metadata about the dataset
            ttl: Time to live in seconds (default: 7 days)
        """
        if not self.is_connected():
            logger.warning("Redis not connected, skipping cache")
            return
        
        try:
            index_key = self._get_index_key(dataset_name)
            
            # Store index as hash for efficient lookup
            # Use pipeline for batch operations
            pipe = self.client.pipeline()
            
            # Store metadata
            if metadata:
                meta_key = self._get_metadata_key(dataset_name)
                pipe.hset(meta_key, mapping=metadata)
                pipe.expire(meta_key, ttl)
            
            # Store index entries
            # We'll store as JSON strings in a hash
            index_hash = {}
            for (chrom, pos), snp_info in index_data.items():
                snp_key = f"{chrom}:{pos}"
                index_hash[snp_key] = json.dumps(snp_info)
            
            # Store in batches to avoid memory issues
            batch_size = 10000
            items = list(index_hash.items())
            for i in range(0, len(items), batch_size):
                batch = dict(items[i:i + batch_size])
                pipe.hset(index_key, mapping=batch)
            
            pipe.expire(index_key, ttl)
            pipe.execute()
            
            logger.info(f"Cached SNP index for {dataset_name}: {len(index_data)} entries")
        except Exception as e:
            logger.error(f"Error caching index: {e}")
    
    def get_cached_snp(self, dataset_name: str, chromosome: str, position: int) -> Optional[Dict]:
        """Get a single SNP from cache"""
        if not self.is_connected():
            return None
        
        try:
            index_key = self._get_index_key(dataset_name)
            snp_key = f"{chromosome}:{position}"
            cached = self.client.hget(index_key, snp_key)
            
            if cached:
                return json.loads(cached)
            return None
        except Exception as e:
            logger.error(f"Error getting cached SNP: {e}")
            return None
    
    def get_cached_region(self, dataset_name: str, chromosome: str, start: int, end: int) -> Optional[List[Dict]]:
        """Get cached SNPs in a region"""
        if not self.is_connected():
            return None
        
        try:
            region_key = self._get_region_key(dataset_name, chromosome, start, end)
            cached = self.client.get(region_key)
            
            if cached:
                return json.loads(cached)
            return None
        except Exception as e:
            logger.error(f"Error getting cached region: {e}")
            return None
    
    def cache_region(self, dataset_name: str, chromosome: str, start: int, end: int, 
                    snps: List[Dict], ttl: int = 3600):
        """Cache SNPs in a region"""
        if not self.is_connected():
            return
        
        try:
            region_key = self._get_region_key(dataset_name, chromosome, start, end)
            self.client.setex(region_key, ttl, json.dumps(snps))
        except Exception as e:
            logger.error(f"Error caching region: {e}")
    
    def get_cached_metadata(self, dataset_name: str) -> Optional[Dict]:
        """Get cached dataset metadata"""
        if not self.is_connected():
            return None
        
        try:
            meta_key = self._get_metadata_key(dataset_name)
            return self.client.hgetall(meta_key)
        except Exception as e:
            logger.error(f"Error getting cached metadata: {e}")
            return None
    
    def invalidate_dataset(self, dataset_name: str):
        """Invalidate all cache entries for a dataset"""
        if not self.is_connected():
            return
        
        try:
            pattern = f"snp:*:{dataset_name}*"
            keys = self.client.keys(pattern)
            if keys:
                self.client.delete(*keys)
                logger.info(f"Invalidated cache for {dataset_name}: {len(keys)} keys")
        except Exception as e:
            logger.error(f"Error invalidating cache: {e}")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.is_connected():
            return {"connected": False}
        
        try:
            info = self.client.info("memory")
            return {
                "connected": True,
                "used_memory": info.get("used_memory_human", "N/A"),
                "used_memory_peak": info.get("used_memory_peak_human", "N/A"),
                "keyspace": self.client.dbsize()
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {"connected": False, "error": str(e)}

