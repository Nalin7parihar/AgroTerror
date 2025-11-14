"""
FastAPI microservice for gene edit suggestions using Graph-CRISPR and DNABERT
"""
import os
import sys
import logging
import uuid
from pathlib import Path
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import (
    GeneEditRequest,
    GeneEditResponse,
    EditSuggestion,
    DNABERTValidation,
    SNPChange,
    EditSummary,
    HealthResponse,
    TraitType
)
from services.bim_parser import BIMParser
from services.graph_crispr_service import GraphCRISPRService
from services.dnabert_service import DNABERTService
import config

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global service instances
bim_parser: Optional[BIMParser] = None
graph_crispr_service: Optional[GraphCRISPRService] = None
dnabert_service: Optional[DNABERTService] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    logger.info("Starting Gene Edit Microservice...")
    
    global bim_parser, graph_crispr_service, dnabert_service
    
    # Initialize BIM parser
    try:
        bim_file_path = Path(config.BIM_FILE_PATH_ENV)
        if bim_file_path.exists():
            bim_parser = BIMParser(str(bim_file_path))
            bim_parser.load_bim_file()
            logger.info(f"Loaded {bim_parser.get_total_snp_count()} SNPs from BIM file")
        else:
            logger.warning(f"BIM file not found at {bim_file_path}")
    except Exception as e:
        logger.error(f"Error loading BIM file: {e}")
    
    # Initialize Graph-CRISPR service
    try:
        config_path = Path(config.GRAPH_CRISPR_CONFIG_PATH)
        model_path = config.GRAPH_CRISPR_MODEL_PATH
        
        graph_crispr_service = GraphCRISPRService(
            config_path=str(config_path) if config_path.exists() else None,
            model_path=model_path,
            device=config.DEVICE
        )
        graph_crispr_service.load_config()
        if model_path and Path(model_path).exists():
            graph_crispr_service.load_model()
        logger.info("Graph-CRISPR service initialized")
    except Exception as e:
        logger.error(f"Error initializing Graph-CRISPR: {e}")
    
    # Initialize DNABERT service
    try:
        model_path = config.DNABERT_MODEL_PATH
        
        dnabert_service = DNABERTService(
            model_path=model_path,
            kmer=config.DNABERT_KMER,
            device=config.DEVICE
        )
        if model_path and Path(model_path).exists():
            dnabert_service.load_model()
        logger.info("DNABERT service initialized")
    except Exception as e:
        logger.error(f"Error initializing DNABERT: {e}")
    
    logger.info("Gene Edit Microservice started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Gene Edit Microservice...")


# Create FastAPI app
app = FastAPI(
    title="Gene Edit Microservice",
    description="AI-powered gene edit suggestions using Graph-CRISPR and DNABERT validation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=dict)
async def root():
    """Root endpoint"""
    return {
        "service": "Gene Edit Microservice",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        graph_crispr_available=graph_crispr_service is not None and graph_crispr_service.is_loaded,
        dnabert_available=dnabert_service is not None and dnabert_service.is_loaded,
        bim_data_loaded=bim_parser is not None and bim_parser.snp_data is not None,
        total_snps_in_database=bim_parser.get_total_snp_count() if bim_parser else 0
    )


@app.post("/api/v1/gene-edit/suggest", response_model=GeneEditResponse)
async def suggest_gene_edits(request: GeneEditRequest):
    """
    Main endpoint for gene edit suggestions
    
    Flow:
    1. Graph-CRISPR generates edit suggestions
    2. DNABERT validates the suggestions
    3. BIM parser identifies affected SNPs
    4. Returns comprehensive results with metrics
    """
    try:
        request_id = str(uuid.uuid4())
        logger.info(f"Processing gene edit request {request_id}")
        
        # Step 1: Generate edit suggestions using Graph-CRISPR
        if not graph_crispr_service:
            raise HTTPException(status_code=503, detail="Graph-CRISPR service not available")
        
        # Parse target region if provided
        target_region = None
        if request.target_region:
            # Format: "chr1:1000-2000" or "1:1000-2000"
            try:
                parts = request.target_region.replace('chr', '').split(':')
                chrom = parts[0]
                start_end = parts[1].split('-')
                target_region = (int(start_end[0]), int(start_end[1]))
            except:
                logger.warning(f"Could not parse target region: {request.target_region}")
        
        # Get edit suggestions
        edit_suggestions_raw = graph_crispr_service.suggest_edits(
            dna_sequence=request.dna_sequence,
            target_region=target_region,
            max_suggestions=request.max_suggestions,
            min_efficiency=request.min_efficiency
        )
        
        # Convert to Pydantic models
        edit_suggestions = [
            EditSuggestion(**suggestion)
            for suggestion in edit_suggestions_raw
        ]
        
        # Step 2: Validate with DNABERT
        if not dnabert_service:
            raise HTTPException(status_code=503, detail="DNABERT service not available")
        
        validations_raw = dnabert_service.validate_edits(
            original_sequence=request.dna_sequence,
            edit_suggestions=edit_suggestions_raw,
            threshold=0.1
        )
        
        dnabert_validations = [
            DNABERTValidation(**validation)
            for validation in validations_raw
        ]
        
        # Step 3: Identify affected SNPs using BIM parser
        snp_changes = []
        if bim_parser:
            for edit, validation in zip(edit_suggestions_raw, validations_raw):
                # Find SNPs near the edit position
                # Note: This is simplified - in practice, you'd map sequence position to genomic coordinates
                chromosome = "1"  # Default - should be determined from sequence context
                position = edit.get('target_position', 0)
                
                nearby_snps = bim_parser.find_snps_near_position(
                    chromosome=chromosome,
                    position=position,
                    window=1000
                )
                
                for snp in nearby_snps[:5]:  # Limit to top 5 nearby SNPs
                    # Determine if this SNP is affected by the edit
                    is_affected = abs(snp['position'] - position) < 50
                    
                    if is_affected:
                        snp_change = SNPChange(
                            snp_id=snp['snp_id'],
                            chromosome=str(snp['chromosome']),
                            position=int(snp['position']),
                            original_allele=snp['ref_allele'],
                            new_allele=edit.get('target_base', snp['alt_allele']),
                            effect_size=abs(validation.get('difference', 0)),
                            is_causal_candidate=validation.get('validation_passed', False) and abs(validation.get('difference', 0)) > 0.2,
                            nearby_genes=[],  # Would be populated from gene annotation
                            dnabert_score=validation.get('mutated_score', 0)
                        )
                        snp_changes.append(snp_change)
        
        # Step 4: Generate summary
        high_impact_snps = [snp for snp in snp_changes if snp.effect_size > 0.3]
        causal_candidates = [snp for snp in snp_changes if snp.is_causal_candidate]
        
        # Calculate trait prediction change (simplified)
        avg_validation_diff = sum(v.difference for v in dnabert_validations) / len(dnabert_validations) if dnabert_validations else 0
        
        # Risk assessment
        if len(causal_candidates) > 3:
            risk = "High - Multiple causal candidates identified"
        elif len(high_impact_snps) > 5:
            risk = "Medium - Several high-impact SNPs affected"
        else:
            risk = "Low - Minimal impact expected"
        
        summary = EditSummary(
            total_snps_affected=len(snp_changes),
            high_impact_snps=len(high_impact_snps),
            causal_candidate_snps=causal_candidates,
            trait_prediction_change=avg_validation_diff,
            risk_assessment=risk,
            overall_confidence=sum(s.confidence for s in edit_suggestions) / len(edit_suggestions) if edit_suggestions else 0
        )
        
        # Step 5: Compile metrics
        metrics = {
            "total_suggestions": len(edit_suggestions),
            "validated_suggestions": sum(1 for v in dnabert_validations if v.validation_passed),
            "average_efficiency": sum(s.efficiency_score for s in edit_suggestions) / len(edit_suggestions) if edit_suggestions else 0,
            "average_confidence": summary.overall_confidence,
            "average_dnabert_score_change": avg_validation_diff,
            "target_trait": request.target_trait.value
        }
        
        # Create response
        response = GeneEditResponse(
            request_id=request_id,
            edit_suggestions=edit_suggestions,
            dnabert_validations=dnabert_validations,
            snp_changes=snp_changes,
            summary=summary,
            metrics=metrics
        )
        
        logger.info(f"Completed request {request_id}: {len(edit_suggestions)} suggestions, {len(snp_changes)} SNPs")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/v1/snps/{chromosome}/{position}")
async def get_snp_info(chromosome: str, position: int, window: int = 1000):
    """Get SNP information for a specific genomic position"""
    if not bim_parser:
        raise HTTPException(status_code=503, detail="BIM parser not available")
    
    try:
        snps = bim_parser.find_snps_near_position(chromosome, position, window)
        return {
            "chromosome": chromosome,
            "position": position,
            "window": window,
            "snps": snps
        }
    except Exception as e:
        logger.error(f"Error fetching SNP info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/snps/by-id/{snp_id}")
async def get_snp_by_id(snp_id: str):
    """Get SNP information by SNP ID"""
    if not bim_parser:
        raise HTTPException(status_code=503, detail="BIM parser not available")
    
    try:
        snp = bim_parser.get_snp_by_id(snp_id)
        if not snp:
            raise HTTPException(status_code=404, detail=f"SNP {snp_id} not found")
        return snp
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching SNP: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True,
        log_level=config.LOG_LEVEL.lower()
    )

