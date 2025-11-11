import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaHeart, FaUser } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <h1>🛍️ E-Commerce</h1>
          </Link>
          
          <div className="navbar-menu">
            <Link to="/products" className="nav-link">Products</Link>
            {user ? (
              <>
                <Link to="/wishlist" className="nav-link">
                  <FaHeart /> Wishlist
                </Link>
                <Link to="/cart" className="nav-link">
                  <FaShoppingCart /> Cart
                  {getCartItemCount() > 0 && (
                    <span className="badge">{getCartItemCount()}</span>
                  )}
                </Link>
                <Link to="/orders" className="nav-link">
                  <FaUser /> Orders
                </Link>
                <div className="user-menu">
                  <span className="user-name">{user.name}</span>
                  <button onClick={handleLogout} className="btn btn-outline">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

