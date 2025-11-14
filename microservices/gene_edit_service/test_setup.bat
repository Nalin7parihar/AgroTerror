@echo off
REM Quick setup and test script for gene_edit_service (Windows)

echo ==========================================
echo Gene Edit Service - Test Setup
echo ==========================================
echo.

REM Check if Redis is running
echo 1. Checking Redis connection...
where redis-cli >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    redis-cli ping >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo    ✓ Redis is running
    ) else (
        echo    ✗ Redis is not running
        echo    Please start Redis manually or use Docker:
        echo    docker run -d --name redis -p 6379:6379 redis:7-alpine
    )
) else (
    echo    ⚠ redis-cli not found - skipping Redis check
    echo    Service will work without Redis (no caching)
)

echo.
echo 2. Checking Python dependencies...
if not exist "venv" (
    echo    Creating virtual environment...
    python -m venv venv
)

echo    Activating virtual environment...
call venv\Scripts\activate.bat

echo    Installing dependencies...
pip install -q -r requirements.txt

echo.
echo 3. Checking data files...
if exist "..\data" (
    echo    ✓ Data directory found
) else (
    echo    ✗ Data directory not found at ..\data
)

echo.
echo ==========================================
echo Setup complete!
echo ==========================================
echo.
echo To start the service:
echo   python main.py
echo.
echo To run tests:
echo   python test_optimizations.py
echo.
echo To check API docs:
echo   http://localhost:8001/docs
echo.

pause

