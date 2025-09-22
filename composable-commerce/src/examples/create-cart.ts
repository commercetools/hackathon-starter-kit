import apiRoot from '../api/client';

const createCart = () => {
  return apiRoot
    .carts()
    .post({
      body: {
        currency: 'USD',
        country: 'US',
        inventoryMode: 'ReserveOnOrder',
        taxMode: 'Platform',
        taxRoundingMode: 'HalfEven',
      },
    })
    .execute();
};

// Example usage
createCart()
  .then(({ body }) => {
    console.log('Created cart:', body);
  })
  .catch(console.error);