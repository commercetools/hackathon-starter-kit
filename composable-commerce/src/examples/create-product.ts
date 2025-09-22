import apiRoot from '../api/client';

const createProduct = () => {
  return apiRoot
    .products()
    .post({
      body: {
        key: 'sample-product',
        name: { en: 'Sample Product' },
        productType: {
          typeId: 'product-type',
          id: '194b0fac-ce90-4dc0-a1c0-94bdc89b70f7',
        },
        slug: { en: 'sample-product' },
        masterVariant: {
          sku: 'SKU-example-1',
          prices: [{
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 2000,
            },
          }],
        },
      },
    })
    .execute();
};

// Example usage
createProduct()
  .then(({ body }) => {
    console.log('Created product:', body);
  })
  .catch(console.error);