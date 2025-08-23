const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

// All admin routes require authentication and admin role
router.use(verifyToken, requireAdmin);

// Dashboard and statistics
router.get('/dashboard', adminController.getDashboardStats);
router.get('/stats/system', adminController.getSystemStats);
router.get('/activity/summary', adminController.getAdminActivitySummary);
router.get('/activity/logs', validatePagination, adminController.getActivityLogs);

module.exports = router;

