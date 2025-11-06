# AkasaEats Frontend

Modern React frontend for the AkasaEats food ordering platform built with Vite.

## 🚀 Features

- **User Authentication**: Register, login, and manage user profiles
- **Browse Items**: Search and filter food items by category
- **Shopping Cart**: Add items, update quantities, and manage cart
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Protected Routes**: Secure pages requiring authentication
- **Real-time Updates**: Cart and auth state management with Context API

## 🛠️ Tech Stack

- **Build Tool**: Vite 7.2.1
- **Framework**: React 18
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios
- **Authentication**: Firebase Client SDK
- **State Management**: React Context API
- **Styling**: Custom CSS with gradients and animations
- **Icons**: Heroicons

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── CartItem.jsx   # Cart item display
│   │   ├── ItemCard.jsx   # Product card
│   │   ├── Navbar.jsx     # Navigation bar
│   │   └── ProtectedRoute.jsx # Route guard
│   ├── context/           # Context providers
│   │   ├── AuthContext.jsx    # Auth state
│   │   └── CartContext.jsx    # Cart state
│   ├── pages/             # Page components
│   │   ├── HomePage.jsx       # Landing page
│   │   ├── LoginPage.jsx      # Login form
│   │   ├── RegisterPage.jsx   # Registration
│   │   ├── ItemsPage.jsx      # Browse items
│   │   ├── CartPage.jsx       # Shopping cart
│   │   └── ProfilePage.jsx    # User profile
│   ├── services/          # API services
│   │   └── api.js         # Axios instances
│   ├── App.jsx            # Main app
│   └── main.jsx           # Entry point
└── .env                   # Environment variables
```

## 🔧 Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend services running (ports 3001, 3002, 3003)

### Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (`.env`):
```env
VITE_AUTH_API_URL=http://localhost:3001/api/v1
VITE_ITEMS_API_URL=http://localhost:3002/api/v1
VITE_CART_API_URL=http://localhost:3003/api/v1
```

### Development

Start dev server:
```bash
npm run dev
```

App runs on `http://localhost:5173` (or next available port).

### Build

Production build:
```bash
npm run build
```

Preview build:
```bash
npm run preview
```

## 🎨 Design System

### Colors
- **Primary Gradient**: `#667eea` → `#764ba2`
- **Text**: `#333` (primary), `#666` (secondary)
- **Background**: `#f8f9fa`

## 🔐 Authentication Flow

1. Register with email/password
2. Login and receive JWT token
3. Token stored in localStorage
4. Auto-attached to API requests
5. Logout clears token

## 🛒 Cart Management

- Add items with quantity
- Update quantities (+/-)
- Remove individual items
- Clear entire cart
- Validate cart (check availability)
- Persistent across sessions

## 📱 Pages

- **Home**: Hero, features, categories
- **Login/Register**: Authentication forms
- **Items**: Browse, search, filter, add to cart
- **Cart**: Manage items, checkout
- **Profile**: View/edit user info, delete account

## 🔄 State Management

### AuthContext
- `user`, `loading`, `error`, `isAuthenticated`
- `register()`, `login()`, `logout()`
- `updateProfile()`, `deleteAccount()`

### CartContext
- `cart`, `loading`, `error`
- `fetchCart()`, `addToCart()`, `updateQuantity()`
- `removeItem()`, `clearCart()`, `validateCart()`
- `getCartItemCount()`, `getCartTotal()`

## 📦 Dependencies

### Production
- react ^18.3.1
- react-router-dom ^7.1.3
- axios ^1.7.9
- firebase ^11.2.0
- @heroicons/react ^2.2.0

### Development
- vite ^7.2.1
- @vitejs/plugin-react ^4.3.4

## 🚧 Future Enhancements

- [ ] Checkout flow with payment
- [ ] Order history
- [ ] Email verification
- [ ] Password reset
- [ ] Dark mode
- [ ] Product reviews
- [ ] Wishlist
- [ ] Order tracking

## 👥 Support

Contact the AkasaEats development team for assistance.
