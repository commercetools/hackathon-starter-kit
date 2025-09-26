import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      alert(`Added ${product.name.en || product.name} to cart!`);
    } catch (err) {
      alert(`Failed to add to cart: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="products-container">
        <div className="products-header">
          <h2>Loading products...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-container">
        <div className="products-header">
          <h2>Error loading products</h2>
          <p style={{ color: 'red' }}>{error}</p>
          <button onClick={loadProducts} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="products-container">
        <div className="products-header">
          <h2>No products found</h2>
          <p>Make sure you have products in your commercetools project.</p>
          <button onClick={loadProducts} className="btn btn-primary">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h2>Our Products</h2>
        <p>Choose from our selection of premium products</p>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              {product.masterVariant.images && product.masterVariant.images[0] ? (
                <img
                  src={product.masterVariant.images[0].url}
                  alt={product.name.en || product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                '🛍️'
              )}
            </div>

            <div className="product-content">
              <h3 className="product-name">
                {product.name.en || product.name || 'Unnamed Product'}
              </h3>

              {product.description && (
                <p className="product-description">
                  {product.description.en || product.description || 'No description available'}
                </p>
              )}

              {product.masterVariant.prices && product.masterVariant.prices[0] ? (
                <div className="product-price">
                  {(() => {
                    const price = product.masterVariant.prices[0];
                    console.log('Product price data:', price);
                    return productService.formatPrice(price);
                  })()}
                </div>
              ) : (
                <div className="product-price" style={{ color: '#999' }}>
                  Price not available
                </div>
              )}

              <div className="product-actions">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="btn btn-primary"
                  disabled={!product.masterVariant.prices || product.masterVariant.prices.length === 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;