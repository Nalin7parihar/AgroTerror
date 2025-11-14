# DNABERT Microservice Documentation

## Overview

DNABERT is a pre-trained Bidirectional Encoder Representations from Transformers model specifically designed for DNA-language understanding in genomes. It provides a foundation for various genomic analysis tasks including sequence classification, mutation analysis, and genomic variant prediction.

## What is DNABERT?

DNABERT is a transformer-based model that treats DNA sequences as a language, enabling deep learning approaches to genomic analysis. It was introduced in the paper "DNABERT: pre-trained Bidirectional Encoder Representations from Transformers model for DNA-language in genome" by Ji et al. (2021).

### Key Features

- **Pre-trained Models**: Available for k-mer sizes 3, 4, 5, and 6
- **Fine-tuning Support**: Can be fine-tuned for specific tasks
- **Sequence Analysis**: Handles DNA sequences up to 512 tokens
- **Mutation Analysis**: Supports SNP and variant effect prediction
- **Motif Discovery**: Attention-based motif identification
- **Visualization Tools**: Attention score visualization

## Architecture

```
DNABERT/
├── src/
│   └── transformers/          # Modified HuggingFace transformers
│       └── dnabert-config/    # Model configurations
├── examples/                  # Usage examples and scripts
│   ├── run_pretrain.py       # Pre-training script
│   ├── run_finetune.py       # Fine-tuning script
│   ├── compute_result.py     # Result computation
│   └── visualize.py          # Visualization tools
├── motif/                     # Motif analysis tools
│   ├── find_motifs.py        # Motif discovery
│   └── motif_utils.py        # Utility functions
├── SNP/                       # SNP analysis tools
│   ├── mutate_seqs.py        # Sequence mutation
│   └── SNP.py                # SNP effect analysis
└── setup.py                   # Package installation
```

## Model Variants

DNABERT models are available in different k-mer sizes:

- **DNABERT-3**: 3-mer tokenization
- **DNABERT-4**: 4-mer tokenization
- **DNABERT-5**: 5-mer tokenization
- **DNABERT-6**: 6-mer tokenization (most commonly used)

### Model Availability

Pre-trained models are available on HuggingFace:
- DNABERT-3: https://huggingface.co/zhihan1996/DNA_bert_3
- DNABERT-4: https://huggingface.co/zhihan1996/DNA_bert_4
- DNABERT-5: https://huggingface.co/zhihan1996/DNA_bert_5
- DNABERT-6: https://huggingface.co/zhihan1996/DNA_bert_6

## Installation

### Prerequisites

- Python 3.6+
- CUDA-capable GPU (recommended) or CPU
- NVIDIA Driver Version >= 410.48 (for CUDA 10.0)
- Anaconda (recommended)

### Setup Steps

1. **Create and activate conda environment:**
   ```bash
   conda create -n dnabert python=3.6
   conda activate dnabert
   ```

2. **Install PyTorch:**
   ```bash
   conda install pytorch torchvision cudatoolkit=10.0 -c pytorch
   ```

3. **Install DNABERT:**
   ```bash
   git clone https://github.com/jerryji1993/DNABERT
   cd DNABERT
   python3 -m pip install --editable .
   cd examples
   python3 -m pip install -r requirements.txt
   ```

4. **Optional - Install Apex for FP16 training:**
   ```bash
   git clone https://github.com/NVIDIA/apex
   cd apex
   pip install -v --no-cache-dir --global-option="--cpp_ext" --global-option="--cuda_ext" ./
   ```

## Usage

### 1. Pre-training (Optional)

If you want to pre-train DNABERT on your own data:

#### Data Preparation

1. Convert sequences to k-mer format
2. Prepare data in the format shown in `examples/sample_data/pre/`
3. Use `motif/motif_utils.py` for sequence to k-mer conversion

#### Training Command

```bash
cd examples

export KMER=6
export TRAIN_FILE=sample_data/pre/6_3k.txt
export TEST_FILE=sample_data/pre/6_3k.txt
export SOURCE=PATH_TO_DNABERT_REPO
export OUTPUT_PATH=output$KMER

python run_pretrain.py \
    --output_dir $OUTPUT_PATH \
    --model_type=dna \
    --tokenizer_name=dna$KMER \
    --config_name=$SOURCE/src/transformers/dnabert-config/bert-config-$KMER/config.json \
    --do_train \
    --train_data_file=$TRAIN_FILE \
    --do_eval \
    --eval_data_file=$TEST_FILE \
    --mlm \
    --gradient_accumulation_steps 25 \
    --per_gpu_train_batch_size 10 \
    --per_gpu_eval_batch_size 6 \
    --save_steps 500 \
    --save_total_limit 20 \
    --max_steps 200000 \
    --evaluate_during_training \
    --logging_steps 500 \
    --line_by_line \
    --learning_rate 4e-4 \
    --block_size 512 \
    --adam_epsilon 1e-6 \
    --weight_decay 0.01 \
    --beta1 0.9 \
    --beta2 0.98 \
    --mlm_probability 0.025 \
    --warmup_steps 10000 \
    --overwrite_output_dir \
    --n_process 24
```

Add `--fp16` flag for mixed precision training (requires Apex).

### 2. Fine-tuning

Fine-tune DNABERT on a specific task:

#### Data Preparation

1. Prepare data in TSV format (see `examples/sample_data/ft/`)
2. Convert sequences to k-mer format
3. Include labels for your task

#### Download Pre-trained Model

Download the pre-trained model from HuggingFace or the original repository.

#### Fine-tuning Command

```bash
cd examples

export KMER=6
export MODEL_PATH=PATH_TO_THE_PRETRAINED_MODEL
export DATA_PATH=sample_data/ft/$KMER
export OUTPUT_PATH=./ft/$KMER

python run_finetune.py \
    --model_type dna \
    --tokenizer_name=dna$KMER \
    --model_name_or_path $MODEL_PATH \
    --task_name dnaprom \
    --do_train \
    --do_eval \
    --data_dir $DATA_PATH \
    --max_seq_length 100 \
    --per_gpu_eval_batch_size=32 \
    --per_gpu_train_batch_size=32 \
    --learning_rate 2e-4 \
    --num_train_epochs 5.0 \
    --output_dir $OUTPUT_PATH \
    --evaluate_during_training \
    --logging_steps 100 \
    --save_steps 4000 \
    --warmup_percent 0.1 \
    --hidden_dropout_prob 0.1 \
    --overwrite_output \
    --weight_decay 0.01 \
    --n_process 8
```

### 3. Prediction

Make predictions on new sequences:

```bash
export KMER=6
export MODEL_PATH=./ft/$KMER
export DATA_PATH=sample_data/ft/$KMER
export PREDICTION_PATH=./result/$KMER

python run_finetune.py \
    --model_type dna \
    --tokenizer_name=dna$KMER \
    --model_name_or_path $MODEL_PATH \
    --task_name dnaprom \
    --do_predict \
    --data_dir $DATA_PATH \
    --max_seq_length 75 \
    --per_gpu_pred_batch_size=128 \
    --output_dir $MODEL_PATH \
    --predict_dir $PREDICTION_PATH \
    --n_process 48
```

### 4. Visualization

Generate attention scores for visualization:

```bash
export KMER=6
export MODEL_PATH=./ft/$KMER
export DATA_PATH=sample_data/ft/$KMER
export PREDICTION_PATH=./result/$KMER

python run_finetune.py \
    --model_type dna \
    --tokenizer_name=dna$KMER \
    --model_name_or_path $MODEL_PATH \
    --task_name dnaprom \
    --do_visualize \
    --visualize_data_dir $DATA_PATH \
    --visualize_models $KMER \
    --data_dir $DATA_PATH \
    --max_seq_length 81 \
    --per_gpu_pred_batch_size=16 \
    --output_dir $MODEL_PATH \
    --predict_dir $PREDICTION_PATH \
    --n_process 96
```

### 5. Motif Analysis

Discover motifs using attention scores:

```bash
cd ../motif

export KMER=6
export DATA_PATH=../examples/sample_data/ft/$KMER
export PREDICTION_PATH=../examples/result/$KMER
export MOTIF_PATH=./result/$KMER

python find_motifs.py \
    --data_dir $DATA_PATH \
    --predict_dir $PREDICTION_PATH \
    --window_size 24 \
    --min_len 5 \
    --pval_cutoff 0.005 \
    --min_n_motif 3 \
    --align_all_ties \
    --save_file_dir $MOTIF_PATH \
    --verbose
```

### 6. SNP Analysis

Analyze the effect of mutations:

#### Step 1: Create Mutation File

Create a file specifying mutations (see `SNP/example_mut_file.txt`):
- Column 1: Sequence index in dev.tsv
- Column 2: Start position
- Column 3: End position
- Column 4: Mutation target

#### Step 2: Mutate Sequences

```bash
cd ../SNP
python mutate_seqs.py \
    ./../examples/sample_data/ft/6/dev.tsv \
    ./examples/ \
    --mut_file ./example_mut_file.txt \
    --k 6
```

#### Step 3: Predict on Mutated Sequences

```bash
# Run prediction on mutated sequences
# (use same command as prediction section)
```

#### Step 4: Compute Mutation Effects

```bash
python SNP.py \
    --orig_seq_file ../examples/sample_data/ft/6/dev.tsv \
    --orig_pred_file ../examples/result/6/pred_results.npy \
    --mut_seq_file examples/dev.tsv \
    --mut_pred_file examples/pred_results.npy \
    --save_file_dir examples
```

## Integration with AgroTerror

DNABERT is integrated into the AgroTerror platform through the `gene_edit_service` microservice. The integration provides:

### DNABERT Service Wrapper

Located at: `microservices/gene_edit_service/services/dnabert_service.py`

**Key Features:**
- Model loading and initialization
- Sequence scoring and validation
- Mutation effect prediction
- Mock predictions for development/testing

**Key Methods:**
- `load_model()`: Load DNABERT model from path
- `predict_sequence_score()`: Get prediction score for a sequence
- `validate_mutation()`: Validate mutations by comparing original vs mutated sequences
- `seq2kmer()`: Convert DNA sequence to k-mer format

**Usage Example:**
```python
from services.dnabert_service import DNABERTService

# Initialize service
dnabert = DNABERTService(
    model_path="/path/to/dnabert_model",
    kmer=6,
    device="cuda"  # or "cpu"
)

# Load model
dnabert.load_model()

# Predict sequence score
score = dnabert.predict_sequence_score("ATCGATCGATCG")

# Validate mutation
result = dnabert.validate_mutation(
    original_sequence="ATCGATCGATCG",
    mutated_sequence="ATCGATCGATCA",
    mutation_position=11,
    threshold=0.1
)
```

## Data Formats

### Pre-training Data Format

Plain text file with one sequence per line (in k-mer format):
```
ATCGAT ATCGAT TCGATC ...
GCTAGC GCTAGC CTAGCT ...
```

### Fine-tuning Data Format

TSV file with columns:
- Column 1: Label
- Column 2: Sequence (in k-mer format)

Example:
```
0    ATCGAT ATCGAT TCGATC
1    GCTAGC GCTAGC CTAGCT
```

### Mutation File Format

TSV file with columns:
- Column 1: Sequence index
- Column 2: Start position
- Column 3: End position
- Column 4: Mutation target

Example:
```
0    10    12    ATC
1    5     7     GCT
```

## Key Concepts

### K-mer Tokenization

DNA sequences are converted to k-mers (overlapping substrings of length k) before processing:
- Original: `ATCGATCG`
- 3-mer: `ATC TCG CGA GAT ATC TCG`
- 6-mer: `ATCGAT TCGATC CGATCG`

### Sequence Length Limits

- Maximum sequence length: 512 tokens (after k-mer conversion)
- For longer sequences, truncation or chunking is required

### Model Architecture

- Based on BERT architecture
- Bidirectional encoder
- Multi-head attention
- Task-specific classification heads for fine-tuning

## Performance Considerations

### Hardware Requirements

- **Training**: 8x NVIDIA GeForce RTX 2080 Ti (11GB) recommended
- **Inference**: Single GPU or CPU (slower)
- **Memory**: Adjust batch size based on available GPU memory

### Optimization Tips

1. **Batch Size**: Adjust based on GPU memory
2. **Mixed Precision**: Use `--fp16` flag for faster training
3. **Gradient Accumulation**: Use for effective larger batch sizes
4. **Sequence Length**: Shorter sequences = faster processing

## Troubleshooting

### Common Issues

1. **CUDA Out of Memory**:
   - Reduce batch size
   - Use gradient accumulation
   - Use CPU instead of GPU

2. **Model Not Loading**:
   - Verify model path
   - Check model compatibility with k-mer size
   - Ensure all dependencies are installed

3. **Sequence Length Errors**:
   - Ensure sequences are within 512 token limit
   - Check k-mer conversion
   - Verify max_seq_length parameter

## DNABERT-2

Note: A newer version, DNABERT-2, is available with improvements:
- Multi-species genome training
- More efficient architecture
- Easier to use
- Comprehensive benchmark (GUE)

Repository: https://github.com/Zhihan1996/DNABERT_2

## Citation

If you use DNABERT in your research, please cite:

```bibtex
@article{ji2021dnabert,
    author = {Ji, Yanrong and Zhou, Zhihan and Liu, Han and Davuluri, Ramana V},
    title = "{DNABERT: pre-trained Bidirectional Encoder Representations from Transformers model for DNA-language in genome}",
    journal = {Bioinformatics},
    volume = {37},
    number = {15},
    pages = {2112-2120},
    year = {2021},
    month = {02},
    issn = {1367-4803},
    doi = {10.1093/bioinformatics/btab083}
}
```

## Resources

- **Original Repository**: https://github.com/jerryji1993/DNABERT
- **HuggingFace Models**: https://huggingface.co/zhihan1996
- **Paper**: https://doi.org/10.1093/bioinformatics/btab083
- **DNABERT-2**: https://github.com/Zhihan1996/DNABERT_2

