# VaaniConnect Backend Setup Guide

## Prerequisites
- Python 3.10 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## Installation Steps

### 1. Create Virtual Environment
```bash
# Windows
python -m venv venv

# Linux/Mac
python3 -m venv venv
```

### 2. Activate Virtual Environment
```bash
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
.\venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate
```

### 3. Upgrade pip
```bash
python -m pip install --upgrade pip
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

**Note:** If you encounter any errors during installation, try installing the problematic packages individually:

```bash
# Core dependencies
pip install tiktoken
pip install protobuf
pip install sentencepiece
pip install transformers==4.57.1
pip install torch==2.9.0
pip install torchaudio==2.9.0
pip install Flask==3.1.2
pip install flask-cors==5.0.0
pip install soundfile==0.13.1
pip install scipy==1.14.1
pip install numpy==1.26.4
```

### 5. Verify Installation
```bash
python -c "import transformers; import torch; import soundfile; print('✅ All dependencies installed successfully!')"
```

## Running the Server

### Start the Flask Backend
```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`

You should see:
```
Loading model... this may take a few minutes ⏳
✅ Model loaded successfully!
 * Serving Flask app 'app'
 * Debug mode: off
 * Running on http://127.0.0.1:5000
```

## Troubleshooting

### Error: ModuleNotFoundError: No module named 'tiktoken'
**Solution:**
```bash
pip install tiktoken
```

### Error: protobuf library not found
**Solution:**
```bash
pip install protobuf
```

### Error: sentencepiece not found
**Solution:**
```bash
pip install sentencepiece
```

### Error: Model download fails or takes too long
**Solution:**
- Make sure you have a stable internet connection
- The model (facebook/hf-seamless-m4t-medium) is ~2.5GB and will be downloaded on first run
- Model will be cached in `~/.cache/huggingface/hub/` for future use

### Error: Out of memory
**Solution:**
- The model requires at least 8GB RAM
- Close other applications to free up memory
- Consider using the smaller model: `facebook/hf-seamless-m4t-small` (modify in app.py)

## Project Structure
```
backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── SETUP.md              # This file
├── venv/                 # Virtual environment (not in git)
├── audio_outputs/        # Generated audio files
└── .gitignore           # Git ignore rules
```

## API Endpoints

- `GET /` - Health check
- `POST /translate` - Text-to-text translation
- `POST /text-to-speech` - Text-to-speech generation
- `POST /speech-to-text` - Speech-to-text transcription
- `POST /speech-to-speech` - Speech-to-speech translation
- `GET /output.wav` - Serve generated audio file

## Supported Languages

36 languages are supported for all features:
Afrikaans, Amharic, Arabic, Assamese, Azerbaijani, Bulgarian, Bengali, Bosnian, Catalan, Czech, Welsh, Danish, German, Greek, English, Spanish, Estonian, Persian, Finnish, French, Irish, Galician, Gujarati, Hebrew, Hindi, Croatian, Hungarian, Indonesian, Icelandic, Italian, Japanese, Georgian, Kazakh, Khmer, Kannada, Korean, Lithuanian, Luxembourgish, Lao, Marathi, Macedonian, Malayalam, Mongolian, Burmese, Dutch, Norwegian, Nepali, Oriya, Punjabi, Polish, Portuguese, Romanian, Russian, Sindhi, Sinhala, Slovak, Slovenian, Somali, Serbian, Swedish, Swahili, Tamil, Telugu, Tajik, Thai, Tagalog, Turkish, Ukrainian, Urdu, Uzbek (Northern), Vietnamese

## Support

If you encounter any issues:
1. Check this SETUP.md file for common solutions
2. Verify all dependencies are installed: `pip list`
3. Check Python version: `python --version` (should be 3.10+)
4. Check the error messages in the terminal
5. Contact the development team

## License

This project uses Meta's SeamlessM4T model which is licensed under CC-BY-NC 4.0.
