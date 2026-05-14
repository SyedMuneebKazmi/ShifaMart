import api from './api';

/**
 * AI service for symptom prediction and chat
 * Connects to the Node.js backend which proxies to Python AI API
 */
const aiService = {
  /**
   * Chat with AI agent - main conversational interface
   * @param {string} message - User message
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object>} AI response with predictions, suggestions, etc.
   */
  chat: async (message, sessionId = null) => {
    const response = await api.post('/ai/chat', { 
      message, 
      session_id: sessionId 
    });
    return response.data;
  },

  /**
   * Predict diseases based on symptoms list
   * @param {string[]} symptoms - Array of symptom strings
   * @param {string} duration - Duration of symptoms
   * @param {number} topK - Number of top predictions
   * @returns {Promise<Object>}
   */
  predictDisease: async (symptoms, duration = null, topK = 5) => {
    const response = await api.post('/ai/predict', { 
      symptoms, 
      duration,
      top_k: topK 
    });
    return response.data;
  },

  /**
   * Analyze symptoms from natural language text
   * @param {string} text - Natural language description
   * @param {number} topK - Number of top predictions
   * @returns {Promise<Object>}
   */
  analyzeText: async (text, topK = 5) => {
    const response = await api.post('/ai/analyze', { 
      text,
      top_k: topK 
    });
    return response.data;
  },

  /**
   * Check severity of symptoms
   * @param {string[]} symptoms - Array of symptoms
   * @param {string} duration - Duration of symptoms
   * @returns {Promise<Object>}
   */
  checkSeverity: async (symptoms, duration = null) => {
    const response = await api.post('/ai/severity', { 
      symptoms, 
      duration 
    });
    return response.data;
  },

  /**
   * Get first aid instructions
   * @param {string[]} symptoms - Array of symptoms
   * @param {string} emergencyType - Type of emergency
   * @returns {Promise<Object>}
   */
  getFirstAid: async (symptoms = null, emergencyType = null) => {
    const response = await api.post('/ai/first-aid', { 
      symptoms, 
      emergency_type: emergencyType 
    });
    return response.data;
  },

  /**
   * Get list of all symptoms
   * @returns {Promise<Object>}
   */
  getSymptomsList: async () => {
    const response = await api.get('/ai/symptoms');
    return response.data;
  },

  /**
   * Get list of all diseases
   * @returns {Promise<Object>}
   */
  getDiseasesList: async () => {
    const response = await api.get('/ai/diseases');
    return response.data;
  },

  /**
   * Get first aid emergency types
   * @returns {Promise<Object>}
   */
  getFirstAidTypes: async () => {
    const response = await api.get('/ai/first-aid/types');
    return response.data;
  },

  /**
   * Get emergency contact numbers
   * @returns {Promise<Object>}
   */
  getEmergencyNumbers: async () => {
    const response = await api.get('/ai/first-aid/emergency-numbers');
    return response.data;
  },

  /**
   * Check AI service health
   * @returns {Promise<Object>}
   */
  checkHealth: async () => {
    const response = await api.get('/ai/health');
    return response.data;
  },

  /**
   * End AI chat session
   * @param {string} sessionId - Session to end
   * @returns {Promise<Object>}
   */
  endSession: async (sessionId) => {
    const response = await api.delete(`/ai/chat/${sessionId}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  analyzeSymptoms: async (symptoms) => {
    if (Array.isArray(symptoms)) {
      return aiService.predictDisease(symptoms);
    }
    return aiService.analyzeText(symptoms);
  },

  chatWithAI: async (message, context = {}) => {
    return aiService.chat(message, context.sessionId);
  },
};

export default aiService;
