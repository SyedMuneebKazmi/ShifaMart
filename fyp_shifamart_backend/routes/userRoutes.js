const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../utils/validation');
const { body } = require('express-validator');

// All routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('age').optional().isInt({ min: 0, max: 120 }).withMessage('Age must be between 0 and 120'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null])
], validateRequest, userController.updateProfile);

// Medical history routes
router.get('/medical-history', userController.getMedicalHistory);
router.post('/medical-history', [
  body('condition').trim().notEmpty().withMessage('Condition is required'),
  body('diagnosedDate').optional().isISO8601().withMessage('Invalid date format'),
  body('status').optional().isString()
], validateRequest, userController.addMedicalHistory);
router.delete('/medical-history/:historyId', userController.deleteMedicalHistory);

// Allergies routes
router.get('/allergies', userController.getAllergies);
router.post('/allergies', [
  body('allergy').trim().notEmpty().withMessage('Allergy name is required')
], validateRequest, userController.addAllergy);
router.delete('/allergies/:allergy', userController.deleteAllergy);

// Medications routes
router.get('/medications', userController.getMedications);
router.post('/medications', [
  body('name').trim().notEmpty().withMessage('Medication name is required'),
  body('dosage').optional().isString(),
  body('frequency').optional().isString(),
  body('duration').optional().isString()
], validateRequest, userController.addMedication);
router.delete('/medications/:medicationId', userController.deleteMedication);

// Admin routes (if needed)
router.get('/all', protect, userController.getAllUsers); // Only for admin

module.exports = router;