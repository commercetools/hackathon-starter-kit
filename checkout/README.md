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

3. **Configure Checkout Application**
   - Use sample Checkout application 
   - Change Origin URLs to "Allow all URLs to communicate to the checkout application" for testing purposes
  
4. **Configure Payment Methods**
   - In the Checkout application settings
   - Configure Payment Integrations , install Sample payment connector 
   - Add payment methods (card etc.) and enable them

5. **Copy Application ID**
   - After configuration, copy the **Application ID**
   - You'll need this for your `.env` file

## 🛠 Installation & Setup

### 1. Clone and Install

```bash
# From the hackathon-starter-kit root
cd checkout

# Install server & client dependencies
npm run setup


### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env
cp /client/.env.example /client/.env
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

Edit client `.env` with your project:

```env
REACT_APP_CTP_PROJECT_KEY=consulting
```


## 🎯 Running the Application

### Development Mode

```bash
# Start server
npm run start-server
```

```bash
# Start client
npm run build-client
npm run start-client
```

This starts:
- **Backend server**: http://localhost:3001
- **React client**: http://localhost:3000


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
  - **Visa**: 4111111111111111
  - **Expiry**: Any future date
  - **CVV**: Any 3-digit number

### 4. Order Completion
- Should redirect to success page
- Order ID should be displayed
- Cart should be cleared

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


## 📖 Additional Resources

### commercetools Documentation
- [Checkout Documentation](https://docs.commercetools.com/checkout)
- [Checkout Browser SDK](https://docs.commercetools.com/checkout/browser-sdk)
- [Payment Connectors](https://docs.commercetools.com/checkout/connectors-and-applications)