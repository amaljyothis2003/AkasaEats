# Item Inventory Microservice

A complete **Item Inventory** management system built with Express.js and Firebase for the AkasaEats food ordering platform.

## 🚀 Features

- ✅ Browse all food items with filtering and search
- ✅ Category-based item organization
- ✅ Real-time stock management
- ✅ Image upload support (Firebase Storage)
- ✅ Stock availability checking
- ✅ CRUD operations for items (Admin)
- ✅ Firebase Authentication integration
- ✅ Comprehensive error handling
- ✅ Seed script with 30+ sample items

## 📁 Project Structure

```
item-inventory/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin SDK
│   ├── controllers/
│   │   └── itemController.js    # Item operations
│   ├── middleware/
│   │   ├── verifyToken.js       # JWT verification
│   │   ├── errorHandler.js      # Error handling
│   │   └── upload.js            # Multer config
│   ├── routes/
│   │   └── items.js             # API routes
│   ├── scripts/
│   │   └── seedData.js          # Database seeding
│   └── server.js                # Express app
├── uploads/                      # Temporary upload dir
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── test-api.js
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Admin SDK
- **File Upload**: Multer
- **Middleware**: CORS, Morgan

## 📦 Installation

### Step 1: Install Dependencies

```powershell
cd item-inventory
npm install
```

### Step 2: Environment Configuration

```powershell
Copy-Item .env.example .env
```

Edit `.env`:
```env
PORT=3002
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
API_PREFIX=/api/v1
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Step 3: Firebase Setup

1. Use the same Firebase project from auth service
2. Place `serviceAccountKey.json` in project root
3. Enable Firebase Storage in Firebase Console

### Step 4: Seed Database

```powershell
# Add sample items (30+ items)
npm run seed

# Force reseed (clears existing data)
npm run seed -- --force
```

### Step 5: Run the Service

```powershell
# Development mode
npm run dev

# Production mode
npm start
```

## 🔌 API Endpoints

### Base URL: `http://localhost:3002/api/v1`

All endpoints (except /health) require Firebase ID token in Authorization header.

### Public Endpoint
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |

### Item Browsing (Protected)
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/items` | Get all items | `category`, `search`, `inStock` |
| GET | `/items/categories` | Get all categories | - |
| GET | `/items/category/:category` | Get items by category | - |
| GET | `/items/:id` | Get item by ID | - |

### Item Management (Protected - Admin)
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/items` | Create new item | `name, price, category, stock, description?, image?` |
| PUT | `/items/:id` | Update item | `name?, price?, category?, stock?, description?, image?` |
| DELETE | `/items/:id` | Delete item | - |
| PATCH | `/items/:id/stock` | Update stock | `stock` |

### Stock Management (Protected)
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/items/check-stock` | Check stock availability | `items: [{ itemId, quantity }]` |

## 📝 API Usage Examples

### 1. Get All Items

```powershell
$token = "<your-firebase-id-token>"

Invoke-RestMethod -Uri "http://localhost:3002/api/v1/items" `
  -Headers @{ Authorization = "Bearer $token" }
```

### 2. Filter by Category

```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/v1/items?category=Fruits" `
  -Headers @{ Authorization = "Bearer $token" }
```

### 3. Search Items

```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/v1/items?search=chicken" `
  -Headers @{ Authorization = "Bearer $token" }
```

### 4. Create Item (with image)

```powershell
$body = @{
    name = "Pizza"
    description = "Delicious cheese pizza"
    price = "12.99"
    category = "Fast Food"
    stock = "50"
}

# For file upload, use multipart/form-data
# Better to use Postman for image uploads
```

### 5. Check Stock Availability

```powershell
$body = @{
    items = @(
        @{ itemId = "abc123"; quantity = 2 },
        @{ itemId = "xyz789"; quantity = 5 }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/v1/items/check-stock" `
  -Method Post `
  -Headers @{ 
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body $body
```

## 🗄️ Database Schema

### Firestore Collection: `items`

```javascript
{
  name: String,              // Item name
  description: String,       // Item description
  price: Number,            // Item price
  category: String,         // Category (Fruits, Vegetables, etc.)
  stock: Number,            // Available quantity
  imageUrl: String,         // Firebase Storage URL
  createdAt: Timestamp,     // Creation time
  updatedAt: Timestamp      // Last update time
}
```

### Available Categories

- **Fruits** - Fresh fruits
- **Vegetables** - Fresh vegetables
- **Non-Veg** - Meat, fish, chicken
- **Breads** - Bread, naan, baguettes
- **Beverages** - Drinks, juices
- **Snacks** - Quick bites

## 📷 Image Upload

### Configuration

- **Max Size**: 5MB (configurable in .env)
- **Allowed Types**: JPEG, PNG, GIF
- **Storage**: Firebase Storage
- **Access**: Public URLs

### Upload Example

```javascript
// Using FormData
const formData = new FormData();
formData.append('name', 'Pizza');
formData.append('price', '12.99');
formData.append('category', 'Fast Food');
formData.append('stock', '50');
formData.append('image', file); // File object

fetch('http://localhost:3002/api/v1/items', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`
  },
  body: formData
});
```

## 🌱 Seed Data

The seed script includes **30 sample items**:

- 5 Fruits
- 5 Vegetables  
- 5 Non-Veg items
- 5 Breads
- 5 Beverages
- 5 Snacks

```powershell
# Run seed script
npm run seed

# Force reseed (clears existing)
npm run seed -- --force
```

## 🔐 Authentication

All API endpoints (except `/health`) require:

1. Valid Firebase ID token
2. Authorization header: `Bearer <token>`

Get token from Auth service (port 3001) or Firebase Client SDK.

## 🧪 Testing

### Automated Tests

```powershell
npm test
```

### Manual Testing

1. Import `postman_collection.json` (to be created)
2. Set base URL: `http://localhost:3002/api/v1`
3. Add ID token to Authorization header
4. Test endpoints

## 🚀 Deployment

Same deployment options as auth service:

1. Firebase Cloud Functions
2. Google Cloud Run (Docker)
3. Heroku
4. AWS EC2 / Azure VM

See DEPLOYMENT.md (to be created) for details.

## 🔄 Integration

### With Auth Service

```javascript
// 1. Get ID token from auth service
const idToken = await user.getIdToken();

// 2. Call item inventory service
const response = await fetch('http://localhost:3002/api/v1/items', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});
```

### With Cart Service

```javascript
// Check stock before adding to cart
const checkStock = async (items) => {
  const response = await fetch('http://localhost:3002/api/v1/items/check-stock', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items })
  });
  return response.json();
};
```

## 📊 Query Parameters

### GET /items

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `category` | string | Filter by category | `?category=Fruits` |
| `search` | string | Search in name/description | `?search=chicken` |
| `inStock` | boolean | Only in-stock items | `?inStock=true` |

Combine multiple filters:
```
/items?category=Fruits&inStock=true&search=apple
```

## 🐛 Troubleshooting

### Firebase Storage not working
- Enable Firebase Storage in Firebase Console
- Verify service account has Storage Admin role

### Image upload fails
- Check MAX_FILE_SIZE in `.env`
- Verify file type (JPEG, PNG, GIF only)
- Check Firebase Storage quota

### Items not appearing after seed
- Run seed with `--force` flag
- Check Firestore rules
- Verify Firebase connection

## 📚 Additional Resources

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Express.js Guide](https://expressjs.com/)

## 📄 License

MIT

## 👥 Authors

AkasaEats Development Team - Hackathon 2025

---

**Service Port**: 3002  
**API Base**: `http://localhost:3002/api/v1`  
**Health Check**: `http://localhost:3002/health`
