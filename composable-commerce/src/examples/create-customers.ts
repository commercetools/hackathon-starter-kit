import apiRoot from '../api/client';

const createCustomer = () => {
  return apiRoot
    .customers()
    .post(
      {
        // The CustomerDraft is the object within the body
        body: {
          email: 'sdk@example.com',
          password: 'examplePassword',
        },
      })
    .execute();
};

// Create the customer and output the Customer ID
createCustomer()
  .then(({ body }) => {
    console.log(body.customer.id);
  })
  .catch(console.error);