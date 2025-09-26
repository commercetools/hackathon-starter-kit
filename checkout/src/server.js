const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { URL } = require('url');
require('dotenv').config();

const { ClientBuilder } = require('@commercetools/ts-client');
const { createApiBuilderFromCtpClient } = require('@commercetools/platform-sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limit payload size for DoS protection
app.use(express.static('client/build'));

// Security helpers
function validateCommercetoolsUrl(url) {
  try {
    const parsedUrl = new URL(url);
    // Only allow commercetools domains to prevent SSRF
    const allowedHosts = [
      'session.europe-west1.gcp.commercetools.com',
      'session.us-central1.gcp.commercetools.com',
      'session.australia-southeast1.gcp.commercetools.com',
      'auth.europe-west1.gcp.commercetools.com',
      'auth.us-central1.gcp.commercetools.com',
      'auth.australia-southeast1.gcp.commercetools.com',
      'api.europe-west1.gcp.commercetools.com',
      'api.us-central1.gcp.commercetools.com',
      'api.australia-southeast1.gcp.commercetools.com'
    ];

    return allowedHosts.includes(parsedUrl.hostname) &&
           (parsedUrl.protocol === 'https:');
  } catch (error) {
    return false;
  }
}

function validateInput(input, type) {
  if (!input) return false;

  switch (type) {
    case 'uuid':
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);
    case 'cartId':
      // Allow UUID or commercetools ID format
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input) ||
             /^[a-zA-Z0-9-_]{1,256}$/.test(input);
    case 'currency':
      return /^[A-Z]{3}$/.test(input);
    case 'country':
      return /^[A-Z]{2}$/.test(input);
    case 'locale':
      return /^[a-z]{2}(-[A-Z]{2})?$/.test(input);
    case 'string':
      return typeof input === 'string' && input.length <= 1000;
    case 'number':
      return typeof input === 'number' && input >= 0 && input <= 10000;
    default:
      return false;
  }
}

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

    // Input validation for DoS protection
    if (!cartId || !validateInput(cartId, 'cartId')) {
      return res.status(400).json({ error: 'Valid Cart ID is required' });
    }

    if (locale && !validateInput(locale, 'locale')) {
      return res.status(400).json({ error: 'Invalid locale format' });
    }

    if (returnUrl && !validateInput(returnUrl, 'string')) {
      return res.status(400).json({ error: 'Invalid return URL format' });
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
    // Using the correct endpoint structure with SSRF protection
    const sessionApiUrl = process.env.SESSION_API_URL || 'https://session.europe-west1.gcp.commercetools.com';

    if (!validateCommercetoolsUrl(sessionApiUrl)) {
      return res.status(400).json({ error: 'Invalid session API URL' });
    }

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
    const { currency = 'USD', country = 'US', productId, quantity = 1 } = req.body;

    // Input validation
    if (currency && !validateInput(currency, 'currency')) {
      return res.status(400).json({ error: 'Invalid currency format' });
    }

    if (country && !validateInput(country, 'country')) {
      return res.status(400).json({ error: 'Invalid country format' });
    }

    if (productId && !validateInput(productId, 'string')) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    if (typeof quantity !== 'undefined' && !validateInput(quantity, 'number')) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

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
              productId: productId,
              variantId: 1,
              quantity: quantity,
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


// Start server
app.listen(PORT, () => {
  console.log(`🚀 commercetools Checkout Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛒 Project: ${projectKey}`);

  if (!process.env.CHECKOUT_APPLICATION_ID) {
    console.warn('⚠️  CHECKOUT_APPLICATION_ID not set - please configure in .env');
  }
});