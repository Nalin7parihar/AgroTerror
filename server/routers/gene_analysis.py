"""
Gene Analysis Router - Handles gene editing analysis requests
Flow: Frontend -> Server -> Microservice -> Server -> Frontend
"""
import httpx
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import HTMLResponse, Response
from datetime import datetime
from bson import ObjectId
from typing import Optional
import io
try:
    from jinja2 import Template
except ImportError:
    # Fallback to basic string template if jinja2 is not available
    class Template:
        def __init__(self, template_str: str):
            self.template_str = template_str
        def render(self, **kwargs) -> str:
            result = self.template_str
            for key, value in kwargs.items():
                if isinstance(value, (int, float)):
                    result = result.replace(f"{{{{ {key}|round(1) }}}}", str(round(value, 1)))
                    result = result.replace(f"{{{{ {key}|round(2) }}}}", str(round(value, 2)))
                result = result.replace(f"{{{{ {key} }}}}", str(value))
            return result

from schemas.gene_analysis import (
    GeneAnalysisRequest,
    GeneAnalysisResponse,
    AnalysisHistoryResponse,
    AnalysisHistoryItem,
    EditSummaryResponse
)
from core.dependencies import get_current_user
from core.database import get_db
from core.config import settings
from core.rate_limit import limiter, get_rate_limit
from model.user import User
from motor.motor_asyncio import AsyncIOMotorDatabase
from services.ollama import generate_edit_summary

logger = logging.getLogger(__name__)

# Try to import xhtml2pdf for PDF generation (pure Python, cross-platform)
try:
    from xhtml2pdf import pisa
    XHTML2PDF_AVAILABLE = True
    logger.info("✓ xhtml2pdf imported successfully - PDF export enabled")
except ImportError as e:
    XHTML2PDF_AVAILABLE = False
    pisa = None
    logger.warning(f"xhtml2pdf not available. PDF export will return HTML. Import error: {e}")
    logger.warning("Install with: pip install xhtml2pdf")
except Exception as e:
    XHTML2PDF_AVAILABLE = False
    pisa = None
    logger.error(f"Error importing xhtml2pdf: {e}. PDF export disabled.")
    import traceback
    logger.error(traceback.format_exc())

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


@router.get("/history/{analysis_id}/dna-comparison")
@limiter.limit(get_rate_limit("gene_analysis_detail"))
async def get_dna_comparison(
    request: Request,
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get DNA comparison data for each edit suggestion
    Compares original DNA with modified DNA for each of the 5 edit suggestions
    Returns positions of changes for visualization
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
        
        # Get original DNA sequence
        original_dna = analysis.get("dna_sequence", "")
        if not original_dna:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Original DNA sequence not found in analysis"
            )
        
        # Get edit suggestions
        edit_suggestions = analysis.get("edit_suggestions", [])
        if not edit_suggestions:
            return {
                "analysis_id": analysis_id,
                "original_dna": original_dna,
                "comparisons": []
            }
        
        comparisons = []
        
        # Process each edit suggestion (up to 5)
        for idx, edit in enumerate(edit_suggestions[:5]):
            # Apply the edit to create modified DNA
            modified_dna = list(original_dna)
            target_pos = edit.get("target_position", -1)
            original_base = edit.get("original_base")
            target_base = edit.get("target_base")
            
            # Apply the edit if valid
            if 0 <= target_pos < len(modified_dna) and original_base and target_base:
                if modified_dna[target_pos] == original_base:
                    modified_dna[target_pos] = target_base
            
            modified_dna_str = "".join(modified_dna)
            
            # Compare original and modified DNA to find all changes
            changes = []
            for i in range(len(original_dna)):
                if i < len(modified_dna_str) and original_dna[i] != modified_dna_str[i]:
                    changes.append({
                        "position": i,
                        "original": original_dna[i],
                        "modified": modified_dna_str[i]
                    })
            
            comparisons.append({
                "suggestion_index": idx,
                "guide_rna": edit.get("guide_rna", ""),
                "target_position": target_pos,
                "edit_type": edit.get("edit_type", "substitution"),
                "efficiency_score": edit.get("efficiency_score", 0),
                "confidence": edit.get("confidence", 0),
                "original_base": original_base,
                "target_base": target_base,
                "original_dna": original_dna,
                "modified_dna": modified_dna_str,
                "changes": changes,
                "change_count": len(changes)
            })
        
        return {
            "analysis_id": analysis_id,
            "original_dna": original_dna,
            "comparisons": comparisons,
            "total_suggestions": len(comparisons)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting DNA comparison: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving DNA comparison: {str(e)}"
        )


@router.post("/history/{analysis_id}/summary", response_model=EditSummaryResponse)
@limiter.limit(get_rate_limit("gene_analysis_detail"))
async def generate_summary(
    request: Request,
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Generate a comprehensive summary explaining the gene edit suggestions and their effects.
    Uses Ollama (llama3.2) to generate human-readable explanations.
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
        
        # Convert to GeneAnalysisResponse
        analysis_response = GeneAnalysisResponse(
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
        
        # Get target trait
        target_trait = analysis.get("target_trait", "custom")
        
        # Generate summary using Ollama
        logger.info(f"Generating summary for analysis {analysis_id} using Ollama")
        summary_text = await generate_edit_summary(analysis_response, target_trait)
        
        return EditSummaryResponse(
            analysis_id=analysis_id,
            summary=summary_text
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating summary: {str(e)}"
        )


@router.get("/locus/{analysis_id}")
@limiter.limit(get_rate_limit("gene_analysis_detail"))
async def get_snp_locus_from_analysis(
    request: Request,
    analysis_id: str,
    chromosome: str,
    start: int,
    end: int,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get SNP locus data from a specific analysis result
    Filters SNPs by chromosome and position range from stored analysis data
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
        
        if start >= end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start position must be less than end position"
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
        
        # Get SNP changes from analysis
        snp_changes = analysis.get("snp_changes", [])
        
        # Filter SNPs by chromosome and position range
        filtered_snps = [
            snp for snp in snp_changes
            if str(snp.get("chromosome", "")).lower() == str(chromosome).lower()
            and start <= snp.get("position", 0) <= end
        ]
        
        # Sort by position
        filtered_snps.sort(key=lambda x: x.get("position", 0))
        
        return {
            "analysis_id": analysis_id,
            "chromosome": chromosome,
            "start": start,
            "end": end,
            "count": len(filtered_snps),
            "snps": filtered_snps,
            "input_sequence": analysis.get("dna_sequence", ""),
            "target_trait": analysis.get("target_trait", ""),
            "dataset_name": analysis.get("dataset_name", "")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting SNP locus: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving SNP locus: {str(e)}"
        )


@router.get("/locus/density/{analysis_id}")
@limiter.limit(get_rate_limit("gene_analysis_detail"))
async def get_snp_density_from_analysis(
    request: Request,
    analysis_id: str,
    chromosome: str,
    start: int,
    end: int,
    bins: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Calculate SNP density from stored analysis data
    Returns density histogram data for visualization
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
        
        if start >= end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start position must be less than end position"
            )
        
        if bins < 1 or bins > 1000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bins must be between 1 and 1000"
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
        
        # Get SNP changes from analysis
        snp_changes = analysis.get("snp_changes", [])
        
        # Filter SNPs by chromosome and position range
        filtered_snps = [
            snp for snp in snp_changes
            if str(snp.get("chromosome", "")).lower() == str(chromosome).lower()
            and start <= snp.get("position", 0) <= end
        ]
        
        # Calculate bin size
        window_size = end - start
        bin_size = window_size / bins
        
        # Initialize bins
        density_bins = [
            {
                "start": int(start + i * bin_size),
                "end": int(start + (i + 1) * bin_size),
                "count": 0,
                "density": 0.0,
                "causal_count": 0,
                "causal_density": 0.0
            }
            for i in range(bins)
        ]
        
        # Count SNPs in each bin
        for snp in filtered_snps:
            pos = snp.get("position", 0)
            bin_index = min(int((pos - start) / bin_size), bins - 1)
            if bin_index >= 0:
                density_bins[bin_index]["count"] += 1
                # Count causal candidates separately
                if snp.get("is_causal_candidate", False):
                    density_bins[bin_index]["causal_count"] += 1
        
        # Calculate density (SNPs per kb)
        for bin_data in density_bins:
            bin_width_kb = (bin_data["end"] - bin_data["start"]) / 1000.0
            bin_data["density"] = bin_data["count"] / bin_width_kb if bin_width_kb > 0 else 0.0
            bin_data["causal_density"] = bin_data["causal_count"] / bin_width_kb if bin_width_kb > 0 else 0.0
        
        # Get causal candidates in this region
        causal_candidates = [
            snp for snp in filtered_snps
            if snp.get("is_causal_candidate", False)
        ]
        
        return {
            "analysis_id": analysis_id,
            "chromosome": chromosome,
            "start": start,
            "end": end,
            "bins": bins,
            "total_snps": len(filtered_snps),
            "causal_candidates": len(causal_candidates),
            "density_bins": density_bins,
            "snps": filtered_snps,
            "causal_snps": causal_candidates
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating SNP density: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating SNP density: {str(e)}"
        )


@router.get("/history/{analysis_id}/report")
@limiter.limit(get_rate_limit("gene_analysis_detail"))
async def export_analysis_report(
    request: Request,
    analysis_id: str,
    format: str = Query(default="html", regex="^(html|pdf)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Generate and export analysis report in HTML or PDF format
    Includes edit suggestions, DNABERT validations, SNP changes, and scenario results
    """
    try:
        obj_id = ObjectId(analysis_id)
        analysis = await db.gene_analyses.find_one({
            "_id": obj_id,
            "user_id": current_user.id
        })
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Prepare report data
        report_data = {
            "analysis_id": analysis_id,
            "created_at": analysis.get("created_at", datetime.utcnow()),
            "dna_sequence": analysis.get("dna_sequence", ""),
            "target_trait": analysis.get("target_trait", ""),
            "dataset_name": analysis.get("dataset_name", ""),
            "summary": analysis.get("summary", {}),
            "edit_suggestions": analysis.get("edit_suggestions", []),
            "snp_changes": analysis.get("snp_changes", []),
            "dnabert_validations": analysis.get("dnabert_validations", []),
            "user_email": current_user.email,
        }
        
        # Generate HTML report
        html_content = _generate_html_report(report_data)
        
        if format == "pdf":
            # Generate actual PDF using xhtml2pdf
            if not XHTML2PDF_AVAILABLE:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="PDF generation not available. Please install xhtml2pdf: pip install xhtml2pdf"
                )
            
            try:
                # Generate PDF from HTML
                logger.info(f"Generating PDF report for analysis {analysis_id}")
                pdf_bytes = _generate_pdf_from_html(html_content)
                
                if not pdf_bytes or len(pdf_bytes) == 0:
                    raise Exception("PDF generation returned empty result")
                
                # Return PDF with proper headers
                logger.info(f"Sending PDF response: {len(pdf_bytes)} bytes")
                return Response(
                    content=pdf_bytes,
                    media_type="application/pdf",
                    headers={
                        "Content-Type": "application/pdf",
                        "Content-Disposition": f"attachment; filename=gene-analysis-report-{analysis_id}.pdf",
                        "Content-Length": str(len(pdf_bytes))
                    }
                )
            except Exception as e:
                error_msg = f"Error generating PDF: {str(e)}"
                logger.error(error_msg)
                logger.exception("Full PDF generation error traceback:")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=error_msg
                )
        else:
            return HTMLResponse(content=html_content, media_type="text/html")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating report: {str(e)}"
        )


def _generate_html_report(data: dict) -> str:
    """Generate HTML report from analysis data"""
    # Helper function for rounding
    def round_val(val, decimals=1):
        if isinstance(val, (int, float)):
            return round(val, decimals)
        return val
    
    # Helper function for formatting dates
    def format_date(dt):
        if dt and hasattr(dt, 'strftime'):
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        return 'N/A'
    
    # Helper function for title case
    def title_case(s):
        if s:
            return str(s).replace('_', ' ').title()
        return ''
    
    # Prepare template variables
    analysis_id = data.get('analysis_id', 'N/A')
    created_at = format_date(data.get('created_at'))
    user_email = data.get('user_email', 'N/A')
    target_trait = title_case(data.get('target_trait', ''))
    dataset_name = data.get('dataset_name') or 'N/A'
    summary = data.get('summary', {})
    dna_sequence = data.get('dna_sequence', '')
    edit_suggestions = data.get('edit_suggestions', [])
    snp_changes = data.get('snp_changes', [])
    dnabert_validations = data.get('dnabert_validations', [])
    
    # Build HTML directly
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gene Analysis Report - {analysis_id}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
               line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ border-bottom: 3px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }}
        .header h1 {{ color: #2c3e50; font-size: 28px; margin-bottom: 10px; }}
        .header .meta {{ color: #7f8c8d; font-size: 14px; }}
        .section {{ margin-bottom: 40px; }}
        .section h2 {{ color: #2c3e50; font-size: 22px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #ecf0f1; }}
        .summary-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }}
        .summary-card {{ background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50; }}
        .summary-card h3 {{ font-size: 12px; color: #7f8c8d; text-transform: uppercase; margin-bottom: 10px; }}
        .summary-card .value {{ font-size: 32px; font-weight: bold; color: #2c3e50; }}
        .suggestion {{ background: #f8f9fa; padding: 20px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #3498db; }}
        .suggestion h3 {{ color: #2c3e50; margin-bottom: 10px; }}
        .suggestion-details {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px; }}
        .suggestion-detail {{ background: white; padding: 10px; border-radius: 4px; }}
        .suggestion-detail label {{ font-size: 12px; color: #7f8c8d; display: block; margin-bottom: 5px; }}
        .suggestion-detail span {{ font-weight: bold; color: #2c3e50; }}
        .badge {{ display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }}
        .badge-success {{ background: #d4edda; color: #155724; }}
        .badge-danger {{ background: #f8d7da; color: #721c24; }}
        .badge-primary {{ background: #cce5ff; color: #004085; }}
        .dna-sequence {{ font-family: 'Courier New', monospace; background: #f8f9fa; padding: 15px; border-radius: 8px; 
                        word-break: break-all; font-size: 12px; margin: 10px 0; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
        table th, table td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ecf0f1; }}
        table th {{ background: #f8f9fa; font-weight: bold; color: #2c3e50; }}
        .footer {{ margin-top: 40px; padding-top: 20px; border-top: 2px solid #ecf0f1; text-align: center; color: #7f8c8d; font-size: 12px; }}
        @media print {{ body {{ background: white; }} .container {{ box-shadow: none; }} }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Gene Analysis Lab Report</h1>
            <div class="meta">
                <p><strong>Analysis ID:</strong> {analysis_id}</p>
                <p><strong>Date:</strong> {created_at}</p>
                <p><strong>User:</strong> {user_email}</p>
                <p><strong>Target Trait:</strong> {target_trait}</p>
                <p><strong>Dataset:</strong> {dataset_name}</p>
            </div>
        </div>

        <div class="section">
            <h2>Executive Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Overall Confidence</h3>
                    <div class="value">{round_val(summary.get('overall_confidence', 0), 1)}%</div>
                </div>
                <div class="summary-card">
                    <h3>SNPs Affected</h3>
                    <div class="value">{summary.get('total_snps_affected', 0)}</div>
                </div>
                <div class="summary-card">
                    <h3>Trait Change</h3>
                    <div class="value">{round_val(summary.get('trait_prediction_change', 0), 2)}%</div>
                </div>
                <div class="summary-card">
                    <h3>Edit Suggestions</h3>
                    <div class="value">{len(edit_suggestions)}</div>
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <strong>Risk Assessment:</strong> {summary.get('risk_assessment', 'N/A')}
            </div>
        </div>

        <div class="section">
            <h2>DNA Sequence</h2>
            <div class="dna-sequence">{dna_sequence}</div>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 10px;">Sequence Length: {len(dna_sequence)} nucleotides</p>
        </div>

        <div class="section">
            <h2>Edit Suggestions</h2>
"""
    
    # Build edit suggestions section
    suggestions_html = ''
    for idx, suggestion in enumerate(edit_suggestions):
        suggestion_idx = idx + 1
        target_pos = suggestion.get('target_position', 'N/A')
        edit_type = suggestion.get('edit_type', 'N/A')
        original_base = suggestion.get('original_base') or 'N/A'
        target_base = suggestion.get('target_base') or 'N/A'
        efficiency = round_val(suggestion.get('efficiency_score', 0), 1)
        confidence = round_val(suggestion.get('confidence', 0), 1)
        guide_rna = suggestion.get('guide_rna', '')
        
        validation_html = ''
        if dnabert_validations and idx < len(dnabert_validations):
            validation = dnabert_validations[idx]
            passed = validation.get('validation_passed', False)
            conf_score = validation.get('confidence_score')
            bg_color = '#d4edda' if passed else '#f8d7da'
            badge_class = 'badge-success' if passed else 'badge-danger'
            status_text = '✓ Passed' if passed else '✗ Failed'
            
            conf_text = f'<span style="margin-left: 10px;">Confidence: {round_val(conf_score, 2)}</span>' if conf_score else ''
            validation_html = f'''
                <div style="margin-top: 15px; padding: 10px; background: {bg_color}; border-radius: 4px;">
                    <strong>DNABERT Validation:</strong> 
                    <span class="badge {badge_class}">{status_text}</span>
                    {conf_text}
                </div>
            '''
        
        guide_rna_html = f'''
                    <div class="suggestion-detail" style="grid-column: 1 / -1;">
                        <label>Guide RNA</label>
                        <span style="font-family: 'Courier New', monospace;">{guide_rna}</span>
                    </div>
        ''' if guide_rna else ''
        
        suggestions_html += f'''
            <div class="suggestion">
                <h3>Edit Suggestion #{suggestion_idx}</h3>
                <div class="suggestion-details">
                    <div class="suggestion-detail">
                        <label>Position</label>
                        <span>{target_pos}</span>
                    </div>
                    <div class="suggestion-detail">
                        <label>Edit Type</label>
                        <span>{edit_type}</span>
                    </div>
                    <div class="suggestion-detail">
                        <label>Base Change</label>
                        <span>{original_base} → {target_base}</span>
                    </div>
                    <div class="suggestion-detail">
                        <label>Efficiency</label>
                        <span>{efficiency}%</span>
                    </div>
                    <div class="suggestion-detail">
                        <label>Confidence</label>
                        <span>{confidence}%</span>
                    </div>
                    {guide_rna_html}
                </div>
                {validation_html}
            </div>
        '''
    
    html += suggestions_html
    html += '''
        </div>
'''
    
    # Build SNP changes table
    if snp_changes:
        html += f'''
        <div class="section">
            <h2>SNP Changes ({len(snp_changes)})</h2>
            <table>
                <thead>
                    <tr>
                        <th>SNP ID</th>
                        <th>Chromosome</th>
                        <th>Position</th>
                        <th>Allele Change</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
'''
        for snp in snp_changes[:50]:
            snp_id = snp.get('snp_id', 'N/A')
            chromosome = snp.get('chromosome', 'N/A')
            position = snp.get('position', 'N/A')
            original_allele = snp.get('original_allele', 'N/A')
            new_allele = snp.get('new_allele', 'N/A')
            is_causal = snp.get('is_causal_candidate', False)
            badge_class = 'badge-danger' if is_causal else 'badge-primary'
            badge_text = 'Causal' if is_causal else 'Associated'
            
            html += f'''
                    <tr>
                        <td>{snp_id}</td>
                        <td>{chromosome}</td>
                        <td>{position}</td>
                        <td>{original_allele} → {new_allele}</td>
                        <td><span class="badge {badge_class}">{badge_text}</span></td>
                    </tr>
'''
        
        html += '''
                </tbody>
            </table>
'''
        if len(snp_changes) > 50:
            html += f'            <p style="margin-top: 15px; color: #7f8c8d; font-size: 12px;">Showing first 50 of {len(snp_changes)} SNP changes</p>'
        html += '''
        </div>
'''
    
    html += '''
        <div class="footer">
            <p>Generated by AgrIQ Gene Analysis Platform</p>
            <p>This report is confidential and intended for authorized use only.</p>
        </div>
    </div>
</body>
</html>'''
    
    return html


def _generate_pdf_from_html(html_content: str) -> bytes:
    """
    Generate PDF bytes from HTML content using xhtml2pdf
    """
    try:
        # Create a BytesIO buffer to store PDF
        result_buffer = io.BytesIO()
        
        # Add page break and print-specific CSS to HTML
        pdf_html = html_content.replace(
            '<style>',
            '''<style>
            @page {
                size: A4;
                margin: 2cm;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            @media print {
                body { 
                    background: white !important;
                    color: black !important;
                }
                .container { 
                    box-shadow: none !important;
                }
            }
            table {
                page-break-inside: avoid;
            }
            .suggestion {
                page-break-inside: avoid;
            }
            .section {
                page-break-inside: avoid;
            }
        '''
        )
        
        # Generate PDF using pisa
        # pisa.pisaDocument expects a file-like object for src and dest
        html_bytes = io.BytesIO(pdf_html.encode('utf-8'))
        
        try:
            pdf_result = pisa.pisaDocument(
                src=html_bytes,
                dest=result_buffer
            )
        finally:
            # Close the source buffer
            html_bytes.close()
        
        # Check for errors
        if pdf_result.err:
            error_msg = "PDF generation error"
            if pdf_result.err:
                error_msg = f"PDF generation error: {pdf_result.err}"
            logger.error(error_msg)
            raise Exception(error_msg)
        
        # Reset buffer position and get PDF bytes
        result_buffer.seek(0)
        pdf_bytes = result_buffer.getvalue()
        
        # Verify PDF was generated (should start with %PDF)
        if len(pdf_bytes) == 0:
            raise Exception("PDF generation produced empty output")
        
        if not pdf_bytes.startswith(b'%PDF'):
            logger.warning(f"Generated PDF may be invalid. First 20 bytes: {pdf_bytes[:20]}")
            # Still return it, as some PDFs may be valid but not start with %PDF
        
        # Close buffer
        result_buffer.close()
        
        logger.info(f"Successfully generated PDF: {len(pdf_bytes)} bytes")
        return pdf_bytes
    except Exception as e:
        logger.error(f"xhtml2pdf PDF generation error: {str(e)}")
        logger.exception("Full traceback:")
        raise

