import api from './api';

/**
 * Admin service for managing platform and users
 */
const adminService = {
  /**
   * Get all users with optional filters
   * @param {Object} filters - Filter options (role, search, page, limit)
   * @returns {Promise<Object>}
   */
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data.data || [];
  },

  /**
   * Get platform statistics
   * @returns {Promise<Object>}
   */
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data.data || {};
  },

  /**
   * Get reports and activity logs
   * @returns {Promise<Object>}
   */
  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data.data || {};
  },

  /**
   * Deactivate a user
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  deactivateUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/deactivate`);
    return response.data.data || {};
  },

  /**
   * Activate a user
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  activateUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/activate`);
    return response.data.data || {};
  }
};

export default adminService;
