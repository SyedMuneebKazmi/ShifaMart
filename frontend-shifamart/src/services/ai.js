import api from './api';

/**
 * AI service for symptom prediction and chat
 */
const aiService = {
  /**
   * Predict diseases based on symptoms
   * @param {string[]} symptoms - Array of symptom strings
   * @returns {Promise<{predictions: Array, suggested_action: string}>}
   */
  predictDisease: async (symptoms) => {
    const response = await api.post('/ai/predict', { symptoms });
    return response.data;
  },

  /**
   * Chat with AI agent
   * @param {string} message - User message
   * @param {Object} context - Conversation context
   * @returns {Promise<{response: string, actions: Array}>}
   */
  chatWithAI: async (message, context = {}) => {
    const response = await api.post('/ai/chat', { message, context });
    return response.data;
  },

  /**
   * Get chat history
   * @param {number} limit - Number of messages to retrieve
   * @returns {Promise<Array>}
   */
  getChatHistory: async (limit = 50) => {
    const response = await api.get('/ai/chat/history', { params: { limit } });
    return response.data;
  },

  /**
   * Analyze symptoms with detailed report
   * @param {Object} symptomData - Detailed symptom information
   * @returns {Promise<Object>}
   */
  analyzeSymptoms: async (symptomData) => {
    const response = await api.post('/ai/analyze-symptoms', symptomData);
    return response.data;
  },
};

export default aiService;
