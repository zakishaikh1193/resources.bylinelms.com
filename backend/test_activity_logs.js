const { pool } = require('./config/database');

async function testActivityLogs() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const [connectionTest] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', connectionTest);
    
    // Check if school_activity_logs table exists
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'school_activity_logs'
    `);
    
    if (tables.length === 0) {
      console.log('❌ school_activity_logs table does not exist');
      console.log('Creating table...');
      
      // Create the table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS school_activity_logs (
          log_id INT AUTO_INCREMENT PRIMARY KEY,
          school_id INT NOT NULL,
          school_name VARCHAR(255) NOT NULL,
          school_email VARCHAR(255),
          school_organization VARCHAR(255),
          activity_type ENUM('login', 'resource_download', 'resource_view', 'resource_upload', 'logout', 'other') NOT NULL,
          resource_id INT NULL,
          resource_name VARCHAR(255) NULL,
          resource_type VARCHAR(100) NULL,
          subject_name VARCHAR(100) NULL,
          grade_level VARCHAR(50) NULL,
          ip_address VARCHAR(45) NULL,
          user_agent TEXT NULL,
          login_time DATETIME NULL,
          activity_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          file_size BIGINT NULL,
          file_extension VARCHAR(20) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ school_activity_logs table created');
    } else {
      console.log('✅ school_activity_logs table exists');
    }
    
    // Test simple query
    const [logs] = await pool.execute(`
      SELECT 
        sal.log_id,
        sal.school_name,
        sal.school_email,
        sal.school_organization,
        sal.activity_type,
        sal.resource_name,
        sal.resource_type,
        sal.subject_name,
        sal.grade_level,
        sal.ip_address,
        sal.user_agent,
        sal.login_time,
        sal.activity_timestamp,
        sal.file_size,
        sal.file_extension,
        sal.created_at
      FROM school_activity_logs sal
      ORDER BY sal.activity_timestamp DESC
      LIMIT 5
    `);
    
    console.log('✅ Query successful, found', logs.length, 'logs');
    console.log('Sample logs:', logs);
    
    // Insert a test log if no logs exist
    if (logs.length === 0) {
      console.log('No logs found, inserting test data...');
      await pool.execute(`
        INSERT INTO school_activity_logs (
          school_id, school_name, school_email, school_organization, 
          activity_type, activity_timestamp
        ) VALUES (
          1, 'Test School', 'test@school.com', 'Test Organization',
          'login', NOW()
        )
      `);
      console.log('✅ Test log inserted');
    }
    
  } catch (error) {
    console.error('❌ Error testing activity logs:', error);
  } finally {
    await pool.end();
  }
}

testActivityLogs();

