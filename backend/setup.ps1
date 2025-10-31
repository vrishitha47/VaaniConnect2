# VaaniConnect Backend Setup Script (PowerShell)
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "VaaniConnect Backend Setup Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Python installation
Write-Host "[1/6] Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host $pythonVersion -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.10 or higher from https://www.python.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Create virtual environment
Write-Host "[2/6] Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists" -ForegroundColor Green
} else {
    python -m venv venv
    Write-Host "Virtual environment created successfully" -ForegroundColor Green
}
Write-Host ""

# Activate virtual environment
Write-Host "[3/6] Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host ""

# Upgrade pip
Write-Host "[4/6] Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip
Write-Host ""

# Install dependencies
Write-Host "[5/6] Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Cyan
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "WARNING: Some packages failed to install" -ForegroundColor Yellow
    Write-Host "Trying to install critical packages individually..." -ForegroundColor Yellow
    Write-Host ""
    
    $packages = @(
        "tiktoken",
        "protobuf",
        "sentencepiece",
        "transformers==4.57.1",
        "torch==2.9.0",
        "Flask==3.1.2",
        "flask-cors==5.0.0",
        "soundfile==0.13.1",
        "scipy==1.14.1",
        "numpy==1.26.4"
    )
    
    foreach ($package in $packages) {
        Write-Host "Installing $package..." -ForegroundColor Cyan
        pip install $package
    }
}
Write-Host ""

# Verify installation
Write-Host "[6/6] Verifying installation..." -ForegroundColor Yellow
$verifyScript = @"
import transformers
import torch
import soundfile
import tiktoken
import sentencepiece
print('✅ All critical dependencies installed successfully!')
"@

python -c $verifyScript

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start the server, run:" -ForegroundColor Cyan
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    Write-Host "  python app.py" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "WARNING: Some dependencies are missing" -ForegroundColor Yellow
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "Press Enter to exit"
