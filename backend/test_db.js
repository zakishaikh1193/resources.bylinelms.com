const { pool } = require('./config/database');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const [result] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', result[0]);
    
    // Check if school_activity_logs table exists
    try {
      const [tableCheck] = await pool.execute('SHOW TABLES LIKE "school_activity_logs"');
      if (tableCheck.length > 0) {
        console.log('✅ school_activity_logs table already exists');
        return;
      }
    } catch (e) {
      console.log('Table check failed, will create it');
    }
    
    // Create the table
    console.log('Creating school_activity_logs table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS school_activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        school_name VARCHAR(255) NOT NULL COMMENT 'Name of the school',
        school_email VARCHAR(255) COMMENT 'Email of the school',
        school_organization VARCHAR(255) COMMENT 'Organization/Institution name',
        resource_name VARCHAR(255) NULL COMMENT 'Name of the resource downloaded (NULL for login)',
        resource_type VARCHAR(100) NULL COMMENT 'Type of resource (PDF, DOC, etc.)',
        activity_type ENUM('login', 'resource_download', 'resource_view') NOT NULL DEFAULT 'login',
        login_time DATETIME NOT NULL COMMENT 'When the school user logged in',
        activity_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When this activity occurred',
        ip_address VARCHAR(45) COMMENT 'IP address of the school',
        user_agent TEXT COMMENT 'Browser/device information',
        file_size BIGINT NULL COMMENT 'File size in bytes (for downloads)',
        file_extension VARCHAR(20) NULL COMMENT 'File extension (for downloads)',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_school_name (school_name),
        INDEX idx_activity_type (activity_type),
        INDEX idx_login_time (login_time),
        INDEX idx_activity_timestamp (activity_timestamp),
        INDEX idx_school_activity (school_name, activity_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await pool.execute(createTableSQL);
    console.log('✅ school_activity_logs table created successfully');
    
    // Insert sample data
    console.log('Inserting sample data...');
    
    const insertSampleData = `
      INSERT INTO school_activity_logs (
        school_name, school_email, school_organization, resource_name, resource_type, 
        activity_type, login_time, ip_address, user_agent, file_size, file_extension
      ) VALUES 
      ('School A', 'schoola@example.com', 'ABC School', NULL, NULL, 'login', NOW() - INTERVAL 2 HOUR, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NULL, NULL),
      ('School A', 'schoola@example.com', 'ABC School', 'Mathematics Worksheet', 'PDF', 'resource_download', NOW() - INTERVAL 2 HOUR, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1024000, 'pdf'),
      ('School B', 'schoolb@example.com', 'XYZ School', NULL, NULL, 'login', NOW() - INTERVAL 1 HOUR, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', NULL, NULL),
      ('School B', 'schoolb@example.com', 'XYZ School', 'English Grammar Book', 'PDF', 'resource_download', NOW() - INTERVAL 1 HOUR, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 2048000, 'pdf')
    `;
    
    await pool.execute(insertSampleData);
    console.log('✅ Sample data inserted successfully');
    
    // Verify the data
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM school_activity_logs');
    console.log('✅ Total records in table:', rows[0].total);
    
    // Show sample data
    const [sampleData] = await pool.execute('SELECT * FROM school_activity_logs ORDER BY activity_timestamp DESC LIMIT 3');
    console.log('✅ Sample data:', JSON.stringify(sampleData, null, 2));
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();
