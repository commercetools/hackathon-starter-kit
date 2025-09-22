import apiRoot from '../api/client';

const findCustomerByEmail = (email: string) => {
  return apiRoot
    .customers()
    .get({
      queryArgs: {
        where: `email="${email}"`,
      },
    })
    .execute();
};

// Example usage
findCustomerByEmail('sdk@example.com')
  .then(({ body }) => {
    console.log('Found customers:', body.results);
  })
  .catch(console.error);