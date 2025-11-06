# 🚀 Quick Start Guide - Auth Microservice

## Prerequisites Checklist
- [x] Node.js installed (v14+)
- [ ] Firebase project created
- [ ] Service account key downloaded
- [ ] `.env` file configured

---

## 🔥 Setup (First Time Only)

### 1. Firebase Setup (5 minutes)
Follow detailed instructions in: `FIREBASE_SETUP.md`

**Quick steps:**
1. Create Firebase project at https://console.firebase.google.com/
2. Enable Email/Password authentication
3. Create Firestore database
4. Download service account key → save as `serviceAccountKey.json`

### 2. Environment Setup
```powershell
# Copy environment template
Copy-Item .env.example .env

# Edit .env with your settings
notepad .env
```

### 3. Install Dependencies (Already Done)
```powershell
npm install
```

---

## ▶️ Running the Service

### Development Mode (with auto-reload)
```powershell
npm run dev
```

### Production Mode
```powershell
npm start
```

### Run Tests
```powershell
npm test
```

---

## 🧪 Quick Test

### Option 1: Browser
Open: http://localhost:3001/health

### Option 2: PowerShell
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/health"
```

### Option 3: cURL
```bash
curl http://localhost:3001/health
```

---

## 📡 API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/api/v1/auth/register` | POST | No | Register user |
| `/api/v1/auth/user/:uid` | GET | No | Get user by ID |
| `/api/v1/auth/profile` | GET | Yes | Get profile |
| `/api/v1/auth/profile` | PUT | Yes | Update profile |
| `/api/v1/auth/logout` | POST | Yes | Logout |
| `/api/v1/auth/user` | DELETE | Yes | Delete account |

**Auth Required** = Include header: `Authorization: Bearer <idToken>`

---

## 🔑 Getting ID Token (for Protected Routes)

### Method 1: Use Custom Token (from registration)
1. Register a user → you get `customToken`
2. Use Firebase Client SDK: `signInWithCustomToken(auth, customToken)`
3. Get ID token: `auth.currentUser.getIdToken()`

### Method 2: Direct Sign In (Frontend)
```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const idToken = await userCredential.user.getIdToken();
```

---

## 📝 Example: Complete Flow

### 1. Register User
```powershell
$body = @{
    email = "test@example.com"
    password = "test123456"
    name = "Test User"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

$response
```

### 2. Get User Profile (need ID token from Firebase Client SDK)
```powershell
$idToken = "eyJhbGc..." # Get from Firebase Client SDK

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/profile" `
  -Headers @{ Authorization = "Bearer $idToken" }
```

---

## 🐛 Common Issues

### Port Already in Use
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Firebase Connection Error
- Check `serviceAccountKey.json` exists
- Verify path in `.env` file
- Ensure Firebase project is active

### CORS Error (from frontend)
- Add frontend URL to `ALLOWED_ORIGINS` in `.env`
- Example: `ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173`

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `README.md` | Complete documentation |
| `FIREBASE_SETUP.md` | Firebase configuration guide |
| `QUICK_START.md` | This file |
| `.env.example` | Environment variables template |
| `postman_collection.json` | Import into Postman for testing |
| `test-api.js` | Automated test script |

---

## 🎯 Next Steps

1. ✅ Auth service running
2. → Test with Postman (import `postman_collection.json`)
3. → Build React frontend
4. → Integrate frontend with auth service
5. → Build other microservices (cart, items, orders)

---

## 💡 Pro Tips

- Use `npm run dev` during development (auto-reload)
- Import Postman collection for easy testing
- Check server logs for debugging
- Keep `serviceAccountKey.json` secure (never commit!)
- Use environment variables for sensitive data

---

## 🆘 Need Help?

1. Check `README.md` for detailed docs
2. Check `FIREBASE_SETUP.md` for Firebase issues
3. Run `npm test` to verify setup
4. Check server logs in terminal

---

**Service Port:** 3001  
**API Base:** http://localhost:3001/api/v1  
**Health Check:** http://localhost:3001/health

Happy coding! 🎉
