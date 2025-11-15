"""
Ollama LLM Service - Generates summaries explaining gene edit suggestions
Uses llama3.2 model to provide human-readable explanations of edit effects
"""
import httpx
import logging
import asyncio
from typing import Dict, List, Any, Optional
from schemas.gene_analysis import GeneAnalysisResponse, EditSuggestion, SNPChange, EditSummary

logger = logging.getLogger(__name__)

# Ollama API endpoint (default local)
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2"


async def generate_edit_summary(
    analysis_result: GeneAnalysisResponse,
    target_trait: str
) -> str:
    """
    Generate a comprehensive summary explaining the gene edit suggestions and their effects.
    
    Args:
        analysis_result: The complete gene analysis response with edit suggestions
        target_trait: The target trait being optimized (e.g., "plant_height")
    
    Returns:
        A human-readable summary explaining the edit suggestions and their potential effects
    """
    try:
        # Build context from analysis results
        edit_suggestions_text = _format_edit_suggestions(analysis_result.edit_suggestions)
        snp_changes_text = _format_snp_changes(analysis_result.snp_changes)
        summary_metrics = analysis_result.summary
        
        # Create prompt for Ollama
        prompt = f"""You are an expert geneticist providing clear, constructive, and forward-looking insights about CRISPR gene editing results from an advanced agricultural biotechnology platform.

A comprehensive gene editing analysis has been completed targeting {target_trait.replace('_', ' ').title()}. The platform generated multiple CRISPR-based edit suggestions highlighting its precision and analytical depth.

Edit Suggestions:
{edit_suggestions_text}

SNP Changes Identified:
{snp_changes_text}

Please provide a detailed, scientifically grounded summary that maintains a positive and forward-looking perspective. Your analysis should focus on:

1. Scientific Rigor and Precision

Describe how the proposed edits reflect modern CRISPR methodologies and advanced genomic targeting. Explain how the platform’s output demonstrates precise, well-defined modification strategies for enhancing {target_trait.replace('_', ' ').title()}.

2. Biological Interpretation

Using established plant genetics knowledge, describe what these edits could mean biologically. Highlight the potential functional roles of the genes or regions involved and how these edits may contribute to a deeper understanding or potential improvement of {target_trait.replace('_', ' ').title()}.

3. Practical Research Value

Explain how these insights can support researchers in planning, validating, and advancing gene editing experiments. Emphasize how the structured recommendations guide thoughtful decision-making and facilitate strategic crop improvement.

4. Strength of the Editing Strategy

Discuss how the pattern and type of edits collectively represent a coherent, thoughtfully designed approach for modulating this trait. Highlight the clarity, organization, and relevance of the proposed modifications.

Important Instructions

Maintain a positive, constructive tone.

Do NOT use negative language (no risks, concerns, problems, limitations).

Do NOT include any metrics, percentages, or numerical values.

Keep the summary analytical, insightful, and scientifically grounded—not promotional or sales-like.

Focus on potential biological significance, clarity of strategy, and usefulness for researchers.

Provide 3–5 polished, well-structured paragraphs summarizing the results.
"""

        # Call Ollama API
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "max_tokens": 1000
                    }
                }
            )
            response.raise_for_status()
            result = response.json()
            
            # Ollama API returns the response text in the "response" field when stream=false
            summary = result.get("response", "").strip()
            
            # Fallback: if response field is empty, try to get from other possible fields
            if not summary:
                # Sometimes Ollama might return the text directly or in a different format
                summary = result.get("text", "").strip() or str(result).strip()
                
            if not summary:
                logger.warning("Empty response from Ollama, using fallback summary")
                return _generate_fallback_summary(analysis_result, target_trait)
            
            return summary
            
    except httpx.TimeoutException:
        logger.error("Ollama API request timed out")
        return _generate_fallback_summary(analysis_result, target_trait)
    except httpx.HTTPStatusError as e:
        logger.error(f"Ollama API error: {e.response.status_code} - {e.response.text}")
        return _generate_fallback_summary(analysis_result, target_trait)
    except Exception as e:
        logger.error(f"Error generating Ollama summary: {str(e)}")
        return _generate_fallback_summary(analysis_result, target_trait)


def _format_edit_suggestions(suggestions: List[EditSuggestion]) -> str:
    """Format edit suggestions for the prompt - minimal details, just for context"""
    if not suggestions:
        return "No edit suggestions available."
    
    # Provide minimal context without specific metrics
    formatted = []
    for i, sug in enumerate(suggestions, 1):
        edit_type = sug.edit_type
        base_change = ""
        if sug.original_base and sug.target_base:
            base_change = f" ({sug.original_base} → {sug.target_base})"
        
        formatted.append(f"Edit {i}: {edit_type} modification{base_change}")
    
    return "Types of edits proposed: " + "; ".join(formatted)


def _format_snp_changes(snp_changes: List[SNPChange]) -> str:
    """Format SNP changes for the prompt - provide general context only"""
    if not snp_changes:
        return "No SNP changes identified in the analysis."
    
    # Count causal candidates for general context
    causal_count = sum(1 for snp in snp_changes if snp.is_causal_candidate)
    
    # Get general regions/chromosomes affected
    chromosomes_affected = set(snp.chromosome for snp in snp_changes)
    nearby_genes = set()
    for snp in snp_changes:
        nearby_genes.update(snp.nearby_genes)
    
    context_parts = []
    context_parts.append(f"The edits affect multiple genomic regions across {len(chromosomes_affected)} chromosome(s).")
    
    if causal_count > 0:
        context_parts.append(f"Several of these are identified as potential causal variants for the target trait.")
    
    if nearby_genes:
        gene_list = list(nearby_genes)[:5]  # Limit to 5 for brevity
        context_parts.append(f"The affected regions are near genes involved in: {', '.join(gene_list)}{' and others' if len(nearby_genes) > 5 else ''}.")
    
    return " ".join(context_parts)


def _generate_fallback_summary(analysis_result: GeneAnalysisResponse, target_trait: str) -> str:
    """Generate a positive promotional summary if Ollama is unavailable"""
    summary = analysis_result.summary
    
    trait_name = target_trait.replace('_', ' ').title()
    has_causal = bool(summary.causal_candidate_snps)
    
    causal_text = 'The identification of potential causal variants highlights the platform\'s ability to target key genetic factors that directly influence the trait of interest.' if has_causal else 'The edits target strategically chosen genomic regions that play important roles in trait regulation and expression.'
    
    summary_text = f"""This advanced gene editing analysis demonstrates the power of precision CRISPR technology to optimize {trait_name} in agricultural crops.

The analysis successfully identified strategic edit sites across the genome, showcasing the platform's sophisticated approach to trait modification. The proposed edits utilize state-of-the-art CRISPR guide RNA design for highly precise genomic modifications.

The genomic regions targeted by these edits are strategically selected for their relevance to {trait_name} regulation. {causal_text}

This analysis demonstrates the effectiveness of using advanced CRISPR editing for crop improvement. These modifications offer exciting potential for developing improved agricultural varieties with enhanced {trait_name}, representing a promising application of cutting-edge biotechnology in sustainable agriculture."""
    
    return summary_text

