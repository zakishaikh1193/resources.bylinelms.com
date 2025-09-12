const mysql = require('mysql2/promise');

async function debugViewTracking() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resources_db'
  });
  
  try {
    console.log('🔍 Debugging View Tracking Function...\n');
    
    const resource_id = 22;
    const user_id = 1; // Admin user
    const ip_address = '127.0.0.1';
    const user_agent = 'Test Browser';
    
    console.log('1. Testing resource lookup...');
    const [resources] = await pool.execute(
      'SELECT title FROM resources WHERE resource_id = ?',
      [resource_id]
    );
    
    if (resources.length === 0) {
      console.log('❌ Resource not found');
      return;
    }
    
    const resource = resources[0];
    console.log(`✅ Resource found: ${resource.title}`);
    
    console.log('\n2. Testing resource_views insert...');
    try {
      const [viewResult] = await pool.execute(
        'INSERT INTO resource_views (resource_id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?)',
        [resource_id, user_id, ip_address, user_agent]
      );
      console.log(`✅ resource_views insert successful: ${viewResult.insertId}`);
    } catch (error) {
      console.log('❌ resource_views insert failed:', error.message);
      return;
    }
    
    console.log('\n3. Testing resources view_count update...');
    try {
      const [updateResult] = await pool.execute(
        'UPDATE resources SET view_count = view_count + 1 WHERE resource_id = ?',
        [resource_id]
      );
      console.log(`✅ view_count update successful: ${updateResult.affectedRows} rows affected`);
    } catch (error) {
      console.log('❌ view_count update failed:', error.message);
      return;
    }
    
    console.log('\n4. Testing activity_logs insert...');
    try {
      const details = JSON.stringify({ title: resource.title, view_method: 'web' });
      console.log('Details JSON:', details);
      
      const [result] = await pool.execute(
        `INSERT INTO activity_logs (user_id, action, resource_id, ip_address, user_agent, details, created_at) 
         VALUES (?, 'RESOURCE_VIEW', ?, ?, ?, ?, NOW())`,
        [user_id, resource_id, ip_address, user_agent, details]
      );
      console.log(`✅ activity_logs insert successful: ${result.insertId}`);
    } catch (error) {
      console.log('❌ activity_logs insert failed:', error.message);
      console.log('Error details:', error);
      return;
    }
    
    console.log('\n✅ All database operations successful!');
    
    // Verify the results
    const [updatedResource] = await pool.execute(
      'SELECT view_count FROM resources WHERE resource_id = ?',
      [resource_id]
    );
    
    const [viewCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM resource_views WHERE resource_id = ?',
      [resource_id]
    );
    
    const [activityCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM activity_logs WHERE resource_id = ? AND action = "RESOURCE_VIEW"',
      [resource_id]
    );
    
    console.log('\n📊 Verification:');
    console.log(`Resources view_count: ${updatedResource[0].view_count}`);
    console.log(`resource_views count: ${viewCount[0].count}`);
    console.log(`activity_logs count: ${activityCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

debugViewTracking();

