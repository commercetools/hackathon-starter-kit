import axios from 'axios';

const API_BASE_URL = '/api';

class CheckoutService {
  async createCheckoutSession(sessionData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/checkout/session`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to create checkout session'
      );
    }
  }

  async getSessionStatus(sessionId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/checkout/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get session status:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to get session status'
      );
    }
  }
}

export const checkoutService = new CheckoutService();