import { useState } from 'react';
import './ItemCard.css';

const ItemCard = ({ item, onAddToCart }) => {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    await onAddToCart(item);
    setAdding(false);
    setAdded(true);
    
    // Reset "added" state after 2 seconds
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="item-card">
      <div className="item-image">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} />
        ) : (
          <div className="no-image">
            <span>🍽️</span>
          </div>
        )}
        {!item.available && (
          <div className="unavailable-badge">Out of Stock</div>
        )}
      </div>

      <div className="item-content">
        <div className="item-category">{item.category}</div>
        <h3 className="item-name">{item.name}</h3>
        <p className="item-description">{item.description}</p>

        <div className="item-footer">
          <div className="item-price">
            <span className="currency">₹</span>
            <span className="amount">{item.price.toFixed(2)}</span>
          </div>

          <button
            className={`add-to-cart-btn ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={!item.available || adding || added}
          >
            {adding ? '...' : added ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
