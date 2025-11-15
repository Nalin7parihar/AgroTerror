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
- Gene analysis integration with microservices
- Database and caching setup
- API endpoints and usage examples
- Configuration and deployment guide

**Key Features:**
- User authentication with JWT tokens
- Multi-language LLM queries (English, Hindi, Kannada)
- Gene edit analysis with DNABERT and Graph-CRISPR integration
- Redis caching for performance
- MongoDB for data persistence
- Rate limiting and security features

### [Frontend Documentation](./frontend.md)

Complete documentation for the Next.js frontend application, including:
- Architecture and project structure
- Pages and routing
- Components and UI elements
- 3D DNA visualizations
- API integration
- Authentication flow
- Deployment guide

**Key Features:**
- Next.js 16 with App Router
- React Three Fiber for 3D DNA visualizations
- Responsive UI with Tailwind CSS
- User authentication and dashboard
- Gene analysis interface
- Interactive chatbot widget

### [Gene Edit Service Documentation](./gene-edit-service.md)

Documentation for the gene edit microservice that integrates DNABERT and Graph-CRISPR:
- Service architecture and workflow
- API endpoints and usage
- DNABERT integration for mutation validation
- Graph-CRISPR integration for edit suggestions
- SNP analysis with HapMap3 data
- Dataset management
- Configuration and deployment

**Key Features:**
- FastAPI microservice
- Graph-CRISPR for guide RNA suggestions
- DNABERT for mutation validation
- SNP analysis and risk assessment
- Redis caching for performance
- Multi-dataset support

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

1. **Frontend Setup**: See [Frontend Documentation](./frontend.md#setup-and-installation)
2. **Server Setup**: See [Server Documentation](./server.md#setup-and-installation)
3. **Gene Edit Service Setup**: See [Gene Edit Service Documentation](./gene-edit-service.md#setup-and-installation)
4. **DNABERT Setup**: See [DNABERT Documentation](./dnabert.md#installation)
5. **Graph-CRISPR Setup**: See [Graph-CRISPR Documentation](./graph-crispr.md#setup-and-installation)

## Project Structure

```
AgroTerror/
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utility libraries
│   └── public/           # Static assets
├── server/               # Main FastAPI server
│   ├── core/             # Core configuration and utilities
│   ├── routers/          # API route handlers
│   ├── services/         # Business logic services
│   ├── schemas/          # Pydantic models
│   └── model/            # Database models
├── microservices/
│   ├── DNABERT/          # DNABERT model and tools
│   ├── Graph-CRISPR/     # Graph-CRISPR model
│   └── gene_edit_service/ # Gene edit microservice (integrates DNABERT + Graph-CRISPR)
│       ├── services/     # Service implementations
│       ├── models.py     # Pydantic models
│       └── main.py       # FastAPI application
└── docs/                 # This documentation
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

