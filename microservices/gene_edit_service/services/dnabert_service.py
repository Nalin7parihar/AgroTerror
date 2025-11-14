"""
DNABERT service wrapper for validating gene edits
"""
import os
import sys
import logging
import numpy as np
import pandas as pd
import torch
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import tempfile

# Add DNABERT to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "DNABERT"))

logger = logging.getLogger(__name__)


class DNABERTService:
    """Service wrapper for DNABERT model validation"""
    
    def __init__(
        self,
        model_path: Optional[str] = None,
        kmer: int = 6,
        device: str = "cuda" if torch.cuda.is_available() else "cpu"
    ):
        """
        Initialize DNABERT service
        
        Args:
            model_path: Path to DNABERT model directory
            kmer: K-mer size (default: 6)
            device: Device to run model on ('cuda' or 'cpu')
        """
        self.device = device
        self.model_path = model_path
        self.kmer = kmer
        self.model = None
        self.tokenizer = None
        self.is_loaded = False
        
        # Default paths relative to DNABERT directory
        self.dnabert_dir = Path(__file__).parent.parent.parent / "DNABERT"
        
    def load_model(self, model_path: Optional[str] = None):
        """
        Load DNABERT model and tokenizer
        
        Args:
            model_path: Path to model directory
        """
        if model_path:
            self.model_path = model_path
        
        if not self.model_path or not Path(self.model_path).exists():
            logger.warning("DNABERT model path not found. Service will use mock validation.")
            self.is_loaded = False
            return
        
        try:
            # Import DNABERT modules
            from src.transformers import BertForSequenceClassification, BertTokenizer
            
            # Load tokenizer
            tokenizer_name = f"dna{self.kmer}"
            tokenizer_path = self.dnabert_dir / "src" / "transformers" / tokenizer_name
            
            if tokenizer_path.exists():
                self.tokenizer = BertTokenizer.from_pretrained(str(tokenizer_path))
            else:
                logger.warning(f"Tokenizer not found at {tokenizer_path}. Using mock validation.")
                self.is_loaded = False
                return
            
            # Load model
            self.model = BertForSequenceClassification.from_pretrained(self.model_path)
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            logger.info(f"Loaded DNABERT model from {self.model_path}")
            
        except Exception as e:
            logger.error(f"Error loading DNABERT model: {e}")
            logger.warning("Falling back to mock validation")
            self.is_loaded = False
    
    def seq2kmer(self, seq: str, k: int) -> str:
        """
        Convert DNA sequence to k-mer representation
        
        Args:
            seq: DNA sequence
            k: K-mer size
            
        Returns:
            K-mer string
        """
        kmer = [seq[x:x+k] for x in range(len(seq)+1-k)]
        kmers = " ".join(kmer)
        return kmers
    
    def kmer2seq(self, kmers: str) -> str:
        """
        Convert k-mer string back to DNA sequence
        
        Args:
            kmers: Space-separated k-mers
            
        Returns:
            DNA sequence
        """
        kmers_list = kmers.split()
        seq = kmers_list[0]
        for kmer in kmers_list[1:]:
            seq += kmer[-1]
        return seq
    
    def predict_sequence_score(self, sequence: str) -> float:
        """
        Predict score for a DNA sequence
        
        Args:
            sequence: DNA sequence
            
        Returns:
            Prediction score (0-1)
        """
        if not self.is_loaded:
            return self._mock_prediction(sequence)
        
        try:
            # Convert to k-mer
            kmer_seq = self.seq2kmer(sequence, self.kmer)
            
            # Tokenize
            encoded = self.tokenizer.encode_plus(
                kmer_seq,
                add_special_tokens=True,
                max_length=512,
                padding='max_length',
                truncation=True,
                return_attention_mask=True,
                return_tensors='pt'
            )
            
            # Move to device
            input_ids = encoded['input_ids'].to(self.device)
            attention_mask = encoded['attention_mask'].to(self.device)
            
            # Predict
            with torch.no_grad():
                outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
                logits = outputs.logits
                # Apply sigmoid for binary classification or softmax for multi-class
                if logits.shape[1] == 1:
                    score = torch.sigmoid(logits).item()
                else:
                    score = torch.softmax(logits, dim=1)[0][1].item()
            
            return float(score)
            
        except Exception as e:
            logger.error(f"Error in DNABERT prediction: {e}")
            return self._mock_prediction(sequence)
    
    def _mock_prediction(self, sequence: str) -> float:
        """Generate mock prediction when model is not available"""
        # Simple heuristic: score based on GC content and length
        gc_content = (sequence.count('G') + sequence.count('C')) / len(sequence) if sequence else 0.5
        length_factor = min(1.0, len(sequence) / 1000)
        
        # Mock score between 0.3 and 0.8
        score = 0.3 + (gc_content * 0.3) + (length_factor * 0.2) + np.random.normal(0, 0.05)
        return float(max(0.0, min(1.0, score)))
    
    def validate_mutation(
        self,
        original_sequence: str,
        mutated_sequence: str,
        mutation_position: int,
        threshold: float = 0.1
    ) -> Dict[str, float]:
        """
        Validate a mutation by comparing original and mutated sequences
        
        Args:
            original_sequence: Original DNA sequence
            mutated_sequence: Mutated DNA sequence
            mutation_position: Position of mutation
            threshold: Minimum difference threshold for validation
            
        Returns:
            Dictionary with validation results
        """
        # Get predictions
        original_score = self.predict_sequence_score(original_sequence)
        mutated_score = self.predict_sequence_score(mutated_sequence)
        
        # Calculate metrics
        difference = mutated_score - original_score
        abs_difference = abs(difference)
        
        # Log odds ratio (avoid division by zero)
        if original_score > 0 and original_score < 1 and mutated_score > 0 and mutated_score < 1:
            log_or = np.log2(original_score / (1 - original_score)) - np.log2(mutated_score / (1 - mutated_score))
        else:
            log_or = 0.0
        
        # Validation passed if difference exceeds threshold
        validation_passed = abs_difference >= threshold
        
        return {
            'original_score': original_score,
            'mutated_score': mutated_score,
            'difference': difference,
            'log_odds_ratio': log_or,
            'validation_passed': validation_passed,
            'mutation_position': mutation_position
        }
    
    def validate_edits(
        self,
        original_sequence: str,
        edit_suggestions: List[Dict],
        threshold: float = 0.1
    ) -> List[Dict]:
        """
        Validate multiple edit suggestions
        
        Args:
            original_sequence: Original DNA sequence
            edit_suggestions: List of edit suggestion dictionaries
            threshold: Minimum difference threshold
            
        Returns:
            List of validation results
        """
        validations = []
        
        for edit in edit_suggestions:
            # Create mutated sequence
            mutated_sequence = self._apply_edit(original_sequence, edit)
            
            # Validate
            validation = self.validate_mutation(
                original_sequence,
                mutated_sequence,
                edit.get('target_position', 0),
                threshold
            )
            
            validations.append(validation)
        
        return validations
    
    def _apply_edit(self, sequence: str, edit: Dict) -> str:
        """
        Apply an edit to a sequence
        
        Args:
            sequence: Original sequence
            edit: Edit dictionary with target_position, edit_type, original_base, target_base
            
        Returns:
            Mutated sequence
        """
        pos = edit.get('target_position', 0)
        edit_type = edit.get('edit_type', 'substitution')
        original_base = edit.get('original_base', '')
        target_base = edit.get('target_base', '')
        
        if pos < 0 or pos >= len(sequence):
            return sequence
        
        if edit_type == 'substitution':
            if sequence[pos] == original_base:
                return sequence[:pos] + target_base + sequence[pos+1:]
        elif edit_type == 'insertion':
            return sequence[:pos] + target_base + sequence[pos:]
        elif edit_type == 'deletion':
            return sequence[:pos] + sequence[pos+1:]
        
        return sequence
    
    def batch_validate(
        self,
        sequences: List[str],
        mutations: List[Dict]
    ) -> List[Dict]:
        """
        Batch validate multiple mutations
        
        Args:
            sequences: List of original sequences
            mutations: List of mutation dictionaries
            
        Returns:
            List of validation results
        """
        results = []
        
        for seq, mut in zip(sequences, mutations):
            mutated_seq = self._apply_edit(seq, mut)
            validation = self.validate_mutation(
                seq,
                mutated_seq,
                mut.get('target_position', 0)
            )
            results.append(validation)
        
        return results

