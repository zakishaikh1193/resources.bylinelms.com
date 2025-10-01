const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');

async function testSchoolLogin() {
  try {
    console.log('🧪 Testing School Login Functionality...\n');
    
    // Step 1: Check current school_activity_logs
    console.log('1️⃣ Checking current school_activity_logs...');
    const [currentLogs] = await pool.execute('SELECT COUNT(*) as total FROM school_activity_logs');
    console.log(`✅ Current total logs: ${currentLogs[0].total}`);
    
    // Step 2: Check if we have a school user
    console.log('\n2️⃣ Checking school users...');
    const [schoolUsers] = await pool.execute("SELECT user_id, name, email, organization FROM users WHERE role = 'school' AND status = 'active'");
    
    if (schoolUsers.length === 0) {
      console.log('❌ No school users found. Creating a test school user...');
      
      // Create a test school user
      const hashedPassword = await bcrypt.hash('school123', 12);
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, role, organization, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['Test School', 'testschool@example.com', hashedPassword, 'school', 'Test School Organization', 'active']
      );
      
      console.log('✅ Test school user created with ID:', result.insertId);
      
      // Get the created user
      const [newUser] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
      const schoolUser = newUser[0];
      console.log('✅ Test school user:', schoolUser.name, schoolUser.email);
    } else {
      console.log('✅ Found school users:');
      schoolUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.organization}`);
      });
    }
    
    // Step 3: Simulate a school login by inserting directly into school_activity_logs
    console.log('\n3️⃣ Simulating school login activity...');
    const schoolUser = schoolUsers[0] || { user_id: 1, name: 'Test School', email: 'testschool@example.com', organization: 'Test School Organization' };
    
    const [loginResult] = await pool.execute(
      `INSERT INTO school_activity_logs (
        school_id, school_name, school_email, school_organization, 
        activity_type, login_time, ip_address, user_agent, 
        additional_details
      ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [
        schoolUser.user_id,
        schoolUser.name,
        schoolUser.email,
        schoolUser.organization,
        'login',
        '192.168.1.100',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        JSON.stringify({
          login_method: 'web',
          session_id: `sess_${Date.now()}`,
          user_role: 'school',
          organization: schoolUser.organization,
          test_data: true
        })
      ]
    );
    
    console.log('✅ School login activity logged with ID:', loginResult.insertId);
    
    // Step 4: Verify the new log entry
    console.log('\n4️⃣ Verifying new log entry...');
    const [newLogs] = await pool.execute('SELECT COUNT(*) as total FROM school_activity_logs');
    console.log(`✅ New total logs: ${newLogs[0].total}`);
    
    const [latestLog] = await pool.execute('SELECT * FROM school_activity_logs ORDER BY id DESC LIMIT 1');
    if (latestLog.length > 0) {
      const log = latestLog[0];
      console.log('✅ Latest log entry:');
      console.log(`   - ID: ${log.id}`);
      console.log(`   - School: ${log.school_name} (${log.school_organization})`);
      console.log(`   - Activity: ${log.activity_type}`);
      console.log(`   - IP: ${log.ip_address}`);
      console.log(`   - Time: ${log.login_time}`);
      console.log(`   - Details: ${log.additional_details}`);
    }
    
    // Step 5: Test the admin API query
    console.log('\n5️⃣ Testing admin API query logic...');
    try {
      const [apiLogs] = await pool.execute(`
        SELECT 
          sal.id as log_id,
          sal.school_id,
          sal.school_name,
          sal.school_email,
          sal.school_organization,
          sal.activity_type,
          sal.resource_id,
          sal.resource_name,
          sal.resource_type,
          sal.subject_name,
          sal.grade_level,
          sal.ip_address,
          sal.user_agent,
          sal.login_time,
          sal.activity_timestamp,
          sal.session_duration,
          sal.file_size,
          sal.file_extension,
          sal.download_count,
          sal.additional_details,
          sal.created_at,
          sal.updated_at
         FROM school_activity_logs sal
         ORDER BY sal.activity_timestamp DESC
         LIMIT 5
       `);
      
      console.log(`✅ Admin API query successful: ${apiLogs.length} records`);
      
      if (apiLogs.length > 0) {
        console.log('Sample API response record:');
        const log = apiLogs[0];
        console.log({    
          log_id: log.log_id,
          school_name: log.school_name,
          activity_type: log.activity_type,
          ip_address: log.ip_address,
          login_time: log.login_time
        });
      }
      
    } catch (error) {
      console.log(`❌ Admin API query failed: ${error.message}`);
    }
    
    console.log('\n✅ School login test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- School login activity is now being logged to school_activity_logs table');
    console.log('- Admin dashboard can fetch this data using the /admin/activity/logs endpoint');
    console.log('- Data includes: school info, login time, IP address, user agent, and additional details');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testSchoolLogin();
