import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';
import logo from '../assets/AkasaEats logo.png';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="AkasaEats home">
          <img src={logo} alt="AkasaEats logo" className="navbar-logo-img" />
          <span className="navbar-logo-text">AkasaEats</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/items" className="navbar-link">Browse Items</Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className="navbar-link cart-link">
                🛒 Cart
                {getCartItemCount() > 0 && (
                  <span className="cart-badge">{getCartItemCount()}</span>
                )}
              </Link>
              <Link to="/profile" className="navbar-link">
                👤 {user?.displayName || 'Profile'}
              </Link>
              <button onClick={handleLogout} className="navbar-btn logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-btn">Login</Link>
              <Link to="/register" className="navbar-btn register-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
