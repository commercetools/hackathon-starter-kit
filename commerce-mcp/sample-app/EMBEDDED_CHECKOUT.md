# Embedded Checkout with ACP Integration

This document explains the embedded checkout feature that enables instant product purchases using the Agentic Commerce Protocol (ACP) and Stripe payment tokens.

## 🎯 Overview

The embedded checkout feature allows users to:
1. Search for products using natural language through the chat interface
2. View products in an interactive tile format (similar to ChatGPT Instant Checkout)
3. Purchase products instantly with a single click using the "Buy" button
4. Complete checkout via ACP with Stripe test payment tokens

## 🏗️ Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Chat Interface                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Product   │  │  Product   │  │  Product   │            │
│  │   Tile     │  │   Tile     │  │   Tile     │            │
│  │  [Buy]     │  │  [Buy]     │  │  [Buy]     │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (page.tsx)                        │
│  • handleBuyProduct()                                         │
│  • Product extraction from chat messages                      │
│  • Checkout status management                                │
└──────────────────────────────────────────────────────────────┘
           │                                           │
           ▼                                           ▼
┌─────────────────────────┐       ┌──────────────────────────┐
│  /api/checkout/init     │       │ /api/checkout/complete   │
│  • Create session       │       │ • Generate Stripe token  │
│  • Submit to ACP        │  ───▶ │ • Submit to ACP          │
└─────────────────────────┘       └──────────────────────────┘
           │                                           │
           └───────────────┬───────────────────────────┘
                           ▼
                ┌─────────────────────┐
                │   ACP Server        │
                │ (commercetools)     │
                └─────────────────────┘
```

## 📁 File Structure

```
app/
├── components/
│   └── ProductTile.tsx          # Product tile and grid components
├── lib/
│   ├── stripe.ts                # Stripe test token generation
│   └── commercetools-auth.ts    # commercetools OAuth authentication
├── api/
│   ├── chat/
│   │   └── route.ts             # Updated with product formatting instructions
│   └── checkout/
│       ├── init/
│       │   └── route.ts         # Initialize ACP checkout session (with OAuth)
│       ├── update/
│       │   └── route.ts         # Update session address/shipping (with OAuth)
│       └── complete/
│           └── route.ts         # Complete checkout with payment token (with OAuth)
└── page.tsx                     # Updated chat UI with product tiles
```

## 🔧 Configuration

### commercetools OAuth Setup

All ACP checkout endpoints require authentication using commercetools OAuth 2.0 Client Credentials flow.

**To get your OAuth credentials:**

1. Go to your commercetools Merchant Center
2. Navigate to **Settings > Developer settings**
3. Click **Create new API client**
4. Select scopes (at minimum: `manage_orders`, `manage_payments`)
5. Save the generated credentials:
   - **Client ID**
   - **Client Secret**
   - **Project Key**
   - **API URL** (to determine the region for auth URL)

**Auth URL by region:**
- Europe (GCP): `https://auth.europe-west1.gcp.commercetools.com`
- US (GCP): `https://auth.us-central1.gcp.commercetools.com`
- Australia (GCP): `https://auth.australia-southeast1.gcp.commercetools.com`

The OAuth token is automatically:
- Fetched on first checkout request
- Cached in memory with automatic expiration handling
- Refreshed when expired

### Environment Variables

Add these to your `.env` file:

```bash
# ACP (Agentic Commerce Protocol) Configuration
ACP_URL=https://your-acp-server.commercetools.com

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# commercetools OAuth Configuration (for ACP authentication)
CTP_PROJECT_KEY=your-project-key
CTP_CLIENT_ID=your-client-id
CTP_CLIENT_SECRET=your-client-secret
CTP_AUTH_URL=https://auth.europe-west1.gcp.commercetools.com
CTP_SCOPES=manage_project:your-project-key
```

### ACP URL

The `ACP_URL` should point to your commercetools-hosted ACP server. Contact commercetools support to get your ACP server URL.

### Stripe Test Tokens

The implementation uses Stripe test tokens as documented here:
https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens

Test card numbers are available in `app/lib/stripe.ts`.

## 🎨 Product Display Format

When the AI assistant responds with product information, it must include a JSON code block in this format:

\`\`\`json
{
  "products": [
    {
      "id": "product-id",
      "name": "Product Name",
      "description": "Product description",
      "sku": "PRODUCT-SKU",
      "price": {
        "value": {
          "centAmount": 9999,
          "currencyCode": "USD",
          "fractionDigits": 2
        }
      },
      "images": [{"url": "https://example.com/image.jpg"}]
    }
  ]
}
\`\`\`

The JSON block is automatically:
1. Extracted by the `extractProducts()` function in `page.tsx`
2. Passed to the `ProductGrid` component
3. Rendered as interactive tiles with Buy buttons

## 💳 Checkout Flow

### 1. User Clicks "Buy" Button

```typescript
// In page.tsx
const handleBuyProduct = async (product: Product) => {
  // Step 1: Initialize checkout
  const initResponse = await fetch('/api/checkout/init', {
    method: 'POST',
    body: JSON.stringify({
      productId: product.id,
      sku: product.sku,
      quantity: 1,
    }),
  });

  const { sessionId } = await initResponse.json();

  // Step 2: Complete with payment
  const completeResponse = await fetch('/api/checkout/complete', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
    }),
  });

  const { sessionId: completedSessionId } = await completeResponse.json();
}
```

### 2. Initialize Checkout Session

The `/api/checkout/init` endpoint:
- Obtains commercetools OAuth access token
- Creates a checkout request with product SKU, buyer info, and fulfillment address
- Calls ACP server's `POST /checkout_sessions` endpoint with Bearer token authentication
- Returns a session ID and session data

**Request format:**
```json
{
  "buyer": {
    "first_name": "Test",
    "last_name": "Customer",
    "email": "test@example.com",
    "phone_number": "15558901212"
  },
  "items": [
    {
      "id": "PRODUCT-SKU",
      "quantity": 1
    }
  ],
  "fulfillment_address": {
    "name": "Test Customer",
    "line_one": "789 Beacon St",
    "line_two": "Unit 4B",
    "city": "Boston",
    "state": "MA",
    "country": "US",
    "postal_code": "02215"
  }
}
```

### 3. Complete Checkout

The `/api/checkout/complete` endpoint:
- Obtains commercetools OAuth access token
- Generates a Stripe shared payment token (spt_xxx) using `createSharedPaymentToken()`
- Calls ACP server's `POST /checkout_sessions/{sessionId}/complete` endpoint with Bearer token authentication
- Returns updated session with status "completed"

**Request format:**
```json
{
  "payment_data": {
    "token": "spt_1SUakgPshpOCyD4hP3tOOKgb",
    "provider": "stripe",
    "billing_address": {
      "name": "Test Customer",
      "line_one": "75 State Street",
      "line_two": "",
      "city": "Boston",
      "state": "MA",
      "postal_code": "02109",
      "country": "US"
    }
  },
  "buyer": {
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "Customer",
    "phone_number": "15558901212"
  }
}
```

### 4. Update Checkout Session (Optional)

The `/api/checkout/update` endpoint allows updating the session:
- Obtains commercetools OAuth access token
- Change fulfillment address
- Select shipping option
- Update buyer information
- Calls ACP server's `POST /checkout_sessions/{sessionId}` endpoint with Bearer token authentication

**Request format:**
```json
{
  "buyer": {
    "first_name": "Sarah",
    "last_name": "Jenkins",
    "email": "s.jenkins@example.net",
    "phone_number": "15558901212"
  },
  "fulfillment_option_id": "816d546f-4ab1-4026-bcc0-05c14255c9c9",
  "fulfillment_address": {
    "name": "Sarah Jenkins",
    "line_one": "789 Beacon St",
    "line_two": "Unit 4B",
    "city": "Boston",
    "state": "MA",
    "country": "US",
    "postal_code": "02215"
  }
}
```

### ACP Session Response Format

All ACP endpoints return a session object with the following structure:

```json
{
  "id": "f93c271a-0bad-4dfd-bf7c-c25ecb06d41f",
  "status": "completed",
  "currency": "USD",
  "line_items": [
    {
      "id": "59709f6c-cde2-4bf5-b8e2-5c59ef6ccf81",
      "item": {
        "id": "CARM-024",
        "quantity": 1
      },
      "base_amount": 56610,
      "discount": 0,
      "subtotal": 56610,
      "tax": 9435,
      "total": 56610
    }
  ],
  "totals": [
    {
      "type": "items_base_amount",
      "display_text": "Items Base Amount",
      "amount": 56610
    },
    {
      "type": "subtotal",
      "display_text": "Subtotal",
      "amount": 56610
    },
    {
      "type": "tax",
      "display_text": "Tax",
      "amount": 17768
    },
    {
      "type": "fulfillment",
      "display_text": "Shipping",
      "amount": 50000
    },
    {
      "type": "total",
      "display_text": "Total",
      "amount": 106610
    }
  ],
  "fulfillment_options": [
    {
      "id": "8ac60f15-5a3d-44b4-a613-f70adbe3c6f6",
      "type": "shipping",
      "title": "Standard Shipping",
      "subtitle": "3-5 business days",
      "carrier_info": "Standard",
      "earliest_delivery_time": "2025-12-24T16:22:40.904Z",
      "latest_delivery_time": "2025-12-28T16:22:40.904Z",
      "subtotal": 50000,
      "tax": 0,
      "total": 50000
    },
    {
      "id": "816d546f-4ab1-4026-bcc0-05c14255c9c9",
      "type": "shipping",
      "title": "Express shipping",
      "subtitle": "1-2 business days",
      "carrier_info": "Express Carrier",
      "earliest_delivery_time": "2025-12-24T16:22:40.904Z",
      "latest_delivery_time": "2025-12-25T16:22:40.904Z",
      "subtotal": 75000,
      "tax": 0,
      "total": 75000
    }
  ],
  "fulfillment_option_id": "8ac60f15-5a3d-44b4-a613-f70adbe3c6f6",
  "fulfillment_address": {
    "name": "Sarah Jenkins",
    "line_one": "789 Beacon St",
    "line_two": "Unit 4B",
    "city": "Boston",
    "state": "MA",
    "country": "US",
    "postal_code": "02215"
  },
  "buyer": {
    "email": "s.jenkins@example.net",
    "first_name": "Sarah Jenkins",
    "phone_number": "987654321"
  },
  "messages": [],
  "links": [
    {
      "type": "terms_of_use",
      "url": "http://store.com/tos"
    },
    {
      "type": "privacy_policy",
      "url": "http://store.com/policy"
    },
    {
      "type": "seller_shop_policies",
      "url": "http://store.com/policies"
    }
  ]
}
```

**Important notes about the response:**
- All amounts are in cents (e.g., 56610 = $566.10)
- `status` can be: "pending", "completed", "failed"
- `fulfillment_options` lists available shipping methods
- `totals` provides a breakdown of the order total

## 🧪 Testing

### Testing Product Display

1. Start the development server:
   ```bash
   npm run dev
   ```

2. In the chat, type:
   ```
   Show me all products
   ```

3. The AI should respond with:
   - A text description
   - A JSON code block with product data
   - Product tiles rendered below the message

### Testing Checkout Flow

1. Click the "Buy" button on any product tile

2. Watch the checkout status indicator:
   - "Initializing checkout..."
   - "Processing payment..."
   - "✅ Order placed successfully! Order ID: xxx"

3. Check the browser console for detailed logs

### Mock Mode

If the ACP server is not available, the checkout will fail gracefully with an error message. To test locally without a real ACP server, you can:

1. Mock the ACP endpoints in your development environment
2. Update the API routes to return mock responses
3. Use the provided test card numbers from Stripe

## 📚 References

- [ACP Specification](https://developers.openai.com/commerce/specs/checkout)
- [Stripe Agentic Commerce](https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens)
- [commercetools ACP Documentation](https://docs.commercetools.com/)

## 🔒 Security Notes

⚠️ **Important Security Considerations:**

1. **OAuth Credentials**:
   - **NEVER** commit `.env` file to version control
   - Store `CTP_CLIENT_SECRET` securely (use environment variables in production)
   - Use minimum required scopes for your API client
   - Rotate credentials periodically
   - Token caching is in-memory only (use Redis/similar in production for distributed systems)

2. **Test Tokens Only**: The current implementation uses test payment tokens. In production:
   - Use Stripe.js for PCI-compliant card tokenization
   - Never expose secret keys in frontend code
   - Implement proper payment validation

3. **Session Security**: Ensure ACP sessions are:
   - Time-limited
   - Tied to authenticated users
   - Validated on the backend
   - Protected by OAuth Bearer tokens

4. **HTTPS Required**: Always use HTTPS in production for:
   - Payment token transmission
   - API communications
   - ACP server connections
   - OAuth token requests

## 🚀 Production Deployment

Before deploying to production:

1. **Configure Real Stripe Integration**:
   - Replace mock token generation with real Stripe.js
   - Set up Stripe webhooks
   - Implement proper error handling

2. **Set Production Environment Variables**:
   ```bash
   ACP_URL=https://your-production-acp-server.com
   STRIPE_PUBLISHABLE_KEY=pk_live_your_real_key
   ```

3. **Add User Authentication**:
   - Require login before checkout
   - Associate orders with user accounts
   - Implement order history

4. **Enable Production Features**:
   - Real inventory management
   - Email confirmations
   - Order tracking
   - Payment verification

## 🐛 Troubleshooting

### Products Not Displaying

- Check browser console for JSON parsing errors
- Ensure AI response includes properly formatted JSON block
- Verify the JSON matches the Product interface in `ProductTile.tsx`

### Checkout Failing

- Verify `ACP_URL` is set correctly in `.env`
- Check that ACP server is accessible
- Review server logs for API errors
- Ensure product data includes all required fields

### Images Not Loading

- Placeholder SVG will be shown if image URL is invalid
- Check CORS settings if loading external images
- Verify image URLs are accessible

## 📞 Support

For issues with:
- **ACP Server**: Contact commercetools support
- **Stripe Integration**: See [Stripe Documentation](https://docs.stripe.com)
- **Application Code**: Check the GitHub issues or README
