const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');
const { validateRequest } = require('../utils/validation');
const { body } = require('express-validator');

// All routes require authentication
router.use(protect);

// Chat with AI (main endpoint)
router.post('/chat', [
  body('session_id').optional().isString(),
  body('message').trim().notEmpty().withMessage('Message is required')
], validateRequest, aiController.chatWithAI);

// Analyze symptoms from text
router.post('/analyze', [
  body('text').trim().notEmpty().withMessage('Text is required'),
  body('top_k').optional().isInt({ min: 1, max: 10 }).withMessage('top_k must be between 1 and 10')
], validateRequest, aiController.analyzeSymptoms);

// Predict from symptoms list
router.post('/predict', [
  body('symptoms').isArray().withMessage('Symptoms must be an array'),
  body('symptoms.*').isString().withMessage('Each symptom must be a string'),
  body('duration').optional().isString(),
  body('top_k').optional().isInt({ min: 1, max: 10 })
], validateRequest, aiController.predictDisease);

// Check severity
router.post('/severity', [
  body('symptoms').isArray().withMessage('Symptoms must be an array'),
  body('symptoms.*').isString(),
  body('duration').optional().isString()
], validateRequest, aiController.checkSeverity);

// Get first aid instructions
router.post('/first-aid', [
  body('symptoms').optional().isArray(),
  body('emergency_type').optional().isString()
], validateRequest, aiController.getFirstAid);

// Reference data
router.get('/symptoms', aiController.getSymptomsList);
router.get('/diseases', aiController.getDiseasesList);

// Health check
router.get('/health', aiController.checkAIHealth);

// First aid types
router.get('/first-aid/types', aiController.getFirstAidTypes);
router.get('/first-aid/emergency-numbers', aiController.getEmergencyNumbers);

// Delete chat session from AI memory
router.delete('/chat/:sessionId', aiController.endAISession);

module.exports = router;