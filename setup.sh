#!/bin/bash

# AlgoTrading - Local Development Setup Script

echo "Starting AlgoTrading Local Development..."

# Check Python
echo "Checking Python..."
if ! command -v python &> /dev/null; then
    echo "Python not found. Please install Python 3.12+"
    exit 1
fi

# Check PostgreSQL
echo "Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL not found. Please install PostgreSQL 13+"
    exit 1
fi

# Install UV package manager (if not already installed)
echo "Installing UV package manager..."
pip install uv

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
echo "Installing dependencies with UV..."
uv sync --all-extras

# Create database
echo "Creating database..."
psql -U postgres -c "CREATE DATABASE algotrading;" 2>/dev/null || true
psql -U postgres -c "CREATE USER algotrading WITH PASSWORD 'password';" 2>/dev/null || true
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE algotrading TO algotrading;" 2>/dev/null || true

# Import schema
echo "Importing database schema..."
psql -U algotrading -d algotrading -f ddl/schema.sql

# Create .env file
echo "Creating .env file..."
cp .env.example .env

echo ""
echo "Backend setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env with your Google OAuth credentials"
echo "2. Run: uvicorn app.main:app --reload"
echo "3. Frontend: cd frontend && npm install && npm start"
echo ""
echo "🌐 Access:"
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo "   Docs: http://localhost:8000/docs"
