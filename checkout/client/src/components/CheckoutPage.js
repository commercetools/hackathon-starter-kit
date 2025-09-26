import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { checkoutService } from '../services/checkoutService';
import { productService } from '../services/productService';

function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const checkoutRef = useRef(null);

  const [checkoutSession, setCheckoutSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutSDK, setCheckoutSDK] = useState(null);

  const totalPrice = getTotalPrice();

  useEffect(() => {
    if (!cart || !cart.lineItems || cart.lineItems.length === 0) {
      navigate('/cart');
      return;
    }

    initializeCheckout();
  }, [cart, navigate]);

  const initializeCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create checkout session
      const sessionData = {
        cartId: cart.id,
        returnUrl: `${window.location.origin}/checkout/success`,
        locale: 'en'
      };

      const session = await checkoutService.createCheckoutSession(sessionData);

      setCheckoutSession(session);

      // Don't automatically load SDK - let user click the button

    } catch (err) {
      console.error('Checkout initialization error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCheckoutSDK = async (session) => {
    try {
      // Import the commercetools Checkout Browser SDK using the correct method
      const { checkoutFlow } = await import('@commercetools/checkout-browser-sdk');


      // Initialize the checkout using checkoutFlow method
      const checkoutConfig = {
        projectKey: process.env.REACT_APP_CTP_PROJECT_KEY ,
        region: 'europe-west1.gcp',
        sessionId: session.sessionId,
        applicationId: session.applicationId,
        locale: 'en',
        onInfo: (message) => {
          console.log('Checkout message received:', message);
          if (message.code === 'checkout_completed') {
            const orderId = message.payload?.order?.id;
            console.log('Checkout completed! Order ID:', orderId);

            // Clear the cart
            clearCart();

            // Redirect to thank you page with order information
            navigate('/checkout/success', {
              state: {
                orderId: orderId,
                orderNumber: message.payload?.order?.orderNumber,
                totalPrice: getTotalPrice(),
                completedAt: new Date().toISOString()
              }
            });
          }
        }
      };

      // The checkoutFlow method opens a full-screen checkout
      const checkout = await checkoutFlow(checkoutConfig);
      setCheckoutSDK(checkout);

    } catch (err) {
      console.error('SDK loading error:', err);
      throw new Error(`Failed to load checkout: ${err.message}`);
    }
  };

  const handleCheckoutSuccess = (result) => {
    console.log('Checkout successful:', result);

    // Clear the cart
    clearCart();

    // Redirect to success page
    navigate('/checkout/success', {
      state: {
        orderId: result.orderId,
        paymentId: result.paymentId
      }
    });
  };

  const handleCheckoutError = (error) => {
    console.error('Checkout error:', error);
    setError(`Checkout failed: ${error.message}`);
  };

  const handleCheckoutClose = () => {
    console.log('Checkout closed by user');
    // User closed the checkout, stay on the page
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="checkout-section">
          <h2>Setting up checkout...</h2>
          <div className="checkout-loading">
            <div className="loading-spinner"></div>
            <p>Initializing secure checkout process...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-container">
        <div className="checkout-section">
          <h2>Checkout Error</h2>
          <div className="checkout-error">
            <p>{error}</p>
            <div style={{ marginTop: '1rem' }}>
              <button onClick={initializeCheckout} className="btn btn-primary">
                Try Again
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="btn btn-secondary"
                style={{ marginLeft: '1rem' }}
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* Order Summary */}
      <div className="checkout-section">
        <h3>Order Summary</h3>
        {cart && cart.lineItems && (
          <div>
            {cart.lineItems.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid #eee'
              }}>
                <div>
                  <strong>{item.name.en || item.name}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Qty: {item.quantity} × {productService.formatPrice(item.price)}
                  </div>
                </div>
                <div>
                  <strong>{productService.formatPrice(item.totalPrice)}</strong>
                </div>
              </div>
            ))}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '1rem 0',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderTop: '2px solid #213547',
              marginTop: '1rem'
            }}>
              <span>Total:</span>
              <span>{productService.formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Action */}
      <div className="checkout-section">
        <h3>Proceed to Payment</h3>
        {checkoutSession && !loading ? (
          <div>
            <p>Click below to open the secure checkout flow:</p>
            <button
              onClick={() => loadCheckoutSDK(checkoutSession)}
              className="btn btn-success"
              style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
            >
              Open Secure Checkout
            </button>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
              This will open a secure full-screen checkout experience powered by commercetools.
            </p>
          </div>
        ) : (
          <div className="checkout-loading">
            <div className="loading-spinner"></div>
            <p>Preparing checkout session...</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default CheckoutPage;