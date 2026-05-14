import api from './api';

/**
 * Authentication service
 */
const authService = {
  /**
   * Login user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{token: string, user: Object}>}
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<{token: string, user: Object}>}
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>}
   */
  getMe: async () => {
    // Backend exposes the current user at /users/profile
    const response = await api.get('/users/profile');
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Request password reset
   * @param {string} email 
   * @returns {Promise<Object>}
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   * @param {string} token 
   * @param {string} newPassword 
   * @returns {Promise<Object>}
   */
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

export default authService;
