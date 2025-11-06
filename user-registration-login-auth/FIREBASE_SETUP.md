# 🔥 Firebase Setup Guide for AkasaEats Auth Service

This guide will walk you through setting up Firebase for the authentication microservice.

## 📋 Prerequisites

- Google account
- Node.js installed
- Firebase CLI (optional, for deployment)

---

## 🚀 Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `akasaeats` (or your preferred name)
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

---

### 2. Enable Firebase Authentication

1. In Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Toggle **"Enable"** ON
6. Click **"Save"**

**Why?** This allows users to register and login with email/password.

---

### 3. Set Up Cloud Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - ⚠️ We'll add proper security rules later
4. Select a location closest to your users (e.g., `us-central1`)
5. Click **"Enable"**

**Why?** Firestore will store user profiles, carts, orders, and items.

---

### 4. Configure Firestore Security Rules

1. In Firestore Database, go to **"Rules"** tab
2. Replace the default rules with the content from `firestore.rules.txt`
3. Click **"Publish"**

**Security rules preview:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /carts/{cartId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    match /items/{itemId} {
      allow read: if request.auth != null;
    }
  }
}
```

---

### 5. Generate Service Account Key (CRITICAL)

1. In Firebase Console, click ⚙️ **Settings** icon → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** in the popup
5. A JSON file will download automatically

**Important steps:**
```powershell
# Move the downloaded file to your project
Move-Item ~/Downloads/*firebase-adminsdk*.json D:\AKASA\user-registration-login-auth\serviceAccountKey.json

# Verify it's there
Test-Path D:\AKASA\user-registration-login-auth\serviceAccountKey.json
```

⚠️ **SECURITY WARNING:**
- NEVER commit this file to Git (already in `.gitignore`)
- NEVER share this file publicly
- NEVER hardcode it in your code
- This file has full admin access to your Firebase project

---

### 6. Set Up Environment Variables

1. Copy the example environment file:
```powershell
cd D:\AKASA\user-registration-login-auth
Copy-Item .env.example .env
```

2. Edit `.env` file (use VS Code or any text editor):
```env
PORT=3001
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
API_PREFIX=/api/v1
```

---

### 7. Enable Firebase Storage (for Item Images)

1. In Firebase Console, click **"Storage"** in the left sidebar
2. Click **"Get started"**
3. Review the security rules (start in test mode for development)
4. Choose the same location as your Firestore database
5. Click **"Done"**

**Storage security rules (for later):**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /items/{itemId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins via backend
    }
  }
}
```

---

### 8. Get Firebase Web Config (for Frontend)

1. In Firebase Console → Project Settings
2. Scroll down to **"Your apps"**
3. Click the **Web** icon (`</>`)
4. Register your app with nickname: `akasaeats-web`
5. Copy the Firebase configuration object

**Save this for your React frontend:**
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "akasaeats.firebaseapp.com",
  projectId: "akasaeats",
  storageBucket: "akasaeats.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Email/Password authentication enabled
- [ ] Firestore database created
- [ ] Firestore security rules published
- [ ] Service account key downloaded and saved as `serviceAccountKey.json`
- [ ] `.env` file created and configured
- [ ] Firebase Storage enabled
- [ ] Web config saved for frontend

---

## 🧪 Test Your Setup

1. Start the auth service:
```powershell
cd D:\AKASA\user-registration-login-auth
npm run dev
```

2. Test the health endpoint:
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/health"
```

3. Run the automated tests:
```powershell
npm test
```

If all tests pass, your Firebase setup is complete! ✅

---

## 🔧 Troubleshooting

### Error: "Cannot find module './serviceAccountKey.json'"
- Verify the file exists: `Test-Path ./serviceAccountKey.json`
- Check the path in `.env` file
- Make sure you downloaded the service account key

### Error: "PERMISSION_DENIED"
- Check your Firestore security rules
- Make sure authentication is enabled
- Verify the user is authenticated with a valid token

### Error: "CORS policy blocked"
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
- Restart the server after changing `.env`

### Error: "Firebase Admin already initialized"
- This is usually harmless during development
- Restart the server with `npm run dev`

---

## 📚 Next Steps

1. ✅ Auth service is ready
2. → Set up Item Inventory microservice
3. → Set up Cart microservice
4. → Build React frontend
5. → Integrate all services

---

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

## 💡 Tips

- **Development**: Use test mode for Firestore rules
- **Production**: Always use strict security rules
- **Monitoring**: Enable Firebase Analytics for insights
- **Backups**: Regularly export Firestore data
- **Costs**: Monitor usage in Firebase Console → Usage and billing

---

Need help? Check the main README.md or reach out to the team! 🚀
