# 🚀 VaaniConnect2 - Complete Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Testing Your Deployment](#testing-your-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ Render account (sign up at [render.com](https://render.com))
- ✅ Your code pushed to GitHub repository

---

## Backend Deployment (Render)

### Step 1: Prepare Backend for Production

The following files have been created for you:
- `backend/Procfile` - Tells Render how to start your app
- `backend/requirements-production.txt` - Production dependencies
- `backend/.env.example` - Environment variables template

### Step 2: Update Backend Code for Production

You need to update `backend/app.py` to:
1. Use environment variables for PORT
2. Configure CORS for your Vercel domain

**Add this at the top of `backend/app.py` (after imports):**

```python
import os
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS for production
cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
CORS(app, resources={r"/*": {"origins": cors_origins}})
```

**Update the bottom of `backend/app.py`:**

```python
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
```

### Step 3: Deploy to Render

1. **Go to Render Dashboard**
   - Visit [https://dashboard.render.com/](https://dashboard.render.com/)
   - Click **"New +"** → **"Web Service"**

2. **Connect Your Repository**
   - Select **"Build and deploy from a Git repository"**
   - Click **"Connect GitHub"** and authorize Render
   - Select your `VaaniConnect2` repository

3. **Configure Web Service**
   - **Name**: `vaaniconnect-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements-production.txt`
   - **Start Command**: Leave empty (uses Procfile automatically)
   - **Instance Type**: **Free** (for testing) or **Starter** (for production)

4. **Set Environment Variables**
   
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these variables:
   ```
   FLASK_ENV=production
   CORS_ORIGINS=https://your-app-name.vercel.app
   PYTHON_VERSION=3.11.0
   ```
   
   > ⚠️ You'll update `CORS_ORIGINS` after deploying frontend

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait 10-15 minutes for initial deployment (downloads ML model)
   - Note your backend URL: `https://vaaniconnect-backend.onrender.com`

### Step 4: Verify Backend Deployment

Once deployed, test the backend:
```bash
curl https://your-backend-url.onrender.com/
```

You should see: `🌐 VaaniConnect Backend is Running!`

> ⚠️ **Important Notes for Render:**
> - **Free tier**: App sleeps after 15 mins of inactivity. First request takes 50+ seconds to wake up.
> - **Model size**: SeamlessM4T model is ~2.5GB. Ensure you have enough storage.
> - **Memory**: Free tier has 512MB RAM. The model may require **Starter plan ($7/month) with 2GB RAM**.
> - **Build time**: Initial deployment takes 10-15 minutes to download the model.

---

## Frontend Deployment (Vercel)

### Step 1: Update Frontend Code

You need to update the frontend to use environment variables instead of hardcoded URLs.

**Create `frontend/src/config.js`:**

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export { API_URL };
```

**Update `frontend/src/TextTranslate.jsx`:**

Replace:
```javascript
const res = await fetch("http://127.0.0.1:5000/translate", {
```

With:
```javascript
import { API_URL } from './config.js';
// ...
const res = await fetch(`${API_URL}/translate`, {
```

**Update `frontend/src/TextToSpeech.jsx`:**

Replace:
```javascript
const res = await fetch("http://127.0.0.1:5000/text-to-speech", {
```
and
```javascript
const url = `http://127.0.0.1:5000/output.wav?t=${Date.now()}`;
```

With:
```javascript
import { API_URL } from './config.js';
// ...
const res = await fetch(`${API_URL}/text-to-speech`, {
// ...
const url = `${API_URL}/output.wav?t=${Date.now()}`;
```

**Update `frontend/src/SpeechToSpeech.jsx`:**

Replace:
```javascript
const res = await fetch('http://127.0.0.1:5000/speech-to-speech', {
```
and
```javascript
? `http://127.0.0.1:5000/output.wav?t=${Date.now()}`
```

With:
```javascript
import { API_URL } from './config.js';
// ...
const res = await fetch(`${API_URL}/speech-to-speech`, {
// ...
? `${API_URL}/output.wav?t=${Date.now()}`
```

### Step 2: Test Locally

Before deploying, test the build:

```bash
cd frontend
npm run build
npm run preview
```

Verify the app works at `http://localhost:4173`

### Step 3: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit [https://vercel.com/](https://vercel.com/)
   - Click **"Add New..."** → **"Project"**

2. **Import Repository**
   - Click **"Import Git Repository"**
   - Select your `VaaniConnect2` repository
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset**: **Vite** (auto-detected)
   - **Root Directory**: Click **"Edit"** → Enter `frontend`
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Add Environment Variables**
   
   **Important:** Add this environment variable:
   ```
   VITE_API_URL=https://your-render-backend-url.onrender.com
   ```
   
   Replace `your-render-backend-url.onrender.com` with your actual Render backend URL from Step 4.

5. **Deploy**
   - Click **"Deploy"**
   - Wait 1-2 minutes for deployment
   - Note your frontend URL: `https://your-app-name.vercel.app`

---

## Post-Deployment Configuration

### Update CORS Settings on Render

1. Go back to **Render Dashboard**
2. Select your backend service
3. Go to **"Environment"** tab
4. Update `CORS_ORIGINS` variable:
   ```
   CORS_ORIGINS=https://your-app-name.vercel.app
   ```
   Replace with your actual Vercel URL

5. Click **"Save Changes"**
6. Wait for automatic re-deployment (~2 minutes)

---

## Testing Your Deployment

### 1. Test Homepage
- Visit your Vercel URL: `https://your-app-name.vercel.app`
- You should see the VaaniConnect interface

### 2. Test Text Translation
- Enter text: "Hello, how are you?"
- Select target language: Spanish
- Click Translate
- Should see: "Hola, ¿cómo estás?"

### 3. Test Text-to-Speech
- Enter text: "Welcome to VaaniConnect"
- Select language: English
- Click Generate Speech
- Audio should play

### 4. Test Speech-to-Speech
- Record audio or upload file
- Select source and target languages
- Should receive translated audio

> ⚠️ **First Request Delay:**
> On Render's free tier, if the service is asleep, the first request may take 50-60 seconds to wake up and respond.

---

## Troubleshooting

### Backend Issues

#### 1. **"Application Error" on Render**
**Solution:**
- Check Render logs: Dashboard → Your Service → Logs
- Common issues:
  - Out of memory (upgrade to Starter plan)
  - Missing dependencies (check requirements-production.txt)
  - Port not configured (ensure app.py uses `os.getenv("PORT")`)

#### 2. **Model Download Timeout**
**Solution:**
- Increase build timeout in Render
- Or use Starter plan with more resources

#### 3. **CORS Errors**
**Solution:**
- Verify `CORS_ORIGINS` in Render environment variables
- Ensure it matches your Vercel URL exactly (no trailing slash)
- Check browser console for exact error

### Frontend Issues

#### 1. **"Network Error" or "Failed to Fetch"**
**Solution:**
- Check browser console (F12)
- Verify `VITE_API_URL` in Vercel environment variables
- Ensure backend is running (test backend URL directly)
- Check CORS configuration on backend

#### 2. **Audio Not Playing**
**Solution:**
- Check browser console for errors
- Verify backend `/output.wav` endpoint is accessible
- Try different browser (Chrome recommended)
- Check audio file permissions on Render

#### 3. **Build Fails on Vercel**
**Solution:**
- Check Vercel build logs
- Ensure `Root Directory` is set to `frontend`
- Verify `package.json` has correct dependencies
- Try: `npm install` locally and commit `package-lock.json`

### Performance Issues

#### 1. **Slow First Request**
**Cause:** Render free tier sleeps after 15 minutes
**Solution:**
- Upgrade to Render Starter plan ($7/month) for always-on service
- Or accept 50-second delay for first request

#### 2. **Long Translation Time**
**Cause:** Large ML model on limited resources
**Solution:**
- Upgrade to Starter plan (2GB RAM)
- Consider using Render's higher tiers for production

---

## Important Notes

### Render Free Tier Limitations
- ✅ **Good for**: Testing, demos, portfolios
- ❌ **Not ideal for**: Production, high traffic
- **Limitations:**
  - Sleeps after 15min inactivity (50s wake time)
  - 512MB RAM (may not be enough for ML model)
  - 750 hours/month free

### Recommended for Production
- **Render**: Starter plan ($7/month) - 2GB RAM, always-on
- **Vercel**: Free tier is excellent for frontend

### Cost Estimate
- **Frontend (Vercel)**: Free (generous limits)
- **Backend (Render)**:
  - Free tier: $0 (with limitations)
  - Starter: $7/month (recommended)

---

## Next Steps

✅ **Successfully Deployed?** Great! Here's what to do next:

1. **Custom Domain** (Optional)
   - Vercel: Settings → Domains → Add domain
   - Render: Settings → Custom Domain

2. **Monitor Usage**
   - Vercel: Analytics tab
   - Render: Metrics tab

3. **Set Up CI/CD**
   - Both platforms auto-deploy on git push to main branch!

4. **Share Your App**
   - Add URLs to your GitHub README
   - Share on LinkedIn, portfolio

---

## Support

If you encounter issues:
1. Check logs (Vercel/Render dashboards)
2. Review this guide's troubleshooting section
3. Check GitHub issues for similar problems

---

**Deployed by:** Vennapureddy Rishitha Reddy  
**Repository:** https://github.com/vrishitha47/VaaniConnect2  
**Questions?** vrishitha47@gmail.com

---

🎉 **Congratulations on deploying VaaniConnect2!**
