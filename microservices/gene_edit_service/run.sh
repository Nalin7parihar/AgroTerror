#!/bin/bash

# Gene Edit Microservice Startup Script

echo "Starting Gene Edit Microservice..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Run the service
echo "Starting FastAPI server..."
python main.py

