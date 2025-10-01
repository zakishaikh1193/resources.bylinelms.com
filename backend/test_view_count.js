const mysql = require('mysql2/promise');

async function testViewCount() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resources_db'
  });
  
  try {
    console.log('🔍 Testing Resource View Count System...\n');
    
    // Check current view counts in resources table
    const [resources] = await pool.execute(`
      SELECT 
        resource_id,
        title,
        view_count,
        download_count
      FROM resources 
      ORDER BY view_count DESC 
      LIMIT 10
    `);
    
    console.log('📊 Current View Counts in Resources Table:');
    console.log('==========================================');
    resources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title}`);
      console.log(`   ID: ${resource.resource_id}`);
      console.log(`   Views: ${resource.view_count}`);
      console.log(`   Downloads: ${resource.download_count}`);
      console.log('');
    });
    
    // Check resource_views table entries
    const [views] = await pool.execute(`
      SELECT 
        rv.view_id,
        rv.resource_id,
        r.title,
        u.name as user_name,
        rv.viewed_at
      FROM resource_views rv
      LEFT JOIN resources r ON rv.resource_id = r.resource_id
      LEFT JOIN users u ON rv.user_id = u.user_id
      ORDER BY rv.viewed_at DESC
      LIMIT 10
    `);
    
    console.log('👁️ Recent Views in resource_views Table:');
    console.log('=========================================');
    views.forEach((view, index) => {
      console.log(`${index + 1}. ${view.title} (ID: ${view.resource_id})`);
      console.log(`   User: ${view.user_name || 'Anonymous'}`);
      console.log(`   Viewed: ${view.viewed_at}`);
      console.log('');
    });
    
    // Check activity_logs for RESOURCE_VIEW entries
    const [activityViews] = await pool.execute(`
      SELECT 
        al.log_id,
        al.resource_id,
        r.title,
        u.name as user_name,
        al.created_at
      FROM activity_logs al
      LEFT JOIN resources r ON al.resource_id = r.resource_id
      LEFT JOIN users u ON al.user_id = u.user_id
      WHERE al.action = 'RESOURCE_VIEW'
      ORDER BY al.created_at DESC
      LIMIT 10
    `);
    
    console.log('📝 RESOURCE_VIEW Entries in activity_logs:');
    console.log('==========================================');
    activityViews.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title} (ID: ${activity.resource_id})`);
      console.log(`   User: ${activity.user_name || 'Anonymous'}`);
      console.log(`   Time: ${activity.created_at}`);
      console.log('');
    });
    
    // Summary statistics
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT resource_id) as unique_resources_viewed,
        COUNT(DISTINCT user_id) as unique_users_viewed
      FROM resource_views
    `);
    
    const [activityStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_activity_views
      FROM activity_logs 
      WHERE action = 'RESOURCE_VIEW'
    `);
    
    console.log('📈 View Tracking Summary:');
    console.log('=========================');
    console.log(`Total Views (resource_views): ${stats[0].total_views}`);
    console.log(`Unique Resources Viewed: ${stats[0].unique_resources_viewed}`);
    console.log(`Unique Users Viewed: ${stats[0].unique_users_viewed}`);
    console.log(`Activity Log Views: ${activityStats[0].total_activity_views}`);
    
    // Check if view counts match between tables
    const [mismatchCheck] = await pool.execute(`
      SELECT 
        r.resource_id,
        r.title,
        r.view_count as resources_view_count,
        COUNT(rv.view_id) as actual_views_count
      FROM resources r
      LEFT JOIN resource_views rv ON r.resource_id = rv.resource_id
      GROUP BY r.resource_id, r.title, r.view_count
      HAVING r.view_count != COUNT(rv.view_id)
      LIMIT 5
    `);
    
    if (mismatchCheck.length > 0) {
      console.log('\n⚠️ View Count Mismatches Found:');
      console.log('===============================');
      mismatchCheck.forEach((mismatch, index) => {
        console.log(`${index + 1}. ${mismatch.title}`);
        console.log(`   Resources table: ${mismatch.resources_view_count}`);
        console.log(`   Actual views: ${mismatch.actual_views_count}`);
        console.log('');
      });
    } else {
      console.log('\n✅ All view counts are synchronized!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testViewCount();

