import apiRoot from '../api/client';

const queryCustomer = (customerId: string) => {
  return apiRoot
    .customers()
    .withId({ ID: customerId })
    .get()
    .execute();
};

// Example usage
queryCustomer('99d00b64-e4a9-4ea1-a333-6b05b3f90064')
  .then(({ body }) => {
    console.log('Customer details:', body);
  })
  .catch(console.error);