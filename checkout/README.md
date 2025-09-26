# commercetools Checkout Example

A complete React-based e-commerce application demonstrating commercetools Checkout integration with embedded payment processing, cart management, and order completion.

## 🚀 Features

- **Product Catalog**: Browse products from your commercetools project
- **Shopping Cart**: Add, update, and remove items
- **Embedded Checkout**: Secure payment processing with commercetools Checkout
- **Order Completion**: Success page with order confirmation
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Cart and checkout state management

## 📋 Prerequisites

Before running this example, you need:

### 1. commercetools Project Setup
- commercetools account and project
- API client credentials with required scopes
- Sample products in your project (or import using the import example)

### 2. commercetools Checkout Application Setup
This is the **critical step** - you must set up a Checkout application in Merchant Center:

#### Step-by-Step Checkout Setup:

1. **Login to Merchant Center**
   ```
   https://mc.europe-west1.gcp.commercetools.com
   ```

2. **Navigate to Settings > Checkout**
   - In the left sidebar: Settings → Checkout
   - If you don't see "Checkout", ensure your project has Checkout enabled

3. **Create New Checkout Application**
   - Click "Create Application"
   - Fill in application details:
     - **Name**: "Hackathon Checkout App" (or your preferred name)
     - **Description**: "Checkout app for hackathon project"
     - **Application URL**: `http://localhost:3000` (for development)
     - **Allowed Origins**: `http://localhost:3000, http://localhost:3001`

4. **Configure Payment Methods**
   - In the Checkout application settings
   - Add payment methods (Credit Cards, PayPal, etc.)
   - For testing: Enable "Test Mode" payment processors

5. **Copy Application ID**
   - After creation, copy the **Application ID**
   - You'll need this for your `.env` file

### 3. Payment Integration Setup

#### For Testing (Recommended):
1. **Enable Test Payment Processors**
   - In Checkout app settings → Payment Methods
   - Enable "Test Credit Card Processor"
   - No additional setup required for testing

#### For Production:
1. **Configure Real Payment Processors**
   - Stripe: Add Stripe API keys
   - PayPal: Configure PayPal credentials
   - Adyen: Add Adyen credentials
   - Follow specific integration guides for each processor

2. **Webhook Configuration** (Optional but recommended)
   - Set webhook URL: `https://yourdomain.com/api/webhook/checkout`
   - Select events: `checkout.session.completed`, `payment.created`

## 🛠 Installation & Setup

### 1. Clone and Install

```bash
# From the hackathon-starter-kit root
cd checkout-example

# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# commercetools Platform Configuration
CTP_PROJECT_KEY=your-project-key
CTP_CLIENT_ID=your-client-id
CTP_CLIENT_SECRET=your-client-secret
CTP_AUTH_URL=https://auth.europe-west1.gcp.commercetools.com
CTP_API_URL=https://api.europe-west1.gcp.commercetools.com
CTP_SCOPES=manage_project:your-project-key manage_payments:your-project-key

# commercetools Checkout Configuration
CHECKOUT_APPLICATION_ID=your-checkout-application-id-from-step-5-above
CHECKOUT_APPLICATION_URL=https://checkout.europe-west1.gcp.commercetools.com

# Server Configuration
PORT=3001
CLIENT_PORT=3000
```

**⚠️ Critical**: The `CHECKOUT_APPLICATION_ID` must match the Application ID from your Merchant Center Checkout app.

### 3. Verify Setup

Check if everything is configured correctly:

```bash
# Test API connection
npm run server

# In another terminal, test the health endpoint
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": {
    "projectKey": "your-project-key",
    "checkoutAppId": "***configured***"
  }
}
```

### 4. Add Sample Products (Optional)

If your project doesn't have products:

```bash
# Go to composable-commerce example
cd ../composable-commerce

# Run the import example to add sample products
npm run import-product bulk

# Go back to checkout example
cd ../checkout-example
```

## 🎯 Running the Application

### Development Mode

```bash
# Start both server and client concurrently
npm run dev
```

This starts:
- **Backend server**: http://localhost:3001
- **React client**: http://localhost:3000

### Production Build

```bash
# Build the client
npm run build

# Start production server
npm start
```

## 🧪 Testing the Checkout Flow

### 1. Browse Products
- Navigate to http://localhost:3000
- Products should load from your commercetools project
- Add items to cart

### 2. View Cart
- Click the cart icon (should show item count)
- Verify items, quantities, and pricing
- Proceed to checkout

### 3. Complete Checkout
- Fill in shipping/billing information
- Use test card numbers for testing:
  - **Visa**: 4242424242424242
  - **Mastercard**: 5555555555554444
  - **Expiry**: Any future date
  - **CVV**: Any 3-digit number

### 4. Order Completion
- Should redirect to success page
- Order ID should be displayed
- Cart should be cleared

## 🔧 Customization

### Styling
Edit `client/src/App.css` to customize appearance:

```css
/* Change primary color */
.btn-primary {
  background-color: #your-brand-color;
}

/* Customize checkout appearance */
.checkout-embedded {
  /* Custom checkout styling */
}
```

### Checkout SDK Configuration
In `CheckoutPage.js`, customize the SDK loading:

```javascript
const checkout = await CheckoutAPI.loadCheckout({
  sessionId: session.sessionId,
  sessionUrl: session.sessionUrl,
  locale: 'en', // Change locale
  appearance: {
    theme: 'light', // 'light' or 'dark'
    colorPrimary: '#213547', // Your brand color
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif'
  }
});
```

### Adding Custom Fields
Extend the checkout session creation in `server.js`:

```javascript
const checkoutSessionData = {
  cartId: cartId,
  countryCode: cart.body.country || 'US',
  locale: locale,
  returnUrl: returnUrl,
  applicationId: process.env.CHECKOUT_APPLICATION_ID,
  // Add custom fields
  metadata: {
    source: 'hackathon-app',
    campaignId: 'summer2024'
  }
};
```

## 📊 Monitoring & Analytics

### Webhook Events
The server includes webhook handling for:
- `CheckoutSessionCompleted`: Payment successful
- `CheckoutSessionExpired`: Session timed out
- `PaymentCreated`: Payment object created

### Error Tracking
Add error tracking service integration:

```javascript
// In server.js
const Sentry = require('@sentry/node');

app.use(Sentry.Handlers.errorHandler());
```

### Order Analytics
Track successful orders:

```javascript
// In CheckoutSuccess.js
useEffect(() => {
  if (orderId) {
    // Google Analytics
    gtag('event', 'purchase', {
      transaction_id: orderId,
      value: totalAmount,
      currency: 'USD'
    });
  }
}, [orderId]);
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "CHECKOUT_APPLICATION_ID not set"
**Cause**: Missing or incorrect checkout application ID
**Solution**:
- Verify the Application ID in Merchant Center → Settings → Checkout
- Ensure `.env` file has correct `CHECKOUT_APPLICATION_ID`

#### 2. "Failed to create checkout session"
**Causes**:
- Incorrect API credentials
- Missing cart or invalid cart ID
- Checkout application not properly configured

**Solutions**:
- Check API client scopes include `manage_payments`
- Verify cart exists and has items
- Confirm checkout application is active in Merchant Center

#### 3. "No products found"
**Cause**: Empty commercetools project
**Solution**: Import sample products using the import example

#### 4. Checkout SDK fails to load
**Causes**:
- CORS issues
- Invalid session URL
- Network connectivity

**Solutions**:
- Check browser console for CORS errors
- Verify allowed origins in checkout application settings
- Use fallback checkout URL provided in the UI

#### 5. Payments fail in test mode
**Cause**: Test payment processor not configured
**Solution**:
- Enable test mode in checkout application
- Use valid test card numbers
- Check payment processor logs in Merchant Center

### Debug Mode

Enable detailed logging:

```bash
# Set environment variable
NODE_ENV=development npm run dev
```

This enables:
- Console logging for all API calls
- Debug information in UI
- Detailed error messages

### API Endpoints for Testing

Test backend functionality directly:

```bash
# Health check
curl http://localhost:3001/api/health

# Get products
curl http://localhost:3001/api/products

# Create test cart
curl -X POST http://localhost:3001/api/cart/create \
  -H "Content-Type: application/json" \
  -d '{"currency": "USD", "country": "US"}'
```

## 📖 Additional Resources

### commercetools Documentation
- [Checkout Documentation](https://docs.commercetools.com/checkout)
- [Checkout Browser SDK](https://docs.commercetools.com/checkout/browser-sdk)
- [Payment Integration Guide](https://docs.commercetools.com/checkout/payment-integrations)

### API References
- [Platform API](https://docs.commercetools.com/api)
- [Checkout API](https://docs.commercetools.com/checkout/api)

### Payment Processors
- [Stripe Integration](https://docs.commercetools.com/checkout/payment-integrations/stripe)
- [PayPal Integration](https://docs.commercetools.com/checkout/payment-integrations/paypal)
- [Adyen Integration](https://docs.commercetools.com/checkout/payment-integrations/adyen)

## 🤝 Support

- **Documentation**: [docs.commercetools.com](https://docs.commercetools.com)
- **Community**: [community.commercetools.com](https://community.commercetools.com)
- **Support**: [support.commercetools.com](https://support.commercetools.com)

## 📄 License

This example is provided under the MIT License. See LICENSE file for details.

---

**Happy coding! 🚀** If you encounter any issues, refer to the troubleshooting section or reach out to the commercetools community.