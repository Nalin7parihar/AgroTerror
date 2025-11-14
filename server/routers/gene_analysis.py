"""
Gene Analysis Router - Handles gene editing analysis requests
Flow: Frontend -> Server -> Microservice -> Server -> Frontend
"""
import httpx
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from datetime import datetime
from bson import ObjectId

from schemas.gene_analysis import (
    GeneAnalysisRequest,
    GeneAnalysisResponse,
    AnalysisHistoryResponse,
    AnalysisHistoryItem
)
from core.dependencies import get_current_user
from core.database import get_db
from core.config import settings
from core.rate_limit import limiter, get_rate_limit
from model.user import User
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/gene-analysis", tags=["Gene Analysis"])


async def call_microservice(request_data: dict) -> dict:
    """
    Call the gene edit microservice
    """
    try:
        microservice_url = f"{settings.GENE_EDIT_SERVICE_URL}/api/v1/gene-edit/suggest"
        
        async with httpx.AsyncClient(timeout=300.0) as client:  # 5 minute timeout for ML processing
            response = await client.post(
                microservice_url,
                json=request_data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException:
        logger.error("Microservice request timed out")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Analysis request timed out. Please try again with a shorter sequence."
        )
    except httpx.HTTPStatusError as e:
        logger.error(f"Microservice returned error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Microservice error: {e.response.text}"
        )
    except Exception as e:
        logger.error(f"Error calling microservice: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unable to connect to analysis service: {str(e)}"
        )


@router.post("/analyze", response_model=GeneAnalysisResponse, status_code=status.HTTP_200_OK)
@limiter.limit(get_rate_limit("gene_analysis"))
async def analyze_gene_edits(
    request: Request,
    analysis_request: GeneAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Analyze gene edits - forwards request to microservice and saves result to MongoDB
    Flow: Frontend -> Server -> Microservice -> Server (save to DB) -> Frontend
    """
    try:
        # Convert request to microservice format
        microservice_request = {
            "dna_sequence": analysis_request.dna_sequence,
            "target_trait": analysis_request.target_trait.value,
            "target_region": analysis_request.target_region,
            "max_suggestions": analysis_request.max_suggestions,
            "min_efficiency": analysis_request.min_efficiency,
            "dataset_name": analysis_request.dataset_name,
            "dataset_category": analysis_request.dataset_category
        }
        
        logger.info(f"Forwarding analysis request to microservice for user {current_user.id}")
        
        # Call microservice
        microservice_response = await call_microservice(microservice_request)
        
        # Generate analysis ID
        analysis_id = str(ObjectId())
        
        # Prepare analysis document for MongoDB
        analysis_doc = {
            "_id": ObjectId(analysis_id),
            "user_id": current_user.id,
            "request_id": microservice_response.get("request_id", analysis_id),
            "dna_sequence": analysis_request.dna_sequence,
            "target_trait": analysis_request.target_trait.value,
            "target_region": analysis_request.target_region,
            "max_suggestions": analysis_request.max_suggestions,
            "min_efficiency": analysis_request.min_efficiency,
            "dataset_name": analysis_request.dataset_name,
            "dataset_category": analysis_request.dataset_category,
            "edit_suggestions": microservice_response.get("edit_suggestions", []),
            "dnabert_validations": microservice_response.get("dnabert_validations", []),
            "snp_changes": microservice_response.get("snp_changes", []),
            "summary": microservice_response.get("summary", {}),
            "metrics": microservice_response.get("metrics", {}),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Save to MongoDB
        await db.gene_analyses.insert_one(analysis_doc)
        logger.info(f"Saved analysis {analysis_id} to database for user {current_user.id}")
        
        # Prepare response
        response_data = {
            "analysis_id": analysis_id,
            "request_id": microservice_response.get("request_id", analysis_id),
            "dna_sequence": analysis_request.dna_sequence,
            "edit_suggestions": microservice_response.get("edit_suggestions", []),
            "dnabert_validations": microservice_response.get("dnabert_validations", []),
            "snp_changes": microservice_response.get("snp_changes", []),
            "summary": microservice_response.get("summary", {}),
            "metrics": microservice_response.get("metrics", {}),
            "created_at": analysis_doc["created_at"]
        }
        
        return GeneAnalysisResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in analyze_gene_edits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing analysis: {str(e)}"
        )


@router.get("/history", response_model=AnalysisHistoryResponse)
@limiter.limit(get_rate_limit("gene_analysis_history"))
async def get_analysis_history(
    request: Request,
    limit: int = 20,
    skip: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get analysis history for the current user
    """
    try:
        # Query analyses for current user, sorted by created_at descending
        cursor = db.gene_analyses.find(
            {"user_id": current_user.id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        analyses_list = await cursor.to_list(length=limit)
        
        # Get total count
        total = await db.gene_analyses.count_documents({"user_id": current_user.id})
        
        # Format response
        history_items = []
        for analysis in analyses_list:
            history_items.append(
                AnalysisHistoryItem(
                    analysis_id=str(analysis["_id"]),
                    dna_sequence=analysis.get("dna_sequence", "")[:100] + "..." if len(analysis.get("dna_sequence", "")) > 100 else analysis.get("dna_sequence", ""),
                    target_trait=analysis.get("target_trait", ""),
                    dataset_name=analysis.get("dataset_name", "maize"),  # Default to maize if not set
                    created_at=analysis.get("created_at", datetime.utcnow()),
                    summary=analysis.get("summary", {})
                )
            )
        
        return AnalysisHistoryResponse(
            analyses=history_items,
            total=total
        )
        
    except Exception as e:
        logger.error(f"Error getting analysis history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving analysis history: {str(e)}"
        )


@router.get("/history/{analysis_id}", response_model=GeneAnalysisResponse)
@limiter.limit(get_rate_limit("gene_analysis_detail"))
async def get_analysis_detail(
    request: Request,
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get detailed analysis by ID
    """
    try:
        # Validate ObjectId
        try:
            obj_id = ObjectId(analysis_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid analysis ID format"
            )
        
        # Find analysis
        analysis = await db.gene_analyses.find_one({
            "_id": obj_id,
            "user_id": current_user.id
        })
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        # Format response
        return GeneAnalysisResponse(
            analysis_id=str(analysis["_id"]),
            request_id=analysis.get("request_id", str(analysis["_id"])),
            dna_sequence=analysis.get("dna_sequence", ""),
            edit_suggestions=analysis.get("edit_suggestions", []),
            dnabert_validations=analysis.get("dnabert_validations", []),
            snp_changes=analysis.get("snp_changes", []),
            summary=analysis.get("summary", {}),
            metrics=analysis.get("metrics", {}),
            created_at=analysis.get("created_at", datetime.utcnow())
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting analysis detail: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving analysis: {str(e)}"
        )

