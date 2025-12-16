@echo off
echo ================================
echo AlgoTrading Sprint 1 Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% found
echo.

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed
echo.

echo ================================
echo ✅ Sprint 1 Setup Complete!
echo ================================
echo.
echo Next steps:
echo.
echo 1. Update .env.local with your Google OAuth credentials:
echo    - GOOGLE_CLIENT_ID
echo    - GOOGLE_CLIENT_SECRET
echo    - NEXTAUTH_SECRET (generate with: powershell [Convert]::ToBase64String([byte[]][Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32)))
echo.
echo 2. Make sure backend is running:
echo    cd ..\AlgoTrading
echo    python -m uvicorn app.main:app --reload
echo.
echo 3. Start frontend development server:
echo    npm run dev
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo 📚 For more info, see README.md
echo.
pause
