# 🎙️ VaaniConnect

VaaniConnect is an AI-powered translation web app that helps users translate spoken or typed text across multiple languages.  
It uses **Flask** as the backend and **React** as the frontend, integrating **Meta’s SeamlessM4T multilingual model** for high-quality translation.

---

## 🚀 Features
- 🌍 Translate text between multiple languages (supports English, Telugu, Spanish, etc.)
- 🗣️ Speech-to-text and text-to-speech integration
- ⚡ Real-time API built with Flask
- 🎨 Modern React-based UI
- 🧠 AI-powered using Hugging Face transformers

---

## 🧩 Tech Stack
**Frontend:** React, Tailwind CSS  
**Backend:** Flask, Python  
**AI Model:** facebook/hf-seamless-m4t-medium (Hugging Face)  
**APIs:** REST-based Flask endpoints  

---

## 📁 Project Structure
```bash
VaaniConnect2/
├── backend/
│ ├── app.py
│ ├── requirements.txt
│ ├── static/
│ └── templates/
├── frontend/
│ ├── src/
│ └── package.json
└── README.md

```

## ⚙️ Setup Instructions

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
pip install -r requirements.txt
python app.py
```

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

###🧪 Test the API
```bash
Once Flask is running at http://127.0.0.1:5000, open PowerShell and run:

Invoke-RestMethod -Uri "http://127.0.0.1:5000/translate" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"text": "Hello, how are you?", "target_lang": "spa"}'
```

### 🩵 Author

Vennapureddy Rishitha Reddy
📧 vrishitha47@gmail.com
