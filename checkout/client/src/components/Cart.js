import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { productService } from '../services/productService';

function Cart() {
  const {
    cart,
    loading,
    updateQuantity,
    removeItem,
    getTotalPrice,
    getTotalItems
  } = useCart();
  const navigate = useNavigate();

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 0) return;
    updateQuantity(itemId, newQuantity);
  };

  const proceedToCheckout = () => {
    if (!cart || !cart.lineItems || cart.lineItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-container">
        <h2>Loading cart...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!cart || !cart.lineItems || cart.lineItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h2>Your Cart</h2>
        </div>
        <div className="cart-empty">
          <h3>Your cart is empty</h3>
          <p>Start shopping to add items to your cart</p>
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h2>
      </div>

      <div className="cart-items">
        {cart.lineItems.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <h4>{item.name.en || item.name}</h4>
              <p>
                {productService.formatPrice(item.price)} each
              </p>
              {item.productId && (
                <p style={{ fontSize: '0.8rem', color: '#888' }}>
                  Product ID: {item.productId}
                </p>
              )}
            </div>

            <div className="cart-item-quantity">
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                className="quantity-btn"
                disabled={item.quantity <= 1}
              >
                −
              </button>
              <span style={{ minWidth: '40px', textAlign: 'center' }}>
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                className="quantity-btn"
              >
                +
              </button>
            </div>

            <div className="cart-item-total">
              <strong>
                {productService.formatPrice(item.totalPrice)}
              </strong>
              <button
                onClick={() => removeItem(item.id)}
                className="btn btn-danger"
                style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <span>Total: </span>
          <span>{productService.formatPrice(totalPrice)}</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/" className="btn btn-secondary">
            Continue Shopping
          </Link>
          <button
            onClick={proceedToCheckout}
            className="btn btn-success"
            style={{ flex: 1 }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;