# AgroTerror Documentation

Welcome to the AgroTerror project documentation. This directory contains comprehensive documentation for the server and microservices components of the AgroTerror platform.

## Overview

AgroTerror is an AI-powered platform that predicts crop growth and yield by alternating genes using CRISPR technology. The system consists of a FastAPI server and multiple microservices for gene editing analysis.

## Documentation Index

### [Server Documentation](./server.md)

Complete documentation for the main FastAPI server, including:
- Architecture and project structure
- Authentication system
- LLM query service with Google Gemini integration
- Database and caching setup
- API endpoints and usage examples
- Configuration and deployment guide

**Key Features:**
- User authentication with JWT tokens
- Multi-language LLM queries (English, Hindi, Kannada)
- Redis caching for performance
- MongoDB for data persistence

### [DNABERT Microservice](./dnabert.md)

Documentation for the DNABERT pre-trained model for DNA sequence analysis:
- Model overview and architecture
- Installation and setup instructions
- Pre-training and fine-tuning guides
- Prediction and visualization tools
- SNP and mutation analysis
- Integration with AgroTerror platform

**Key Features:**
- Pre-trained models for k-mer sizes 3-6
- Sequence classification and prediction
- Mutation effect analysis
- Motif discovery using attention scores

### [Graph-CRISPR Microservice](./graph-crispr.md)

Documentation for the Graph-CRISPR model for CRISPR guide RNA efficiency prediction:
- Model architecture and components
- Dataset preparation and processing
- Training and prediction workflows
- Configuration and hyperparameters
- Integration with AgroTerror platform

**Key Features:**
- Graph neural network for sgRNA modeling
- Secondary structure integration
- RNA-FM embeddings
- Editing efficiency prediction

## Quick Start

1. **Server Setup**: See [Server Documentation](./server.md#setup-and-installation)
2. **DNABERT Setup**: See [DNABERT Documentation](./dnabert.md#installation)
3. **Graph-CRISPR Setup**: See [Graph-CRISPR Documentation](./graph-crispr.md#setup-and-installation)

## Project Structure

```
AgroTerror/
├── server/                 # Main FastAPI server
├── microservices/
│   ├── DNABERT/           # DNABERT model and tools
│   ├── Graph-CRISPR/      # Graph-CRISPR model
│   └── gene_edit_service/ # Integration microservice
├── frontend/              # Next.js frontend application
└── docs/                  # This documentation
```

## Getting Help

For issues or questions:
1. Check the relevant documentation file
2. Review the troubleshooting sections
3. Check the project's main README.md
4. Review code comments and examples

## Contributing

When updating documentation:
- Keep documentation in sync with code changes
- Include code examples where helpful
- Update this README if adding new documentation files
- Follow the existing documentation style

## License

See the main project LICENSE file for license information.

