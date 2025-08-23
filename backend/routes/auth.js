const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateSchoolAccountCreation,
  validateUserLogin,
  validateUserId,
  validateAdminUserUpdate,
  validatePasswordReset,
  validatePagination
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.put('/change-password', verifyToken, authController.changePassword);

// Admin routes
router.post('/admin/users/schools', verifyToken, requireAdmin, validateSchoolAccountCreation, authController.createSchoolAccount);
router.post('/admin/users/admins', verifyToken, requireAdmin, validateSchoolAccountCreation, authController.createAdminAccount);
router.get('/admin/users', verifyToken, requireAdmin, validatePagination, authController.getAllUsers);
router.get('/admin/users/:userId', verifyToken, requireAdmin, validateUserId, authController.getUserById);
router.put('/admin/users/:userId', verifyToken, requireAdmin, validateUserId, validateAdminUserUpdate, authController.updateUser);
router.put('/admin/users/:userId/password', verifyToken, requireAdmin, validateUserId, validatePasswordReset, authController.resetUserPassword);
router.put('/admin/users/:userId/status', verifyToken, requireAdmin, validateUserId, authController.updateUserStatus);
router.delete('/admin/users/:userId', verifyToken, requireAdmin, validateUserId, authController.deleteUser);

module.exports = router;
