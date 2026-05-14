const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
const adminOnly = [
  authMiddleware.protect,
  authMiddleware.authorize('admin')
];

// Get all users
router.get('/users', adminOnly, adminController.getAllUsers);

// Get statistics
router.get('/stats', adminOnly, adminController.getStats);

// Get reports
router.get('/reports', adminOnly, adminController.getReports);

// Deactivate user
router.put('/users/:id/deactivate', adminOnly, adminController.deactivateUser);

// Activate user
router.put('/users/:id/activate', adminOnly, adminController.activateUser);

module.exports = router;
