const { pool } = require('./config/database');

async function insertSampleData() {
  try {
    console.log('Checking existing data...');
    
    // Check if data already exists
    const [existingData] = await pool.execute('SELECT COUNT(*) as total FROM school_activity_logs');
    console.log('Current records in table:', existingData[0].total);
    
    if (existingData[0].total > 0) {
      console.log('✅ Table already has data, skipping insertion');
      return;
    }
    
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
      ('School B', 'schoolb@example.com', 'XYZ School', 'English Grammar Book', 'PDF', 'resource_download', NOW() - INTERVAL 1 HOUR, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 2048000, 'pdf'),
      ('School C', 'schoolc@example.com', 'DEF Academy', NULL, NULL, 'login', NOW() - INTERVAL 30 MINUTE, '192.168.1.102', 'Mozilla/5.0 (Linux; Android)', NULL, NULL),
      ('School C', 'schoolc@example.com', 'DEF Academy', 'History Timeline', 'HTML', 'resource_view', NOW() - INTERVAL 30 MINUTE, '192.168.1.102', 'Mozilla/5.0 (Linux; Android)', NULL, NULL)
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
    console.error('❌ Failed to insert sample data:', error);
  } finally {
    process.exit(0);
  }
}

insertSampleData();

