import api from './api';

/**
 * Emergency service for ambulance and first aid
 */
const emergencyService = {
  /**
   * Trigger ambulance request
   * @param {Object} emergencyData - Emergency details
   * @returns {Promise<{status: string, eta_min: number}>}
   */
  triggerAmbulance: async (emergencyData) => {
    const response = await api.post('/emergency/trigger', emergencyData);
    return response.data;
  },

  /**
   * Get first aid instructions
   * @param {string} emergencyType - Type of emergency
   * @returns {Promise<Object>}
   */
  getFirstAidInstructions: async (emergencyType) => {
    const response = await api.get(`/emergency/first-aid/${emergencyType}`);
    return response.data;
  },

  /**
   * Get all first aid categories
   * @returns {Promise<Array>}
   */
  getFirstAidCategories: async () => {
    const response = await api.get('/emergency/first-aid/categories');
    return response.data;
  },

  /**
   * Report emergency incident
   * @param {Object} incidentData - Incident details
   * @returns {Promise<Object>}
   */
  reportIncident: async (incidentData) => {
    const response = await api.post('/emergency/report', incidentData);
    return response.data;
  },

  /**
   * Get emergency contacts
   * @returns {Promise<Array>}
   */
  getEmergencyContacts: async () => {
    const response = await api.get('/emergency/contacts');
    return response.data;
  },
};

export default emergencyService;
