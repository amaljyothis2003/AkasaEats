import { useState } from 'react';
import { useCart } from '../context/CartContext';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const [updating, setUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    await updateQuantity(item.itemId, newQuantity);
    setUpdating(false);
  };

  const handleRemove = async () => {
    if (window.confirm(`Remove ${item.name} from cart?`)) {
      await removeItem(item.itemId);
    }
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} />
        ) : (
          <div className="no-image">🍽️</div>
        )}
      </div>

      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.name}</h3>
        <p className="cart-item-category">{item.category}</p>
        <p className="cart-item-price">₹{item.price.toFixed(2)} each</p>
      </div>

      <div className="cart-item-controls">
        <div className="quantity-controls">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={updating || item.quantity <= 1}
            className="quantity-btn"
          >
            -
          </button>
          <span className="quantity-value">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={updating}
            className="quantity-btn"
          >
            +
          </button>
        </div>

        <div className="cart-item-total">
          <span className="total-label">Total:</span>
          <span className="total-amount">₹{(item.price * item.quantity).toFixed(2)}</span>
        </div>

        <button onClick={handleRemove} className="remove-btn">
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
