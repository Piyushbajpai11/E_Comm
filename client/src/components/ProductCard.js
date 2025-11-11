import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [adding, setAdding] = React.useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    setAdding(true);
    const result = await addToCart(product.id, 1, product.purchaseOptions[0]);
    setAdding(false);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      alert('Please login to add items to wishlist');
      return;
    }
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/products/${product.id}`}>
          <img src={product.image} alt={product.name} />
        </Link>
        {discount > 0 && (
          <span className="discount-badge">-{discount}%</span>
        )}
        <button
          className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FaHeart />
        </button>
      </div>
      <div className="product-info">
        <Link to={`/products/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <p className="product-brand">{product.brand}</p>
        <div className="product-rating">
          <span className="stars">{'⭐'.repeat(Math.floor(product.rating))}</span>
          <span className="rating-text">({product.reviews} reviews)</span>
        </div>
        <div className="product-price">
          <span className="current-price">${product.price.toFixed(2)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="original-price">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        <button
          className="btn btn-primary add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
        >
          <FaShoppingCart /> {adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

