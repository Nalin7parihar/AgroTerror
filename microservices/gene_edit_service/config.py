"""
Configuration management for Gene Edit Microservice
"""
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base paths
BASE_DIR = Path(__file__).parent
MICROSERVICES_DIR = BASE_DIR.parent

# Service paths
GRAPH_CRISPR_DIR = MICROSERVICES_DIR / "Graph-CRISPR"
DNABERT_DIR = MICROSERVICES_DIR / "DNABERT"
BIM_FILE_PATH = MICROSERVICES_DIR / "8652_Hybrid.bim"

# Configuration from environment variables
GRAPH_CRISPR_CONFIG_PATH = os.getenv(
    "GRAPH_CRISPR_CONFIG_PATH",
    str(GRAPH_CRISPR_DIR / "config_BE.json")
)

GRAPH_CRISPR_MODEL_PATH = os.getenv("GRAPH_CRISPR_MODEL_PATH", None)

DNABERT_MODEL_PATH = os.getenv("DNABERT_MODEL_PATH", None)
DNABERT_KMER = int(os.getenv("DNABERT_KMER", "6"))

BIM_FILE_PATH_ENV = os.getenv("BIM_FILE_PATH", str(BIM_FILE_PATH))

# Server configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8001"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Device configuration
DEVICE = os.getenv("DEVICE", "cuda" if os.getenv("CUDA_VISIBLE_DEVICES") else "cpu")

