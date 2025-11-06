# 📑 Project Index - Auth Microservice

## 🎯 Quick Navigation

### 🚀 Getting Started
- **[QUICK_START.md](./QUICK_START.md)** - Start here! Quick setup guide
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Firebase configuration (required)
- **[README.md](./README.md)** - Complete documentation

### 📚 Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design
- **[BUILD_SUMMARY.md](./BUILD_SUMMARY.md)** - What was built and features
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide

### 🔧 Configuration Files
- **[.env.example](./.env.example)** - Environment variables template
- **[.gitignore](./.gitignore)** - Git ignore rules
- **[package.json](./package.json)** - Node.js dependencies and scripts
- **[firestore.rules.txt](./firestore.rules.txt)** - Firestore security rules

### 🧪 Testing & Tools
- **[test-api.js](./test-api.js)** - Automated API test script
- **[postman_collection.json](./postman_collection.json)** - Postman API collection

---

## 📂 Source Code Structure

### Entry Point
```
src/server.js                    # Express server entry point
```

### Configuration
```
src/config/
└── firebase.js                  # Firebase Admin SDK initialization
```

### Routes (API Endpoints)
```
src/routes/
└── auth.js                      # Authentication routes
```

### Controllers (Business Logic)
```
src/controllers/
└── authController.js            # Auth operations:
                                   - register()
                                   - getUserByUid()
                                   - getProfile()
                                   - updateProfile()
                                   - deleteUser()
                                   - revokeTokens()
                                   - sendEmailVerification()
                                   - createCustomToken()
```

### Middleware
```
src/middleware/
├── verifyToken.js               # JWT token verification
└── errorHandler.js              # Global error handling
```

---

## 🔌 API Endpoints Reference

### Base URL
```
http://localhost:3001/api/v1
```

### Public Routes
- `GET /health` - Health check
- `POST /auth/register` - Register user
- `GET /auth/user/:uid` - Get user by ID
- `POST /auth/verify-email` - Send verification email
- `POST /auth/custom-token` - Create custom token

### Protected Routes (Require Bearer Token)
- `GET /auth/profile` - Get current user profile
- `PUT /auth/profile` - Update user profile
- `DELETE /auth/user` - Delete user account
- `POST /auth/logout` - Logout (revoke tokens)

---

## 🛠️ NPM Scripts

```bash
npm start         # Start production server
npm run dev       # Start development server (auto-reload)
npm test          # Run API tests
```

---

## 📦 Dependencies

### Runtime
- `express` - Web framework
- `firebase-admin` - Firebase Admin SDK
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `body-parser` - Request body parsing
- `morgan` - HTTP request logger

### Development
- `nodemon` - Auto-reload server
- `axios` - HTTP client for testing

---

## 🔥 Firebase Services Used

1. **Firebase Authentication**
   - Email/Password authentication
   - Custom token generation
   - User management

2. **Cloud Firestore**
   - User profile storage
   - Real-time data sync
   - Security rules

3. **Firebase Admin SDK**
   - Server-side Firebase operations
   - Token verification
   - User management

---

## 📊 File Sizes & Lines of Code

### Source Code
| File | Purpose | LOC |
|------|---------|-----|
| `src/server.js` | Express app | ~110 |
| `src/controllers/authController.js` | Business logic | ~290 |
| `src/routes/auth.js` | API routes | ~90 |
| `src/middleware/verifyToken.js` | Token verification | ~60 |
| `src/middleware/errorHandler.js` | Error handling | ~50 |
| `src/config/firebase.js` | Firebase config | ~60 |

**Total Source Code: ~660 lines**

### Documentation
| File | Purpose | LOC |
|------|---------|-----|
| `README.md` | Complete docs | ~400 |
| `QUICK_START.md` | Quick guide | ~200 |
| `FIREBASE_SETUP.md` | Setup guide | ~300 |
| `ARCHITECTURE.md` | Architecture | ~500 |
| `DEPLOYMENT.md` | Deploy guide | ~400 |
| `BUILD_SUMMARY.md` | Summary | ~300 |

**Total Documentation: ~2,100 lines**

---

## ✅ Checklist for First Run

- [ ] Read **QUICK_START.md**
- [ ] Follow **FIREBASE_SETUP.md** to configure Firebase
- [ ] Copy `.env.example` to `.env`
- [ ] Edit `.env` with your configuration
- [ ] Place `serviceAccountKey.json` in project root
- [ ] Run `npm run dev` to start server
- [ ] Test with `npm test` or Postman
- [ ] Import `postman_collection.json` for API testing

---

## 🔍 Common Tasks

### Start Development
```bash
npm run dev
```

### Test API
```bash
npm test
```

### Register a User
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456","name":"Test User"}'
```

### Check Service Health
```bash
curl http://localhost:3001/health
```

### View Logs
Check terminal output where `npm run dev` is running

---

## 🆘 Troubleshooting

### Issue: Cannot find module 'serviceAccountKey.json'
- **Solution**: Follow FIREBASE_SETUP.md to download and place the file

### Issue: Port 3001 already in use
- **Solution**: Change PORT in `.env` or kill process on port 3001

### Issue: Firebase connection error
- **Solution**: Verify serviceAccountKey.json path in `.env`

### Issue: CORS error
- **Solution**: Add frontend URL to ALLOWED_ORIGINS in `.env`

---

## 📞 Support

- Check README.md for detailed documentation
- Check FIREBASE_SETUP.md for Firebase issues
- Check QUICK_START.md for quick reference
- Review ARCHITECTURE.md for system design

---

## 📈 Project Status

- ✅ **Version**: 1.0.0
- ✅ **Status**: Production Ready
- ✅ **Test Coverage**: Basic tests implemented
- ✅ **Documentation**: Complete
- ✅ **Security**: Firebase rules configured
- ✅ **Deployment**: Guides provided

---

## 🎯 Next Steps

1. Complete Firebase setup
2. Test all endpoints
3. Integrate with frontend
4. Deploy to production
5. Build remaining microservices:
   - Item Inventory
   - Cart Management
   - Order Management

---

**Project**: AkasaEats Food Ordering Platform  
**Microservice**: User Registration, Login & Authentication  
**Build Date**: November 6, 2025  
**Status**: ✅ Complete
