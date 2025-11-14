"""
Example usage of the Gene Edit Microservice API
"""
import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8001"


def check_health() -> Dict[str, Any]:
    """Check service health"""
    response = requests.get(f"{BASE_URL}/health")
    return response.json()


def suggest_gene_edits(
    dna_sequence: str,
    target_trait: str = "plant_height",
    max_suggestions: int = 5,
    min_efficiency: float = 50.0
) -> Dict[str, Any]:
    """Request gene edit suggestions"""
    payload = {
        "dna_sequence": dna_sequence,
        "target_trait": target_trait,
        "max_suggestions": max_suggestions,
        "min_efficiency": min_efficiency
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/gene-edit/suggest",
        json=payload
    )
    response.raise_for_status()
    return response.json()


def get_snp_info(chromosome: str, position: int, window: int = 1000) -> Dict[str, Any]:
    """Get SNP information for a genomic position"""
    response = requests.get(
        f"{BASE_URL}/api/v1/snps/{chromosome}/{position}",
        params={"window": window}
    )
    response.raise_for_status()
    return response.json()


def get_snp_by_id(snp_id: str) -> Dict[str, Any]:
    """Get SNP information by ID"""
    response = requests.get(f"{BASE_URL}/api/v1/snps/by-id/{snp_id}")
    response.raise_for_status()
    return response.json()


def print_results(result: Dict[str, Any]):
    """Pretty print results"""
    print("\n" + "="*80)
    print("GENE EDIT SUGGESTIONS RESULTS")
    print("="*80)
    
    print(f"\nRequest ID: {result['request_id']}")
    print(f"\nMetrics:")
    for key, value in result['metrics'].items():
        print(f"  {key}: {value}")
    
    print(f"\nEdit Suggestions ({len(result['edit_suggestions'])}):")
    for i, suggestion in enumerate(result['edit_suggestions'], 1):
        print(f"\n  {i}. Guide RNA: {suggestion['guide_rna']}")
        print(f"     Position: {suggestion['target_position']}")
        print(f"     Edit: {suggestion['original_base']} → {suggestion['target_base']}")
        print(f"     Efficiency: {suggestion['efficiency_score']:.2f}%")
        print(f"     Confidence: {suggestion['confidence']:.2f}")
    
    print(f"\nDNABERT Validations:")
    for i, validation in enumerate(result['dnabert_validations'], 1):
        status = "✓ PASSED" if validation['validation_passed'] else "✗ FAILED"
        print(f"  {i}. {status}")
        print(f"     Original Score: {validation['original_score']:.4f}")
        print(f"     Mutated Score: {validation['mutated_score']:.4f}")
        print(f"     Difference: {validation['difference']:.4f}")
        print(f"     Log OR: {validation['log_odds_ratio']:.4f}")
    
    print(f"\nSNP Changes ({len(result['snp_changes'])}):")
    for i, snp in enumerate(result['snp_changes'][:10], 1):  # Show first 10
        causal = "CAUSAL CANDIDATE" if snp['is_causal_candidate'] else ""
        print(f"  {i}. {snp['snp_id']} @ {snp['chromosome']}:{snp['position']}")
        print(f"     {snp['original_allele']} → {snp['new_allele']} (Effect: {snp['effect_size']:.4f}) {causal}")
    
    print(f"\nSummary:")
    summary = result['summary']
    print(f"  Total SNPs Affected: {summary['total_snps_affected']}")
    print(f"  High Impact SNPs: {summary['high_impact_snps']}")
    print(f"  Causal Candidates: {len(summary['causal_candidate_snps'])}")
    print(f"  Trait Prediction Change: {summary['trait_prediction_change']:.4f}")
    print(f"  Overall Confidence: {summary['overall_confidence']:.2f}")
    print(f"  Risk Assessment: {summary['risk_assessment']}")
    
    print("\n" + "="*80 + "\n")


if __name__ == "__main__":
    # Example DNA sequence (replace with real sequence)
    example_sequence = "ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG"
    
    print("Checking service health...")
    health = check_health()
    print(f"Status: {health['status']}")
    print(f"Graph-CRISPR: {'✓' if health['graph_crispr_available'] else '✗'}")
    print(f"DNABERT: {'✓' if health['dnabert_available'] else '✗'}")
    print(f"BIM Data: {'✓' if health['bim_data_loaded'] else '✗'}")
    print(f"Total SNPs: {health['total_snps_in_database']}")
    
    print("\nRequesting gene edit suggestions...")
    try:
        result = suggest_gene_edits(
            dna_sequence=example_sequence,
            target_trait="plant_height",
            max_suggestions=5,
            min_efficiency=50.0
        )
        print_results(result)
        
        # Example: Get SNP info
        if result['snp_changes']:
            first_snp = result['snp_changes'][0]
            print(f"\nFetching details for SNP: {first_snp['snp_id']}")
            try:
                snp_details = get_snp_by_id(first_snp['snp_id'])
                print(json.dumps(snp_details, indent=2))
            except Exception as e:
                print(f"Error fetching SNP details: {e}")
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

