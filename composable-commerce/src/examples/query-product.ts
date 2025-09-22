import apiRoot from '../api/client';

const queryProductByKey = (productKey: string) => {
  return apiRoot
    .products()
    .withKey({ key: productKey })
    .get({
      queryArgs: {
        expand: [
          'productType',
          'masterVariant.prices[*].channel',
          'masterData.staged.categories[*]'
        ],
      },
    })
    .execute();
};

// Example usage
queryProductByKey('sample-product')
  .then(({ body }) => {
    console.log('Product details:', body);
  })
  .catch((error) => {
    console.error('Failed to fetch product:', error.message);
    if (error.body) {
      console.error('API Error:', error.body);
    }
  });