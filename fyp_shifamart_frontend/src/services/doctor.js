import api from './api';

/**
 * Doctor service for profile management
 */
const doctorService = {
  /**
   * Get the logged-in doctor's own profile
   * @returns {Promise<Object>}
   */
  getMyProfile: async () => {
    const response = await api.get('/doctors/profile/me');
    return response.data;
  },

  /**
   * Update the logged-in doctor's profile
   * @param {Object} profileData - Fields to update
   * @returns {Promise<Object>}
   */
  updateMyProfile: async (profileData) => {
    const response = await api.put('/doctors/profile/me', profileData);
    return response.data;
  },

  /**
   * Upload a profile picture / avatar
   * @param {File} file - The image file to upload
   * @returns {Promise<{avatar: string}>}
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/doctors/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get all doctors (public)
   * @param {Object} params - Query params (search, specialization, available)
   * @returns {Promise<Object>}
   */
  getAllDoctors: async (params = {}) => {
    const response = await api.get('/doctors', { params });
    return response.data;
  },

  /**
   * Get a single doctor by ID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },
};

export default doctorService;
