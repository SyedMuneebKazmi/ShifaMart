const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const doctorController = require('../controllers/doctorController');
const upload = require('../middleware/uploadMiddleware');
const { validateRequest } = require('../utils/validation');
const { body } = require('express-validator');

// Get all doctors (public - no auth required for viewing)
router.get('/', doctorController.getAllDoctors);

// All routes below require authentication
router.use(protect);

// Doctor profile endpoints (doctor-only) — MUST be before /:id
router.get('/profile/me', doctorController.getDoctorProfile);

router.put('/profile/me', [
  body('name').trim().optional(),
  body('specialization').trim().optional(),
  body('experience').optional().isInt({ min: 0 }),
  body('consultationFee').optional().isFloat({ min: 0 }),
  body('hospital').trim().optional(),
  body('qualifications').optional().isString(),
  body('bio').trim().optional(),
  body('availability').optional().isString(),
  body('licenseNumber').trim().optional(),
  body('city').trim().optional(),
  body('phone').trim().optional(),
], validateRequest, doctorController.updateDoctorProfile);

// Avatar upload endpoint
router.post('/profile/avatar', upload.single('avatar'), doctorController.uploadAvatar);

// Get single doctor details (public-ish, but after protect for auth'd users)
router.get('/:id', doctorController.getDoctorById);

// Get available slots for booking
router.get('/:doctorId/slots', doctorController.getAvailableSlots);

// Create appointment
router.post('/:doctorId/appointments', [
  body('date').trim().notEmpty().withMessage('Date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('reason').trim().optional(),
], validateRequest, doctorController.createAppointment);

module.exports = router;
