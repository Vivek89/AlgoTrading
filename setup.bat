@echo off
REM AlgoTrading - Local Development Setup Script (Windows)

echo.
echo Starting AlgoTrading Local Development...
echo.

REM Check Python
echo Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found. Please install Python 3.12+
    pause
    exit /b 1
)

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

REM Check if venv exists at workspace level (parallel to AlgoTrading)
echo Checking for virtual environment...
if not exist "..\venv" (
    echo Creating virtual environment at workspace level...
    cd ..
    python -m venv venv
    cd AlgoTrading
) else (
    echo Virtual environment found at workspace level
)

REM Activate virtual environment
echo Activating virtual environment...
call ..\venv\Scripts\activate.bat

REM Set UV environment variables
echo Setting UV environment variables...
set UV_VENV=..\venv
set UV_PYTHON=%CD%\..\venv\Scripts\python.exe
set UV_INDEX_URL=https://pypi.org/simple/

REM Install UV package manager in venv
echo Installing UV package manager...
python -m pip install uv

REM Install dependencies with UV
echo Installing Python dependencies with UV...
python -m uv sync --all-extras

REM Initialize SQLite database
echo Initializing SQLite database...
if exist "ddl\schema.sql" (
    sqlite3 algo_trading.db < ddl\schema.sql
    echo Database schema imported successfully
) else (
    echo Warning: ddl\schema.sql not found. Skipping database initialization.
)

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Backend is configured with SQLite database
echo 2. Start backend: ..\venv\Scripts\python.exe -m uvicorn app.main:app --reload
echo 3. Start frontend: cd frontend ^&^& npm run dev
echo.
echo Access:
echo    Backend: http://localhost:8000
echo    Frontend: http://localhost:3000
echo    API Docs: http://localhost:8000/docs
echo.
pause
