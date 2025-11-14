"""
Pydantic models for Gene Edit Microservice API requests and responses
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class TraitType(str, Enum):
    """Target trait types for gene editing"""
    PLANT_HEIGHT = "plant_height"
    LEAF_COLOR = "leaf_color"
    FLOWERING_TIME = "flowering_time"
    YIELD = "yield"
    DISEASE_RESISTANCE = "disease_resistance"
    DROUGHT_TOLERANCE = "drought_tolerance"
    CUSTOM = "custom"


class EditSuggestion(BaseModel):
    """A single gene edit suggestion from Graph-CRISPR"""
    guide_rna: str = Field(..., description="CRISPR guide RNA sequence")
    target_position: int = Field(..., description="Target position in the sequence")
    edit_type: str = Field(..., description="Type of edit (substitution, insertion, deletion)")
    efficiency_score: float = Field(..., description="Predicted editing efficiency (0-100)")
    confidence: float = Field(..., description="Model confidence score")
    original_base: Optional[str] = Field(None, description="Original nucleotide")
    target_base: Optional[str] = Field(None, description="Target nucleotide")


class SNPInfo(BaseModel):
    """SNP information from BIM file"""
    snp_id: str
    chromosome: str
    position: int
    ref_allele: str
    alt_allele: str
    importance_score: Optional[float] = None


class DNABERTValidation(BaseModel):
    """DNABERT validation results"""
    original_score: float = Field(..., description="Score for original sequence")
    mutated_score: float = Field(..., description="Score for mutated sequence")
    difference: float = Field(..., description="Difference in scores")
    log_odds_ratio: float = Field(..., description="Log odds ratio of the change")
    validation_passed: bool = Field(..., description="Whether validation passed threshold")
    mutation_position: int = Field(..., description="Position of mutation")


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


class GeneEditRequest(BaseModel):
    """Request for gene edit suggestions"""
    dna_sequence: str = Field(..., description="Input DNA sequence", min_length=20, max_length=10000)
    target_trait: TraitType = Field(..., description="Target trait to optimize")
    target_region: Optional[str] = Field(None, description="Specific region to target (chromosome:start-end)")
    max_suggestions: int = Field(5, ge=1, le=20, description="Maximum number of edit suggestions")
    min_efficiency: float = Field(50.0, ge=0, le=100, description="Minimum editing efficiency threshold")
    dataset_name: Optional[str] = Field(None, description="[Optional] Plant dataset to use (e.g., 'maize', 'rice', 'soyabean'). Auto-detected from request if not specified.")
    dataset_category: Optional[str] = Field(None, description="[Optional] Dataset category (e.g., 'cereals', 'legumes'). Auto-detected if not specified.")


class GeneEditResponse(BaseModel):
    """Response containing gene edit suggestions and validation"""
    request_id: str
    edit_suggestions: List[EditSuggestion]
    dnabert_validations: List[DNABERTValidation]
    snp_changes: List[SNPChange]
    summary: EditSummary
    metrics: Dict[str, Any] = Field(default_factory=dict)


class DatasetInfo(BaseModel):
    """Dataset information"""
    name: str
    display_name: str
    category: str
    plant_type: str
    description: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    graph_crispr_available: bool
    dnabert_available: bool
    bim_data_loaded: bool
    total_snps_in_database: int
    redis_connected: bool = False
    current_dataset: Optional[str] = None
    available_datasets: List[str] = Field(default_factory=list)

