const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const medicineController = require('../controllers/medicineController');
const { validateRequest } = require('../utils/validation');
const { body } = require('express-validator');

// Search medicines (no auth required)
router.get('/search', medicineController.searchMedicines);

// Compare medicine prices across pharmacies (no auth required)
router.post('/compare-prices', [
  body('medicineName').trim().notEmpty().withMessage('Medicine name is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
], validateRequest, medicineController.comparePrices);

// Compare MULTIPLE medicines across ALL pharmacies (no auth required)
router.post('/compare-multi', [
  body('medicineNames').isArray({ min: 1 }).withMessage('medicineNames must be a non-empty array'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('city').optional().isString(),
  body('sortBy').optional().isIn(['price_desc', 'price_asc', 'distance']),
  body('inStockOnly').optional().isBoolean(),
], validateRequest, medicineController.compareMultipleMedicines);

// All other medicine routes require authentication
router.use(protect);

// Get all medicines (with pagination and filters)
router.get('/', medicineController.getMedicines);

// Get single medicine by ID
router.get('/:id', medicineController.getMedicineById);

// Create medicine (admin only)
router.post('/', [
  body('name').trim().notEmpty().withMessage('Medicine name is required'),
  body('genericName').trim().notEmpty().withMessage('Generic name is required'),
  body('dosage').trim().notEmpty().withMessage('Dosage is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').trim().optional(),
  body('manufacturer').trim().optional(),
], validateRequest, medicineController.createMedicine);

// Update medicine (admin only)
router.put('/:id', [
  body('name').trim().optional(),
  body('genericName').trim().optional(),
  body('dosage').trim().optional(),
  body('category').trim().optional(),
], validateRequest, medicineController.updateMedicine);

// Delete medicine (admin only)
router.delete('/:id', medicineController.deleteMedicine);

// Add medicine to pharmacy inventory
router.post('/inventory/add', [
  body('medicineId').notEmpty().withMessage('Medicine ID is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date'),
], validateRequest, medicineController.addToInventory);

module.exports = router;
