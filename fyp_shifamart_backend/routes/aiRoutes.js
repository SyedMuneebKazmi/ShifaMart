const express = require('express');
const router = express.Router();
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');
const { validateRequest } = require('../utils/validation');
const { body } = require('express-validator');

// Health check - public
router.get('/health', aiController.checkAIHealth);

// Emergency numbers - public
router.get('/first-aid/emergency-numbers', aiController.getEmergencyNumbers);

// First aid types - public
router.get('/first-aid/types', aiController.getFirstAidTypes);

// Reference data - public
router.get('/symptoms', aiController.getSymptomsList);
router.get('/diseases', aiController.getDiseasesList);

// Chat with AI (main endpoint) - optional auth for demo
router.post('/chat', optionalProtect, [
  body('session_id').optional().isString(),
  body('message').trim().notEmpty().withMessage('Message is required')
], validateRequest, aiController.chatWithAI);

// Analyze symptoms from text - optional auth
router.post('/analyze', optionalProtect, [
  body('text').trim().notEmpty().withMessage('Text is required'),
  body('top_k').optional().isInt({ min: 1, max: 10 }).withMessage('top_k must be between 1 and 10')
], validateRequest, aiController.analyzeSymptoms);

// Predict from symptoms list - optional auth
router.post('/predict', optionalProtect, [
  body('symptoms').isArray().withMessage('Symptoms must be an array'),
  body('symptoms.*').isString().withMessage('Each symptom must be a string'),
  body('duration').optional().isString(),
  body('top_k').optional().isInt({ min: 1, max: 10 })
], validateRequest, aiController.predictDisease);

// Check severity - optional auth
router.post('/severity', optionalProtect, [
  body('symptoms').isArray().withMessage('Symptoms must be an array'),
  body('symptoms.*').isString(),
  body('duration').optional().isString()
], validateRequest, aiController.checkSeverity);

// Get first aid instructions - optional auth
router.post('/first-aid', optionalProtect, [
  body('symptoms').optional().isArray(),
  body('emergency_type').optional().isString()
], validateRequest, aiController.getFirstAid);

// Delete chat session from AI memory - requires auth
router.delete('/chat/:sessionId', protect, aiController.endAISession);

module.exports = router;