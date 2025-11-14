#!/bin/bash
# Quick demo commands for gene edit suggestions API

BASE_URL="http://localhost:8001"

echo "=== Demo 1: Basic Request (Plant Height) ==="
curl -X POST "$BASE_URL/api/v1/gene-edit/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "dna_sequence": "ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG",
    "target_trait": "plant_height",
    "max_suggestions": 5,
    "min_efficiency": 50.0
  }'

echo -e "\n\n=== Demo 2: Rice Yield Improvement ==="
curl -X POST "$BASE_URL/api/v1/gene-edit/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "dna_sequence": "GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA",
    "target_trait": "yield",
    "dataset_name": "rice",
    "max_suggestions": 3,
    "min_efficiency": 60.0
  }'

echo -e "\n\n=== Demo 3: Maize Drought Tolerance ==="
curl -X POST "$BASE_URL/api/v1/gene-edit/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "dna_sequence": "TTAACCGGAATTCCGGTTAACCGGAATTCCGGTTAACCGGAATTCCGGTTAACCGGAATTCCGG",
    "target_trait": "drought_tolerance",
    "dataset_name": "maize",
    "target_region": "1:1000-2000",
    "max_suggestions": 5
  }'

echo -e "\n\n=== Demo 4: Chickpea Disease Resistance ==="
curl -X POST "$BASE_URL/api/v1/gene-edit/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "dna_sequence": "ACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT",
    "target_trait": "disease_resistance",
    "dataset_name": "chikpea",
    "max_suggestions": 4,
    "min_efficiency": 55.0
  }'

echo -e "\n\n=== Demo 5: Cotton Flowering Time ==="
curl -X POST "$BASE_URL/api/v1/gene-edit/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "dna_sequence": "GGCCTTAAGGCCGGCCTTAAGGCCGGCCTTAAGGCCGGCCTTAAGGCCGGCCTTAAGGCCGG",
    "target_trait": "flowering_time",
    "dataset_name": "cotton",
    "max_suggestions": 5
  }'

