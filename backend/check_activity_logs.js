const mysql = require('mysql2/promise');

async function checkActivityLogs() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resources_db'
  });
  
  try {
    console.log('🔍 Checking Activity Logs for RESOURCE_VIEW entries...\n');
    
    const [rows] = await pool.execute(`
      SELECT 
        al.log_id,
        al.action,
        al.resource_id,
        al.user_id,
        u.name as user_name,
        u.email as user_email,
        al.created_at,
        al.details
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      WHERE al.action = 'RESOURCE_VIEW'
      ORDER BY al.created_at DESC
      LIMIT 10
    `);
    
    console.log(`Found ${rows.length} RESOURCE_VIEW entries:`);
    
    if (rows.length > 0) {
      rows.forEach((row, index) => {
        console.log(`${index + 1}. Log ID: ${row.log_id}`);
        console.log(`   Action: ${row.action}`);
        console.log(`   User: ${row.user_name || 'Anonymous'} (${row.user_email || 'No email'})`);
        console.log(`   Resource ID: ${row.resource_id}`);
        console.log(`   Time: ${row.created_at}`);
        console.log(`   Details: ${row.details}`);
        console.log('');
      });
    } else {
      console.log('No RESOURCE_VIEW entries found in activity_logs table.');
    }
    
    // Check all recent activity logs
    console.log('\n📝 Recent Activity Logs (all actions):');
    const [allLogs] = await pool.execute(`
      SELECT 
        al.log_id,
        al.action,
        al.resource_id,
        al.user_id,
        u.name as user_name,
        u.email as user_email,
        al.created_at
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);
    
    allLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.action} - ${log.user_name || 'Anonymous'} (${log.created_at})`);
    });
    
    // Check school users
    console.log('\n🏫 School Users:');
    const [schoolUsers] = await pool.execute(`
      SELECT user_id, name, email, role 
      FROM users 
      WHERE role = 'school'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    schoolUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user.user_id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkActivityLogs();

