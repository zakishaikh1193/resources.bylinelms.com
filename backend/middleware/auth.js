const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    console.log('🔍 [AUTH DEBUG] verifyToken called for:', req.path);
    console.log('🔍 [AUTH DEBUG] Authorization header:', req.headers.authorization);
    
    const token = req.headers.authorization?.split(' ')[1];
    console.log('🔍 [AUTH DEBUG] Extracted token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('❌ [AUTH ERROR] No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_2024_byline_learning_solutions');
    console.log('🔍 [AUTH DEBUG] Token decoded successfully:', decoded);
    
    // Get user from database
    const [users] = await pool.execute(
      'SELECT user_id, name, email, role, status FROM users WHERE user_id = ?',
      [decoded.userId]
    );
    console.log('🔍 [AUTH DEBUG] User query result:', users);

    if (users.length === 0) {
      console.log('❌ [AUTH ERROR] User not found for userId:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    const user = users[0];
    console.log('🔍 [AUTH DEBUG] Found user:', user);
    
    if (user.status !== 'active') {
      console.log('❌ [AUTH ERROR] User account not active:', user.status);
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    req.user = user;
    console.log('✅ [AUTH SUCCESS] Token verified, user set:', user.name, user.role);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Check if user is school or admin
const requireSchoolOrAdmin = (req, res, next) => {
  if (req.user.role !== 'school' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'School or admin access required'
    });
  }
  next();
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_2024_byline_learning_solutions');
    
    const [users] = await pool.execute(
      'SELECT user_id, name, email, role, status FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (users.length > 0 && users[0].status === 'active') {
      req.user = users[0];
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireSchoolOrAdmin,
  optionalAuth
};
