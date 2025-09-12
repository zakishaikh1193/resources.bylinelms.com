const axios = require('axios');

async function testViewEndpointFixed() {
  try {
    console.log('🧪 Testing fixed view tracking endpoint...');
    
    // Test with resource ID 22 (which exists)
    const resourceId = 22;
    const url = `http://localhost:5000/api/resources/${resourceId}/view`;
    
    console.log('Testing URL:', url);
    
    // Test without authentication first
    try {
      const response = await axios.post(url, {}, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Test-Client/1.0'
        }
      });
      
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', response.data);
      
      // Now check if it was inserted into the database
      const mysql = require('mysql2/promise');
      const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'resources_db'
      });
      
      const [rows] = await pool.execute("SELECT * FROM activity_logs WHERE action = 'RESOURCE_VIEW' ORDER BY created_at DESC LIMIT 1");
      if (rows.length > 0) {
        console.log('✅ View tracking successful! Latest entry:');
        console.log(`   - ID: ${rows[0].log_id}`);
        console.log(`   - Resource: ${rows[0].resource_id}`);
        console.log(`   - Time: ${rows[0].created_at}`);
      } else {
        console.log('❌ No RESOURCE_VIEW entry found in database');
      }
      
      await pool.end();
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Error response status:', error.response.status);
        console.log('❌ Error response data:', error.response.data);
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testViewEndpointFixed();

