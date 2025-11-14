"""
BIM file parser for SNP data from HapMap3
BIM format: chromosome, SNP ID, genetic distance, position, ref allele, alt allele
"""
import pandas as pd
from typing import List, Dict, Optional, Tuple, Any
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class BIMParser:
    """Parser for BIM (PLINK binary format) files containing SNP data"""
    
    def __init__(self, bim_file_path: str, dataset_name: Optional[str] = None, 
                 redis_cache: Optional[Any] = None, use_cache: bool = True):
        """
        Initialize BIM parser
        
        Args:
            bim_file_path: Path to the .bim file
            dataset_name: Name of the dataset (for caching)
            redis_cache: Redis cache instance (optional)
            use_cache: Whether to use Redis cache
        """
        self.bim_file_path = Path(bim_file_path)
        self.dataset_name = dataset_name or self.bim_file_path.stem
        self.redis_cache = redis_cache
        self.use_cache = use_cache and redis_cache is not None
        self.snp_data: Optional[pd.DataFrame] = None
        self.snp_index: Dict[Tuple[str, int], Dict] = {}
        self._index_loaded = False
        
    def load_bim_file(self, chunk_size: int = 100000, force_reload: bool = False) -> pd.DataFrame:
        """
        Load BIM file into memory with optional Redis caching
        
        Args:
            chunk_size: Number of rows to read at a time (for large files)
            force_reload: Force reload even if cache exists
            
        Returns:
            DataFrame with columns: chromosome, snp_id, genetic_distance, position, ref_allele, alt_allele
        """
        # Check if index is already loaded
        if self._index_loaded and not force_reload:
            logger.info("SNP index already loaded")
            return self.snp_data
        
        # Try to load from cache first
        if self.use_cache and not force_reload:
            if self.redis_cache.cache_index_exists(self.dataset_name):
                logger.info(f"Loading SNP index from Redis cache for {self.dataset_name}")
                self._load_index_from_cache()
                if self._index_loaded:
                    # Still need to load the DataFrame for region queries
                    # But we can skip the expensive index building
                    self._load_dataframe_only(chunk_size)
                    return self.snp_data
        
        logger.info(f"Loading BIM file from {self.bim_file_path}")
        
        # BIM format: chromosome, SNP ID, genetic distance, position, ref allele, alt allele
        columns = ['chromosome', 'snp_id', 'genetic_distance', 'position', 'ref_allele', 'alt_allele']
        
        try:
            # Read in chunks for large files
            chunks = []
            for chunk in pd.read_csv(
                self.bim_file_path,
                sep='\t',
                header=None,
                names=columns,
                chunksize=chunk_size,
                low_memory=False
            ):
                chunks.append(chunk)
            
            self.snp_data = pd.concat(chunks, ignore_index=True)
            logger.info(f"Loaded {len(self.snp_data)} SNPs from BIM file")
            
            # Create index for fast lookup: (chromosome, position) -> SNP info
            self._build_index()
            
            # Cache the index if Redis is available
            if self.use_cache:
                self._cache_index()
            
            self._index_loaded = True
            return self.snp_data
            
        except Exception as e:
            logger.error(f"Error loading BIM file: {e}")
            raise
    
    def _load_dataframe_only(self, chunk_size: int = 100000):
        """Load only the DataFrame without building index (when using cache)"""
        if self.snp_data is not None:
            return
        
        columns = ['chromosome', 'snp_id', 'genetic_distance', 'position', 'ref_allele', 'alt_allele']
        chunks = []
        for chunk in pd.read_csv(
            self.bim_file_path,
            sep='\t',
            header=None,
            names=columns,
            chunksize=chunk_size,
            low_memory=False
        ):
            chunks.append(chunk)
        
        self.snp_data = pd.concat(chunks, ignore_index=True)
        logger.info(f"Loaded DataFrame with {len(self.snp_data)} SNPs (using cached index)")
    
    def _load_index_from_cache(self):
        """Load SNP index from Redis cache"""
        if not self.use_cache:
            return
        
        try:
            # Get metadata first
            metadata = self.redis_cache.get_cached_metadata(self.dataset_name)
            if metadata:
                logger.info(f"Found cached metadata for {self.dataset_name}")
                # Index will be loaded on-demand from cache
                self._index_loaded = True
        except Exception as e:
            logger.warning(f"Error loading index from cache: {e}")
    
    def _cache_index(self):
        """Cache the SNP index in Redis"""
        if not self.use_cache or not self.snp_index:
            return
        
        try:
            metadata = {
                "dataset_name": self.dataset_name,
                "total_snps": str(len(self.snp_index)),
                "file_path": str(self.bim_file_path),
                "file_size": str(self.bim_file_path.stat().st_size if self.bim_file_path.exists() else 0)
            }
            
            self.redis_cache.cache_index(
                dataset_name=self.dataset_name,
                index_data=self.snp_index,
                metadata=metadata,
                ttl=86400 * 7  # 7 days
            )
            logger.info(f"Cached SNP index for {self.dataset_name}")
        except Exception as e:
            logger.error(f"Error caching index: {e}")
    
    def _build_index(self):
        """Build index for fast SNP lookup by chromosome and position"""
        if self.snp_data is None:
            return
        
        logger.info(f"Building SNP index for {self.dataset_name}...")
        
        # Use vectorized operations for better performance
        self.snp_index = {}
        for _, row in self.snp_data.iterrows():
            key = (str(row['chromosome']), int(row['position']))
            self.snp_index[key] = {
                'snp_id': str(row['snp_id']),
                'ref_allele': str(row['ref_allele']),
                'alt_allele': str(row['alt_allele']),
                'genetic_distance': float(row['genetic_distance']) if pd.notna(row['genetic_distance']) else 0.0,
                'chromosome': str(row['chromosome']),
                'position': int(row['position'])
            }
        logger.info(f"Indexed {len(self.snp_index)} SNPs for {self.dataset_name}")
    
    def get_snp_at_position(self, chromosome: str, position: int) -> Optional[Dict]:
        """
        Get SNP information at a specific chromosome position
        
        Args:
            chromosome: Chromosome name/number
            position: Genomic position
            
        Returns:
            Dictionary with SNP information or None if not found
        """
        # Try cache first
        if self.use_cache:
            cached = self.redis_cache.get_cached_snp(self.dataset_name, str(chromosome), int(position))
            if cached is not None:
                return cached
        
        # Fall back to in-memory index
        key = (str(chromosome), int(position))
        return self.snp_index.get(key)
    
    def get_snps_in_region(self, chromosome: str, start: int, end: int) -> List[Dict]:
        """
        Get all SNPs in a genomic region
        
        Args:
            chromosome: Chromosome name/number
            start: Start position
            end: End position
            
        Returns:
            List of SNP dictionaries
        """
        # Try cache first
        if self.use_cache:
            cached = self.redis_cache.get_cached_region(self.dataset_name, str(chromosome), start, end)
            if cached is not None:
                return cached
        
        # Fall back to DataFrame query
        if self.snp_data is None:
            return []
        
        mask = (
            (self.snp_data['chromosome'] == str(chromosome)) &
            (self.snp_data['position'] >= start) &
            (self.snp_data['position'] <= end)
        )
        
        snps = self.snp_data[mask].to_dict('records')
        
        # Cache the result
        if self.use_cache and snps:
            self.redis_cache.cache_region(self.dataset_name, str(chromosome), start, end, snps)
        
        return snps
    
    def find_snps_near_position(self, chromosome: str, position: int, window: int = 1000) -> List[Dict]:
        """
        Find SNPs near a specific position
        
        Args:
            chromosome: Chromosome name/number
            position: Genomic position
            window: Window size in base pairs (default: 1000)
            
        Returns:
            List of SNP dictionaries within the window
        """
        return self.get_snps_in_region(chromosome, position - window, position + window)
    
    def get_snp_by_id(self, snp_id: str) -> Optional[Dict]:
        """
        Get SNP information by SNP ID
        
        Args:
            snp_id: SNP identifier
            
        Returns:
            Dictionary with SNP information or None if not found
        """
        if self.snp_data is None:
            return None
        
        mask = self.snp_data['snp_id'] == snp_id
        result = self.snp_data[mask]
        
        if len(result) > 0:
            return result.iloc[0].to_dict()
        return None
    
    def get_total_snp_count(self) -> int:
        """Get total number of SNPs in the database"""
        if self.snp_data is None:
            return 0
        return len(self.snp_data)
    
    def get_chromosome_snps(self, chromosome: str) -> List[Dict]:
        """
        Get all SNPs for a specific chromosome
        
        Args:
            chromosome: Chromosome name/number
            
        Returns:
            List of SNP dictionaries
        """
        if self.snp_data is None:
            return []
        
        mask = self.snp_data['chromosome'] == str(chromosome)
        return self.snp_data[mask].to_dict('records')

