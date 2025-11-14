"""
Dataset manager for categorizing and selecting plant datasets
"""
import logging
from pathlib import Path
from typing import Dict, List, Optional, Set
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class DatasetInfo:
    """Information about a plant dataset"""
    name: str
    file_path: Path
    category: str
    plant_type: str
    display_name: str
    description: Optional[str] = None


class DatasetManager:
    """Manages plant datasets and their categorization"""
    
    # Plant categories mapping
    PLANT_CATEGORIES = {
        "cereals": ["maize", "rice", "millet"],
        "legumes": ["chikpea", "soyabean"],
        "fiber_crops": ["cotton"],
        "all": ["maize", "rice", "millet", "chikpea", "soyabean", "cotton"]
    }
    
    # Display names for plants
    PLANT_DISPLAY_NAMES = {
        "maize": "Maize (Corn)",
        "rice": "Rice",
        "millet": "Millet",
        "chikpea": "Chickpea",
        "soyabean": "Soybean",
        "cotton": "Cotton"
    }
    
    # Plant type classifications
    PLANT_TYPES = {
        "maize": "cereal",
        "rice": "cereal",
        "millet": "cereal",
        "chikpea": "legume",
        "soyabean": "legume",
        "cotton": "fiber_crop"
    }
    
    def __init__(self, data_dir: Path):
        """
        Initialize dataset manager
        
        Args:
            data_dir: Directory containing .bim files
        """
        self.data_dir = Path(data_dir)
        self.datasets: Dict[str, DatasetInfo] = {}
        self._discover_datasets()
    
    def _discover_datasets(self):
        """Discover all available datasets in the data directory"""
        if not self.data_dir.exists():
            logger.warning(f"Data directory not found: {self.data_dir}")
            return
        
        # Find all .bim files
        bim_files = list(self.data_dir.glob("*.bim"))
        
        for bim_file in bim_files:
            # Extract plant name from filename (e.g., "maize.bim" -> "maize")
            plant_name = bim_file.stem.lower()
            
            # Get category
            category = self._get_category(plant_name)
            plant_type = self.PLANT_TYPES.get(plant_name, "unknown")
            display_name = self.PLANT_DISPLAY_NAMES.get(plant_name, plant_name.title())
            
            dataset_info = DatasetInfo(
                name=plant_name,
                file_path=bim_file,
                category=category,
                plant_type=plant_type,
                display_name=display_name,
                description=f"{display_name} SNP dataset"
            )
            
            self.datasets[plant_name] = dataset_info
            logger.info(f"Discovered dataset: {plant_name} ({display_name}) - {category}")
    
    def _get_category(self, plant_name: str) -> str:
        """Get category for a plant name"""
        for category, plants in self.PLANT_CATEGORIES.items():
            if plant_name in plants:
                return category
        return "other"
    
    def get_dataset(self, name: str) -> Optional[DatasetInfo]:
        """
        Get dataset by name
        
        Args:
            name: Dataset name (e.g., "maize", "rice")
            
        Returns:
            DatasetInfo or None if not found
        """
        return self.datasets.get(name.lower())
    
    def get_datasets_by_category(self, category: str) -> List[DatasetInfo]:
        """
        Get all datasets in a category
        
        Args:
            category: Category name (e.g., "cereals", "legumes", "fiber_crops")
            
        Returns:
            List of DatasetInfo objects
        """
        if category == "all":
            return list(self.datasets.values())
        
        plants = self.PLANT_CATEGORIES.get(category, [])
        return [self.datasets[p] for p in plants if p in self.datasets]
    
    def get_datasets_by_plant_type(self, plant_type: str) -> List[DatasetInfo]:
        """
        Get all datasets by plant type
        
        Args:
            plant_type: Plant type (e.g., "cereal", "legume", "fiber_crop")
            
        Returns:
            List of DatasetInfo objects
        """
        return [ds for ds in self.datasets.values() if ds.plant_type == plant_type]
    
    def list_all_datasets(self) -> List[DatasetInfo]:
        """Get all available datasets"""
        return list(self.datasets.values())
    
    def list_categories(self) -> List[str]:
        """Get all available categories"""
        return list(self.PLANT_CATEGORIES.keys())
    
    def search_datasets(self, query: str) -> List[DatasetInfo]:
        """
        Search datasets by name or category
        
        Args:
            query: Search query (case-insensitive)
            
        Returns:
            List of matching DatasetInfo objects
        """
        query_lower = query.lower()
        results = []
        
        for dataset in self.datasets.values():
            if (query_lower in dataset.name.lower() or 
                query_lower in dataset.display_name.lower() or
                query_lower in dataset.category.lower() or
                query_lower in dataset.plant_type.lower()):
                results.append(dataset)
        
        return results
    
    def get_dataset_names(self) -> List[str]:
        """Get list of all dataset names"""
        return list(self.datasets.keys())
    
    def is_dataset_available(self, name: str) -> bool:
        """Check if a dataset is available"""
        return name.lower() in self.datasets
    
    def detect_plant_from_text(self, text: str) -> Optional[str]:
        """
        Detect plant name from text (case-insensitive)
        
        Args:
            text: Text to search for plant names
            
        Returns:
            Dataset name if found, None otherwise
        """
        text_lower = text.lower()
        
        # Check for exact matches first
        for dataset_name, display_name in self.PLANT_DISPLAY_NAMES.items():
            if dataset_name in text_lower or display_name.lower() in text_lower:
                return dataset_name
        
        # Check for common variations
        plant_variations = {
            "corn": "maize",
            "chickpea": "chikpea",
            "chick pea": "chikpea",
            "soybean": "soyabean",
            "soy bean": "soyabean"
        }
        
        for variation, dataset_name in plant_variations.items():
            if variation in text_lower:
                return dataset_name
        
        return None

