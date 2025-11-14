# Graph-CRISPR Microservice Documentation

## Overview

Graph-CRISPR is a deep learning model for predicting CRISPR guide RNA (sgRNA) editing efficiency. It uses graph neural networks to model the secondary structure of sgRNA and predict editing efficiency based on sequence and structural features.

## What is Graph-CRISPR?

Graph-CRISPR is a graph-based deep learning approach that:
- Models sgRNA sequences as graphs
- Incorporates secondary structure information
- Uses RNA embeddings (RNA-FM) for sequence representation
- Predicts CRISPR editing efficiency with high accuracy

## Architecture

```
Graph-CRISPR/
├── adjust_model.py          # Main model architecture
├── adjust_layers.py         # Custom layer definitions
├── adjust_common.py         # Common utilities
├── dataset*.py              # Dataset processing scripts
├── trainandtest*.py         # Training and testing scripts
├── predict*.py              # Prediction scripts
├── config_*.json            # Configuration files
├── Dataset/                 # Dataset directory
│   ├── BE/                 # Base Editor datasets
│   ├── PE/                 # Prime Editor datasets
│   ├── EndoDataset/        # Endonuclease datasets
│   └── kimCas9/            # Cas9 datasets
├── npy2tensor.py           # Embedding conversion utility
└── README.md               # Original documentation
```

## Key Components

### 1. Model Architecture

The Graph-CRISPR model consists of:
- **Graph Convolutional Layers**: Process sgRNA graph structure
- **Attention Mechanisms**: Focus on important sequence regions
- **Pooling Layers**: Aggregate graph-level features
- **Classification Head**: Predict editing efficiency

### 2. Data Processing

#### Graph Data Creation

Graphs are created from:
- **Primary Sequence**: sgRNA nucleotide sequence
- **Secondary Structure**: RNA secondary structure (from mxfold2)
- **Embeddings**: Pre-computed RNA-FM embeddings

#### Dataset Scripts

Each dataset has a corresponding processing script (`dataset*.py`):
- `datasetBE.py`: Base Editor dataset
- `dataset500.py`: 500-sample dataset
- Custom datasets can be created by copying and modifying existing scripts

### 3. Configuration Files

JSON configuration files specify:
- Dataset paths
- Model parameters
- Training hyperparameters
- File paths for embeddings and structures

Example config structure:
```json
{
  "root": "/path/to/graph/data",
  "rna_strc_path": "/path/to/secondary/structure.txt",
  "model_path": "/path/to/save/model",
  "embed_path": "/path/to/embeddings.pkl",
  "length": 1133,
  "epochs": 100
}
```

## Setup and Installation

### Prerequisites

- Python 3.7+
- PyTorch
- PyTorch Geometric
- NumPy, Pandas
- RNA-FM (for embeddings)
- mxfold2 (for secondary structure prediction)

### Installation Steps

1. **Install PyTorch and PyTorch Geometric:**
   ```bash
   pip install torch torchvision torchaudio
   pip install torch-geometric
   ```

2. **Install other dependencies:**
   ```bash
   pip install numpy pandas scikit-learn
   ```

3. **Install RNA-FM for embeddings:**
   Follow RNA-FM installation instructions to generate embeddings.

4. **Install mxfold2 for secondary structure:**
   Follow mxfold2 installation instructions.

## Usage Guide

### 1. Preparing Your Dataset

#### Step 1: Create Dataset Directory

Create a folder for your dataset:
```bash
mkdir Dataset/YourDataset
```

#### Step 2: Prepare Data Files

- **CSV file**: Contains sgRNA sequences and efficiency labels
- **Secondary structure file**: Generated using mxfold2
- **Embedding file**: Generated using RNA-FM

#### Step 3: Create Dataset Script

Copy an existing dataset script and modify:

```python
# datasetYourDataset.py
import config
from adjust_common import YourDataset

# Update config path
fig = config('/path/to/config_YourDataset.json')

# Update sequence length
positional_encoding(max_len=20, d_model=640), dtype=torch.float32)

# Update processed file name
def processed_file_names(self):
    return ['YourDataset.pt']

# Update data path and label column
df = pd.read_csv("/path/to/YourDataset.csv", nrows=config.length)
g_label = row['Efficiencies(%)']  # Update column name
```

#### Step 4: Run Dataset Script

```bash
python datasetYourDataset.py
```

This will create a `processed/` folder with:
- `pre_filter.pt`
- `pre_transform.pt`
- `YourDataset.pt`

### 2. Configuration

Create or modify a config JSON file:

```json
{
  "root": "/path/to/Dataset/YourDataset/",
  "rna_strc_path": "/path/to/secondary_structure.txt",
  "model_path": "/path/to/save/best_model",
  "embed_path": "/path/to/embeddings.pkl",
  "length": 1000,
  "epochs": 100
}
```

**Key Parameters:**
- `root`: Path to graph data directory
- `rna_strc_path`: Path to secondary structure file
- `model_path`: Where to save the best model
- `embed_path`: Path to RNA-FM embeddings
- `length`: Number of samples
- `epochs`: Training epochs

### 3. Training

#### Step 1: Update Training Script

Modify `trainandtest*.py`:

```python
# Update config path
config_file_path = '/path/to/config_YourDataset.json'

# Update model save path
best_model_dir = '/path/to/save/best_model'

# Update result save paths
excel_path_mean = '/path/to/mean_results.xlsx'
excel_path_best = '/path/to/best_results.xlsx'
```

#### Step 2: Transfer Learning (Optional)

If using a pre-trained model:

```python
def initialize_model(...):
    model_path = '/path/to/pretrained_model.pt'
    checkpoint = torch.load(model_path)
    model = checkpoint['best_model']
```

#### Step 3: Run Training

```bash
python trainandtestYourDataset.py
```

Training will:
- Perform cross-validation (typically 5-6 fold)
- Save best models for each fold
- Generate Excel files with results

### 4. Prediction

#### Step 1: Update Prediction Script

Modify `predict*.py`:

```python
# Update config path
config_file_path = '/path/to/config_YourDataset.json'

# Update model path (use best model from training)
model_path = '/path/to/best_model/best_model_fold5_epoch33.pt'

# Update result save path
excel_path = '/path/to/prediction_results.xlsx'
```

#### Step 2: Run Prediction

```bash
python predictYourDataset.py
```

This will generate predictions on the test set and save results to Excel.

## Utility Scripts

### npy2tensor.py

Converts RNA-FM embedding .npy files to a single .pkl tensor file:

```python
# Update input and output paths
input_dir = "/path/to/RNA-FM/representation/"
output_path = "/path/to/embeddings_tensors.pkl"

python npy2tensor.py
```

### Secondary Structure Processing

After generating secondary structures with mxfold2, use the provided script to clean the output:

```bash
python delete.py  # Clean mxfold2 output
```

## Integration with AgroTerror

Graph-CRISPR is integrated into the AgroTerror platform through the `gene_edit_service` microservice.

### Graph-CRISPR Service Wrapper

Located at: `microservices/gene_edit_service/services/graph_crispr_service.py`

**Key Features:**
- Model loading and initialization
- Edit suggestion generation
- Efficiency prediction
- Mock predictions for development/testing

**Key Methods:**
- `load_model()`: Load Graph-CRISPR model from checkpoint
- `load_config()`: Load configuration from JSON file
- `suggest_edits()`: Generate CRISPR guide RNA suggestions
- `predict_edit_efficiency()`: Predict editing efficiency for a guide RNA

**Usage Example:**
```python
from services.graph_crispr_service import GraphCRISPRService

# Initialize service
graph_crispr = GraphCRISPRService(
    config_path="/path/to/config.json",
    model_path="/path/to/model.pt",
    device="cuda"  # or "cpu"
)

# Load model
graph_crispr.load_model()

# Suggest edits
suggestions = graph_crispr.suggest_edits(
    dna_sequence="ATCGATCGATCGATCG",
    target_region="1:1000-2000",
    max_suggestions=5
)

# Predict efficiency
efficiency = graph_crispr.predict_edit_efficiency(
    guide_rna="ATCGATCGATCGATCG",
    target_sequence="ATCGATCGATCGATCG"
)
```

## Data Formats

### Input CSV Format

CSV file with columns:
- Sequence column: sgRNA sequence
- Label column: Editing efficiency (percentage or score)

Example:
```csv
Sequence,Efficiencies(%)
ATCGATCGATCGATCG,75.5
GCTAGCTAGCTAGCT,82.3
```

### Secondary Structure Format

Text file with one structure per line (from mxfold2):
```
((((....))))
(((...)))
```

### Embedding Format

Pickle file containing tensor of embeddings:
- Shape: `[num_sequences, sequence_length, embedding_dim]`
- Generated from RNA-FM .npy files using `npy2tensor.py`

## Model Architecture Details

### Graph Construction

1. **Nodes**: Represent nucleotides in the sgRNA sequence
2. **Edges**: Connect adjacent nucleotides and base pairs
3. **Node Features**: Include:
   - Nucleotide identity (one-hot encoding)
   - Positional encoding
   - RNA-FM embeddings
   - Secondary structure information

### Network Layers

1. **Graph Convolutional Layers**: Process local graph neighborhoods
2. **Attention Layers**: Weight important sequence regions
3. **Pooling Layers**: Aggregate to graph-level representation
4. **Fully Connected Layers**: Final prediction

### Training Process

- **Cross-Validation**: Typically 5-6 fold
- **Early Stopping**: Based on validation performance
- **Model Selection**: Best model per fold saved
- **Hyperparameter Tuning**: Can use Optuna (optional)

## Performance Optimization

### Tips for Better Performance

1. **Data Quality**: Ensure high-quality sequences and labels
2. **Embeddings**: Use high-quality RNA-FM embeddings
3. **Secondary Structure**: Accurate structure prediction improves results
4. **Hyperparameters**: Tune learning rate, batch size, etc.
5. **Transfer Learning**: Use pre-trained models when available

### Hardware Requirements

- **Training**: GPU recommended (CUDA-capable)
- **Memory**: Depends on dataset size and batch size
- **Storage**: Space for processed graphs and models

## Troubleshooting

### Common Issues

1. **Graph Data Not Generated**:
   - Check dataset script configuration
   - Verify data file paths
   - Ensure proper data format

2. **Model Not Loading**:
   - Verify model path
   - Check model checkpoint format
   - Ensure model architecture matches

3. **Out of Memory**:
   - Reduce batch size
   - Use smaller sequences
   - Process data in chunks

4. **Poor Performance**:
   - Check data quality
   - Verify embeddings and structures
   - Tune hyperparameters
   - Consider transfer learning

## Dataset-Specific Notes

### Base Editor (BE) Dataset

- Used for base editing efficiency prediction
- Config: `config_BE.json`
- Script: `trainandtestBE.py`, `datasetBE.py`

### Prime Editor (PE) Dataset

- Used for prime editing efficiency prediction
- Config: `config_PE.json` (if available)
- Similar structure to BE dataset

### Wild-Type (WT) Dataset

- Used for standard Cas9 editing
- Config: `config_WTset.json`
- Script: `trainandtestWT.py`

## Best Practices

1. **Data Preparation**:
   - Clean and validate sequences
   - Normalize efficiency scores
   - Handle missing data appropriately

2. **Model Training**:
   - Use cross-validation
   - Monitor validation performance
   - Save checkpoints regularly

3. **Evaluation**:
   - Use appropriate metrics (MSE, MAE, R²)
   - Compare with baseline methods
   - Analyze prediction errors

4. **Deployment**:
   - Optimize model for inference
   - Implement caching for repeated queries
   - Handle edge cases gracefully

## Future Enhancements

Potential improvements:
- Support for longer sequences
- Multi-task learning
- Integration with more CRISPR systems
- Real-time prediction API
- Batch processing capabilities
- Model ensemble methods

## Resources

- **Original Repository**: Check project repository
- **RNA-FM**: https://github.com/zhanglabtools/RNA-FM
- **mxfold2**: https://github.com/mxfold/mxfold2
- **PyTorch Geometric**: https://pytorch-geometric.readthedocs.io/

## Notes

- The model requires graph data, so always run dataset processing first
- Secondary structure and embeddings significantly impact performance
- Transfer learning from pre-trained models can improve results
- Model performance varies by dataset and task

