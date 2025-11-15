#!/bin/bash
# Run server using uv (recommended)
# This ensures the correct Python environment is used

cd "$(dirname "$0")"
uv run uvicorn main:app --host localhost --port 8000 --reload

