import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { productService } from '../services/productService';

function CheckoutSuccess() {
  const location = useLocation();
  const { orderId, orderNumber, totalPrice, completedAt, paymentId } = location.state || {};

  useEffect(() => {
    // Optional: Track successful purchase for analytics
    if (orderId) {
      console.log('Order completed:', orderId);
      // You could send analytics events here
      // gtag('event', 'purchase', { transaction_id: orderId, value: totalPrice?.centAmount / 100, currency: totalPrice?.currencyCode });
    }
  }, [orderId, totalPrice]);

  return (
    <div className="success-container">
      <div className="success-icon">✅</div>

      <h1 className="success-title">Payment Successful!</h1>

      <div className="success-message">
        <p>Thank you for your purchase. Your order has been confirmed and will be processed shortly.</p>

        {(orderId || orderNumber) && (
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            margin: '1.5rem 0',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#213547' }}>Order Details:</h4>

            {orderNumber && (
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Order Number:</strong> {orderNumber}</p>
            )}

            {orderId && (
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Order ID:</strong> {orderId}</p>
            )}

            {totalPrice && (
              <p style={{ margin: '0 0 0.5rem 0' }}>
                <strong>Total Amount:</strong> {productService.formatPrice(totalPrice)}
              </p>
            )}

            {completedAt && (
              <p style={{ margin: '0 0 0.5rem 0' }}>
                <strong>Completed:</strong> {new Date(completedAt).toLocaleString()}
              </p>
            )}

            {paymentId && (
              <p style={{ margin: '0' }}><strong>Payment ID:</strong> {paymentId}</p>
            )}
          </div>
        )}

        <div style={{ fontSize: '0.9rem', color: '#666', margin: '1.5rem 0' }}>
          <h4 style={{ color: '#213547' }}>What happens next?</h4>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>You will receive an email confirmation shortly</li>
            <li>Your order will be processed within 1-2 business days</li>
            <li>You'll receive tracking information once shipped</li>
            <li>Estimated delivery: 3-5 business days</li>
          </ul>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>

        {(orderId || orderNumber) && (
          <a
            href={`mailto:support@example.com?subject=Order ${orderNumber || orderId}`}
            className="btn btn-secondary"
          >
            Contact Support
          </a>
        )}
      </div>

      <div style={{
        marginTop: '2rem',
        fontSize: '0.8rem',
        color: '#888',
        textAlign: 'center'
      }}>
        <p>Need help with your order? <a href="mailto:support@example.com" style={{ color: '#213547' }}>Contact Support</a></p>
      </div>
    </div>
  );
}

export default CheckoutSuccess;