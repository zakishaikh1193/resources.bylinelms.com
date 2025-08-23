const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, organization, designation, phone, address } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, organization, designation, phone, address, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'school')`,
      [name, email, hashedPassword, organization, designation, phone, address]
    );

    // Get the created user (without password)
    const [users] = await pool.execute(
      'SELECT user_id, name, email, role, organization, designation, status, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [result.insertId, 'USER_REGISTER', JSON.stringify({ email, role: 'school' }), req.ip]
    );

    console.log(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: users[0],
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await pool.execute(
      'SELECT user_id, name, email, password, role, organization, designation, status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [user.user_id, 'USER_LOGIN', JSON.stringify({ email, role: user.role }), req.ip]
    );

    // Remove password from response
    delete user.password;

    console.log(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT user_id, name, email, role, organization, designation, phone, address, status, created_at, updated_at 
       FROM users WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, organization, designation, phone, address } = req.body;

    // Update user profile
    await pool.execute(
      `UPDATE users SET name = ?, organization = ?, designation = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = ?`,
      [name, organization, designation, phone, address, req.user.user_id]
    );

    // Get updated user
    const [users] = await pool.execute(
      `SELECT user_id, name, email, role, organization, designation, phone, address, status, created_at, updated_at 
       FROM users WHERE user_id = ?`,
      [req.user.user_id]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [req.user.user_id, 'USER_UPDATE', JSON.stringify({ updatedFields: req.body }), req.ip]
    );

    console.log(`User profile updated: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const [users] = await pool.execute(
      'SELECT password FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [hashedNewPassword, req.user.user_id]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [req.user.user_id, 'PASSWORD_CHANGE', JSON.stringify({ changed: true }), req.ip]
    );

    console.log(`Password changed for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Admin: Create school account
const createSchoolAccount = async (req, res) => {
  try {
    const { name, email, password, organization, designation, phone, address } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new school user
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, organization, designation, phone, address, role, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'school', 'active')`,
      [name, email, hashedPassword, organization, designation, phone, address]
    );

    // Get the created user (without password)
    const [users] = await pool.execute(
      'SELECT user_id, name, email, role, organization, designation, status, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [req.user.user_id, 'ADMIN_CREATE_SCHOOL', JSON.stringify({ 
        createdUserId: result.insertId, 
        email, 
        organization 
      }), req.ip]
    );

    console.log(`Admin ${req.user.email} created school account: ${email}`);

    res.status(201).json({
      success: true,
      message: 'School account created successfully',
      data: users[0]
    });
  } catch (error) {
    console.error('Create school account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create school account'
    });
  }
};

// Admin: Create admin account
const createAdminAccount = async (req, res) => {
  try {
    const { name, email, password, organization, designation, phone, address } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new admin user
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, organization, designation, phone, address, role, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'admin', 'active')`,
      [name, email, hashedPassword, organization, designation, phone, address]
    );

    // Get the created user (without password)
    const [users] = await pool.execute(
      'SELECT user_id, name, email, role, organization, designation, phone, address, status, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [req.user.user_id, 'ADMIN_CREATE_ADMIN', JSON.stringify({ 
        createdUserId: result.insertId, 
        email, 
        organization 
      }), req.ip]
    );

    console.log(`Admin ${req.user.email} created admin account: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: users[0]
    });
  } catch (error) {
    console.error('Create admin account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin account'
    });
  }
};

// Admin: Get all users with filters
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      status, 
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    // Debug logging
    console.log('GetAllUsers called with params:', { page, limit, role, status, search, sort, order });

    // First, let's try a simple query to test the connection
    const [testUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
    console.log('Total users in database:', testUsers[0].count);
    
    // Simple query without any conditions first
    const [allUsers] = await pool.execute(
      'SELECT user_id, name, email, role, organization, designation, phone, address, status, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    console.log('Successfully fetched users:', allUsers.length);

    // Apply filters in JavaScript
    let filteredUsers = allUsers;

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.organization && user.organization.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filteredUsers.sort((a, b) => {
      const aValue = a[sort];
      const bValue = b[sort];
      
      if (order === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const total = filteredUsers.length;

    // Apply pagination in JavaScript
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

// Admin: Get user by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const [users] = await pool.execute(
      `SELECT user_id, name, email, role, organization, designation, phone, address, status, created_at, updated_at 
       FROM users WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
};

// Admin: Update user
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, organization, designation, phone, address, status } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
        [email, userId]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    // Update user
    const updateFields = [];
    const updateParams = [];

    if (name) {
      updateFields.push('name = ?');
      updateParams.push(name);
    }

    if (email) {
      updateFields.push('email = ?');
      updateParams.push(email);
    }

    if (organization !== undefined) {
      updateFields.push('organization = ?');
      updateParams.push(organization);
    }

    if (designation !== undefined) {
      updateFields.push('designation = ?');
      updateParams.push(designation);
    }

    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateParams.push(phone);
    }

    if (address !== undefined) {
      updateFields.push('address = ?');
      updateParams.push(address);
    }

    if (status) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateParams.push(userId);

      await pool.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
        updateParams
      );
    }

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [req.user.user_id, 'ADMIN_UPDATE_USER', JSON.stringify({ 
        targetUserId: userId, 
        updatedFields: req.body 
      }), req.ip]
    );

    console.log(`Admin ${req.user.email} updated user: ${userId}`);

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Admin: Reset user password
const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [hashedPassword, userId]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [req.user.user_id, 'ADMIN_RESET_PASSWORD', JSON.stringify({ 
        targetUserId: userId 
      }), req.ip]
    );

    console.log(`Admin ${req.user.email} reset password for user: ${userId}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// Admin: Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await pool.execute(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [status, userId]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [req.user.user_id, 'ADMIN_UPDATE_STATUS', JSON.stringify({ targetUserId: userId, status }), req.ip]
    );

    console.log(`Admin ${req.user.email} updated user status: ${userId} -> ${status}`);

    res.json({
      success: true,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id, role FROM users WHERE user_id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting another admin
    if (existingUsers[0].role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin accounts'
      });
    }

    // Check if user has resources
    const [resources] = await pool.execute(
      'SELECT COUNT(*) as count FROM resources WHERE created_by = ?',
      [userId]
    );

    if (resources[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with existing resources. Please delete their resources first.'
      });
    }

    // Delete user
    await pool.execute('DELETE FROM users WHERE user_id = ?', [userId]);

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [req.user.user_id, 'ADMIN_DELETE_USER', JSON.stringify({ targetUserId: userId }), req.ip]
    );

    console.log(`Admin ${req.user.email} deleted user: ${userId}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  createSchoolAccount,
  createAdminAccount,
  getAllUsers,
  getUserById,
  updateUser,
  resetUserPassword,
  updateUserStatus,
  deleteUser
};
