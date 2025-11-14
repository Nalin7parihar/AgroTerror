#!/bin/bash
# Quick setup and test script for gene_edit_service

set -e

echo "=========================================="
echo "Gene Edit Service - Test Setup"
echo "=========================================="
echo ""

# Check if Redis is running
echo "1. Checking Redis connection..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "   ✓ Redis is running"
    else
        echo "   ✗ Redis is not running"
        echo "   Starting Redis with Docker..."
        if command -v docker &> /dev/null; then
            docker run -d --name redis-test -p 6379:6379 redis:7-alpine 2>/dev/null || \
            docker start redis-test 2>/dev/null || \
            echo "   Please start Redis manually: docker run -d --name redis -p 6379:6379 redis:7-alpine"
        else
            echo "   Please install and start Redis manually"
        fi
    fi
else
    echo "   ⚠ redis-cli not found - skipping Redis check"
    echo "   Service will work without Redis (no caching)"
fi

echo ""
echo "2. Checking Python dependencies..."
if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi

echo "   Activating virtual environment..."
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

echo "   Installing dependencies..."
pip install -q -r requirements.txt

echo ""
echo "3. Checking data files..."
DATA_DIR="../data"
if [ -d "$DATA_DIR" ]; then
    BIM_COUNT=$(find "$DATA_DIR" -name "*.bim" | wc -l)
    echo "   ✓ Found $BIM_COUNT .bim files in data directory"
else
    echo "   ✗ Data directory not found at $DATA_DIR"
fi

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "To start the service:"
echo "  python main.py"
echo ""
echo "To run tests:"
echo "  python test_optimizations.py"
echo ""
echo "To check API docs:"
echo "  http://localhost:8001/docs"
echo ""

