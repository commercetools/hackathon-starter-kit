# commercetools Composable Commerce Examples

This folder contains examples of using the commercetools Platform SDK with TypeScript.

## Prerequisites

1. Create a commercetools project in the Merchant Center
2. Create API Client credentials with the following scopes:
   - manage_products
   - manage_orders
   - manage_customers

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create your environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your commercetools project credentials:
- Replace `{region}` with your region (e.g., us-central1, europe-west1)
- Add your project key, client ID, and client secret
- Update scopes as needed for your application

## Available Examples

### Customer Operations
- `src/examples/create-customers.ts`: Create new customer accounts
- `src/examples/query-customer.ts`: Retrieve customer details by ID
- `src/examples/update-customer.ts`: Update customer information
- `src/examples/find-customer-by-email.ts`: Search customers by email

### Product Operations
- `src/examples/create-product.ts`: Create new products
- `src/examples/query-product.ts`: Retrieve product details
- `src/examples/search-products.ts`: Search products with filters

### Cart Operations
- `src/examples/create-cart.ts`: Create new shopping carts
- `src/examples/update-cart.ts`: Update cart with line items

## Running Examples

To run any individual example:
```bash
ts-node src/examples/<example-file-name>.ts
```

For instance:
```bash
ts-node src/examples/create-customers.ts
```

See individual files for detailed code examples and comments.