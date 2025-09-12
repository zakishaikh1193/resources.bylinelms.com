const mysql = require('mysql2/promise');

async function checkSchoolUsers() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resources_db'
  });
  
  try {
    console.log('🔍 Checking School Users...\n');
    
    const [users] = await pool.execute(`
      SELECT user_id, name, email, role, status, created_at
      FROM users 
      WHERE role = 'school'
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${users.length} school users:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.user_id}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
    
    // Check if there are any recent logins from school users
    console.log('📝 Recent School User Logins:');
    const [logins] = await pool.execute(`
      SELECT 
        al.log_id,
        al.user_id,
        u.name as user_name,
        u.email as user_email,
        al.created_at
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      WHERE al.action = 'USER_LOGIN' AND u.role = 'school'
      ORDER BY al.created_at DESC
      LIMIT 5
    `);
    
    logins.forEach((login, index) => {
      console.log(`${index + 1}. ${login.user_name} (${login.user_email}) - ${login.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchoolUsers();

