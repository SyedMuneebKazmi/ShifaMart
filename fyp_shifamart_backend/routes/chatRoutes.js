const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../utils/validation');
const { body } = require('express-validator');

// All routes require authentication
router.use(protect);

// Chat session management
router.post('/sessions', [
  body('initialMessage').optional().isString()
], validateRequest, chatController.createSession);

router.get('/sessions', chatController.getUserSessions);
router.get('/sessions/:sessionId', chatController.getSession);
router.delete('/sessions/:sessionId', chatController.endSession);

// Messages within session
router.post('/sessions/:sessionId/messages', [
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('sender').isIn(['user', 'ai']).withMessage('Sender must be user or ai')
], validateRequest, chatController.addMessage);

router.get('/sessions/:sessionId/messages', chatController.getMessages);

// Health records
router.post('/records', [
  body('sessionId').trim().notEmpty().withMessage('Session ID is required'),
  body('symptoms').optional().isArray(),
  body('predictedDiseases').optional().isArray(),
  body('severityAssessment').optional().isObject()
], validateRequest, chatController.createHealthRecord);

router.get('/records', chatController.getHealthRecords);
router.get('/records/:recordId', chatController.getHealthRecord);
router.put('/records/:recordId', [
  body('actualDiagnosis').optional().isObject(),
  body('followUp').optional().isObject(),
  body('medications').optional().isArray()
], validateRequest, chatController.updateHealthRecord);

// Analytics
router.get('/analytics/summary', chatController.getChatSummary);
router.get('/analytics/health-trends', chatController.getHealthTrends);

module.exports = router;