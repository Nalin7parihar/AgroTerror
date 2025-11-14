"""
Graph-CRISPR service wrapper for generating gene edit suggestions
"""
import os
import sys
import json
import logging
import torch
import numpy as np
from typing import List, Dict, Optional, Tuple
from pathlib import Path

# Add Graph-CRISPR to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "Graph-CRISPR"))

logger = logging.getLogger(__name__)


class GraphCRISPRService:
    """Service wrapper for Graph-CRISPR model predictions"""
    
    def __init__(
        self,
        config_path: Optional[str] = None,
        model_path: Optional[str] = None,
        device: str = "cuda" if torch.cuda.is_available() else "cpu"
    ):
        """
        Initialize Graph-CRISPR service
        
        Args:
            config_path: Path to Graph-CRISPR config JSON file
            model_path: Path to trained model checkpoint
            device: Device to run model on ('cuda' or 'cpu')
        """
        self.device = device
        self.config_path = config_path
        self.model_path = model_path
        self.model = None
        self.config = None
        self.is_loaded = False
        
        # Default paths relative to Graph-CRISPR directory
        self.graph_crispr_dir = Path(__file__).parent.parent.parent / "Graph-CRISPR"
        
    def load_config(self, config_path: Optional[str] = None) -> Dict:
        """Load configuration file"""
        if config_path:
            self.config_path = config_path
        elif not self.config_path:
            # Try to find a default config
            default_configs = [
                self.graph_crispr_dir / "config_BE.json",
                self.graph_crispr_dir / "config_117official.json",
                self.graph_crispr_dir / "config_WTset.json"
            ]
            for cfg in default_configs:
                if cfg.exists():
                    self.config_path = str(cfg)
                    break
        
        if not self.config_path or not Path(self.config_path).exists():
            logger.warning("No valid config file found. Using default parameters.")
            self.config = self._get_default_config()
            return self.config
        
        try:
            with open(self.config_path, 'r') as f:
                self.config = json.load(f)
            logger.info(f"Loaded config from {self.config_path}")
            return self.config
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            self.config = self._get_default_config()
            return self.config
    
    def _get_default_config(self) -> Dict:
        """Get default configuration"""
        return {
            "hidden_dim": 1792,
            "layers": 3,
            "dropout": 0.1,
            "heads": 1,
            "embed_dim": 640,
            "conv_layer": "GCNConv",
            "pool_layer": "TopKPooling",
            "global_pool_layer": "global_mean_pool",
            "activation": "LeakyReLU",
            "batch_size": 64,
            "Alpha": 0.001,
            "alpha": 0.001
        }
    
    def load_model(self, model_path: Optional[str] = None):
        """
        Load the trained Graph-CRISPR model
        
        Args:
            model_path: Path to model checkpoint
        """
        if model_path:
            self.model_path = model_path
        
        if not self.model_path or not Path(self.model_path).exists():
            logger.warning("Model path not found. Service will use mock predictions.")
            self.is_loaded = False
            return
        
        try:
            # Import model architecture
            from adjust_model import Net
            from adjust_common import get_activation_function, get_conv_layer, get_pool_layer, get_global_pool_layer
            
            # Load config first
            self.load_config()
            
            # Initialize model
            activation_name = self.config.get('activation', 'LeakyReLU')
            conv_layer_name = self.config.get('conv_layer', 'GCNConv')
            pool_layer_name = self.config.get('pool_layer', 'TopKPooling')
            global_pool_layer_name = self.config.get('global_pool_layer', 'global_mean_pool')
            
            conv_layer = get_conv_layer(conv_layer_name, self.config['embed_dim'], self.config['hidden_dim'])
            pool_layer = get_pool_layer(pool_layer_name, self.config['hidden_dim'])
            global_pool_layer = get_global_pool_layer(global_pool_layer_name)
            activation = get_activation_function(activation_name, alpha=self.config.get('alpha', 0.001))
            
            # Create model
            model = Net(
                node_input_dim=self.config['embed_dim'],
                hidden_dim=self.config['hidden_dim'],
                num_layers=self.config.get('layers', 3),
                dropout=self.config.get('dropout', 0.1),
                gat_heads=self.config.get('heads', 1),
                activation_name=activation_name,
                conv_layer=conv_layer_name,
                pool_layer=pool_layer_name,
                global_pool_layer=global_pool_layer_name,
                Alpha=self.config.get('Alpha', 0.001),
                alpha=self.config.get('alpha', 0.001)
            )
            
            # Load checkpoint
            checkpoint = torch.load(self.model_path, map_location=self.device)
            if 'best_model' in checkpoint:
                model.load_state_dict(checkpoint['best_model'].state_dict())
            else:
                model.load_state_dict(checkpoint)
            
            model.to(self.device)
            model.eval()
            self.model = model
            self.is_loaded = True
            logger.info(f"Loaded Graph-CRISPR model from {self.model_path}")
            
        except Exception as e:
            logger.error(f"Error loading Graph-CRISPR model: {e}")
            logger.warning("Falling back to mock predictions")
            self.is_loaded = False
    
    def predict_edit_efficiency(
        self,
        guide_rna: str,
        target_sequence: str,
        target_position: int
    ) -> Dict[str, float]:
        """
        Predict CRISPR editing efficiency for a guide RNA
        
        Args:
            guide_rna: Guide RNA sequence (20bp)
            target_sequence: Target DNA sequence
            target_position: Position in sequence to edit
            
        Returns:
            Dictionary with efficiency_score and confidence
        """
        if not self.is_loaded:
            # Return mock prediction if model not loaded
            return self._mock_prediction(guide_rna, target_sequence, target_position)
        
        try:
            # This is a simplified version - actual implementation would need
            # to convert guide RNA to graph format and run through model
            # For now, return a placeholder that can be extended
            
            # TODO: Implement full graph conversion and model inference
            # This requires:
            # 1. Convert guide RNA to graph representation
            # 2. Get RNA embeddings
            # 3. Get secondary structure
            # 4. Run through model
            
            logger.warning("Full model inference not yet implemented. Using mock prediction.")
            return self._mock_prediction(guide_rna, target_sequence, target_position)
            
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            return self._mock_prediction(guide_rna, target_sequence, target_position)
    
    def _mock_prediction(
        self,
        guide_rna: str,
        target_sequence: str,
        target_position: int
    ) -> Dict[str, float]:
        """Generate mock prediction when model is not available"""
        # Simple heuristic-based mock prediction
        gc_content = (guide_rna.count('G') + guide_rna.count('C')) / len(guide_rna) if guide_rna else 0.5
        
        # Efficiency based on GC content (optimal around 40-60%)
        if 0.4 <= gc_content <= 0.6:
            efficiency = 75.0 + np.random.normal(0, 5)
        else:
            efficiency = 50.0 + np.random.normal(0, 10)
        
        efficiency = max(0, min(100, efficiency))
        confidence = min(0.9, 0.5 + efficiency / 200)
        
        return {
            'efficiency_score': float(efficiency),
            'confidence': float(confidence)
        }
    
    def suggest_edits(
        self,
        dna_sequence: str,
        target_region: Optional[Tuple[int, int]] = None,
        max_suggestions: int = 5,
        min_efficiency: float = 50.0
    ) -> List[Dict]:
        """
        Suggest gene edits for a DNA sequence
        
        Args:
            dna_sequence: Input DNA sequence
            target_region: Optional (start, end) tuple for target region
            max_suggestions: Maximum number of suggestions
            min_efficiency: Minimum efficiency threshold
            
        Returns:
            List of edit suggestions
        """
        suggestions = []
        
        # Determine target region
        if target_region:
            start, end = target_region
        else:
            start = 0
            end = len(dna_sequence)
        
        # Generate guide RNAs (simplified - in practice, use proper guide RNA design)
        guide_length = 20
        step = 3  # Overlap guides
        
        for pos in range(start, end - guide_length, step):
            guide_rna = dna_sequence[pos:pos + guide_length]
            
            if len(guide_rna) < guide_length:
                continue
            
            # Predict efficiency
            prediction = self.predict_edit_efficiency(guide_rna, dna_sequence, pos)
            
            if prediction['efficiency_score'] >= min_efficiency:
                # Determine edit type and target
                original_base = dna_sequence[pos + guide_length // 2] if pos + guide_length // 2 < len(dna_sequence) else 'A'
                target_base = self._suggest_target_base(original_base)
                
                suggestions.append({
                    'guide_rna': guide_rna,
                    'target_position': pos + guide_length // 2,
                    'edit_type': 'substitution',
                    'efficiency_score': prediction['efficiency_score'],
                    'confidence': prediction['confidence'],
                    'original_base': original_base,
                    'target_base': target_base
                })
        
        # Sort by efficiency and return top suggestions
        suggestions.sort(key=lambda x: x['efficiency_score'], reverse=True)
        return suggestions[:max_suggestions]
    
    def _suggest_target_base(self, original_base: str) -> str:
        """Suggest target base for substitution (simplified)"""
        bases = ['A', 'T', 'G', 'C']
        bases.remove(original_base)
        # In practice, this would be based on trait optimization
        return bases[0]  # Simple: just pick a different base

