import api from './api';

/**
 * Medicine service for searching and comparing prices
 */
const medicineService = {
  /**
   * Compare medicine prices across pharmacies
   * @param {string[]} medicines - Array of medicine names
   * @returns {Promise<{results: Array}>}
   */
  comparePrices: async (medicines) => {
    const response = await api.post('/medicine/compare', { medicines });
    return response.data;
  },

  /**
   * Search for medicines
   * @param {string} query - Search query
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  searchMedicine: async (query, filters = {}) => {
    const response = await api.get('/medicine/search', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  },

  /**
   * Get medicine details by ID
   * @param {string} id - Medicine ID
   * @returns {Promise<Object>}
   */
  getMedicineDetails: async (id) => {
    const response = await api.get(`/medicine/${id}`);
    return response.data;
  },

  /**
   * Get generic alternatives for a medicine
   * @param {string} medicineId - Medicine ID
   * @returns {Promise<Array>}
   */
  getGenericAlternatives: async (medicineId) => {
    const response = await api.get(`/medicine/${medicineId}/alternatives`);
    return response.data;
  },

  /**
   * Check drug interactions
   * @param {string[]} medicineIds - Array of medicine IDs
   * @returns {Promise<{interactions: Array, warnings: Array}>}
   */
  checkInteractions: async (medicineIds) => {
    const response = await api.post('/medicine/check-interactions', { medicineIds });
    return response.data;
  },

  /**
   * Request notification when medicine is available
   * @param {string} medicineId 
   * @param {string} pharmacyId 
   * @returns {Promise<Object>}
   */
  requestNotification: async (medicineId, pharmacyId) => {
    const response = await api.post('/medicine/notify', { medicineId, pharmacyId });
    return response.data;
  },
};

export default medicineService;
