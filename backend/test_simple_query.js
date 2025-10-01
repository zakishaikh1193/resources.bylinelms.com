const { pool } = require('./config/database');

async function testSimpleQuery() {
  try {
    console.log('🧪 Testing simple query...');
    
    // Test 1: Simple query without parameters
    console.log('1. Testing simple query without parameters...');
    const [result1] = await pool.execute('SELECT COUNT(*) as count FROM school_activity_logs');
    console.log('✅ Simple query result:', result1);
    
    // Test 2: Query with LIMIT only
    console.log('2. Testing query with LIMIT only...');
    const [result2] = await pool.execute('SELECT * FROM school_activity_logs LIMIT 5');
    console.log('✅ LIMIT query result count:', result2.length);
    
    // Test 3: Query with LIMIT and OFFSET using string concatenation
    console.log('3. Testing query with LIMIT and OFFSET using string concatenation...');
    const limit = 5;
    const offset = 0;
    const query3 = `SELECT * FROM school_activity_logs LIMIT ${limit} OFFSET ${offset}`;
    console.log('Query:', query3);
    const [result3] = await pool.execute(query3);
    console.log('✅ String concatenation query result count:', result3.length);
    
    // Test 4: Query with LIMIT and OFFSET using parameters
    console.log('4. Testing query with LIMIT and OFFSET using parameters...');
    const [result4] = await pool.execute('SELECT * FROM school_activity_logs LIMIT ? OFFSET ?', [5, 0]);
    console.log('✅ Parameter query result count:', result4.length);
    
    // Test 5: The exact problematic query
    console.log('5. Testing the exact problematic query...');
    const query5 = `SELECT 
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
       LIMIT ? OFFSET ?`;
    
    console.log('Query:', query5);
    console.log('Parameters:', [5, 0]);
    const [result5] = await pool.execute(query5, [5, 0]);
    console.log('✅ Exact query result count:', result5.length);
    
  } catch (error) {
    console.error('❌ Query test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  }
}

testSimpleQuery();

