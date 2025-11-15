@echo off
REM Run server using uv (recommended for Windows)
REM This ensures the correct Python environment is used

cd /d "%~dp0"
uv run uvicorn main:app --host localhost --port 8000 --reload

