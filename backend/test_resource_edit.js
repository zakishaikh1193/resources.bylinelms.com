const mysql = require('mysql2/promise');

async function testResourceEdit() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resources_db'
  });
  
  try {
    console.log('🔍 Testing Resource Edit Activity Log...\n');
    
    // Check for RESOURCE_UPDATED entries
    const [rows] = await pool.execute(`
      SELECT 
        al.log_id,
        al.action,
        al.resource_id,
        al.created_at,
        u.name as user_name,
        u.email as user_email,
        r.title as resource_title
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      LEFT JOIN resources r ON al.resource_id = r.resource_id
      WHERE al.action = 'RESOURCE_UPDATED'
      ORDER BY al.created_at DESC
      LIMIT 10
    `);
    
    console.log(`Found ${rows.length} RESOURCE_UPDATED entries:`);
    
    if (rows.length > 0) {
      rows.forEach((row, index) => {
        console.log(`\n${index + 1}. Log ID: ${row.log_id}`);
        console.log(`   Action: ${row.action}`);
        console.log(`   User: ${row.user_name} (${row.user_email})`);
        console.log(`   Resource: ${row.resource_title} (ID: ${row.resource_id})`);
        console.log(`   Time: ${row.created_at}`);
      });
    } else {
      console.log('No RESOURCE_UPDATED entries found.');
      console.log('\nAvailable actions in activity_logs:');
      
      const [actions] = await pool.execute(`
        SELECT action, COUNT(*) as count 
        FROM activity_logs 
        GROUP BY action 
        ORDER BY count DESC
      `);
      
      actions.forEach(action => {
        console.log(`- ${action.action}: ${action.count} entries`);
      });
    }
    
    // Test the mapping logic
    console.log('\n🔍 Testing activity type mapping...');
    const [mappedRows] = await pool.execute(`
      SELECT 
        al.log_id,
        al.action,
        CASE 
          WHEN al.action = 'USER_LOGIN' THEN 'login'
          WHEN al.action = 'RESOURCE_DOWNLOADED' THEN 'resource_download'
          WHEN al.action = 'RESOURCE_VIEW' THEN 'resource_view'
          WHEN al.action = 'RESOURCE_CREATED' THEN 'resource_upload'
          WHEN al.action = 'RESOURCE_UPDATED' THEN 'resource_edit'
          WHEN al.action = 'ADMIN_CREATE_SCHOOL' THEN 'school_created'
          ELSE 'other'
        END as activity_type,
        al.created_at
      FROM activity_logs al
      WHERE al.action = 'RESOURCE_UPDATED'
      ORDER BY al.created_at DESC
      LIMIT 5
    `);
    
    console.log(`Mapped RESOURCE_UPDATED entries to activity_type:`);
    mappedRows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.action} → ${row.activity_type} (${row.created_at})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testResourceEdit();

