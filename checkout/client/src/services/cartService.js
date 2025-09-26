import axios from 'axios';

const API_BASE_URL = '/api';

class CartService {
  async createCart(cartData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/cart/create`, cartData);
      return response.data;
    } catch (error) {
      console.error('Failed to create cart:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to create cart'
      );
    }
  }

  async getCart(cartId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/cart/${cartId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get cart:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to get cart'
      );
    }
  }

  async addToCart(cartId, productData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/cart/${cartId}/items`, productData);
      return response.data;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to add item to cart'
      );
    }
  }

  async updateCartItem(cartId, itemId, quantity) {
    try {
      const response = await axios.put(`${API_BASE_URL}/cart/${cartId}/items/${itemId}`, {
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update cart item'
      );
    }
  }

  async removeCartItem(cartId, itemId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cart/${cartId}/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to remove cart item'
      );
    }
  }
}

export const cartService = new CartService();