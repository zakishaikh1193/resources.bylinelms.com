const { pool } = require('./config/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Checking school_activity_logs table structure...');
    
    // Check if table exists
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'school_activity_logs'
    `);
    
    if (tables.length === 0) {
      console.log('❌ school_activity_logs table does not exist');
      return;
    }
    
    console.log('✅ school_activity_logs table exists');
    
    // Check table structure
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'school_activity_logs'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📋 Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check if there's any data
    const [countResult] = await pool.execute('SELECT COUNT(*) as count FROM school_activity_logs');
    console.log(`📊 Total records: ${countResult[0].count}`);
    
    if (countResult[0].count > 0) {
      // Show sample data
      const [sampleData] = await pool.execute('SELECT * FROM school_activity_logs LIMIT 3');
      console.log('📄 Sample data:');
      sampleData.forEach((row, index) => {
        console.log(`  Record ${index + 1}:`, {
          log_id: row.log_id,
          school_name: row.school_name,
          activity_type: row.activity_type,
          resource_name: row.resource_name,
          activity_timestamp: row.activity_timestamp
        });
      });
    }
    
    // Test the exact query from the controller
    console.log('🧪 Testing the exact query from controller...');
    try {
      const [testQuery] = await pool.execute(`
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
        LIMIT 5 OFFSET 0
      `);
      
      console.log('✅ Query executed successfully');
      console.log('📊 Query result count:', testQuery.length);
      
      if (testQuery.length > 0) {
        console.log('📄 Query result sample:', testQuery[0]);
      }
      
    } catch (queryError) {
      console.error('❌ Query failed:', queryError);
      console.error('Error details:', {
        message: queryError.message,
        code: queryError.code,
        errno: queryError.errno,
        sqlState: queryError.sqlState,
        sqlMessage: queryError.sqlMessage
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  }
}

checkTableStructure();