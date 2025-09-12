const { pool } = require('./config/database');

async function testDirectAPI() {
  try {
    console.log('🧪 Testing direct API call simulation...');
    
    // Simulate the exact same query that the controller uses
    console.log('1. Testing the exact query from getActivityLogs...');
    
    const page = 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    console.log('Query parameters:', { page, limit, offset, whereClause, params });
    
    const query = `SELECT 
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
       ${whereClause}
       ORDER BY sal.activity_timestamp DESC
       LIMIT ? OFFSET ?`;
    
    console.log('Executing query:', query);
    console.log('With parameters:', [...params, parseInt(limit), offset]);
    
    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);
    console.log('Converted parameters:', { limitInt, offsetInt, typeLimit: typeof limitInt, typeOffset: typeof offsetInt });
    
    const [logs] = await pool.execute(query, [...params, limitInt, offsetInt]);
    console.log('✅ Query executed successfully');
    console.log('Logs count:', logs.length);
    console.log('Sample log:', logs[0]);
    
    // Test count query
    console.log('\n2. Testing count query...');
    const countQuery = `SELECT COUNT(*) as total FROM school_activity_logs sal ${whereClause}`;
    console.log('Count query:', countQuery);
    console.log('Count params:', params);
    
    const [countResult] = await pool.execute(countQuery, params);
    console.log('✅ Count query executed successfully');
    console.log('Count result:', countResult);
    
    const total = countResult[0].total;
    console.log('Total count:', total);
    
    // Test the response structure
    console.log('\n3. Testing response structure...');
    const response = {
      success: true,
      data: {
        logs: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    };
    
    console.log('✅ Response structure created successfully');
    console.log('Response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Direct API test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });
  }
}

testDirectAPI();