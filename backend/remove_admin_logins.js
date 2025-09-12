const mysql = require('mysql2/promise');

async function removeAdminLogins() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resources_db'
  });
  
  try {
    console.log('🔍 Checking for admin login entries...');
    
    // Check current admin login entries
    const [rows] = await pool.execute('SELECT log_id, user_id, action, details, created_at FROM activity_logs WHERE action = "USER_LOGIN" AND JSON_EXTRACT(details, "$.role") = "admin"');
    console.log('Current admin login entries:', rows.length);
    
    if (rows.length > 0) {
      console.log('Admin login entries found:');
      rows.forEach(row => {
        console.log(`- ID: ${row.log_id}, User: ${row.user_id}, Time: ${row.created_at}`);
      });
      
      console.log('\nRemoving admin login entries...');
      const [result] = await pool.execute('DELETE FROM activity_logs WHERE action = "USER_LOGIN" AND JSON_EXTRACT(details, "$.role") = "admin"');
      console.log(`✅ Removed ${result.affectedRows} admin login entries`);
    } else {
      console.log('No admin login entries found');
    }
    
    // Check remaining login entries
    const [remaining] = await pool.execute('SELECT COUNT(*) as count FROM activity_logs WHERE action = "USER_LOGIN"');
    console.log('Remaining login entries:', remaining[0].count);
    
    // Show current activity log breakdown
    const [breakdown] = await pool.execute('SELECT action, COUNT(*) as count FROM activity_logs GROUP BY action ORDER BY count DESC');
    console.log('\nCurrent activity log breakdown:');
    breakdown.forEach(row => {
      console.log(`- ${row.action}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

removeAdminLogins();

