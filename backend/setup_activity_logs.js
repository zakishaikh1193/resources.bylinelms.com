const { pool } = require('./config/database');

async function setupActivityLogs() {
  try {
    console.log('Setting up activity logs...');
    
    // Check if school_activity_logs table exists
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'school_activity_logs'
    `);
    
    if (tables.length === 0) {
      console.log('Creating school_activity_logs table...');
      
      // Create the table
      await pool.execute(`
        CREATE TABLE school_activity_logs (
          log_id INT AUTO_INCREMENT PRIMARY KEY,
          school_id INT NOT NULL,
          school_name VARCHAR(255) NOT NULL,
          school_email VARCHAR(255),
          school_organization VARCHAR(255),
          activity_type ENUM('login', 'resource_download', 'resource_view', 'resource_upload', 'logout', 'other') NOT NULL,
          resource_id INT NULL,
          resource_name VARCHAR(255) NULL,
          downloaded_file_name VARCHAR(255) NULL,
          file_name VARCHAR(255) NULL,
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_school_id (school_id),
          INDEX idx_activity_type (activity_type),
          INDEX idx_resource_id (resource_id),
          INDEX idx_activity_timestamp (activity_timestamp),
          INDEX idx_school_activity (school_id, activity_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ school_activity_logs table created');
    } else {
      console.log('✅ school_activity_logs table already exists');
    }
    
    // Check if there's any data in the table
    const [countResult] = await pool.execute('SELECT COUNT(*) as count FROM school_activity_logs');
    const count = countResult[0].count;
    
    console.log(`Current activity logs count: ${count}`);
    
    if (count === 0) {
      console.log('Inserting sample activity log data...');
      
      // Get some users to use as school_id
      const [users] = await pool.execute('SELECT user_id, name, email, organization FROM users WHERE role = "school" LIMIT 3');
      
      if (users.length > 0) {
        // Insert sample activity logs
        const sampleLogs = [
          {
            school_id: users[0].user_id,
            school_name: users[0].name,
            school_email: users[0].email,
            school_organization: users[0].organization || users[0].name,
            activity_type: 'login',
            resource_id: null,
            resource_name: null,
            downloaded_file_name: null,
            file_name: null,
            resource_type: null,
            subject_name: null,
            grade_level: null,
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            login_time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            activity_timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            file_size: null,
            file_extension: null
          },
          {
            school_id: users[0].user_id,
            school_name: users[0].name,
            school_email: users[0].email,
            school_organization: users[0].organization || users[0].name,
            activity_type: 'resource_download',
            resource_id: 1,
            resource_name: 'Mathematics Worksheet',
            downloaded_file_name: 'math_worksheet.pdf',
            file_name: 'math_worksheet.pdf',
            resource_type: 'document',
            subject_name: 'Mathematics',
            grade_level: '5',
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            login_time: new Date(Date.now() - 2 * 60 * 60 * 1000),
            activity_timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            file_size: 1024000,
            file_extension: 'pdf'
          },
          {
            school_id: users[0].user_id,
            school_name: users[0].name,
            school_email: users[0].email,
            school_organization: users[0].organization || users[0].name,
            activity_type: 'resource_view',
            resource_id: 2,
            resource_name: 'Science Experiment Guide',
            downloaded_file_name: null,
            file_name: 'science_guide.pdf',
            resource_type: 'document',
            subject_name: 'Science',
            grade_level: '6',
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            login_time: new Date(Date.now() - 2 * 60 * 60 * 1000),
            activity_timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            file_size: 2048000,
            file_extension: 'pdf'
          }
        ];
        
        for (const log of sampleLogs) {
          await pool.execute(`
            INSERT INTO school_activity_logs (
              school_id, school_name, school_email, school_organization,
              activity_type, resource_id, resource_name, downloaded_file_name, file_name,
              resource_type, subject_name, grade_level, ip_address, user_agent,
              login_time, activity_timestamp, file_size, file_extension
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            log.school_id, log.school_name, log.school_email, log.school_organization,
            log.activity_type, log.resource_id, log.resource_name, log.downloaded_file_name, log.file_name,
            log.resource_type, log.subject_name, log.grade_level, log.ip_address, log.user_agent,
            log.login_time, log.activity_timestamp, log.file_size, log.file_extension
          ]);
        }
        
        console.log('✅ Sample activity log data inserted');
      } else {
        console.log('⚠️ No school users found to create sample activity logs');
      }
    }
    
    // Test the activity logs query
    console.log('Testing activity logs query...');
    const [testLogs] = await pool.execute(`
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
    
    console.log('✅ Activity logs query successful');
    console.log('Sample logs:', testLogs);
    
  } catch (error) {
    console.error('❌ Error setting up activity logs:', error);
    throw error;
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupActivityLogs()
    .then(() => {
      console.log('✅ Activity logs setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Activity logs setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupActivityLogs };

