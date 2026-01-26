# 🚀 Quick Start - Deployment Guide

## ✅ What's Been Done

All files and code have been prepared for deployment:

1. **Configuration Files Created:**
   - `frontend/.env` & `.env.example`
   - `frontend/vercel.json`
   - `frontend/src/config.js`
   - `backend/Procfile`
   - `backend/requirements-production.txt`
   - `backend/.env.example`

2. **Code Updated:**
   - All frontend components now use environment variables
   - Backend configured for production (PORT & CORS)

3. **Documentation Created:**
   - Complete deployment guide in `DEPLOYMENT.md`

## 🎯 Next Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment - Add config files and update code"
git push origin main
```

### Step 2: Deploy Backend to Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. **Root Directory:** `backend`
5. **Environment Variables:**
   - `FLASK_ENV=production`
   - `CORS_ORIGINS=*` (update after frontend deployment)
   - `PYTHON_VERSION=3.11.0`
6. Deploy and save your backend URL

⏱️ **Wait 10-15 minutes** for initial deployment (downloads ML model)

### Step 3: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. **Root Directory:** `frontend`
4. **Environment Variable:**
   - `VITE_API_URL` = your Render backend URL from Step 2
5. Deploy and save your frontend URL

### Step 4: Update CORS
1. Go back to Render
2. Update environment variable:
   - `CORS_ORIGINS` = your Vercel URL from Step 3
3. Save (auto-redeploys)

## 📖 Full Documentation

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for:
- Detailed step-by-step instructions with screenshots descriptions
- Troubleshooting common issues
- Performance notes
- Cost estimates

## ⚠️ Important Notes

- **Free Tier:** Backend sleeps after 15 min (50s wake time)
- **Recommended:** Render Starter plan ($7/mo) for 2GB RAM
- **Model Size:** 2.5GB - large initial download
- **First Request:** May take 50-60 seconds on free tier

## 🎉 You're Ready!

Everything is configured. Just follow the 4 steps above to deploy!
