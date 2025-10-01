const mysql = require('mysql2/promise');

async function testViewTracking() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resources_db'
  });
  
  try {
    console.log('🔍 Testing view tracking...');
    
    // Check if RESOURCE_VIEW entries exist
    const [rows] = await pool.execute("SELECT * FROM activity_logs WHERE action = 'RESOURCE_VIEW' ORDER BY created_at DESC LIMIT 5");
    console.log('RESOURCE_VIEW entries found:', rows.length);
    
    if (rows.length > 0) {
      console.log('Latest RESOURCE_VIEW entries:');
      rows.forEach(row => {
        console.log(`- ID: ${row.log_id}, User: ${row.user_id}, Resource: ${row.resource_id}, Time: ${row.created_at}`);
      });
    } else {
      console.log('❌ No RESOURCE_VIEW entries found');
    }
    
    // Check total activity logs
    const [total] = await pool.execute('SELECT COUNT(*) as count FROM activity_logs');
    console.log('Total activity logs:', total[0].count);
    
    // Check recent activity logs
    const [recent] = await pool.execute('SELECT action, COUNT(*) as count FROM activity_logs GROUP BY action ORDER BY count DESC');
    console.log('\nActivity types breakdown:');
    recent.forEach(row => {
      console.log(`- ${row.action}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testViewTracking();

