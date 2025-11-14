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
    TraitType,
    DatasetInfo
)
from services.bim_parser import BIMParser
from services.graph_crispr_service import GraphCRISPRService
from services.dnabert_service import DNABERTService
from services.redis_cache import RedisCache
from services.dataset_manager import DatasetManager
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
redis_cache: Optional[RedisCache] = None
dataset_manager: Optional[DatasetManager] = None
current_dataset_name: Optional[str] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    logger.info("Starting Gene Edit Microservice...")
    
    global bim_parser, graph_crispr_service, dnabert_service, redis_cache, dataset_manager, current_dataset_name
    
    # Initialize Redis cache
    if config.REDIS_ENABLED:
        try:
            redis_cache = RedisCache(
                host=config.REDIS_HOST,
                port=config.REDIS_PORT,
                db=config.REDIS_DB,
                password=config.REDIS_PASSWORD
            )
            if redis_cache.is_connected():
                logger.info("Redis cache connected successfully")
            else:
                logger.warning("Redis cache not available, continuing without cache")
                redis_cache = None
        except Exception as e:
            logger.warning(f"Redis initialization failed: {e}. Continuing without cache.")
            redis_cache = None
    else:
        logger.info("Redis cache disabled")
    
    # Initialize Dataset Manager
    try:
        dataset_manager = DatasetManager(config.DATA_DIR)
        logger.info(f"Dataset manager initialized with {len(dataset_manager.list_all_datasets())} datasets")
    except Exception as e:
        logger.error(f"Error initializing dataset manager: {e}")
        dataset_manager = None
    
    # Pre-cache all datasets into Redis
    if dataset_manager and redis_cache and redis_cache.is_connected():
        logger.info("Pre-caching all dataset indices into Redis...")
        cached_count = 0
        for dataset_info in dataset_manager.list_all_datasets():
            try:
                # Check if already cached
                if redis_cache.cache_index_exists(dataset_info.name):
                    logger.info(f"  ✓ {dataset_info.display_name} ({dataset_info.name}) - already cached")
                    cached_count += 1
                    continue
                
                # Load and cache the dataset
                logger.info(f"  Caching {dataset_info.display_name} ({dataset_info.name})...")
                parser = BIMParser(
                    str(dataset_info.file_path),
                    dataset_name=dataset_info.name,
                    redis_cache=redis_cache,
                    use_cache=True
                )
                parser.load_bim_file()  # This will build and cache the index
                logger.info(f"  ✓ Cached {dataset_info.display_name}: {parser.get_total_snp_count():,} SNPs")
                cached_count += 1
            except Exception as e:
                logger.warning(f"  ✗ Failed to cache {dataset_info.name}: {e}")
        
        logger.info(f"Pre-caching complete: {cached_count}/{len(dataset_manager.list_all_datasets())} datasets cached")
    elif dataset_manager and (not redis_cache or not redis_cache.is_connected()):
        logger.warning("Redis not available - skipping pre-caching. Datasets will be cached on first use.")
    
    # Initialize default BIM parser
    try:
        default_dataset = config.DEFAULT_DATASET
        dataset_info = None
        
        if dataset_manager:
            dataset_info = dataset_manager.get_dataset(default_dataset)
        
        if dataset_info and dataset_info.file_path.exists():
            bim_file_path = dataset_info.file_path
            current_dataset_name = dataset_info.name
        else:
            # Fallback to config path
            bim_file_path = Path(config.BIM_FILE_PATH_ENV)
            current_dataset_name = default_dataset
        
        if bim_file_path.exists():
            bim_parser = BIMParser(
                str(bim_file_path),
                dataset_name=current_dataset_name,
                redis_cache=redis_cache,
                use_cache=config.REDIS_ENABLED and redis_cache is not None
            )
            bim_parser.load_bim_file()
            logger.info(f"Loaded {bim_parser.get_total_snp_count()} SNPs from {current_dataset_name} dataset")
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
    available_datasets = []
    if dataset_manager:
        available_datasets = dataset_manager.get_dataset_names()
    
    return HealthResponse(
        status="healthy",
        graph_crispr_available=graph_crispr_service is not None and graph_crispr_service.is_loaded,
        dnabert_available=dnabert_service is not None and dnabert_service.is_loaded,
        bim_data_loaded=bim_parser is not None and bim_parser.snp_data is not None,
        total_snps_in_database=bim_parser.get_total_snp_count() if bim_parser else 0,
        redis_connected=redis_cache.is_connected() if redis_cache else False,
        current_dataset=current_dataset_name,
        available_datasets=available_datasets
    )


def _detect_dataset_from_request(request_text: str, dataset_name: Optional[str] = None, 
                                 category: Optional[str] = None) -> Optional[str]:
    """
    Automatically detect dataset from request text or parameters
    
    Args:
        request_text: Text from request (dna_sequence, target_trait, etc.)
        dataset_name: Explicit dataset name if provided
        category: Category if provided
        
    Returns:
        Detected dataset name or None
    """
    global dataset_manager
    
    # Priority 1: Explicit dataset name
    if dataset_name and dataset_manager:
        if dataset_manager.is_dataset_available(dataset_name):
            return dataset_name.lower()
    
    # Priority 2: Category
    if category and dataset_manager:
        datasets = dataset_manager.get_datasets_by_category(category)
        if datasets:
            return datasets[0].name
    
    # Priority 3: Auto-detect from text
    if request_text and dataset_manager:
        detected = dataset_manager.detect_plant_from_text(request_text)
        if detected:
            return detected
    
    return None


def _get_or_load_dataset(dataset_name: Optional[str] = None, category: Optional[str] = None,
                         auto_detect_text: Optional[str] = None) -> Optional[BIMParser]:
    """
    Get or load a dataset parser with automatic detection
    
    Args:
        dataset_name: Specific dataset name to load
        category: Category to select dataset from
        auto_detect_text: Text to auto-detect plant name from
        
    Returns:
        BIMParser instance or None
    """
    global bim_parser, current_dataset_name, dataset_manager, redis_cache
    
    # Auto-detect dataset if not explicitly provided
    detected_name = _detect_dataset_from_request(
        auto_detect_text or "",
        dataset_name,
        category
    )
    
    target_dataset_name = detected_name or dataset_name
    dataset_info = None
    
    # Determine which dataset to use
    if target_dataset_name and dataset_manager:
        dataset_info = dataset_manager.get_dataset(target_dataset_name)
        if dataset_info:
            target_dataset_name = dataset_info.name
        else:
            target_dataset_name = None
    
    # If no specific dataset requested or already using the right one, return current
    if not target_dataset_name or target_dataset_name == current_dataset_name:
        return bim_parser
    
    # Load the requested dataset (should be fast since it's pre-cached)
    if dataset_info and dataset_info.file_path.exists():
        try:
            new_parser = BIMParser(
                str(dataset_info.file_path),
                dataset_name=target_dataset_name,
                redis_cache=redis_cache,
                use_cache=config.REDIS_ENABLED and redis_cache is not None
            )
            new_parser.load_bim_file()  # Will load from cache if pre-cached
            # Update global parser and dataset name
            bim_parser = new_parser
            current_dataset_name = target_dataset_name
            logger.info(f"Switched to dataset: {target_dataset_name} ({dataset_info.display_name})")
            return new_parser
        except Exception as e:
            logger.error(f"Error loading dataset {target_dataset_name}: {e}")
            return bim_parser  # Return current parser on error
    
    return bim_parser


@app.post("/api/v1/gene-edit/suggest", response_model=GeneEditResponse)
async def suggest_gene_edits(request: GeneEditRequest):
    """
    Main endpoint for gene edit suggestions
    
    Flow:
    1. Graph-CRISPR generates edit suggestions
    2. DNABERT validates the suggestions
    3. BIM parser identifies affected SNPs (using selected dataset)
    4. Returns comprehensive results with metrics
    """
    try:
        request_id = str(uuid.uuid4())
        logger.info(f"Processing gene edit request {request_id}")
        
        # Auto-detect dataset from request (combine all text fields for detection)
        detection_text = f"{request.dna_sequence} {request.target_trait.value}"
        if request.target_region:
            detection_text += f" {request.target_region}"
        
        # Get or load the appropriate dataset (with auto-detection)
        parser = _get_or_load_dataset(
            dataset_name=request.dataset_name,
            category=request.dataset_category,
            auto_detect_text=detection_text
        )
        if not parser:
            raise HTTPException(status_code=503, detail="BIM parser not available")
        
        # Log which dataset is being used
        used_dataset = current_dataset_name or "default"
        logger.info(f"Using dataset: {used_dataset} for request {request_id}")
        
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
        if parser:
            for edit, validation in zip(edit_suggestions_raw, validations_raw):
                # Find SNPs near the edit position
                # Note: This is simplified - in practice, you'd map sequence position to genomic coordinates
                chromosome = "1"  # Default - should be determined from sequence context
                position = edit.get('target_position', 0)
                
                nearby_snps = parser.find_snps_near_position(
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
            "target_trait": request.target_trait.value,
            "dataset_used": current_dataset_name or "default"
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


@app.get("/api/v1/datasets", response_model=List[DatasetInfo])
async def list_datasets():
    """List all available datasets"""
    if not dataset_manager:
        raise HTTPException(status_code=503, detail="Dataset manager not available")
    
    datasets = dataset_manager.list_all_datasets()
    return [
        DatasetInfo(
            name=ds.name,
            display_name=ds.display_name,
            category=ds.category,
            plant_type=ds.plant_type,
            description=ds.description
        )
        for ds in datasets
    ]


@app.get("/api/v1/datasets/categories")
async def list_categories():
    """List all available dataset categories"""
    if not dataset_manager:
        raise HTTPException(status_code=503, detail="Dataset manager not available")
    
    categories = dataset_manager.list_categories()
    category_info = {}
    for cat in categories:
        datasets = dataset_manager.get_datasets_by_category(cat)
        category_info[cat] = {
            "name": cat,
            "datasets": [ds.name for ds in datasets],
            "count": len(datasets)
        }
    
    return category_info


@app.get("/api/v1/datasets/{dataset_name}", response_model=DatasetInfo)
async def get_dataset_info(dataset_name: str):
    """Get information about a specific dataset"""
    if not dataset_manager:
        raise HTTPException(status_code=503, detail="Dataset manager not available")
    
    dataset = dataset_manager.get_dataset(dataset_name)
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_name} not found")
    
    return DatasetInfo(
        name=dataset.name,
        display_name=dataset.display_name,
        category=dataset.category,
        plant_type=dataset.plant_type,
        description=dataset.description
    )


@app.get("/api/v1/cache/stats")
async def get_cache_stats():
    """Get Redis cache statistics"""
    if not redis_cache:
        return {"connected": False, "message": "Redis cache not available"}
    
    return redis_cache.get_cache_stats()


@app.get("/api/v1/snps/{chromosome}/{position}")
async def get_snp_info(chromosome: str, position: int, window: int = 1000, dataset: Optional[str] = None):
    """Get SNP information for a specific genomic position"""
    parser = _get_or_load_dataset(dataset_name=dataset) if dataset else bim_parser
    if not parser:
        raise HTTPException(status_code=503, detail="BIM parser not available")
    
    try:
        snps = parser.find_snps_near_position(chromosome, position, window)
        return {
            "chromosome": chromosome,
            "position": position,
            "window": window,
            "dataset": dataset or current_dataset_name,
            "snps": snps
        }
    except Exception as e:
        logger.error(f"Error fetching SNP info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/snps/by-id/{snp_id}")
async def get_snp_by_id(snp_id: str, dataset: Optional[str] = None):
    """Get SNP information by SNP ID"""
    parser = _get_or_load_dataset(dataset_name=dataset) if dataset else bim_parser
    if not parser:
        raise HTTPException(status_code=503, detail="BIM parser not available")
    
    try:
        snp = parser.get_snp_by_id(snp_id)
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

