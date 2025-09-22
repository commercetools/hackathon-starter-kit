import apiRoot from '../api/client';

const updateCustomer = (customerId: string, version: number) => {
  return apiRoot
    .customers()
    .withId({ ID: customerId })
    .post({
      body: {
        version,
        actions: [
          {
            action: 'setFirstName',
            firstName: 'John',
          },
          {
            action: 'setLastName',
            lastName: 'Doe',
          },
        ],
      },
    })
    .execute();
};

// Example usage
updateCustomer('99d00b64-e4a9-4ea1-a333-6b05b3f90064', 1)
  .then(({ body }) => {
    console.log('Updated customer:', body);
  })
  .catch(console.error);