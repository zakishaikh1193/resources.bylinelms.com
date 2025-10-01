const mysql = require('mysql2/promise');

async function simulateView() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resources_db'
  });
  
  try {
    console.log('🔍 Simulating Resource View...\n');
    
    // Get a resource to test with
    const [resources] = await pool.execute(`
      SELECT resource_id, title, view_count 
      FROM resources 
      WHERE status = 'published' 
      LIMIT 1
    `);
    
    if (resources.length === 0) {
      console.log('❌ No published resources found to test with');
      return;
    }
    
    const resource = resources[0];
    console.log(`📄 Testing with resource: ${resource.title} (ID: ${resource.resource_id})`);
    console.log(`📊 Current view count: ${resource.view_count}\n`);
    
    // Simulate the view tracking process
    const user_id = 1; // Admin user
    const ip_address = '127.0.0.1';
    const user_agent = 'Test Browser';
    
    console.log('🔄 Simulating view tracking...');
    
    // 1. Insert into resource_views table
    const [viewResult] = await pool.execute(
      'INSERT INTO resource_views (resource_id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [resource.resource_id, user_id, ip_address, user_agent]
    );
    console.log(`✅ Inserted into resource_views: ${viewResult.insertId}`);
    
    // 2. Update view count in resources table
    const [updateResult] = await pool.execute(
      'UPDATE resources SET view_count = view_count + 1 WHERE resource_id = ?',
      [resource.resource_id]
    );
    console.log(`✅ Updated view count in resources table: ${updateResult.affectedRows} rows affected`);
    
    // 3. Insert into activity_logs table
    const [activityResult] = await pool.execute(
      `INSERT INTO activity_logs (user_id, action, resource_id, ip_address, user_agent, details, created_at) 
       VALUES (?, 'RESOURCE_VIEW', ?, ?, ?, JSON_OBJECT('title', ?, 'view_method', 'web'), NOW())`,
      [user_id, resource.resource_id, ip_address, user_agent, resource.title]
    );
    console.log(`✅ Inserted into activity_logs: ${activityResult.insertId}\n`);
    
    // Verify the results
    const [updatedResource] = await pool.execute(
      'SELECT view_count FROM resources WHERE resource_id = ?',
      [resource.resource_id]
    );
    
    const [viewCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM resource_views WHERE resource_id = ?',
      [resource.resource_id]
    );
    
    const [activityCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM activity_logs WHERE resource_id = ? AND action = "RESOURCE_VIEW"',
      [resource.resource_id]
    );
    
    console.log('📊 Verification Results:');
    console.log('========================');
    console.log(`Resources table view_count: ${updatedResource[0].view_count}`);
    console.log(`resource_views table count: ${viewCount[0].count}`);
    console.log(`activity_logs RESOURCE_VIEW count: ${activityCount[0].count}`);
    
    if (updatedResource[0].view_count === viewCount[0].count && 
        updatedResource[0].view_count === activityCount[0].count) {
      console.log('\n✅ SUCCESS: All view counts are synchronized!');
    } else {
      console.log('\n❌ MISMATCH: View counts are not synchronized');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

simulateView();

