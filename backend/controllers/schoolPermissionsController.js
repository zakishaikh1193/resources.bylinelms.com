const { pool } = require('../config/database');

// Get school permissions
const getSchoolPermissions = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Verify school exists and is a school user
    const [schools] = await pool.execute(
      'SELECT user_id, name, email, organization FROM users WHERE user_id = ? AND role = ?',
      [schoolId, 'school']
    );

    if (schools.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Get permissions grouped by subject
    const [permissions] = await pool.execute(
      `SELECT 
        p.subject_id,
        s.subject_name,
        s.color as subject_color,
        GROUP_CONCAT(p.grade_id ORDER BY g.grade_number) as grade_ids,
        GROUP_CONCAT(g.grade_level ORDER BY g.grade_number) as grade_levels,
        GROUP_CONCAT(g.grade_number ORDER BY g.grade_number) as grade_numbers,
        COUNT(p.grade_id) as total_grades
      FROM school_subject_permissions p
      JOIN subjects s ON p.subject_id = s.subject_id
      JOIN grades g ON p.grade_id = g.grade_id
      WHERE p.school_id = ?
      GROUP BY p.subject_id, s.subject_name, s.color
      ORDER BY s.subject_name`,
      [schoolId]
    );

    // Transform data for easier frontend consumption
    const transformedPermissions = permissions.map(perm => ({
      subject_id: perm.subject_id,
      subject_name: perm.subject_name,
      subject_color: perm.subject_color,
      grade_ids: perm.grade_ids.split(',').map(id => parseInt(id)),
      grade_levels: perm.grade_levels.split(','),
      grade_numbers: perm.grade_numbers.split(',').map(num => parseInt(num)),
      total_grades: perm.total_grades
    }));

    res.json({
      success: true,
      data: {
        school: schools[0],
        permissions: transformedPermissions
      }
    });
  } catch (error) {
    console.error('Get school permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get school permissions'
    });
  }
};

// Set school permissions (replace all)
const setSchoolPermissions = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { permissions } = req.body;

    // Verify school exists and is a school user
    const [schools] = await pool.execute(
      'SELECT user_id, name, email FROM users WHERE user_id = ? AND role = ?',
      [schoolId, 'school']
    );

    if (schools.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Remove existing permissions
      await pool.execute(
        'DELETE FROM school_subject_permissions WHERE school_id = ?',
        [schoolId]
      );

      // Add new permissions
      if (permissions && permissions.length > 0) {
        for (const perm of permissions) {
          const { subject_id, grade_ids } = perm;
          
          // Validate subject exists
          const [subjects] = await pool.execute(
            'SELECT subject_id FROM subjects WHERE subject_id = ?',
            [subject_id]
          );
          
          if (subjects.length === 0) {
            throw new Error(`Subject with ID ${subject_id} not found`);
          }

          // Add each grade for this subject
          for (const grade_id of grade_ids) {
            // Validate grade exists
            const [grades] = await pool.execute(
              'SELECT grade_id FROM grades WHERE grade_id = ?',
              [grade_id]
            );
            
            if (grades.length === 0) {
              throw new Error(`Grade with ID ${grade_id} not found`);
            }

            await pool.execute(
              'INSERT INTO school_subject_permissions (school_id, subject_id, grade_id, created_by) VALUES (?, ?, ?, ?)',
              [schoolId, subject_id, grade_id, req.user.user_id]
            );
          }
        }
      }

      // Commit transaction
      await pool.query('COMMIT');

      // Log activity
      await pool.execute(
        'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
        [req.user.user_id, 'ADMIN_SET_SCHOOL_PERMISSIONS', JSON.stringify({ 
          schoolId, 
          schoolName: schools[0].name,
          permissionsCount: permissions ? permissions.length : 0 
        }), req.ip]
      );

      res.json({
        success: true,
        message: 'School permissions updated successfully'
      });
    } catch (error) {
      // Rollback on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Set school permissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to set school permissions'
    });
  }
};

// Add school permissions (upsert)
const addSchoolPermissions = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { permissions } = req.body;

    // Verify school exists and is a school user
    const [schools] = await pool.execute(
      'SELECT user_id, name, email FROM users WHERE user_id = ? AND role = ?',
      [schoolId, 'school']
    );

    if (schools.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      if (permissions && permissions.length > 0) {
        for (const perm of permissions) {
          const { subject_id, grade_ids } = perm;
          
          // Validate subject exists
          const [subjects] = await pool.execute(
            'SELECT subject_id FROM subjects WHERE subject_id = ?',
            [subject_id]
          );
          
          if (subjects.length === 0) {
            throw new Error(`Subject with ID ${subject_id} not found`);
          }

          // Add each grade for this subject (ignore duplicates)
          for (const grade_id of grade_ids) {
            // Validate grade exists
            const [grades] = await pool.execute(
              'SELECT grade_id FROM grades WHERE grade_id = ?',
              [grade_id]
            );
            
            if (grades.length === 0) {
              throw new Error(`Grade with ID ${grade_id} not found`);
            }

            // Use INSERT IGNORE to handle duplicates
            await pool.execute(
              'INSERT IGNORE INTO school_subject_permissions (school_id, subject_id, grade_id, created_by) VALUES (?, ?, ?, ?)',
              [schoolId, subject_id, grade_id, req.user.user_id]
            );
          }
        }
      }

      // Commit transaction
      await pool.query('COMMIT');

      // Log activity
      await pool.execute(
        'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
        [req.user.user_id, 'ADMIN_ADD_SCHOOL_PERMISSIONS', JSON.stringify({ 
          schoolId, 
          schoolName: schools[0].name,
          permissionsCount: permissions ? permissions.length : 0 
        }), req.ip]
      );

      res.json({
        success: true,
        message: 'School permissions added successfully'
      });
    } catch (error) {
      // Rollback on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Add school permissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add school permissions'
    });
  }
};

// Remove school permissions
const removeSchoolPermissions = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { permissions } = req.body;

    // Verify school exists and is a school user
    const [schools] = await pool.execute(
      'SELECT user_id, name, email FROM users WHERE user_id = ? AND role = ?',
      [schoolId, 'school']
    );

    if (schools.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      if (permissions && permissions.length > 0) {
        for (const perm of permissions) {
          const { subject_id, grade_ids } = perm;
          
          // Remove each grade for this subject
          for (const grade_id of grade_ids) {
            await pool.execute(
              'DELETE FROM school_subject_permissions WHERE school_id = ? AND subject_id = ? AND grade_id = ?',
              [schoolId, subject_id, grade_id]
            );
          }
        }
      }

      // Commit transaction
      await pool.query('COMMIT');

      // Log activity
      await pool.execute(
        'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
        [req.user.user_id, 'ADMIN_REMOVE_SCHOOL_PERMISSIONS', JSON.stringify({ 
          schoolId, 
          schoolName: schools[0].name,
          permissionsCount: permissions ? permissions.length : 0 
        }), req.ip]
      );

      res.json({
        success: true,
        message: 'School permissions removed successfully'
      });
    } catch (error) {
      // Rollback on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Remove school permissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove school permissions'
    });
  }
};

// Get all schools with permission summary
const getSchoolsWithPermissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = "WHERE u.role = 'school'";
    const params = [];

    if (search) {
      whereClause += " AND (u.name LIKE ? OR u.email LIKE ? OR u.organization LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Get schools with permission counts
    const [schools] = await pool.execute(
      `SELECT 
        u.user_id,
        u.name,
        u.email,
        u.organization,
        u.status,
        u.created_at,
        COUNT(DISTINCT p.subject_id) as subjects_count,
        COUNT(DISTINCT p.grade_id) as grades_count,
        COUNT(p.school_id) as total_permissions
      FROM users u
      LEFT JOIN school_subject_permissions p ON u.user_id = p.school_id
      ${whereClause}
      GROUP BY u.user_id, u.name, u.email, u.organization, u.status, u.created_at
      ORDER BY u.name
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        schools,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get schools with permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get schools with permissions'
    });
  }
};

module.exports = {
  getSchoolPermissions,
  setSchoolPermissions,
  addSchoolPermissions,
  removeSchoolPermissions,
  getSchoolsWithPermissions
};


