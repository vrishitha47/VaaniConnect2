@echo off
echo ================================================
echo VaaniConnect Backend Setup Script
echo ================================================
echo.

echo [1/6] Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10 or higher from https://www.python.org/
    pause
    exit /b 1
)
echo.

echo [2/6] Creating virtual environment...
if exist venv (
    echo Virtual environment already exists
) else (
    python -m venv venv
    echo Virtual environment created successfully
)
echo.

echo [3/6] Activating virtual environment...
call venv\Scripts\activate.bat
echo.

echo [4/6] Upgrading pip...
python -m pip install --upgrade pip
echo.

echo [5/6] Installing dependencies...
echo This may take several minutes...
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo WARNING: Some packages failed to install
    echo Trying to install critical packages individually...
    echo.
    pip install tiktoken
    pip install protobuf
    pip install sentencepiece
    pip install transformers==4.57.1
    pip install torch==2.9.0
    pip install Flask==3.1.2
    pip install flask-cors==5.0.0
    pip install soundfile==0.13.1
)
echo.

echo [6/6] Verifying installation...
python -c "import transformers; import torch; import soundfile; import tiktoken; import protobuf; import sentencepiece; print('✅ All critical dependencies installed successfully!')"
if errorlevel 1 (
    echo.
    echo WARNING: Some dependencies are missing
    echo Please check the error messages above
    echo.
) else (
    echo.
    echo ================================================
    echo ✅ Setup completed successfully!
    echo ================================================
    echo.
    echo To start the server, run:
    echo   venv\Scripts\activate.bat
    echo   python app.py
    echo.
)

pause
