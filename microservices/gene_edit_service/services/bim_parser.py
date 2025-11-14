"""
BIM file parser for SNP data from HapMap3
BIM format: chromosome, SNP ID, genetic distance, position, ref allele, alt allele
"""
import pandas as pd
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class BIMParser:
    """Parser for BIM (PLINK binary format) files containing SNP data"""
    
    def __init__(self, bim_file_path: str):
        """
        Initialize BIM parser
        
        Args:
            bim_file_path: Path to the .bim file
        """
        self.bim_file_path = Path(bim_file_path)
        self.snp_data: Optional[pd.DataFrame] = None
        self.snp_index: Dict[Tuple[str, int], Dict] = {}
        
    def load_bim_file(self, chunk_size: int = 100000) -> pd.DataFrame:
        """
        Load BIM file into memory
        
        Args:
            chunk_size: Number of rows to read at a time (for large files)
            
        Returns:
            DataFrame with columns: chromosome, snp_id, genetic_distance, position, ref_allele, alt_allele
        """
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
            
            return self.snp_data
            
        except Exception as e:
            logger.error(f"Error loading BIM file: {e}")
            raise
    
    def _build_index(self):
        """Build index for fast SNP lookup by chromosome and position"""
        if self.snp_data is None:
            return
        
        logger.info("Building SNP index...")
        for _, row in self.snp_data.iterrows():
            key = (str(row['chromosome']), int(row['position']))
            self.snp_index[key] = {
                'snp_id': row['snp_id'],
                'ref_allele': row['ref_allele'],
                'alt_allele': row['alt_allele'],
                'genetic_distance': row['genetic_distance']
            }
        logger.info(f"Indexed {len(self.snp_index)} SNPs")
    
    def get_snp_at_position(self, chromosome: str, position: int) -> Optional[Dict]:
        """
        Get SNP information at a specific chromosome position
        
        Args:
            chromosome: Chromosome name/number
            position: Genomic position
            
        Returns:
            Dictionary with SNP information or None if not found
        """
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
        if self.snp_data is None:
            return []
        
        mask = (
            (self.snp_data['chromosome'] == str(chromosome)) &
            (self.snp_data['position'] >= start) &
            (self.snp_data['position'] <= end)
        )
        
        snps = self.snp_data[mask].to_dict('records')
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

