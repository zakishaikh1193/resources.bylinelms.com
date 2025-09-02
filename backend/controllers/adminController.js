const { pool } = require('../config/database');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total counts - handle missing tables gracefully
    let userCount = [{ total: 0 }];
    let schoolCount = [{ total: 0 }];
    let resourceCount = [{ total: 0 }];
    let downloadCount = [{ total: 0 }];
    let viewCount = [{ total: 0 }];

    try {
      [userCount] = await pool.execute('SELECT COUNT(*) as total FROM users');
    } catch (e) {
      console.log('Users table not available');
    }

    try {
      [schoolCount] = await pool.execute("SELECT COUNT(*) as total FROM users WHERE role = 'school'");
    } catch (e) {
      console.log('School users query failed');
    }

    try {
      [resourceCount] = await pool.execute('SELECT COUNT(*) as total FROM resources');
    } catch (e) {
      console.log('Resources table not available');
    }

    try {
      [downloadCount] = await pool.execute('SELECT COUNT(*) as total FROM resource_downloads');
    } catch (e) {
      console.log('Resource downloads table not available');
    }

    try {
      [viewCount] = await pool.execute('SELECT COUNT(*) as total FROM resource_views');
    } catch (e) {
      console.log('Resource views table not available');
    }

    // Get recent activity - handle case where activity_logs table might not exist
    let recentActivity = [];
    try {
      const [activityResult] = await pool.execute(
        `SELECT al.*, u.name as user_name, u.role as user_role, r.title as resource_title
         FROM activity_logs al
         LEFT JOIN users u ON al.user_id = u.user_id
         LEFT JOIN resources r ON al.resource_id = r.resource_id
         ORDER BY al.created_at DESC
         LIMIT 10`
      );
      recentActivity = activityResult;
    } catch (activityError) {
      console.log('Activity logs table not available, skipping recent activity');
      // If activity_logs table doesn't exist, we'll just have an empty array
    }

    // Get resource statistics by type
    let resourceTypeStats = [];
    try {
      [resourceTypeStats] = await pool.execute(
        `SELECT rt.type_name, COUNT(r.resource_id) as count
         FROM resource_types rt
         LEFT JOIN resources r ON rt.type_id = r.type_id
         GROUP BY rt.type_id, rt.type_name
         ORDER BY count DESC`
      );
    } catch (e) {
      console.log('Resource type stats query failed');
    }

    // Get resource statistics by subject
    let resourceSubjectStats = [];
    try {
      [resourceSubjectStats] = await pool.execute(
        `SELECT s.subject_name, s.color, COUNT(r.resource_id) as count
         FROM subjects s
         LEFT JOIN resources r ON s.subject_id = s.subject_id
         GROUP BY s.subject_id, s.subject_name, s.color
         ORDER BY count DESC`
      );
    } catch (e) {
      console.log('Resource subject stats query failed');
    }

    // Get recent users
    let recentUsers = [];
    try {
      [recentUsers] = await pool.execute(
        `SELECT user_id, name, email, role, organization, status, created_at
         FROM users
         ORDER BY created_at DESC
         LIMIT 5`
      );
    } catch (e) {
      console.log('Recent users query failed');
    }

    // Get recent resources
    let recentResources = [];
    try {
      [recentResources] = await pool.execute(
        `SELECT r.resource_id, r.title, r.status, r.created_at, u.name as author_name, s.subject_name
         FROM resources r
         JOIN users u ON r.created_by = u.user_id
         JOIN subjects s ON r.subject_id = s.subject_id
         ORDER BY r.created_at DESC
         LIMIT 5`
      );
    } catch (e) {
      console.log('Recent resources query failed');
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: userCount[0]?.total || 0,
          totalSchools: schoolCount[0]?.total || 0,
          totalResources: resourceCount[0]?.total || 0,
          totalDownloads: downloadCount[0]?.total || 0,
          totalViews: viewCount[0]?.total || 0
        },
        recentActivity,
        resourceTypeStats,
        resourceSubjectStats,
        recentUsers,
        recentResources
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

// Get activity logs with filters
const getActivityLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      action, 
      user_id, 
      start_date, 
      end_date,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Build WHERE conditions
    if (action) {
      conditions.push('al.action = ?');
      params.push(action);
    }

    if (user_id) {
      conditions.push('al.user_id = ?');
      params.push(user_id);
    }

    if (start_date) {
      conditions.push('DATE(al.created_at) >= ?');
      params.push(start_date);
    }

    if (end_date) {
      conditions.push('DATE(al.created_at) <= ?');
      params.push(end_date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get activity logs
    const [logs] = await pool.execute(
      `SELECT al.*, u.name as user_name, u.email as user_email, u.role as user_role, 
       r.title as resource_title
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       LEFT JOIN resources r ON al.resource_id = r.resource_id
       ${whereClause}
       ORDER BY al.${sort} ${order}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM activity_logs al ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        logs,
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

// Get comprehensive activity data from multiple sources
const getActivityData = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      action, 
      user_id, 
      start_date, 
      end_date,
      sort = 'activity_time',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Build WHERE conditions
    if (action) {
      conditions.push('activity_type = ?');
      params.push(action);
    }

    if (user_id) {
      conditions.push('user_id = ?');
      params.push(user_id);
    }

    if (start_date) {
      conditions.push('DATE(activity_time) >= ?');
      params.push(start_date);
    }

    if (end_date) {
      conditions.push('DATE(activity_time) <= ?');
      params.push(end_date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get comprehensive activity data from multiple sources
    const [logs] = await pool.execute(
      `SELECT 
        activity_id,
        user_id,
        activity_type as action,
        resource_id,
        ip_address,
        activity_time as created_at,
        user_name,
        user_email,
        user_role,
        school_name,
        resource_title,
        resource_type,
        subject_name,
        grade_level,
        details
       FROM (
         -- User login activities
         SELECT 
           CONCAT('login_', u.user_id, '_', u.last_login) as activity_id,
           u.user_id,
           'user_login' as activity_type,
           NULL as resource_id,
           u.last_ip as ip_address,
           COALESCE(u.last_login, u.created_at) as activity_time,
           u.name as user_name,
           u.email as user_email,
           u.role as user_role,
           COALESCE(u.organization, u.name) as school_name,
           NULL as resource_title,
           NULL as resource_type,
           NULL as subject_name,
           NULL as grade_level,
           JSON_OBJECT('login_method', 'web', 'user_agent', u.last_user_agent) as details
         FROM users u
         WHERE u.last_login IS NOT NULL OR u.created_at IS NOT NULL
         
         UNION ALL
         
         -- Resource download activities
         SELECT 
           CONCAT('download_', rd.download_id) as activity_id,
           rd.user_id,
           'resource_download' as activity_type,
           rd.resource_id,
           rd.ip_address,
           rd.downloaded_at as activity_time,
           u.name as user_name,
           u.email as user_email,
           u.role as user_role,
           COALESCE(u.organization, u.name) as school_name,
           r.title as resource_title,
           rt.type_name as resource_type,
           s.subject_name,
           g.grade_level,
           JSON_OBJECT('download_method', 'web', 'user_agent', rd.user_agent) as details
         FROM resource_downloads rd
         JOIN users u ON rd.user_id = u.user_id
         JOIN resources r ON rd.resource_id = r.resource_id
         JOIN resource_types rt ON r.type_id = rt.type_id
         JOIN subjects s ON r.subject_id = s.subject_id
         JOIN grades g ON r.grade_id = g.grade_id
         
         UNION ALL
         
         -- Resource view activities
         SELECT 
           CONCAT('view_', rv.view_id) as activity_id,
           rv.user_id,
           'resource_view' as activity_type,
           rv.resource_id,
           rv.ip_address,
           rv.viewed_at as activity_time,
           u.name as user_name,
           u.email as user_email,
           u.role as user_role,
           COALESCE(u.organization, u.name) as school_name,
           r.title as resource_title,
           rt.type_name as resource_type,
           s.subject_name,
           g.grade_level,
           JSON_OBJECT('view_method', 'web', 'user_agent', rv.user_agent) as details
         FROM resource_views rv
         JOIN users u ON rv.user_id = u.user_id
         JOIN resources r ON rv.resource_id = r.resource_id
         JOIN resource_types rt ON r.type_id = rt.type_id
         JOIN subjects s ON r.subject_id = s.subject_id
         JOIN grades g ON r.grade_id = g.grade_id
         
         UNION ALL
         
         -- Resource upload activities
         SELECT 
           CONCAT('upload_', r.resource_id) as activity_id,
           r.created_by as user_id,
           'resource_upload' as activity_type,
           r.resource_id,
           NULL as ip_address,
           r.created_at as activity_time,
           u.name as user_name,
           u.email as user_email,
           u.role as user_role,
           COALESCE(u.organization, u.name) as school_name,
           r.title as resource_title,
           rt.type_name as resource_type,
           s.subject_name,
           g.grade_level,
           JSON_OBJECT('file_size', r.file_size, 'file_extension', r.file_extension) as details
         FROM resources r
         JOIN users u ON r.created_by = u.user_id
         JOIN resource_types rt ON r.type_id = rt.type_id
         JOIN subjects s ON r.subject_id = s.subject_id
         JOIN grades g ON r.grade_id = g.grade_id
         
         UNION ALL
         
         -- Activity logs (if any exist)
         SELECT 
           CONCAT('log_', al.log_id) as activity_id,
           al.user_id,
           al.action as activity_type,
           al.resource_id,
           al.ip_address,
           al.created_at as activity_time,
           u.name as user_name,
           u.email as user_email,
           u.role as user_role,
           COALESCE(u.organization, u.name) as school_name,
           r.title as resource_title,
           rt.type_name as resource_type,
           s.subject_name,
           g.grade_level,
           al.details
         FROM activity_logs al
         LEFT JOIN users u ON al.user_id = u.user_id
         LEFT JOIN resources r ON al.resource_id = r.resource_id
         LEFT JOIN resource_types rt ON r.type_id = rt.type_id
         LEFT JOIN subjects s ON r.subject_id = s.subject_id
         LEFT JOIN grades g ON r.grade_id = g.grade_id
       ) as combined_activities
       ${whereClause}
       ORDER BY ${sort} ${order}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM (
         SELECT 
           CONCAT('login_', u.user_id, '_', u.last_login) as activity_id
         FROM users u
         WHERE u.last_login IS NOT NULL OR u.created_at IS NOT NULL
         
         UNION ALL
         
         SELECT 
           CONCAT('download_', rd.download_id) as activity_id
         FROM resource_downloads rd
         
         UNION ALL
         
         SELECT 
           CONCAT('view_', rv.view_id) as activity_id
         FROM resource_views rv
         
         UNION ALL
         
         SELECT 
           CONCAT('upload_', r.resource_id) as activity_id
         FROM resources r
         
         UNION ALL
         
         SELECT 
           CONCAT('log_', al.log_id) as activity_id
         FROM activity_logs al
       ) as combined_activities
       ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get activity data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity data'
    });
  }
};

// Get school resource download activities from the new activity log table
const getSchoolDownloads = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      school_name, 
      start_date, 
      end_date,
      sort = 'activity_timestamp',
      order = 'DESC'
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

    // Get school activities from the new activity log table
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
        sal.activity_timestamp as created_at,
        sal.ip_address,
        sal.user_agent,
        sal.file_size,
        sal.file_extension,
        sal.created_at,
        JSON_OBJECT(
          'download_method', 'web',
          'file_size_mb', CASE WHEN sal.file_size IS NOT NULL THEN ROUND(sal.file_size / 1048576, 2) ELSE NULL END,
          'school_info', sal.school_organization,
          'resource_details', CASE WHEN sal.resource_name IS NOT NULL THEN CONCAT(sal.resource_name, ' (', COALESCE(sal.resource_type, 'Unknown'), ')') ELSE 'Login Activity' END
        ) as details
       FROM school_activity_logs sal
       ${whereClause}
       ORDER BY sal.${sort} ${order}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM school_activity_logs sal
       ${whereClause}`,
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

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    // Get user statistics
    const [userStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_users,
         COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
         COUNT(CASE WHEN role = 'school' THEN 1 END) as school_users,
         COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
         COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_users,
         COUNT(CASE WHEN status = 'banned' THEN 1 END) as banned_users
       FROM users`
    );

    // Get resource statistics
    const [resourceStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_resources,
         COUNT(CASE WHEN status = 'published' THEN 1 END) as published_resources,
         COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_resources,
         COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_resources,
         COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_resources,
         SUM(download_count) as total_downloads,
         SUM(view_count) as total_views,
         SUM(likes) as total_likes
       FROM resources`
    );

    // Get monthly statistics for the last 6 months
    const [monthlyStats] = await pool.execute(
      `SELECT 
         DATE_FORMAT(created_at, '%Y-%m') as month,
         COUNT(*) as new_users,
         COUNT(CASE WHEN role = 'school' THEN 1 END) as new_schools
       FROM users 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month DESC`
    );

    // Get resource upload statistics for the last 6 months
    const [resourceUploadStats] = await pool.execute(
      `SELECT 
         DATE_FORMAT(created_at, '%Y-%m') as month,
         COUNT(*) as new_resources,
         COUNT(CASE WHEN status = 'published' THEN 1 END) as published_resources
       FROM resources 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month DESC`
    );

    // Get top performing resources
    const [topResources] = await pool.execute(
      `SELECT r.resource_id, r.title, r.download_count, r.view_count, r.likes,
       u.name as author_name, s.subject_name, g.grade_level
       FROM resources r
       JOIN users u ON r.created_by = u.user_id
       JOIN subjects s ON r.subject_id = s.subject_id
       JOIN grades g ON r.grade_id = g.grade_id
       WHERE r.status = 'published'
       ORDER BY (r.download_count + r.view_count + r.likes) DESC
       LIMIT 10`
    );

    // Get top contributing schools
    const [topSchools] = await pool.execute(
      `SELECT u.user_id, u.name, u.organization, u.email,
       COUNT(r.resource_id) as resource_count,
       SUM(r.download_count) as total_downloads,
       SUM(r.view_count) as total_views
       FROM users u
       LEFT JOIN resources r ON u.user_id = r.created_by
       WHERE u.role = 'school'
       GROUP BY u.user_id, u.name, u.organization, u.email
       ORDER BY resource_count DESC, total_downloads DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        userStats: userStats[0],
        resourceStats: resourceStats[0],
        monthlyStats,
        resourceUploadStats,
        topResources,
        topSchools
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system statistics'
    });
  }
};

// Get admin activity summary
const getAdminActivitySummary = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Get recent admin actions
    const [adminActions] = await pool.execute(
      `SELECT al.*, u.name as target_user_name, u.email as target_user_email
       FROM activity_logs al
       LEFT JOIN users u ON JSON_EXTRACT(al.details, '$.targetUserId') = u.user_id
       WHERE al.user_id = ? AND al.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY al.created_at DESC`,
      [req.user.user_id, parseInt(days)]
    );

    // Get action counts
    const [actionCounts] = await pool.execute(
      `SELECT action, COUNT(*) as count
       FROM activity_logs
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY action
       ORDER BY count DESC`,
      [req.user.user_id, parseInt(days)]
    );

    res.json({
      success: true,
      data: {
        adminActions,
        actionCounts,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get admin activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin activity summary'
    });
  }
};

module.exports = {
  getDashboardStats,
  getActivityLogs,
  getActivityData,
  getSchoolDownloads,
  getSystemStats,
  getAdminActivitySummary
};
