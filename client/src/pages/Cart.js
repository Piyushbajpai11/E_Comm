import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [validating, setValidating] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleQuantityChange = (productId, purchaseOption, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, purchaseOption);
    } else {
      updateCartItem(productId, newQuantity, purchaseOption);
    }
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) return;

    setValidating(true);
    try {
      const subtotal = getCartTotal();
      const response = await api.post('/coupons/validate', {
        code: couponCode,
        total: subtotal
      });

      if (response.data.valid) {
        setAppliedCoupon(response.data.coupon);
        setDiscount(response.data.discount);
      } else {
        alert('Invalid coupon code');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to validate coupon');
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscount(0);
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          purchaseOption: item.purchaseOption
        })),
        couponCode: appliedCoupon?.code,
        shippingAddress,
        paymentMethod: 'card'
      };

      const response = await api.post('/orders', orderData);
      alert(`Order placed successfully! Order ID: ${response.data.id}`);
      navigate('/orders');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!user) {
    return null;
  }

  const subtotal = getCartTotal();
  const total = subtotal - discount;

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.items.map((item, index) => {
                if (!item.product) return null;
                return (
                  <div key={`${item.productId}-${item.purchaseOption}`} className="cart-item">
                    <img src={item.product.image} alt={item.product.name} />
                    <div className="item-info">
                      <h3>{item.product.name}</h3>
                      <p className="item-brand">{item.product.brand}</p>
                      <p className="item-option">
                        Option: <strong>{item.purchaseOption}</strong>
                      </p>
                      <p className="item-price">${item.product.price.toFixed(2)}</p>
                    </div>
                    <div className="item-quantity">
                      <button
                        onClick={() => handleQuantityChange(
                          item.productId,
                          item.purchaseOption,
                          item.quantity - 1
                        )}
                        className="qty-btn"
                      >
                        <FaMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(
                          item.productId,
                          item.purchaseOption,
                          item.quantity + 1
                        )}
                        className="qty-btn"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <div className="item-total">
                      <strong>${(item.product.price * item.quantity).toFixed(2)}</strong>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId, item.purchaseOption)}
                      className="remove-btn"
                      title="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="summary-section">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <>
                    <div className="summary-row discount-row">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="btn-link">
                      Remove coupon
                    </button>
                  </>
                )}
                <div className="summary-row total-row">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="coupon-section">
                <h3>Apply Coupon</h3>
                <div className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                    className="coupon-input"
                  />
                  <button
                    onClick={handleCouponApply}
                    disabled={validating || !!appliedCoupon}
                    className="btn btn-primary"
                  >
                    {validating ? 'Validating...' : 'Apply'}
                  </button>
                </div>
              </div>

              <div className="shipping-section">
                <h3>Shipping Address</h3>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                  className="address-input"
                />
                <div className="address-row">
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="address-input"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="address-input"
                  />
                </div>
                <div className="address-row">
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={shippingAddress.zip}
                    onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
                    className="address-input"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                    className="address-input"
                  />
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="btn btn-success btn-large"
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

