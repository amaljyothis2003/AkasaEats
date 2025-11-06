# 🚀 AkasaEats Deployment Guide

Complete guide to deploy your AkasaEats application to production.

## 📋 Table of Contents
1. [Deployment Options](#deployment-options)
2. [Option 1: Vercel + Render (Recommended)](#option-1-vercel--render-recommended)
3. [Option 2: Firebase Hosting + Cloud Run](#option-2-firebase-hosting--cloud-run)
4. [Option 3: Railway (All-in-One)](#option-3-railway-all-in-one)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Steps](#post-deployment-steps)

---

## 🎯 Deployment Options

### Comparison Table

| Platform | Frontend | Backend | Database | Cost | Difficulty |
|----------|----------|---------|----------|------|------------|
| **Vercel + Render** | Vercel | Render | Firebase | Free tier available | Easy |
| **Firebase Hosting + Cloud Run** | Firebase | Google Cloud Run | Firebase | Free tier limited | Medium |
| **Railway** | Railway | Railway | Firebase | $5/month | Easy |
| **AWS** | S3 + CloudFront | EC2/ECS | Firebase | Variable | Hard |
| **Heroku** | Heroku | Heroku | Firebase | $7/month | Easy |

**Recommended**: Vercel (Frontend) + Render (Backend) - Best free tier and easiest setup!

---

## 🌟 Option 1: Vercel + Render (Recommended)

### Step 1: Deploy Frontend to Vercel

#### A. Install Vercel CLI
```powershell
npm install -g vercel
```

#### B. Login to Vercel
```powershell
vercel login
```

#### C. Deploy Frontend
```powershell
cd D:\AKASA\frontend
vercel
```

**During deployment, answer:**
- Set up and deploy? **Y**
- Which scope? **(Select your account)**
- Link to existing project? **N**
- Project name? **akasaeats** (or your choice)
- Directory? **./  (press Enter)**
- Want to override settings? **Y**
- Build Command? **npm run build**
- Output Directory? **dist**
- Development Command? **npm run dev**

#### D. Set Environment Variables on Vercel

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these variables:
```
VITE_FIREBASE_API_KEY=AIzaSyB5LpVJwyZ850MlqWt7nzZ12IhfQyF7MeU
VITE_FIREBASE_AUTH_DOMAIN=akasaeats.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=akasaeats
VITE_FIREBASE_STORAGE_BUCKET=akasaeats.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=559355216945
VITE_FIREBASE_APP_ID=1:559355216945:web:ecf3cfaf64fa7a4a2b04d1
```

**Important**: You'll need to update the API URLs later once backend is deployed.

#### E. Redeploy with Environment Variables
```powershell
vercel --prod
```

Your frontend will be live at: `https://akasaeats.vercel.app` (or similar)

---

### Step 2: Deploy Backend to Render

#### A. Create Render Account
Go to: https://render.com and sign up with GitHub

#### B. Deploy Auth Service

1. Go to Render Dashboard → **New +** → **Web Service**
2. Connect your GitHub repository: `amaljyothis2003/AkasaEats`
3. Configure:
   - **Name**: `akasaeats-auth`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `user-registration-login-auth`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: `Free`

4. **Environment Variables** (Add these):
   ```
   PORT=3001
   NODE_ENV=production
   API_PREFIX=/api/v1
   ALLOWED_ORIGINS=https://akasaeats.vercel.app,http://localhost:5175
   ```

5. **Add Firebase Service Account**:
   - Under "Secret Files" section:
   - **Filename**: `serviceAccountKey.json`
   - **Contents**: Copy your entire `serviceAccountKey.json` file content
   
6. Add one more environment variable:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

7. Click **Create Web Service**

Your auth service will be live at: `https://akasaeats-auth.onrender.com`

#### C. Deploy Items Service

Repeat the same process:
1. **New +** → **Web Service**
2. Connect repository
3. Configure:
   - **Name**: `akasaeats-items`
   - **Root Directory**: `item-inventory`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   
4. **Environment Variables**:
   ```
   PORT=3002
   NODE_ENV=production
   API_PREFIX=/api/v1
   ALLOWED_ORIGINS=https://akasaeats.vercel.app,http://localhost:5175
   MAX_FILE_SIZE=5242880
   UPLOAD_DIR=./uploads
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

5. **Secret Files**: Add `serviceAccountKey.json`

Your items service will be live at: `https://akasaeats-items.onrender.com`

#### D. Deploy Cart Service

1. **New +** → **Web Service**
2. Configure:
   - **Name**: `akasaeats-cart`
   - **Root Directory**: `cart`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   
3. **Environment Variables**:
   ```
   PORT=3003
   NODE_ENV=production
   API_PREFIX=/api/v1
   ALLOWED_ORIGINS=https://akasaeats.vercel.app,http://localhost:5175
   ITEM_SERVICE_URL=https://akasaeats-items.onrender.com/api/v1
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

4. **Secret Files**: Add `serviceAccountKey.json`

Your cart service will be live at: `https://akasaeats-cart.onrender.com`

---

### Step 3: Update Frontend with Backend URLs

#### A. Update Frontend Environment Variables

Go to Vercel Dashboard → Settings → Environment Variables

Add/Update these:
```
VITE_API_URL_AUTH=https://akasaeats-auth.onrender.com/api/v1
VITE_API_URL_ITEMS=https://akasaeats-items.onrender.com/api/v1
VITE_API_URL_CART=https://akasaeats-cart.onrender.com/api/v1
```

#### B. Update API Configuration in Code

Edit `frontend/src/services/api.js`:

```javascript
const API_BASE_URLS = {
  auth: import.meta.env.VITE_API_URL_AUTH || 'https://akasaeats-auth.onrender.com/api/v1',
  items: import.meta.env.VITE_API_URL_ITEMS || 'https://akasaeats-items.onrender.com/api/v1',
  cart: import.meta.env.VITE_API_URL_CART || 'https://akasaeats-cart.onrender.com/api/v1',
};
```

#### C. Redeploy Frontend
```powershell
cd D:\AKASA\frontend
vercel --prod
```

---

### Step 4: Update CORS Settings

Update backend environment variables on Render:

For each service (Auth, Items, Cart), update `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://akasaeats.vercel.app,https://akasaeats-auth.onrender.com,https://akasaeats-items.onrender.com,https://akasaeats-cart.onrender.com
```

---

## 🔥 Option 2: Firebase Hosting + Cloud Run

### Step 1: Install Firebase CLI
```powershell
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```powershell
firebase login
```

### Step 3: Initialize Firebase Hosting
```powershell
cd D:\AKASA\frontend
firebase init hosting
```

Select:
- Use existing project: **akasaeats**
- Public directory: **dist**
- Configure as SPA: **Yes**
- Set up automatic builds with GitHub: **No** (we'll do manual)

### Step 4: Build and Deploy Frontend
```powershell
npm run build
firebase deploy --only hosting
```

Your frontend will be at: `https://akasaeats.web.app`

### Step 5: Deploy Backend to Cloud Run

#### A. Create Dockerfile for Each Service

**user-registration-login-auth/Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "src/server.js"]
```

**item-inventory/Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3002
CMD ["node", "src/server.js"]
```

**cart/Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3003
CMD ["node", "src/server.js"]
```

#### B. Install Google Cloud SDK
Download from: https://cloud.google.com/sdk/docs/install

#### C. Deploy to Cloud Run
```powershell
# Auth Service
cd D:\AKASA\user-registration-login-auth
gcloud run deploy akasaeats-auth --source . --region us-central1 --allow-unauthenticated

# Items Service
cd D:\AKASA\item-inventory
gcloud run deploy akasaeats-items --source . --region us-central1 --allow-unauthenticated

# Cart Service
cd D:\AKASA\cart
gcloud run deploy akasaeats-cart --source . --region us-central1 --allow-unauthenticated
```

---

## 🚂 Option 3: Railway (All-in-One)

### Step 1: Create Railway Account
Go to: https://railway.app and sign up with GitHub

### Step 2: Create New Project
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Connect `amaljyothis2003/AkasaEats`

### Step 3: Add Services

#### A. Add Auth Service
1. Click **+ New**
2. Select your repository
3. Configure:
   - **Root Directory**: `user-registration-login-auth`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`

4. Add Environment Variables (Settings → Variables):
   ```
   PORT=3001
   NODE_ENV=production
   API_PREFIX=/api/v1
   ALLOWED_ORIGINS=$FRONTEND_URL
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

5. Add Secret File:
   - Create variable `FIREBASE_SERVICE_ACCOUNT_KEY` with JSON content
   - Railway will create the file automatically

#### B. Add Items Service
Repeat with:
- **Root Directory**: `item-inventory`
- Add appropriate environment variables

#### C. Add Cart Service
Repeat with:
- **Root Directory**: `cart`
- Add appropriate environment variables

#### D. Add Frontend
1. **+ New** → **GitHub Repo**
2. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview`

3. Add environment variables from your `.env` file

### Step 4: Generate Domains
Railway will auto-generate URLs for each service. Update CORS settings accordingly.

---

## 🔐 Environment Configuration

### Production Environment Variables Checklist

#### Backend Services (.env)
```env
# Server
PORT=3001  # (3001, 3002, 3003)
NODE_ENV=production

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# CORS (Update with your actual URLs)
ALLOWED_ORIGINS=https://your-frontend-url.com

# API
API_PREFIX=/api/v1
```

#### Frontend (.env.production)
```env
# Firebase Client
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend APIs (Update after deploying backend)
VITE_API_URL_AUTH=https://your-auth-service.com/api/v1
VITE_API_URL_ITEMS=https://your-items-service.com/api/v1
VITE_API_URL_CART=https://your-cart-service.com/api/v1
```

---

## ✅ Post-Deployment Steps

### 1. Enable Firebase Authentication Email Provider
1. Go to Firebase Console: https://console.firebase.google.com/project/akasaeats
2. Navigate to **Authentication** → **Sign-in method**
3. Enable **Email/Password** provider
4. Save

### 2. Update Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Items collection
    match /items/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Carts collection
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Seed Production Database
```powershell
# Update seed-database.js with production Firebase credentials if needed
node seed-database.js
```

### 4. Test Deployment

#### A. Test Backend Health Endpoints
```powershell
# Auth Service
Invoke-RestMethod -Uri "https://akasaeats-auth.onrender.com/health"

# Items Service
Invoke-RestMethod -Uri "https://akasaeats-items.onrender.com/health"

# Cart Service
Invoke-RestMethod -Uri "https://akasaeats-cart.onrender.com/health"
```

All should return: `{ "success": true, "message": "Service is running" }`

#### B. Test Frontend
1. Visit your frontend URL: `https://akasaeats.vercel.app`
2. Test user registration
3. Test login
4. Browse items
5. Add to cart
6. View cart

### 5. Set up Custom Domain (Optional)

#### For Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `www.akasaeats.com`)
3. Follow DNS configuration instructions

#### For Render:
1. Go to Service Settings → Custom Domains
2. Add your domain
3. Configure DNS records as instructed

---

## 🔍 Monitoring & Debugging

### Check Logs

#### Vercel Logs:
```powershell
vercel logs
```

#### Render Logs:
- Go to service dashboard → **Logs** tab
- Real-time logs visible in dashboard

#### Railway Logs:
- Click on service → **Deployments** → View logs

### Common Issues

#### Issue: CORS Errors
**Solution**: Ensure `ALLOWED_ORIGINS` includes your frontend URL

#### Issue: Firebase Auth Failed
**Solution**: 
- Check Firebase credentials are correct
- Ensure Email/Password provider is enabled
- Verify `serviceAccountKey.json` is properly uploaded

#### Issue: 500 Server Error
**Solution**: Check service logs for detailed error messages

#### Issue: Backend Not Responding
**Solution**: 
- Check if service is running (Render free tier sleeps after inactivity)
- First request may take 30-60 seconds to wake up

---

## 💰 Cost Estimation

### Free Tier Limits

**Vercel (Frontend)**:
- ✅ 100GB bandwidth/month
- ✅ Unlimited websites
- ✅ Automatic SSL
- ✅ CI/CD included

**Render (Backend)**:
- ✅ 750 hours/month (enough for 3 services if they don't run 24/7)
- ⚠️ Services sleep after 15 min inactivity (30s cold start)
- ✅ 100GB bandwidth/month per service
- ✅ Automatic SSL

**Firebase**:
- ✅ 1GB stored data
- ✅ 50K reads/day
- ✅ 20K writes/day
- ✅ 20K deletes/day

**Total Monthly Cost**: **$0** (with free tiers)

### Paid Options

If you need 24/7 uptime:
- **Render**: $7/month per service ($21/month for 3 backend services)
- **Railway**: $5/month (includes all services)
- **Vercel Pro**: $20/month (if you need advanced features)

---

## 🚀 Quick Deployment Summary

### Recommended Path (Vercel + Render):

```powershell
# 1. Deploy Frontend
cd D:\AKASA\frontend
npm install -g vercel
vercel login
vercel --prod

# 2. Deploy Backend (via Render Dashboard)
# - Create 3 web services from GitHub
# - Add environment variables
# - Upload serviceAccountKey.json as secret file

# 3. Update Frontend env vars with backend URLs
# - Add in Vercel dashboard

# 4. Redeploy Frontend
vercel --prod

# 5. Test everything
# - Visit your site
# - Register user
# - Browse items
# - Test cart
```

**Total Time**: 30-45 minutes

---

## 📞 Support

If you encounter issues:
1. Check service logs first
2. Verify all environment variables are set
3. Ensure Firebase credentials are correct
4. Check CORS settings match your URLs

---

## 🎉 Congratulations!

Your AkasaEats application is now live and accessible worldwide! 🌍

**Next Steps**:
- Share your live URL with users
- Monitor application performance
- Set up analytics (Google Analytics, Firebase Analytics)
- Consider adding monitoring (Sentry, LogRocket)
- Plan for scaling based on usage

---

**Made with ❤️ for AkasaEats**
