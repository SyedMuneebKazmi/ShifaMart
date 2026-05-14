const axios = require('axios');
const ChatSession = require('../models/ChatSession');
const User = require('../models/User');

// Python AI API Configuration
// NOTE: FastAPI endpoints are root-based (e.g., /chat, /health), not /api/*
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Axios instance for Python API
const pythonAPI = axios.create({
  baseURL: PYTHON_API_URL,
  timeout: 30000, // 30 seconds timeout for AI processing
  headers: {
    'Content-Type': 'application/json',
  }
});

// Handle AI API errors
const handleAIError = (error) => {
  if (error.code === 'ECONNREFUSED') {
    return {
      success: false,
      message: 'AI Service is temporarily unavailable. Please try again later.',
      fallback: true
    };
  }
  
  return {
    success: false,
    message: error.response?.data?.detail || error.message || 'AI Service error',
    error: error.message
  };
};

// @desc    Chat with AI
// @route   POST /api/ai/chat
// @access  Public (with optional auth)
exports.chatWithAI = async (req, res) => {
  try {
    const { session_id, message } = req.body;
    const userId = req.user?.id || 'guest';

    // Generate session ID if not provided
    const sessionId = session_id || `${userId === 'guest' ? 'guest' : 'user'}_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Call Python AI API
    const response = await pythonAPI.post('/api/chat', {
      session_id: sessionId,
      message: message
    });

    const aiResponse = response.data;

    // Save to database (only if user is authenticated)
    const sessionData = {
      userId: userId !== 'guest' ? userId : null,
      sessionId: sessionId,
      $push: {
        messages: [
          { 
            sender: 'user', 
            content: message,
            timestamp: new Date()
          },
          { 
            sender: 'ai', 
            content: aiResponse.response,
            timestamp: new Date(),
            metadata: {
              state: aiResponse.state,
              suggestions: aiResponse.suggestions || [],
              isEmergency: aiResponse.is_emergency || false
            }
          }
        ]
      },
      $addToSet: { 
        symptoms: { $each: aiResponse.collected_symptoms || [] } 
      },
      status: 'active',
      updatedAt: new Date()
    };

    // Add predictions if available
    if (aiResponse.predictions && aiResponse.predictions.length > 0) {
      sessionData.predictions = aiResponse.predictions;
    }

    // Add severity if available
    if (aiResponse.severity) {
      sessionData.severity = aiResponse.severity;
    }

    // Add first aid if available
    if (aiResponse.first_aid) {
      sessionData.firstAid = aiResponse.first_aid;
    }

    // Add specialist recommendation if available
    if (aiResponse.recommended_specialist) {
      sessionData.recommendedSpecialist = aiResponse.recommended_specialist;
    }

    // Update or create session
    const session = await ChatSession.findOneAndUpdate(
      { sessionId: sessionId },
      sessionData,
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );

    // Prepare response for client
    const clientResponse = {
      success: true,
      sessionId: sessionId,
      data: aiResponse,
      metadata: {
        sessionExists: true,
        messageCount: session.messages.length
      }
    };

    // Add Google Maps and Marham URLs if available
    if (aiResponse.google_maps_url) {
      clientResponse.googleMapsUrl = aiResponse.google_maps_url;
    }
    if (aiResponse.marham_url) {
      clientResponse.marhamUrl = aiResponse.marham_url;
    }

    res.json(clientResponse);
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    
    const errorResponse = handleAIError(error);
    
    if (errorResponse.fallback) {
      // Return fallback response
      return res.status(503).json({
        ...errorResponse,
        data: {
          response: "I'm currently undergoing maintenance. For now, please describe your symptoms clearly and we'll guide you to appropriate care.",
          state: "service_unavailable",
          suggestions: ["Try again", "Contact support"],
          is_emergency: false
        }
      });
    }

    res.status(500).json(errorResponse);
  }
};

// @desc    Analyze symptoms from text
// @route   POST /api/ai/analyze
// @access  Private
exports.analyzeSymptoms = async (req, res) => {
  try {
    const { text, top_k } = req.body;

    // FastAPI endpoint for text prediction
    const response = await pythonAPI.post('/api/analyze', {
      text,
      top_k: top_k || 5
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('AI Analyze Error:', error.message);
    const errorResponse = handleAIError(error);
    res.status(500).json(errorResponse);
  }
};

// @desc    Predict disease from symptoms list
// @route   POST /api/ai/predict
// @access  Private
exports.predictDisease = async (req, res) => {
  try {
    const { symptoms, duration, top_k } = req.body;

    // Validate symptoms array
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms array is required and must not be empty'
      });
    }

    const response = await pythonAPI.post('/api/predict', {
      symptoms: symptoms.map(s => s.toLowerCase().replace(/\s+/g, '_')),
      duration,
      top_k: top_k || 5
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('AI Predict Error:', error.message);
    const errorResponse = handleAIError(error);
    res.status(500).json(errorResponse);
  }
};

// @desc    Check severity
// @route   POST /api/ai/severity
// @access  Private
exports.checkSeverity = async (req, res) => {
  try {
    const { symptoms, duration } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms array is required'
      });
    }

    const response = await pythonAPI.post('/api/severity', {
      symptoms: symptoms.map(s => s.toLowerCase().replace(/\s+/g, '_')),
      duration
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('AI Severity Error:', error.message);
    const errorResponse = handleAIError(error);
    res.status(500).json(errorResponse);
  }
};

// @desc    Get first aid instructions
// @route   POST /api/ai/first-aid
// @access  Private
exports.getFirstAid = async (req, res) => {
  try {
    const { symptoms, emergency_type } = req.body;

    // At least one parameter is required
    if (!symptoms && !emergency_type) {
      return res.status(400).json({
        success: false,
        message: 'Either symptoms or emergency_type is required'
      });
    }

    // Map to FastAPI: /api/first-aid
    if (emergency_type) {
      const response = await pythonAPI.post('/api/first-aid', {
        emergency_type
      });
      return res.json({
        success: true,
        data: response.data
      });
    }

    const response = await pythonAPI.post('/api/first-aid', {
      symptoms: symptoms ? symptoms.map(s => s.toLowerCase().replace(/\s+/g, '_')) : []
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('AI First Aid Error:', error.message);
    const errorResponse = handleAIError(error);
    res.status(500).json(errorResponse);
  }
};

// @desc    Get symptoms list
// @route   GET /api/ai/symptoms
// @access  Private
exports.getSymptomsList = async (req, res) => {
  try {
    const response = await pythonAPI.get('/api/symptoms');
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('AI Symptoms List Error:', error.message);
    const errorResponse = handleAIError(error);
    res.status(500).json(errorResponse);
  }
};

// @desc    Get diseases list
// @route   GET /api/ai/diseases
// @access  Private
exports.getDiseasesList = async (req, res) => {
  try {
    const response = await pythonAPI.get('/api/diseases');
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('AI Diseases List Error:', error.message);
    const errorResponse = handleAIError(error);
    res.status(500).json(errorResponse);
  }
};

// @desc    Check AI API health
// @route   GET /api/ai/health
// @access  Private
exports.checkAIHealth = async (req, res) => {
  try {
    const response = await pythonAPI.get('/api/health');
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Health Check Error:', error.message);
    res.status(503).json({
      success: false,
      message: 'AI API is unavailable',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Get first aid types
// @route   GET /api/ai/first-aid/types
// @access  Private
exports.getFirstAidTypes = async (req, res) => {
  try {
    const response = await pythonAPI.get('/api/first-aid/types');
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('AI First Aid Types Error:', error.message);
    const errorResponse = handleAIError(error);
    res.status(500).json(errorResponse);
  }
};

// @desc    Get emergency numbers
// @route   GET /api/ai/first-aid/emergency-numbers
// @access  Private
exports.getEmergencyNumbers = async (req, res) => {
  try {
    const response = await pythonAPI.get('/api/first-aid/emergency-numbers');
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('AI Emergency Numbers Error:', error.message);
    
    // Fallback emergency numbers for Pakistan
    const fallbackNumbers = {
      "Police": "15",
      "Rescue 1122": "1122",
      "Ambulance": "115",
      "Fire Brigade": "16",
      "Women Helpline": "1099",
      "Child Protection": "1121",
      "Traffic Police": "1915"
    };

    res.json({
      success: true,
      data: fallbackNumbers,
      fallback: true
    });
  }
};

// @desc    End AI session
// @route   DELETE /api/ai/chat/:sessionId
// @access  Private
exports.endAISession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    await pythonAPI.delete(`/api/chat/${sessionId}`);

    res.json({
      success: true,
      message: 'AI session ended successfully'
    });
  } catch (error) {
    console.error('End AI Session Error:', error.message);
    
    // Even if AI API fails, we still return success since session is managed locally
    res.json({
      success: true,
      message: 'Session marked as ended locally',
      warning: 'AI session cleanup may have failed'
    });
  }
};