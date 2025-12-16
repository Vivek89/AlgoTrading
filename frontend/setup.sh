#!/bin/bash

echo "================================"
echo "AlgoTrading Sprint 1 Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✓ Node.js $(node --version) found"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "================================"
echo "✅ Sprint 1 Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Update .env.local with your Google OAuth credentials:"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
echo ""
echo "2. Make sure backend is running:"
echo "   cd ../AlgoTrading"
echo "   python -m uvicorn app.main:app --reload"
echo ""
echo "3. Start frontend development server:"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more info, see README.md"
