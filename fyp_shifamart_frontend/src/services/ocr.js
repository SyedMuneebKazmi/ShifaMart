import api from './api';

/**
 * OCR service for prescription analysis
 */
const ocrService = {
  /**
   * Analyze prescription image using OCR
   * @param {File} imageFile - Prescription image file
   * @returns {Promise<{text: string, medicines: Array}>}
   */
  analyzePrescription: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/ocr/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Get prescription history
   * @returns {Promise<Array>}
   */
  getPrescriptionHistory: async () => {
    const response = await api.get('/ocr/prescriptions');
    return response.data;
  },

  /**
   * Get prescription by ID
   * @param {string} id - Prescription ID
   * @returns {Promise<Object>}
   */
  getPrescriptionById: async (id) => {
    const response = await api.get(`/ocr/prescriptions/${id}`);
    return response.data;
  },

  /**
   * Save analyzed prescription
   * @param {Object} prescriptionData - Prescription data
   * @returns {Promise<Object>}
   */
  savePrescription: async (prescriptionData) => {
    const response = await api.post('/ocr/prescriptions', prescriptionData);
    return response.data;
  },

  /**
   * Delete prescription
   * @param {string} id - Prescription ID
   * @returns {Promise<Object>}
   */
  deletePrescription: async (id) => {
    const response = await api.delete(`/ocr/prescriptions/${id}`);
    return response.data;
  },
};

export default ocrService;
