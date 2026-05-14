import api from './api';

/**
 * Medicine service for searching and comparing prices
 */
const medicineService = {
  /**
   * Compare medicine prices across pharmacies
   * Backend expects: { medicineName: string, city: string, latitude?, longitude? }
   * For multiple medicines we call once per medicine and aggregate results.
   * @param {string[]} medicineNames - Array of medicine name strings
   * @param {string} city - City to search in
   * @returns {Promise<{results: Array}>}
   */
  comparePrices: async (medicineNames, city = 'Lahore') => {
    const primaryMedicine = Array.isArray(medicineNames) ? medicineNames[0] : medicineNames;
    const response = await api.post('/medicines/compare-prices', {
      medicineName: primaryMedicine,
      city,
    });
    return response.data;
  },

  /**
   * Compare multiple medicines across ALL pharmacies in the DB.
   * Returns one entry per pharmacy containing an items[] array per requested medicine.
   * @param {string[]} medicineNames
   * @param {Object} [opts]
   * @param {number} [opts.latitude]
   * @param {number} [opts.longitude]
   * @param {string} [opts.city]
   * @param {boolean} [opts.inStockOnly]
   * @param {'price_desc'|'price_asc'|'distance'} [opts.sortBy]
   */
  compareMulti: async (medicineNames, opts = {}) => {
    const names = Array.isArray(medicineNames) ? medicineNames : [medicineNames];
    const response = await api.post('/medicines/compare-multi', {
      medicineNames: names.filter(Boolean),
      ...(typeof opts.latitude === 'number' ? { latitude: opts.latitude } : {}),
      ...(typeof opts.longitude === 'number' ? { longitude: opts.longitude } : {}),
      ...(opts.city ? { city: opts.city } : {}),
      ...(typeof opts.inStockOnly === 'boolean' ? { inStockOnly: opts.inStockOnly } : {}),
      ...(opts.sortBy ? { sortBy: opts.sortBy } : {}),
    });
    return response.data;
  },

  /**
   * Search for medicines
   * @param {string} query - Search query
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  searchMedicine: async (query, filters = {}) => {
    const response = await api.get('/medicines/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  /**
   * List medicines from the global catalogue (paginated).
   * Used by the Pharmacy Inventory Manager.
   */
  getMedicines: async (params = {}) => {
    const response = await api.get('/medicines', { params });
    return response.data;
  },

  /**
   * Create a new medicine in the global catalogue (admin only on backend).
   */
  createMedicine: async (data) => {
    const response = await api.post('/medicines', data);
    return response.data;
  },

  /**
   * Update a medicine in the global catalogue (admin only on backend).
   */
  updateMedicine: async (id, data) => {
    const response = await api.put(`/medicines/${id}`, data);
    return response.data;
  },

  /**
   * Delete a medicine from the global catalogue (admin only on backend).
   */
  deleteMedicine: async (id) => {
    const response = await api.delete(`/medicines/${id}`);
    return response.data;
  },

  /**
   * Add a medicine to the current pharmacy's inventory.
   */
  addToInventory: async (data) => {
    const response = await api.post('/medicines/inventory/add', data);
    return response.data;
  },

  /**
   * Get medicine details by ID
   * @param {string} id - Medicine ID
   * @returns {Promise<Object>}
   */
  getMedicineDetails: async (id) => {
    const response = await api.get(`/medicines/${id}`);
    return response.data;
  },

  /**
   * Get generic alternatives for a medicine
   * @param {string} medicineId - Medicine ID
   * @returns {Promise<Array>}
   */
  getGenericAlternatives: async (medicineId) => {
    const response = await api.get(`/medicines/${medicineId}/alternatives`);
    return response.data;
  },

  /**
   * Check drug interactions
   * @param {string[]} medicineIds - Array of medicine IDs
   * @returns {Promise<{interactions: Array, warnings: Array}>}
   */
  checkInteractions: async (medicineIds) => {
    const response = await api.post('/medicines/check-interactions', { medicineIds });
    return response.data;
  },

  /**
   * Request notification when medicine is available
   * @param {string} medicineId
   * @param {string} pharmacyId
   * @returns {Promise<Object>}
   */
  requestNotification: async (medicineId, pharmacyId) => {
    const response = await api.post('/medicines/notify', { medicineId, pharmacyId });
    return response.data;
  },
};

export default medicineService;
