const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Organization name too long'),
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Designation too long'),
  handleValidationErrors
];

// School account creation validation (admin)
const validateSchoolAccountCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('organization')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Organization name must be between 2 and 255 characters'),
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Designation too long'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number too long'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address too long'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Resource creation validation
const validateResourceCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description too long'),
  body('subject_id')
    .isInt({ min: 1 })
    .withMessage('Valid subject ID is required'),
  body('grade_id')
    .isInt({ min: 1 })
    .withMessage('Valid grade ID is required'),
  body('type_id')
    .isInt({ min: 1 })
    .withMessage('Valid resource type ID is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid tag IDs are required'),
  handleValidationErrors
];

// Resource update validation
const validateResourceUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid resource ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description too long'),
  body('subject_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid subject ID is required'),
  body('grade_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid grade ID is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status value'),
  handleValidationErrors
];

// Resource ID validation
const validateResourceId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid resource ID is required'),
  handleValidationErrors
];

// User ID validation
const validateUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  handleValidationErrors
];

// Admin user update validation
const validateAdminUserUpdate = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Organization name too long'),
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Designation too long'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number too long'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address too long'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'banned'])
    .withMessage('Invalid status value'),
  handleValidationErrors
];

// Password reset validation
const validatePasswordReset = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('subject_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid subject ID is required'),
  query('grade_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid grade ID is required'),
  query('type_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid resource type ID is required'),
  handleValidationErrors
];

// Comment validation
const validateComment = [
  body('comment')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  handleValidationErrors
];

// Review validation
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review comment too long'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateSchoolAccountCreation,
  validateUserLogin,
  validateResourceCreation,
  validateResourceUpdate,
  validateResourceId,
  validateUserId,
  validateAdminUserUpdate,
  validatePasswordReset,
  validatePagination,
  validateSearch,
  validateComment,
  validateReview
};
