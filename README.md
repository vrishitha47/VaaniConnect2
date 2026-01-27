# 🎙️ VaaniConnect: Universal AI Translation Platform

VaaniConnect is a high-performance, AI-driven translation platform designed to break language barriers through seamless **Text-to-Text**, **Text-to-Speech**, and **Speech-to-Speech** communication. 

Powered by **Meta's SeamlessM4T (Massively Multilingual & Multimodal Machine Translation)** model, VaaniConnect provides a unified interface for translating over 36 languages with high accuracy and natural-sounding voice synthesis.

---

## 📖 About the Project

VaaniConnect was built to demonstrate the power of modern multimodal AI. Unlike traditional translation apps that use separate models for transcription, translation, and synthesis, VaaniConnect utilizes a **unified model architecture**. This reduces errors and ensures that the nuances of the original speech are preserved throughout the translation process.

### Core Objectives:
- **Multimodal Flexibility:** Handle any combination of text and audio input/output.
- **Low Latency:** Streamline API calls to ensure quick response times for real-time interaction.
- **Aesthetic UI:** A clean, glassmorphic React interface designed for both desktop and mobile use.

---

## 🚀 Key Features

### 1. ✍️ Text-to-Text Translation
Simple yet powerful translation between dozens of languages. Ideal for quick messaging and document snapshots.

### 2. 🔊 Text-to-Speech (TTS)
Converts typed text into natural, lifelike audio in the target language. This is perfect for learning pronunciation or communicating when you cannot speak.

### 3. 🎤 Speech-to-Speech (S2S)
The flagship feature. Speak in one language (e.g., Telugu) and have the AI immediately play back your message in another (e.g., Spanish). It performs:
- **ASR:** Automatic Speech Recognition (Transcribing your voice).
- **MT:** Machine Translation (Translating the text).
- **TTS:** Text-to-Speech (Synthesizing the output).

---

## 🧩 Tech Stack & Architecture

### **Frontend**
- **React (Vite):** Fast, modern UI with state management for recording and playback.
- **Vanilla CSS:** Custom design system with modern typography and gradients.
- **Web MediaRecorder API:** For captured high-quality audio directly from the browser.

### **Backend**
- **Flask (Python):** Robust REST API handling model inference and file management.
- **Hugging Face Transformers:** The engine running the `SeamlessM4T-medium` model.
- **PyTorch:** Underlying tensor processing for AI computations.

---

## 📁 Project Structure
```bash
VaaniConnect2/
├── backend/
│   ├── app.py                  # Core Flask API & AI Logic
│   ├── requirements.txt         # Dependencies
│   └── Procfile                # Deployment config for Render
├── frontend/
│   ├── src/
│   │   ├── config.js           # API URL management
│   │   ├── SpeechToSpeech.jsx  # Audio recording & S2S UI
│   │   └── ...                 # Other feature components
│   ├── package.json
│   └── vercel.json             # Deployment config for Vercel
└── README.md
```

---

## ⚙️ Local Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/vrishitha47/VaaniConnect2.git
cd VaaniConnect2
```

### 2️⃣ Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate    # (Windows)
# source venv/bin/activate # (Mac/Linux)
pip install -r requirements.txt
python app.py
```

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🚀 Deployment Guide

### 🛑 Important: Hardware Requirements
The **SeamlessM4T-medium** model is a heavy AI model (~2.5GB). 
- **Local:** Requires at least 4GB of free RAM.
- **Render:** The **Free Tier (512MB RAM)** will OOM (Out of Memory) crash. You **MUST** use the **Starter Plan ($7/mo)** with **2GB RAM** for this project to run in production.

### 1️⃣ Deploy Backend (Render)
1. Add Environment Variables:
   - `FLASK_ENV`: `production`
   - `CORS_ORIGINS`: `https://your-app.vercel.app`
   - `PYTHON_VERSION`: `3.11.0`
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`

### 2️⃣ Deploy Frontend (Vercel)
1. Root Directory: `frontend`
2. Environment Variable: `VITE_API_URL` -> your Render URL.

---

## 🩵 Author
**Vennapureddy Rishitha Reddy**  
📧 [vrishitha47@gmail.com](mailto:vrishitha47@gmail.com)
