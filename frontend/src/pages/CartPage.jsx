import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import './CartPage.css';

const CartPage = () => {
  const { cart, loading, error, fetchCart, validateCart, clearCart, getCartTotal } = useCart();
  const [validating, setValidating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();

  const loadCart = useCallback(() => {
    console.log('CartPage: Loading cart...');
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleValidateCart = async () => {
    setValidating(true);
    await validateCart();
    setValidating(false);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setClearing(true);
      await clearCart();
      setClearing(false);
    }
  };

  const handleCheckout = async () => {
    // Validate cart before checkout
    const validation = await validateCart();
    if (validation && validation.isValid) {
      alert('Checkout functionality coming soon!');
    } else {
      alert('Please fix cart issues before checkout.');
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Cart</h2>
          <p className="error-text">{error}</p>
          <button onClick={loadCart} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to get started!</p>
          <button onClick={() => navigate('/items')} className="browse-btn">
            Browse Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <div className="cart-actions">
            <button 
              onClick={handleValidateCart} 
              className="validate-btn"
              disabled={validating}
            >
              {validating ? 'Validating...' : 'Validate Cart'}
            </button>
            <button 
              onClick={handleClearCart} 
              className="clear-btn"
              disabled={clearing}
            >
              {clearing ? 'Clearing...' : 'Clear Cart'}
            </button>
          </div>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map(item => (
              <CartItem key={item.itemId} item={item} />
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal ({cart.items.length} items)</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>₹50.00</span>
            </div>

            <div className="summary-row total">
              <span>Total</span>
              <span>₹{(getCartTotal() + 50).toFixed(2)}</span>
            </div>

            <button onClick={handleCheckout} className="checkout-btn">
              Proceed to Checkout
            </button>

            <button 
              onClick={() => navigate('/items')} 
              className="continue-shopping-btn"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
