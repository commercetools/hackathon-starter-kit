import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function Header() {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          commercetools Checkout Example
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">
            Products
          </Link>
          <Link to="/cart" className="nav-link">
            Cart
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;