# 🛒 Cart Management Service

A robust cart management microservice for the AkasaEats food ordering platform. This service handles shopping cart operations with user isolation, real-time stock validation, and seamless integration with the item inventory service.

## 🌟 Features

- **User-Isolated Carts**: Each user has their own cart, automatically managed by user ID
- **Real-time Stock Validation**: Validates item availability before adding/updating cart
- **Item Service Integration**: Fetches live item details and prices from inventory service
- **Automatic Calculations**: Computes subtotals and totals dynamically
- **Pre-Checkout Validation**: Validates cart before order placement
- **Token-Based Security**: All endpoints protected with Firebase JWT authentication
- **Error Handling**: Comprehensive error messages and status codes

## 📋 Prerequisites

- Node.js (v14 or higher)
- Firebase Admin SDK credentials
- **Running Services**:
  - Auth Service (port 3001) - for user authentication
  - Item Inventory Service (port 3002) - for item validation

## 🚀 Quick Start

### 1. Environment Setup

```powershell
# Navigate to cart service directory
cd cart

# Copy environment template
Copy-Item .env.example .env

# Copy Firebase service account key from auth service
Copy-Item ..\user-registration-login-auth\serviceAccountKey.json .\serviceAccountKey.json
```

### 2. Configure .env

```env
PORT=3003
NODE_ENV=development
API_PREFIX=/api/v1

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Item Service URL
ITEM_SERVICE_URL=http://localhost:3002/api/v1

# CORS (Frontend URLs)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Install & Run

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Or production mode
npm start
```

Server will start on **http://localhost:3003**

## 📚 API Endpoints

All cart endpoints require authentication via `Authorization: Bearer <token>` header.

### Base URL
```
http://localhost:3003/api/v1/cart
```

### 1. Get Cart
Retrieves user's cart with enriched item details.

**Request:**
```http
GET /api/v1/cart
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "abc123",
    "items": [
      {
        "itemId": "item_001",
        "quantity": 2,
        "name": "Fresh Apple",
        "price": 120,
        "category": "Fruits",
        "images": ["https://..."],
        "subtotal": 240
      }
    ],
    "totalItems": 2,
    "totalPrice": 240,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Add Item to Cart
Adds an item or updates quantity if already in cart.

**Request:**
```http
POST /api/v1/cart
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "itemId": "item_001",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "userId": "abc123",
    "items": [
      {
        "itemId": "item_001",
        "quantity": 2,
        "addedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validation:**
- ✅ Item exists in inventory
- ✅ Sufficient stock available
- ✅ Quantity > 0

### 3. Update Item Quantity
Updates the quantity of an item in the cart.

**Request:**
```http
PUT /api/v1/cart/item_001
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "data": {
    "userId": "abc123",
    "items": [
      {
        "itemId": "item_001",
        "quantity": 3,
        "addedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "updatedAt": "2024-01-15T10:32:00Z"
  }
}
```

**Note:** Setting quantity to 0 removes the item from cart.

### 4. Remove Item from Cart
Removes a specific item from the cart.

**Request:**
```http
DELETE /api/v1/cart/item_001
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

### 5. Clear Cart
Removes all items from the cart.

**Request:**
```http
DELETE /api/v1/cart
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

### 6. Validate Cart
Pre-checkout validation to ensure all items are still available and in stock.

**Request:**
```http
GET /api/v1/cart/validate
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cart is valid",
  "data": {
    "valid": true,
    "items": [
      {
        "itemId": "item_001",
        "quantity": 2,
        "name": "Fresh Apple",
        "price": 120,
        "available": true,
        "stockAvailable": 50,
        "subtotal": 240
      }
    ],
    "totalPrice": 240,
    "issues": []
  }
}
```

**Validation Checks:**
- ✅ All items still exist in inventory
- ✅ Sufficient stock for each item
- ✅ No price changes (informational)

**Possible Issues:**
```json
{
  "issues": [
    {
      "itemId": "item_002",
      "issue": "Out of stock",
      "requested": 5,
      "available": 0
    }
  ]
}
```

## 🗄️ Firestore Schema

### Collection: `carts`

Document ID: `{userId}`

```json
{
  "userId": "abc123",
  "items": [
    {
      "itemId": "item_001",
      "quantity": 2,
      "addedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:32:00.000Z"
}
```

**Fields:**
- `userId` (string): User identifier (document ID)
- `items` (array): Array of cart items
  - `itemId` (string): Reference to item in inventory
  - `quantity` (number): Item quantity
  - `addedAt` (timestamp): When item was added
- `createdAt` (timestamp): Cart creation time
- `updatedAt` (timestamp): Last modification time

## 🔧 Testing

### Using PowerShell

```powershell
# 1. Get auth token from auth service
$registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/register" -Method POST -ContentType "application/json" -Body (@{
  email = "test@example.com"
  password = "Test123!"
  displayName = "Test User"
} | ConvertTo-Json)

$token = $registerResponse.data.idToken

# 2. Add item to cart
Invoke-RestMethod -Uri "http://localhost:3003/api/v1/cart" -Method POST -Headers @{
  "Authorization" = "Bearer $token"
} -ContentType "application/json" -Body (@{
  itemId = "item_001"
  quantity = 2
} | ConvertTo-Json)

# 3. Get cart
Invoke-RestMethod -Uri "http://localhost:3003/api/v1/cart" -Method GET -Headers @{
  "Authorization" = "Bearer $token"
}

# 4. Update quantity
Invoke-RestMethod -Uri "http://localhost:3003/api/v1/cart/item_001" -Method PUT -Headers @{
  "Authorization" = "Bearer $token"
} -ContentType "application/json" -Body (@{
  quantity = 5
} | ConvertTo-Json)

# 5. Validate cart
Invoke-RestMethod -Uri "http://localhost:3003/api/v1/cart/validate" -Method GET -Headers @{
  "Authorization" = "Bearer $token"
}

# 6. Remove item
Invoke-RestMethod -Uri "http://localhost:3003/api/v1/cart/item_001" -Method DELETE -Headers @{
  "Authorization" = "Bearer $token"
}

# 7. Clear cart
Invoke-RestMethod -Uri "http://localhost:3003/api/v1/cart" -Method DELETE -Headers @{
  "Authorization" = "Bearer $token"
}
```

### Using JavaScript (Axios)

```javascript
const axios = require('axios');

const CART_URL = 'http://localhost:3003/api/v1/cart';
let token = 'your_token_here';

// Add to cart
await axios.post(CART_URL, {
  itemId: 'item_001',
  quantity: 2
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get cart
const cart = await axios.get(CART_URL, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Update quantity
await axios.put(`${CART_URL}/item_001`, {
  quantity: 3
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Validate cart
const validation = await axios.get(`${CART_URL}/validate`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🏗️ Architecture

### Service Integration

```
User → Auth Service (3001) → Get Token
       ↓
User → Cart Service (3003) → Verify Token
       ↓
Cart Service → Item Service (3002) → Validate Items/Stock
       ↓
Cart Service → Firestore → Store Cart Data
```

### Key Components

1. **Controllers** (`src/controllers/cartController.js`)
   - Business logic for cart operations
   - Integration with item service
   - Automatic calculations

2. **Services** (`src/services/itemService.js`)
   - Axios-based HTTP client
   - Communicates with item inventory service
   - Token forwarding for authentication

3. **Middleware**
   - `verifyToken.js`: JWT authentication
   - `errorHandler.js`: Global error handling

4. **Routes** (`src/routes/cart.js`)
   - RESTful API endpoints
   - Route protection

## 🔐 Security

- **JWT Authentication**: All endpoints require valid Firebase ID tokens
- **User Isolation**: Users can only access their own carts
- **Token Forwarding**: User tokens passed to item service for authorization
- **Input Validation**: Validates itemId, quantity, and other inputs
- **CORS Protection**: Configurable allowed origins

## 🐛 Error Handling

### Common Errors

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Missing or invalid parameters |
| 401 | Unauthorized | Invalid or missing token |
| 404 | Not Found | Cart or item not found |
| 409 | Conflict | Item already in cart (use update) |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | Item service unreachable |

### Example Error Response

```json
{
  "success": false,
  "message": "Item not found in inventory",
  "error": {
    "code": "ITEM_NOT_FOUND",
    "details": "The requested item does not exist"
  }
}
```

## 📦 Dependencies

### Production
- `express`: Web framework
- `firebase-admin`: Firebase integration
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment configuration
- `body-parser`: Request parsing
- `morgan`: HTTP logging
- `axios`: HTTP client for service calls

### Development
- `nodemon`: Auto-reload during development

## 🔄 Integration Points

### Dependencies
1. **Auth Service** (port 3001)
   - Required for user authentication
   - Provides JWT tokens

2. **Item Inventory Service** (port 3002)
   - Required for item validation
   - Provides item details and stock info

### Used By
- **Order Service** (future): Will read from cart during checkout
- **Frontend Application**: React app consuming cart APIs

## 📝 Notes

- Cart data is stored per user (userId as document ID)
- Items are only referenced by ID, details fetched from item service
- Stock validation happens on every add/update operation
- Empty carts are automatically created on first add
- Setting quantity to 0 removes the item
- Validate endpoint should be called before checkout

## 🚀 Deployment

See the main project documentation for deployment instructions.

## 📄 License

This project is part of the AkasaEats platform.

---

**Service Status**: ✅ Operational  
**Version**: 1.0.0  
**Port**: 3003
