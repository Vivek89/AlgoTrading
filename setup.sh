#!/bin/bash

# AlgoTrading - Local Development Setup Script

echo "Starting AlgoTrading Local Development..."

# Check Python
echo "Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "Python not found. Please install Python 3.12+"
    exit 1
fi

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Install UV package manager (if not already installed)
echo "Installing UV package manager..."
pip3 install uv

# Check if venv exists at workspace level (parallel to AlgoTrading)
echo "Checking for virtual environment..."
if [ ! -d "../venv" ]; then
    echo "Creating virtual environment at workspace level..."
    cd ..
    uv venv venv
    cd AlgoTrading
else
    echo "Virtual environment found at workspace level"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source ../venv/bin/activate

# Set UV environment variables
echo "Setting UV environment variables..."
export UV_VENV="../venv"
export UV_PYTHON="$(pwd)/../venv/bin/python"
export UV_INDEX_URL="https://pypi.org/simple/"

# Install dependencies with UV
echo "Installing Python dependencies with UV..."
uv sync --all-extras

# Initialize SQLite database
echo "Initializing SQLite database..."
if [ -f "ddl/schema.sql" ]; then
    sqlite3 algo_trading.db < ddl/schema.sql
    echo "Database schema imported successfully"
else
    echo "Warning: ddl/schema.sql not found. Skipping database initialization."
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Backend is configured with SQLite database"
echo "2. Start backend: uvicorn app.main:app --reload"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. cd /Users/apple/Documents/workspace/algo_trading/AlgoTrading/frontend && npm run dev"
echo ""
echo "Access:"
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
