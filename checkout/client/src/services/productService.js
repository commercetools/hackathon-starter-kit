import axios from 'axios';

const API_BASE_URL = '/api';

class ProductService {
  async getProducts(limit = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch products'
      );
    }
  }

  async getProduct(productId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch product'
      );
    }
  }

  formatPrice(price) {
    if (!price) {
      console.log('No price provided');
      return 'Price not available';
    }

    // Handle different price structures
    let centAmount, currencyCode;

    if (typeof price === 'object') {
      centAmount = price.centAmount || price.value?.centAmount;
      currencyCode = price.currencyCode || price.value?.currencyCode;
    } else {
      console.log('Invalid price format:', price);
      return 'Invalid price format';
    }

    // Validate centAmount
    if (typeof centAmount !== 'number' || isNaN(centAmount)) {
      console.log('Invalid centAmount:', centAmount);
      return 'Price unavailable';
    }

    const amount = centAmount / 100;
    const currency = currencyCode || 'USD';

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (error) {
      console.error('Error formatting price:', error);
      return `${currency} ${amount.toFixed(2)}`;
    }
  }
}

export const productService = new ProductService();