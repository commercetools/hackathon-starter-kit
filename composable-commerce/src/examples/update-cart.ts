import apiRoot from '../api/client';

const updateCartWithSku = (cartId: string, version: number, sku: string) => {
  return apiRoot
    .carts()
    .withId({ ID: cartId })
    .post({
      body: {
        version,
        actions: [
          {
            action: 'addLineItem',
            sku: sku,
            quantity: 1,
          },
        ],
      },
    })
    .execute();
};

// Example usage
updateCartWithSku('0fd477cb-1681-4b54-bfea-0c84519e2c3a', 1, 'SKU-example-1')
  .then(({ body }) => {
    console.log('Updated cart:', body);
    console.log('Added line items:', body.lineItems);
  })
  .catch((error) => {
    console.error('Failed to update cart:', error.message);
    if (error.body) {
      console.error('API Error:', error.body);
    }
  });