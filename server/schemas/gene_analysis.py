from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime


class TraitType(str, Enum):
    """Target trait types for gene editing"""
    PLANT_HEIGHT = "plant_height"
    LEAF_COLOR = "leaf_color"
    FLOWERING_TIME = "flowering_time"
    YIELD = "yield"
    DISEASE_RESISTANCE = "disease_resistance"
    DROUGHT_TOLERANCE = "drought_tolerance"
    CUSTOM = "custom"


class GeneAnalysisRequest(BaseModel):
    """Request model for gene analysis"""
    dna_sequence: str = Field(..., description="Input DNA sequence", min_length=20, max_length=10000)
    target_trait: TraitType = Field(..., description="Target trait to optimize")
    target_region: Optional[str] = Field(None, description="Specific region to target (chromosome:start-end)")
    max_suggestions: int = Field(5, ge=1, le=20, description="Maximum number of edit suggestions")
    min_efficiency: float = Field(50.0, ge=0, le=100, description="Minimum editing efficiency threshold")
    dataset_name: Optional[str] = Field(None, description="Optional: Plant dataset to use")
    dataset_category: Optional[str] = Field(None, description="Optional: Dataset category")


class EditSuggestion(BaseModel):
    """A single gene edit suggestion"""
    guide_rna: str
    target_position: int
    edit_type: str
    efficiency_score: float
    confidence: float
    original_base: Optional[str] = None
    target_base: Optional[str] = None


class DNABERTValidation(BaseModel):
    """DNABERT validation results"""
    original_score: float
    mutated_score: float
    difference: float
    log_odds_ratio: float
    validation_passed: bool
    mutation_position: int


class SNPChange(BaseModel):
    """SNP change information"""
    snp_id: str
    chromosome: str
    position: int
    original_allele: str
    new_allele: str
    effect_size: float
    is_causal_candidate: bool
    nearby_genes: List[str] = []
    dnabert_score: Optional[float] = None


class EditSummary(BaseModel):
    """Summary of gene edit changes"""
    total_snps_affected: int
    high_impact_snps: int
    causal_candidate_snps: List[SNPChange]
    trait_prediction_change: float
    risk_assessment: str
    overall_confidence: float


class GeneAnalysisResponse(BaseModel):
    """Response model for gene analysis"""
    analysis_id: str
    request_id: str
    edit_suggestions: List[EditSuggestion]
    dnabert_validations: List[DNABERTValidation]
    snp_changes: List[SNPChange]
    summary: EditSummary
    metrics: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class AnalysisHistoryItem(BaseModel):
    """Single analysis history item"""
    analysis_id: str
    dna_sequence: str
    target_trait: str
    dataset_name: Optional[str] = None
    created_at: datetime
    summary: EditSummary


class AnalysisHistoryResponse(BaseModel):
    """Response model for analysis history"""
    analyses: List[AnalysisHistoryItem]
    total: int

