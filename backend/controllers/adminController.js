const { pool } = require('../config/database');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const [userCount] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const [schoolCount] = await pool.execute("SELECT COUNT(*) as total FROM users WHERE role = 'school'");
    const [resourceCount] = await pool.execute('SELECT COUNT(*) as total FROM resources');
    const [downloadCount] = await pool.execute('SELECT COUNT(*) as total FROM resource_downloads');
    const [viewCount] = await pool.execute('SELECT COUNT(*) as total FROM resource_views');

    // Get recent activity
    const [recentActivity] = await pool.execute(
      `SELECT al.*, u.name as user_name, u.role as user_role, r.title as resource_title
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       LEFT JOIN resources r ON al.resource_id = r.resource_id
       ORDER BY al.created_at DESC
       LIMIT 10`
    );

    // Get resource statistics by type
    const [resourceTypeStats] = await pool.execute(
      `SELECT rt.type_name, COUNT(r.resource_id) as count
       FROM resource_types rt
       LEFT JOIN resources r ON rt.type_id = r.type_id
       GROUP BY rt.type_id, rt.type_name
       ORDER BY count DESC`
    );

    // Get resource statistics by subject
    const [resourceSubjectStats] = await pool.execute(
      `SELECT s.subject_name, s.color, COUNT(r.resource_id) as count
       FROM subjects s
       LEFT JOIN resources r ON s.subject_id = r.subject_id
       GROUP BY s.subject_id, s.subject_name, s.color
       ORDER BY count DESC`
    );

    // Get recent users
    const [recentUsers] = await pool.execute(
      `SELECT user_id, name, email, role, organization, status, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 5`
    );

    // Get recent resources
    const [recentResources] = await pool.execute(
      `SELECT r.resource_id, r.title, r.status, r.created_at, u.name as author_name, s.subject_name
       FROM resources r
       JOIN users u ON r.created_by = u.user_id
       JOIN subjects s ON r.subject_id = s.subject_id
       ORDER BY r.created_at DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: userCount[0].total,
          totalSchools: schoolCount[0].total,
          totalResources: resourceCount[0].total,
          totalDownloads: downloadCount[0].total,
          totalViews: viewCount[0].total
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
  getSystemStats,
  getAdminActivitySummary
};
