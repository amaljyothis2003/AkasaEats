import { useState, useEffect, useCallback } from 'react';
import { itemsService } from '../services/api';
import { useCart } from '../context/CartContext';
import ItemCard from '../components/ItemCard';
import './ItemsPage.css';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  const filterItems = useCallback(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [items, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      console.log('Fetching items...');
      const response = await itemsService.getAllItems();
      console.log('Items response:', response);
      const data = response.data.data || response.data; // Handle both response formats
      console.log('Items data:', data);
      setItems(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      setCategories(uniqueCategories);
      
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load items. Please try again later.';
      setError(errorMsg);
      console.error('Error fetching items:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item) => {
    await addToCart(item.itemId, 1);
  };

  if (loading) {
    return (
      <div className="items-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="items-page">
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button onClick={fetchItems} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="items-page">
      <div className="items-container">
        {/* Header */}
        <div className="items-header">
          <h1>Browse Our Menu</h1>
          <p>Fresh ingredients, delivered to your doorstep</p>
        </div>

        {/* Search and Filters */}
        <div className="items-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-filters">
            <button
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Items
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="no-items">
            <p>No items found matching your criteria.</p>
            <button 
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="items-count">
              Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            </div>
            <div className="items-grid">
              {filteredItems.map(item => (
                <ItemCard 
                  key={item.itemId} 
                  item={item} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ItemsPage;
