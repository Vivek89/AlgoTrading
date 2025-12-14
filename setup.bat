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


REM Check if venv exists at workspace level (parallel to AlgoTrading)
echo Checking for virtual environment...
if not exist "..\algo_venv" (
    echo Creating virtual environment at workspace level...
    cd ..
    python -m venv algo_venv
    cd AlgoTrading
) else (
    echo Virtual environment found at workspace level
)

REM Activate virtual environment
echo Activating virtual environment...
call ..\algo_venv\Scripts\activate.bat

REM Set UV environment variables
echo Setting UV environment variables...
set UV_VENV=..\algo_venv
set UV_PYTHON=%CD%\..\algo_venv\Scripts\python.exe
set UV_INDEX_URL=https://pypi.org/simple/

REM Install UV package manager in venv
echo Installing UV package manager...
python -m pip install uv

REM Install dependencies with UV
echo Installing dependencies with UV...
python -m uv sync --all-extras --active

REM Create .env file
echo Creating .env file...
if not exist ".env" (
    copy .env.example .env
)

Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser

echo.
echo Backend setup complete!
echo.
echo Next steps:
echo 1. Edit .env with your Google OAuth credentials
echo 2. Run backend (from AlgoTrading directory):
echo    METHOD 1: ..\algo_venv\Scripts\python.exe -m uvicorn app.main:app --reload
echo    METHOD 2: ..\algo_venv\Scripts\activate.bat then uvicorn app.main:app --reload
echo 3. Frontend setup (in new terminal):
echo    CMD: cd frontend && npm install && npm start
echo    PowerShell: cd frontend; npm install; npm start
echo.
echo Access:
echo    Backend: http://localhost:8000
echo    Frontend: http://localhost:3000
echo    Docs: http://localhost:8000/docs
echo.
pause
