const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const pharmacyController = require('../controllers/pharmacyController');
const { validateRequest } = require('../utils/validation');
const { body } = require('express-validator');

// ============================================================
// PUBLIC ROUTES (no authentication required)
// ============================================================

// Get all pharmacies
router.get('/all', pharmacyController.getAllPharmacies);

// Get nearby pharmacies (geolocation)
router.get('/nearby', pharmacyController.getNearbyPharmacies);

// Get inventory (medicines) for a pharmacy
router.get('/:id/inventory', pharmacyController.getPharmacyInventory);

// Get single pharmacy by ID (put last so it doesn't swallow /all, /nearby, etc.)
router.get('/:id', pharmacyController.getPharmacyById);

// ============================================================
// PROTECTED ROUTES (require authentication)
// ============================================================
router.use(protect);

// Create pharmacy profile
router.post('/', [
  body('pharmacyName').trim().notEmpty().withMessage('Pharmacy name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
], validateRequest, pharmacyController.createPharmacy);

// Get my pharmacy (for logged-in pharmacy owner)
router.get('/my-profile', pharmacyController.getMyPharmacy);

// Update pharmacy profile
router.put('/:id', [
  body('pharmacyName').trim().optional(),
  body('address').trim().optional(),
  body('city').trim().optional(),
  body('phoneNumber').trim().optional(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
], validateRequest, pharmacyController.updatePharmacy);

// Delete pharmacy
router.delete('/:id', pharmacyController.deletePharmacy);

// Verify pharmacy (admin only)
router.put('/:id/verify', pharmacyController.verifyPharmacy);

module.exports = router;
