# 🚀 Cart Service - Quick Setup Guide

## Prerequisites Checklist

Before starting the cart service, ensure you have:

- ✅ Node.js installed (v14 or higher)
- ✅ Firebase project created
- ✅ Firebase service account key downloaded
- ✅ Auth service running on port 3001
- ✅ Item inventory service running on port 3002

## Step-by-Step Setup

### Step 1: Firebase Service Account Key

You need a Firebase service account key JSON file. If you already have one from the auth or item service, you can reuse it.

**Option A: Reuse existing key**
```powershell
# If you have it in auth service
Copy-Item ..\user-registration-login-auth\serviceAccountKey.json .\serviceAccountKey.json

# OR if you have it in item service
Copy-Item ..\item-inventory\serviceAccountKey.json .\serviceAccountKey.json
```

**Option B: Download from Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click gear icon → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Save as `serviceAccountKey.json` in the `cart` directory

### Step 2: Verify Environment Configuration

The `.env` file is already configured with default values:

```env
PORT=3003
NODE_ENV=development
API_PREFIX=/api/v1
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
ITEM_SERVICE_URL=http://localhost:3002/api/v1
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Modify if needed** (usually defaults work fine).

### Step 3: Install Dependencies

If you haven't already:
```powershell
npm install
```

### Step 4: Start Required Services

The cart service depends on two other services:

**Terminal 1: Auth Service**
```powershell
cd ..\user-registration-login-auth
npm run dev
```
Wait for: `✅ Server: http://localhost:3001`

**Terminal 2: Item Inventory Service**
```powershell
cd ..\item-inventory
npm run dev
```
Wait for: `✅ Server: http://localhost:3002`

**Optional: Seed test data**
```powershell
# In item-inventory terminal
node src/scripts/seedData.js
```

### Step 5: Start Cart Service

**Terminal 3: Cart Service**
```powershell
cd cart
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║  🛒 Cart Management Service Started                   ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  📡 Server:    http://localhost:3003                   ║
║  🔧 API:       /api/v1                                 ║
║  🌍 ENV:       development                             ║
║  ✅ Firebase:  Connected                              ║
╚════════════════════════════════════════════════════════╝
```

### Step 6: Verify Service

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3003/health"
```

Expected response:
```json
{
  "success": true,
  "message": "Cart service is running",
  "timestamp": "2024-01-15T...",
  "service": "cart-management"
}
```

## Quick Test

### 1. Register a User
```powershell
$registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/register" -Method POST -ContentType "application/json" -Body (@{
  email = "test@example.com"
  password = "Test123!"
  displayName = "Test User"
} | ConvertTo-Json)

$token = $registerResponse.data.idToken
Write-Host "Token: $token"
```

### 2. Add Item to Cart
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/v1/cart" -Method POST -Headers @{
  "Authorization" = "Bearer $token"
} -ContentType "application/json" -Body (@{
  itemId = "item_001"
  quantity = 2
} | ConvertTo-Json)
```

### 3. Get Cart
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/v1/cart" -Method GET -Headers @{
  "Authorization" = "Bearer $token"
}
```

## Run Full Test Suite

Once all services are running:

```powershell
npm run test
# OR
node test-api.js
```

This will run 13 automated tests covering all cart operations.

## Troubleshooting

### Error: "Cannot find path 'serviceAccountKey.json'"
**Solution**: Download or copy the Firebase service account key (see Step 1)

### Error: "ECONNREFUSED localhost:3001"
**Solution**: Auth service is not running. Start it first (see Step 4)

### Error: "ECONNREFUSED localhost:3002"
**Solution**: Item service is not running. Start it (see Step 4)

### Error: "Item not found in inventory"
**Solution**: Run seed script in item-inventory service:
```powershell
cd ..\item-inventory
node src/scripts/seedData.js
```

### Port Already in Use
**Solution**: Change PORT in `.env` file or kill existing process:
```powershell
# Find process using port 3003
netstat -ano | findstr :3003

# Kill process (replace PID)
taskkill /PID <PID> /F
```

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/expired token | Get new token from auth service |
| 404 Item not found | Item doesn't exist | Use valid itemId from inventory |
| 400 Insufficient stock | Not enough stock | Check item stock quantity |
| 503 Service unavailable | Item service down | Start item service |

## Service Dependencies

```
Cart Service (3003)
├── Requires: Auth Service (3001)
│   └── For: JWT token generation
└── Requires: Item Service (3002)
    └── For: Item validation & details
```

## Next Steps

1. ✅ Complete this setup guide
2. ✅ Verify all three services are running
3. ✅ Run test suite to validate integration
4. 🔄 Build React frontend (next phase)
5. 🔄 Build order service (next phase)

## Support

- Check `README.md` for detailed API documentation
- Check `BUILD_SUMMARY.md` for implementation details
- Review `test-api.js` for usage examples

---

**Need help?** All services should be running on:
- Auth: http://localhost:3001
- Items: http://localhost:3002
- Cart: http://localhost:3003

