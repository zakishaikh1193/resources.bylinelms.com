const express = require('express');
const router = express.Router();
const schoolPermissionsController = require('../controllers/schoolPermissionsController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validateSchoolPermissions, validateSchoolId } = require('../middleware/validation');

// All routes require admin authentication
router.use(verifyToken, requireAdmin);

// Get all schools with permission summary
router.get('/', schoolPermissionsController.getSchoolsWithPermissions);

// Get school permissions
router.get('/:schoolId/permissions', validateSchoolId, schoolPermissionsController.getSchoolPermissions);

// Set school permissions (replace all)
router.put('/:schoolId/permissions', validateSchoolId, validateSchoolPermissions, schoolPermissionsController.setSchoolPermissions);

// Add school permissions (upsert)
router.post('/:schoolId/permissions', validateSchoolId, validateSchoolPermissions, schoolPermissionsController.addSchoolPermissions);

// Remove school permissions
router.delete('/:schoolId/permissions', validateSchoolId, validateSchoolPermissions, schoolPermissionsController.removeSchoolPermissions);

module.exports = router;


