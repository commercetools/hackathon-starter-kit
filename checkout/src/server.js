const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { ClientBuilder } = require('@commercetools/ts-client');
const { createApiBuilderFromCtpClient } = require('@commercetools/platform-sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('client/build'));

// commercetools client setup
const projectKey = process.env.CTP_PROJECT_KEY;
const scopes = process.env.CTP_SCOPES.split(' ');

const authMiddlewareOptions = {
  host: process.env.CTP_AUTH_URL,
  projectKey,
  credentials: {
    clientId: process.env.CTP_CLIENT_ID,
    clientSecret: process.env.CTP_CLIENT_SECRET,
  },
  scopes,
  httpClient: fetch,
};

const httpMiddlewareOptions = {
  host: process.env.CTP_API_URL,
  httpClient: fetch,
};

const ctpClient = new ClientBuilder()
  .withProjectKey(projectKey)
  .withClientCredentialsFlow(authMiddlewareOptions)
  .withHttpMiddleware(httpMiddlewareOptions)
  .withLoggerMiddleware()
  .build();

const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({ projectKey });

// Checkout session creation endpoint
app.post('/api/checkout/session', async (req, res) => {
  try {
    const { cartId, returnUrl, locale = 'en' } = req.body;

    if (!cartId) {
      return res.status(400).json({ error: 'Cart ID is required' });
    }

    console.log(`Creating checkout session for cart: ${cartId}`);

    // Get cart details from commercetools
    const cart = await apiRoot
      .carts()
      .withId({ ID: cartId })
      .get()
      .execute();

    if (!cart.body) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Create checkout session using correct API structure
    const checkoutSessionData = {
      cart: {
        cartRef: {
          id: cartId
        }
      },
      metadata: {
        applicationKey: process.env.CHECKOUT_APPLICATION_ID
      }
      // Optional: Add futureOrderNumber if needed
      // futureOrderNumber: `ORDER-${Date.now()}`
    };

    console.log('Creating checkout session with correct structure:', checkoutSessionData);

    // Call commercetools Checkout API to create session
    // Using the correct endpoint structure
    const sessionApiUrl = process.env.SESSION_API_URL || 'https://session.europe-west1.gcp.commercetools.com';
    const checkoutResponse = await fetch(
      `${sessionApiUrl}/${projectKey}/sessions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify(checkoutSessionData),
      }
    );

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      console.error('Checkout session creation failed:', errorText);
      return res.status(checkoutResponse.status).json({
        error: 'Failed to create checkout session',
        details: errorText
      });
    }

    const checkoutSession = await checkoutResponse.json();

    res.json({
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
      projectKey: projectKey, // Include project key for SDK
      applicationId: process.env.CHECKOUT_APPLICATION_ID, // Include application ID
      cart: {
        id: cart.body.id,
        version: cart.body.version,
        totalPrice: cart.body.totalPrice,
        lineItems: cart.body.lineItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice
        }))
      }
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Sample cart creation endpoint for demo
app.post('/api/cart/create', async (req, res) => {
  try {
    const { currency = 'USD', country = 'US' } = req.body;

    console.log('Creating sample cart...');

    // Create a new cart
    const cart = await apiRoot
      .carts()
      .post({
        body: {
          currency: currency,
          country: country,
          lineItems: [
            {
              productId: req.body.productId || await getSampleProductId(),
              variantId: 1,
              quantity: req.body.quantity || 1,
            }
          ]
        }
      })
      .execute();

    res.json({
      cart: {
        id: cart.body.id,
        version: cart.body.version,
        totalPrice: cart.body.totalPrice,
        lineItems: cart.body.lineItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice
        }))
      }
    });

  } catch (error) {
    console.error('Error creating cart:', error);
    res.status(500).json({
      error: 'Failed to create cart',
      message: error.message
    });
  }
});

// Get products for demo
app.get('/api/products', async (req, res) => {
  try {
    const products = await apiRoot
      .productProjections()
      .search()
      .get({
        queryArgs: {
          limit: 10,
          staged: false
        }
      })
      .execute();

    res.json({
      products: products.body.results.map(product => ({
        id: product.id,
        key: product.key,
        name: product.name,
        description: product.description,
        slug: product.slug,
        masterVariant: {
          id: product.masterVariant.id,
          sku: product.masterVariant.sku,
          prices: product.masterVariant.prices,
          images: product.masterVariant.images
        }
      }))
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// Checkout webhook endpoint
app.post('/api/webhook/checkout', express.raw({type: 'application/json'}), (req, res) => {
  try {
    console.log('Received checkout webhook:', req.body.toString());

    // Parse the webhook payload
    const payload = JSON.parse(req.body.toString());

    // Handle different webhook events
    switch (payload.type) {
      case 'CheckoutSessionCompleted':
        console.log('Checkout session completed:', payload.data);
        // Handle successful payment
        break;
      case 'CheckoutSessionExpired':
        console.log('Checkout session expired:', payload.data);
        // Handle session expiry
        break;
      case 'PaymentCreated':
        console.log('Payment created:', payload.data);
        // Handle payment creation
        break;
      default:
        console.log('Unknown webhook event:', payload.type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: {
      projectKey: process.env.CTP_PROJECT_KEY,
      checkoutAppId: process.env.CHECKOUT_APPLICATION_ID ? '***configured***' : 'NOT_SET'
    }
  });
});

// Helper functions
async function getAccessToken() {
  const authResponse = await fetch(`${process.env.CTP_AUTH_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.CTP_CLIENT_ID}:${process.env.CTP_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: `grant_type=client_credentials&scope=${encodeURIComponent(process.env.CTP_SCOPES)}`,
  });

  const tokenData = await authResponse.json();
  return tokenData.access_token;
}

async function getSampleProductId() {
  try {
    const products = await apiRoot
      .productProjections()
      .search()
      .get({
        queryArgs: { limit: 1 }
      })
      .execute();

    if (products.body.results.length > 0) {
      return products.body.results[0].id;
    }

    throw new Error('No products found in project');
  } catch (error) {
    console.error('Error getting sample product:', error);
    throw error;
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 commercetools Checkout Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛒 Project: ${projectKey}`);

  if (!process.env.CHECKOUT_APPLICATION_ID) {
    console.warn('⚠️  CHECKOUT_APPLICATION_ID not set - please configure in .env');
  }
});