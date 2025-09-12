// Original working version of adminController.js
// This is the clean version that should work properly

const { pool } = require('../config/database');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [usersResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const [schoolsResult] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE role = "school"');
    const [resourcesResult] = await pool.execute('SELECT COUNT(*) as total FROM resources');
    
    // Get total downloads
    const [downloadsResult] = await pool.execute('SELECT COUNT(*) as total FROM resource_downloads');
    
    // Get total views
    const [viewsResult] = await pool.execute('SELECT COUNT(*) as total FROM resource_views');

    const stats = {
      totalUsers: usersResult[0].total,
      totalSchools: schoolsResult[0].total,
      totalResources: resourcesResult[0].total,
      totalDownloads: downloadsResult[0].total,
      totalViews: viewsResult[0].total
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics'
    });
  }
};

// Get activity logs - SIMPLIFIED WORKING VERSION
const getActivityLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      action, 
      school_name, 
      start_date, 
      end_date
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Build WHERE conditions
    if (action) {
      conditions.push('sal.activity_type = ?');
      params.push(action);
    }

    if (school_name && school_name !== 'all') {
      conditions.push('sal.school_name = ?');
      params.push(school_name);
    }

    if (start_date) {
      conditions.push('DATE(sal.activity_timestamp) >= ?');
      params.push(start_date);
    }

    if (end_date) {
      conditions.push('DATE(sal.activity_timestamp) <= ?');
      params.push(end_date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Simple query without complex enhancements
    const [logs] = await pool.execute(
      `SELECT 
        sal.id as log_id,
        sal.school_name,
        sal.school_email,
        sal.school_organization,
        sal.activity_type,
        sal.resource_name,
        sal.downloaded_file_name,
        sal.file_name,
        sal.resource_type,
        sal.subject_name,
        sal.grade_level,
        sal.ip_address,
        sal.user_agent,
        sal.login_time,
        sal.activity_timestamp,
        sal.file_size,
        sal.file_extension,
        sal.created_at
       FROM school_activity_logs sal
       ${whereClause}
       ORDER BY sal.activity_timestamp DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM school_activity_logs sal ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        logs: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity logs'
    });
  }
};

// Get school downloads - SIMPLIFIED VERSION
const getSchoolDownloads = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      school_name, 
      start_date, 
      end_date
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Build WHERE conditions
    if (school_name && school_name !== 'all') {
      conditions.push('sal.school_name = ?');
      params.push(school_name);
    }

    if (start_date) {
      conditions.push('DATE(sal.activity_timestamp) >= ?');
      params.push(start_date);
    }

    if (end_date) {
      conditions.push('DATE(sal.activity_timestamp) <= ?');
      params.push(end_date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Simple query
    const [activities] = await pool.execute(
      `SELECT 
        sal.id as log_id,
        sal.school_name,
        sal.school_email,
        sal.school_organization,
        sal.resource_name,
        sal.resource_type,
        sal.activity_type,
        sal.login_time,
        sal.activity_timestamp,
        sal.ip_address,
        sal.user_agent,
        sal.file_size,
        sal.file_extension,
        sal.created_at
       FROM school_activity_logs sal
       ${whereClause}
       ORDER BY sal.activity_timestamp DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM school_activity_logs sal ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        logs: activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get school downloads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get school downloads'
    });
  }
};

module.exports = {
  getDashboardStats,
  getActivityLogs,
  getSchoolDownloads
};
