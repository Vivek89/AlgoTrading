# AlgoTrading - Node.js Path Setup Script (PowerShell)

Write-Host "Checking for Node.js installation..."

# Check if node is available
$nodeCheck = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Node.js is already installed: $nodeCheck"
    Write-Host "npm version: $(npm --version)"
    exit 0
}

Write-Host ""
Write-Host "Node.js is NOT installed on your system."
Write-Host ""
Write-Host "Please install Node.js LTS (Long-Term Support):"
Write-Host "1. Visit: https://nodejs.org/"
Write-Host "2. Download the LTS version"
Write-Host "3. Run the installer"
Write-Host "4. Restart your terminal"
Write-Host ""
Write-Host "After installation, verify it works:"
Write-Host "  node --version"
Write-Host "  npm --version"
Write-Host ""
Write-Host "Alternative installation methods:"
Write-Host ""
Write-Host "Using Chocolatey (if installed):"
Write-Host "  choco install nodejs"
Write-Host ""
Write-Host "Using Windows Package Manager (Windows 11+):"
Write-Host "  winget install OpenJS.NodeJS"
Write-Host ""

Read-Host "Press Enter when Node.js is installed"

# Check again
$nodeCheck = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Great! Node.js is now installed: $nodeCheck"
    Write-Host "npm version: $(npm --version)"
} else {
    Write-Host "Node.js is still not found. Please ensure it's installed and in your PATH."
}
