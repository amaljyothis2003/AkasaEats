# User Registration, Login & Auth Microservice

A complete authentication microservice built with **Express.js** and **Firebase Admin SDK** for the AkasaEats food ordering platform.

## 🚀 Features

- ✅ User registration with email and password
- ✅ Firebase Authentication integration
- ✅ JWT token verification middleware
- ✅ Protected routes with Bearer token authentication
- ✅ User profile management (CRUD operations)
- ✅ Firestore integration for user data persistence
- ✅ Email verification support
- ✅ Token revocation (logout)
- ✅ Comprehensive error handling
- ✅ CORS enabled for cross-origin requests
- ✅ Input validation and sanitization

## 📁 Project Structure

```
user-registration-login-auth/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin SDK initialization
│   ├── controllers/
│   │   └── authController.js    # Auth business logic
│   ├── middleware/
│   │   ├── verifyToken.js       # JWT token verification
│   │   └── errorHandler.js      # Global error handler
│   ├── routes/
│   │   └── auth.js              # Auth API routes
│   └── server.js                # Express app entry point
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: Firebase Admin SDK
- **Database**: Cloud Firestore
- **Middleware**: CORS, Body-Parser, Morgan

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Admin SDK credentials

### Step 1: Install Dependencies

```powershell
cd user-registration-login-auth
npm install
```

### Step 2: Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one

2. **Enable Authentication**
   - In Firebase Console → Authentication → Sign-in method
   - Enable **Email/Password** provider

3. **Enable Firestore Database**
   - In Firebase Console → Firestore Database
   - Create database (start in test mode for development)

4. **Generate Service Account Key**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `serviceAccountKey.json` in the project root
   - ⚠️ **NEVER commit this file to Git!**

### Step 3: Environment Configuration

```powershell
# Copy the example env file
Copy-Item .env.example .env
```

Edit `.env` file with your configuration:

```env
PORT=3001
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
API_PREFIX=/api/v1
```

### Step 4: Run the Service

**Development mode (with auto-reload):**
```powershell
npm run dev
```

**Production mode:**
```powershell
npm start
```

The service will start on `http://localhost:3001`

## 🔌 API Endpoints

### Base URL: `http://localhost:3001/api/v1`

### Public Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/health` | Health check | - |
| POST | `/auth/register` | Register new user | `{ email, password, name }` |
| GET | `/auth/user/:uid` | Get user by UID | - |
| POST | `/auth/verify-email` | Send verification email | `{ email }` |
| POST | `/auth/custom-token` | Create custom token | `{ uid }` |

### Protected Endpoints (Require Authorization Header)

| Method | Endpoint | Description | Body | Header |
|--------|----------|-------------|------|--------|
| GET | `/auth/profile` | Get current user profile | - | `Authorization: Bearer <token>` |
| PUT | `/auth/profile` | Update user profile | `{ name?, photoURL? }` | `Authorization: Bearer <token>` |
| DELETE | `/auth/user` | Delete user account | - | `Authorization: Bearer <token>` |
| POST | `/auth/logout` | Revoke tokens (logout) | - | `Authorization: Bearer <token>` |

## 📝 API Usage Examples

### 1. Register a New User

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uid": "abc123xyz",
    "email": "user@example.com",
    "name": "John Doe",
    "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Get User Profile (Protected)

First, obtain an ID token from Firebase Client SDK, then:

```bash
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer <YOUR_ID_TOKEN>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "abc123xyz",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2025-11-06T10:30:00Z"
  }
}
```

### 3. Update Profile

```bash
curl -X PUT http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer <YOUR_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "photoURL": "https://example.com/photo.jpg"
  }'
```

### 4. Logout (Revoke Tokens)

```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Authorization: Bearer <YOUR_ID_TOKEN>"
```

## 🔐 Firebase Security Rules

Add these rules to your Firestore Database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🔄 Integration with Frontend

### React Example (using Firebase Client SDK)

```javascript
// 1. Register user (call backend)
const registerUser = async (email, password, name) => {
  const response = await fetch('http://localhost:3001/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  const data = await response.json();
  
  // 2. Sign in with custom token (Firebase Client SDK)
  import { signInWithCustomToken } from 'firebase/auth';
  import { auth } from './firebase'; // Your Firebase config
  
  const userCredential = await signInWithCustomToken(auth, data.data.customToken);
  return userCredential;
};

// 3. Get ID token and call protected endpoints
import { getAuth } from 'firebase/auth';

const getProfile = async () => {
  const auth = getAuth();
  const idToken = await auth.currentUser.getIdToken();
  
  const response = await fetch('http://localhost:3001/api/v1/auth/profile', {
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  });
  return await response.json();
};
```

## 🧪 Testing

### Manual Testing with PowerShell

```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get

# Test registration
$body = @{
    email = "test@example.com"
    password = "test123456"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

## 🚀 Deployment

### Option 1: Deploy to Cloud (Firebase Hosting + Cloud Run)

1. Build the service
2. Containerize with Docker
3. Deploy to Cloud Run
4. Set environment variables in Cloud Run

### Option 2: Deploy to Traditional Server

1. Clone repository on server
2. Install dependencies: `npm install --production`
3. Set environment variables
4. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name auth-service
   pm2 save
   pm2 startup
   ```

## 🔒 Security Best Practices

- ✅ Service account key is gitignored
- ✅ Environment variables for sensitive data
- ✅ JWT token verification on protected routes
- ✅ CORS configuration to prevent unauthorized origins
- ✅ Input validation on all endpoints
- ✅ Firestore security rules enforce user data isolation
- ✅ Password minimum length enforced
- ✅ Error messages don't leak sensitive information

## 🐛 Troubleshooting

### Firebase initialization error
- Verify `serviceAccountKey.json` exists and path is correct in `.env`
- Check that the service account has proper permissions

### CORS errors
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

### Token verification fails
- Ensure ID token is obtained from Firebase Client SDK
- Check token hasn't expired (tokens expire after 1 hour)

## 📚 Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Express.js Guide](https://expressjs.com/)

## 📄 License

MIT

## 👥 Authors

AkasaEats Development Team - Hackathon 2025
