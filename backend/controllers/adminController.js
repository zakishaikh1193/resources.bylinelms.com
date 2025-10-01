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

// Get activity logs - USING EXISTING activity_logs TABLE
const getActivityLogs = async (req, res) => {
  try {
    console.log('🔍 [DEBUG] getActivityLogs called');
    console.log('🔍 [DEBUG] Request query:', req.query);
    console.log('🔍 [DEBUG] User from auth middleware:', req.user);
    
    const { 
      page = 1, 
      limit = 20, 
      action, 
      school_name, 
      start_date, 
      end_date
    } = req.query;

    console.log('🔍 [DEBUG] Parsed query params:', { page, limit, action, school_name, start_date, end_date });

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Build WHERE conditions
    if (action) {
      // Map frontend action to database action
      let dbAction;
      switch(action) {
        case 'login': dbAction = 'USER_LOGIN'; break;
        case 'resource_download': dbAction = 'RESOURCE_DOWNLOADED'; break;
        case 'resource_view': dbAction = 'RESOURCE_VIEW'; break;
        case 'resource_upload': dbAction = 'RESOURCE_CREATED'; break;
        case 'resource_edit': dbAction = 'RESOURCE_UPDATED'; break;
        default: dbAction = action;
      }
      conditions.push('al.action = ?');
      params.push(dbAction);
    }

    if (school_name && school_name !== 'all') {
      conditions.push('u.name = ?');
      params.push(school_name);
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
    
    console.log('🔍 [DEBUG] WHERE clause:', whereClause);
    console.log('🔍 [DEBUG] Query params:', [...params, parseInt(limit), offset]);

    // Use the existing activity_logs table with user information
    // Map database actions to frontend expected activity types
    const query = `SELECT 
        al.log_id,
        al.resource_id,
        COALESCE(u.name, 'Unknown User') as school_name,
        COALESCE(u.email, 'No email') as school_email,
        COALESCE(u.organization, u.name, 'Unknown Organization') as school_organization,
        CASE 
          WHEN al.action = 'USER_LOGIN' THEN 'login'
          WHEN al.action = 'RESOURCE_DOWNLOADED' THEN 'resource_download'
          WHEN al.action = 'RESOURCE_VIEW' THEN 'resource_view'
          WHEN al.action = 'RESOURCE_CREATED' THEN 'resource_upload'
          WHEN al.action = 'RESOURCE_UPDATED' THEN 'resource_edit'
          WHEN al.action = 'ADMIN_CREATE_SCHOOL' THEN 'school_created'
          ELSE 'other'
        END as activity_type,
        CASE 
          WHEN al.action = 'USER_LOGIN' THEN NULL
          WHEN al.action = 'ADMIN_CREATE_SCHOOL' THEN NULL
          ELSE COALESCE(JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.title')), r.title, 'No resource')
        END as resource_name,
        NULL as downloaded_file_name,
        NULL as file_name,
        COALESCE(rt.type_name, 'Unknown') as resource_type,
        COALESCE(s.subject_name, 'Unknown') as subject_name,
        COALESCE(g.grade_level, 'Unknown') as grade_level,
        al.ip_address,
        al.user_agent,
        al.created_at as login_time,
        al.created_at as activity_timestamp,
        COALESCE(r.file_size, 0) as file_size,
        COALESCE(r.file_extension, 'Unknown') as file_extension,
        al.created_at
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       LEFT JOIN resources r ON al.resource_id = r.resource_id
       LEFT JOIN resource_types rt ON r.type_id = rt.type_id
       LEFT JOIN subjects s ON r.subject_id = s.subject_id
       LEFT JOIN grades g ON r.grade_id = g.grade_id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`;
    
    // Try using string concatenation for LIMIT/OFFSET to avoid parameter binding issues
    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);
    console.log('🔍 [DEBUG] Converted parameters:', { limitInt, offsetInt, typeLimit: typeof limitInt, typeOffset: typeof offsetInt });
    
    const finalQuery = query.replace('LIMIT ? OFFSET ?', `LIMIT ${limitInt} OFFSET ${offsetInt}`);
    console.log('🔍 [DEBUG] Final query:', finalQuery);
    console.log('🔍 [DEBUG] Query parameters (without LIMIT/OFFSET):', params);
    
    const [logs] = await pool.execute(finalQuery, params);
    console.log('🔍 [DEBUG] Query executed successfully, logs count:', logs.length);

    // Get total count
    console.log('🔍 [DEBUG] Getting total count...');
    const countQuery = `SELECT COUNT(*) as total 
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      LEFT JOIN resources r ON al.resource_id = r.resource_id
      ${whereClause}`;
    console.log('🔍 [DEBUG] Count query:', countQuery);
    console.log('🔍 [DEBUG] Count params:', params);
    
    const [countResult] = await pool.execute(countQuery, params);
    console.log('🔍 [DEBUG] Count result:', countResult);

    const total = countResult[0].total;
    console.log('🔍 [DEBUG] Total count:', total);

    const response = {
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
    };
    
    console.log('🔍 [DEBUG] Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('❌ [ERROR] Get activity logs error:', error);
    console.error('❌ [ERROR] Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });
    
    const errorResponse = {
      success: false,
      message: 'Failed to get activity logs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      debug: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      } : undefined
    };
    
    console.error('❌ [ERROR] Sending error response:', JSON.stringify(errorResponse, null, 2));
    res.status(500).json(errorResponse);
  }
};

// Get comprehensive activity data from multiple sources - SIMPLIFIED VERSION
const getActivityData = async (req, res) => {
  try {
    console.log('🔍 [DEBUG] getActivityData called');
    console.log('🔍 [DEBUG] Request query:', req.query);
    console.log('🔍 [DEBUG] User from auth middleware:', req.user);
    
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
    
    console.log('🔍 [DEBUG] Parsed query params:', { page, limit, action, user_id, start_date, end_date, sort, order });

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Build WHERE conditions
    if (action) {
      // Map frontend action to database action
      let dbAction;
      switch(action) {
        case 'login': dbAction = 'USER_LOGIN'; break;
        case 'resource_download': dbAction = 'RESOURCE_DOWNLOADED'; break;
        case 'resource_view': dbAction = 'RESOURCE_VIEW'; break;
        case 'resource_upload': dbAction = 'RESOURCE_CREATED'; break;
        case 'resource_edit': dbAction = 'RESOURCE_UPDATED'; break;
        default: dbAction = action;
      }
      conditions.push('al.action = ?');
      params.push(dbAction);
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

    // Use the existing activity_logs table - much simpler and more reliable
    // Map database actions to frontend expected activity types
    const query = `SELECT 
        al.log_id as activity_id,
        al.user_id,
        CASE 
          WHEN al.action = 'USER_LOGIN' THEN 'login'
          WHEN al.action = 'RESOURCE_DOWNLOADED' THEN 'resource_download'
          WHEN al.action = 'RESOURCE_VIEW' THEN 'resource_view'
          WHEN al.action = 'RESOURCE_CREATED' THEN 'resource_upload'
          WHEN al.action = 'RESOURCE_UPDATED' THEN 'resource_edit'
          WHEN al.action = 'ADMIN_CREATE_SCHOOL' THEN 'school_created'
          ELSE 'other'
        END as activity_type,
        al.resource_id,
        al.ip_address,
        al.created_at as activity_time,
        COALESCE(u.name, 'Unknown User') as user_name,
        COALESCE(u.email, 'No email') as user_email,
        COALESCE(u.role, 'unknown') as user_role,
        COALESCE(u.organization, u.name, 'Unknown Organization') as school_name,
        CASE 
          WHEN al.action = 'USER_LOGIN' THEN NULL
          WHEN al.action = 'ADMIN_CREATE_SCHOOL' THEN NULL
          ELSE COALESCE(JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.title')), r.title, 'No resource')
        END as resource_title,
        COALESCE(rt.type_name, 'Unknown') as resource_type,
        COALESCE(s.subject_name, 'Unknown') as subject_name,
        COALESCE(g.grade_level, 'Unknown') as grade_level,
        al.details
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       LEFT JOIN resources r ON al.resource_id = r.resource_id
       LEFT JOIN resource_types rt ON r.type_id = rt.type_id
       LEFT JOIN subjects s ON r.subject_id = s.subject_id
       LEFT JOIN grades g ON r.grade_id = g.grade_id
       ${whereClause}
       ORDER BY al.created_at ${order}
       LIMIT ? OFFSET ?`;

    // Try using string concatenation for LIMIT/OFFSET to avoid parameter binding issues
    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);
    
    const finalQuery = query.replace('LIMIT ? OFFSET ?', `LIMIT ${limitInt} OFFSET ${offsetInt}`);
    console.log('🔍 [DEBUG] getActivityData final query:', finalQuery);
    console.log('🔍 [DEBUG] getActivityData params (without LIMIT/OFFSET):', params);

    const [logs] = await pool.execute(finalQuery, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total 
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      LEFT JOIN resources r ON al.resource_id = r.resource_id
      ${whereClause}`;
    
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    console.log('🔍 [DEBUG] getActivityData success, logs count:', logs.length, 'total:', total);

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
    console.error('❌ [ERROR] Get activity data error:', error);
    console.error('❌ [ERROR] Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get activity data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
