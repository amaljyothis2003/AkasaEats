# 🛒 Cart Management Service - Build Summary

## Service Overview

The Cart Management Service is the third core microservice of the AkasaEats platform, providing shopping cart functionality with user isolation, real-time stock validation, and seamless integration with the item inventory service.

## 📁 Project Structure

```
cart/
├── src/
│   ├── config/
│   │   └── firebase.js              # Firebase Admin initialization
│   ├── controllers/
│   │   └── cartController.js        # Cart business logic (6 operations)
│   ├── middleware/
│   │   ├── verifyToken.js           # JWT authentication middleware
│   │   └── errorHandler.js          # Global error handling
│   ├── routes/
│   │   └── cart.js                  # API route definitions
│   ├── services/
│   │   └── itemService.js           # Item service integration (Axios)
│   └── server.js                    # Express app initialization
├── .env                             # Environment configuration
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies and scripts
├── test-api.js                      # Automated API tests (13 tests)
└── README.md                        # Complete documentation
```

## 🎯 Key Features

### 1. **User-Isolated Carts**
- Each user has their own cart (userId as document ID)
- Users cannot access other users' carts
- Automatic cart creation on first add

### 2. **Real-Time Stock Validation**
- Validates item availability before adding to cart
- Checks stock on quantity updates
- Pre-checkout validation endpoint

### 3. **Item Service Integration**
- Fetches live item details from inventory service
- Forwards user tokens for authentication
- Handles service unavailability gracefully

### 4. **Automatic Calculations**
- Computes subtotals per item
- Calculates total cart price
- Updates on every cart modification

### 5. **Comprehensive Error Handling**
- User-friendly error messages
- Proper HTTP status codes
- Service-to-service error propagation

## 🔌 API Endpoints (6 Total)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/cart` | Get user's cart | ✅ |
| POST | `/api/v1/cart` | Add item to cart | ✅ |
| PUT | `/api/v1/cart/:itemId` | Update item quantity | ✅ |
| DELETE | `/api/v1/cart/:itemId` | Remove item from cart | ✅ |
| DELETE | `/api/v1/cart` | Clear entire cart | ✅ |
| GET | `/api/v1/cart/validate` | Pre-checkout validation | ✅ |
| GET | `/health` | Health check | ❌ |

## 🗄️ Database Schema

### Firestore Collection: `carts`

```javascript
{
  // Document ID: userId
  userId: "abc123",
  items: [
    {
      itemId: "item_001",
      quantity: 2,
      addedAt: "2024-01-15T10:30:00.000Z"
    }
  ],
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:32:00.000Z"
}
```

**Note**: Only item references stored in cart. Full item details (name, price, images) fetched from item service on demand.

## 🏗️ Architecture Integration

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Auth Service (3001)                                     │
│  - Registers/authenticates user                          │
│  - Issues JWT token                                      │
└───────────────────────┬─────────────────────────────────┘
                        │ Token
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Cart Service (3003) [THIS SERVICE]                      │
│  - Verifies token (verifyToken middleware)               │
│  - Manages cart operations                               │
│  - Calls item service for validation                     │
└───────────┬───────────────────────┬─────────────────────┘
            │                       │
            │ Validate Items        │ Store Cart
            ▼                       ▼
┌─────────────────────┐   ┌─────────────────────┐
│ Item Service (3002) │   │  Firestore DB       │
│ - Check stock       │   │  - carts/           │
│ - Get item details  │   │    {userId}         │
└─────────────────────┘   └─────────────────────┘
```

## 📦 Dependencies

### Production (7 packages)
```json
{
  "express": "^4.18.2",           // Web framework
  "firebase-admin": "^13.0.0",    // Firebase integration
  "cors": "^2.8.5",               // CORS handling
  "dotenv": "^16.3.1",            // Environment config
  "body-parser": "^1.20.2",       // Request parsing
  "morgan": "^1.10.0",            // HTTP logging
  "axios": "^1.6.2"               // HTTP client
}
```

### Development (1 package)
```json
{
  "nodemon": "^3.0.2"             // Auto-reload
}
```

**Total Package Count**: 269 packages (runtime + dependencies)

## 🧪 Testing

### Automated Test Suite
The `test-api.js` script includes **13 comprehensive tests**:

1. ✅ Health check
2. ✅ User registration & login
3. ✅ Get available item from inventory
4. ✅ Get empty cart
5. ✅ Add item to cart
6. ✅ Get cart with items (enriched)
7. ✅ Update item quantity
8. ✅ Validate cart (pre-checkout)
9. ✅ Add duplicate item (should update)
10. ✅ Invalid quantity (error test)
11. ✅ Invalid token (error test)
12. ✅ Remove item from cart
13. ✅ Clear entire cart

### Run Tests
```powershell
# Prerequisites: Start all three services
cd ..\user-registration-login-auth; npm run dev  # Terminal 1
cd ..\item-inventory; npm run dev                # Terminal 2
cd ..\cart; npm run dev                          # Terminal 3

# Run tests
cd ..\cart
node test-api.js
```

## 🚀 Quick Start

### 1. Setup Environment
```powershell
cd cart

# Copy Firebase credentials
Copy-Item ..\user-registration-login-auth\serviceAccountKey.json .\serviceAccountKey.json

# Environment already configured in .env
```

### 2. Start Service
```powershell
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

**Service URL**: http://localhost:3003

### 3. Verify Service
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3003/health"
```

## 🔐 Security Features

1. **JWT Authentication**: All cart endpoints require valid Firebase tokens
2. **User Isolation**: Cart document ID = userId (automatic isolation)
3. **Token Forwarding**: User token passed to item service for authorization
4. **Input Validation**: Validates itemId, quantity, and request bodies
5. **CORS Protection**: Only configured origins allowed
6. **Error Sanitization**: No sensitive data in error responses

## 📊 Code Statistics

| Metric | Count |
|--------|-------|
| Total Files | 11 |
| Source Files | 7 |
| Lines of Code | ~900 |
| API Endpoints | 7 (6 protected + 1 public) |
| Controller Functions | 6 |
| Middleware Functions | 2 |
| Service Functions | 3 |
| Test Cases | 13 |

## 🔄 Integration Points

### Dependencies (Required)
1. **Auth Service** (port 3001)
   - Provides JWT tokens
   - User authentication

2. **Item Inventory Service** (port 3002)
   - Item validation
   - Stock availability
   - Item details (name, price, images)

### Consumers (Future)
1. **Order Service** (to be built)
   - Will read cart during checkout
   - Clear cart after order placement

2. **Frontend Application** (to be built)
   - React app consuming cart APIs
   - Real-time cart updates

## 🎓 Key Implementation Details

### 1. Cart Controller (`cartController.js`)
**285 lines**, 6 exported functions:

- `getCart()`: Fetches cart, enriches with item details, calculates totals
- `addToCart()`: Validates stock, handles duplicates, adds items
- `updateQuantity()`: Updates with stock validation, removes if qty=0
- `removeFromCart()`: Removes specific item
- `clearCart()`: Deletes entire cart document
- `validateCart()`: Pre-checkout validation, checks all items

### 2. Item Service Integration (`itemService.js`)
**97 lines**, 3 functions:

- `getItem()`: Fetches single item details
- `checkStockAvailability()`: Validates stock for item
- `getMultipleItems()`: Bulk item fetch (parallel requests)

**Key Feature**: Forwards user token to item service for authentication

### 3. Middleware
- **verifyToken**: Extracts user from Firebase token, attaches to `req.user`
- **errorHandler**: Global error handling with Axios error support

### 4. Routes
- RESTful design
- All routes protected with `verifyToken`
- Clean route definitions with JSDoc comments

## 📝 Environment Variables

```env
PORT=3003                          # Service port
NODE_ENV=development               # Environment
API_PREFIX=/api/v1                 # API version prefix
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
ITEM_SERVICE_URL=http://localhost:3002/api/v1
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 🎯 Business Logic Highlights

### Cart Operations Flow

1. **Add to Cart**:
   ```
   Verify token → Check item exists → Validate stock → 
   Check if already in cart → Add/Update → Return cart
   ```

2. **Update Quantity**:
   ```
   Verify token → Check cart exists → Validate stock → 
   Update quantity (or remove if 0) → Return cart
   ```

3. **Validate Cart**:
   ```
   Verify token → Get cart → For each item:
     - Check item still exists
     - Validate stock availability
     - Fetch current price
   → Return validation results with issues
   ```

### Edge Cases Handled

- ✅ Cart doesn't exist (auto-create on add)
- ✅ Item not in cart (error on update/remove)
- ✅ Item already in cart (update quantity on add)
- ✅ Quantity = 0 (remove item on update)
- ✅ Insufficient stock (reject with error)
- ✅ Item service unavailable (503 error)
- ✅ Invalid token (401 error)
- ✅ Missing parameters (400 error)

## 🌟 Notable Features

### 1. Enriched Cart Response
Cart items automatically enriched with:
- Item name
- Current price
- Category
- Images
- Calculated subtotal

### 2. Stock Validation
Every cart operation validates against live inventory:
- Add: Check stock before adding
- Update: Check stock before increasing quantity
- Validate: Check all items before checkout

### 3. Automatic Calculations
Cart totals calculated dynamically:
- Per-item subtotal: `quantity × price`
- Cart total: Sum of all subtotals
- Item count: Total items in cart

### 4. Service Resilience
- Graceful handling of item service errors
- Informative error messages
- Proper status codes

## 🔧 NPM Scripts

```json
{
  "start": "node src/server.js",      // Production
  "dev": "nodemon src/server.js",     // Development
  "test": "node test-api.js"          // Run tests
}
```

## 📚 Documentation Files

1. **README.md** (850+ lines)
   - Complete API documentation
   - Usage examples (PowerShell & JavaScript)
   - Architecture diagrams
   - Error handling guide
   - Deployment notes

2. **BUILD_SUMMARY.md** (This file)
   - Build details
   - Code statistics
   - Integration points
   - Implementation notes

3. **Inline Documentation**
   - JSDoc comments on all functions
   - Route descriptions
   - Middleware explanations

## ✅ Completion Checklist

- [x] Firebase configuration
- [x] JWT authentication middleware
- [x] Error handling middleware
- [x] Item service integration
- [x] Cart controller (6 operations)
- [x] API routes
- [x] Express server setup
- [x] Environment configuration
- [x] Comprehensive README
- [x] Automated test suite (13 tests)
- [x] Build summary documentation

## 🎉 Service Status

**Status**: ✅ **COMPLETE & READY FOR TESTING**

The Cart Management Service is fully implemented with:
- ✅ All core functionality
- ✅ Complete documentation
- ✅ Automated tests
- ✅ Security features
- ✅ Error handling
- ✅ Service integration

## 🚦 Next Steps

1. **Start all three services**:
   ```powershell
   # Terminal 1: Auth Service
   cd user-registration-login-auth; npm run dev
   
   # Terminal 2: Item Inventory
   cd item-inventory; npm run dev
   
   # Terminal 3: Cart Service
   cd cart; npm run dev
   ```

2. **Run seed data** (if not already done):
   ```powershell
   cd item-inventory
   node src/scripts/seedData.js
   ```

3. **Run tests**:
   ```powershell
   cd cart
   node test-api.js
   ```

4. **Build frontend** (Next phase):
   - React application
   - Integration with all three services
   - Cart UI with real-time updates

---

**Built with**: Node.js + Express + Firebase  
**Version**: 1.0.0  
**Service Port**: 3003  
**Build Date**: 2024-01-15

