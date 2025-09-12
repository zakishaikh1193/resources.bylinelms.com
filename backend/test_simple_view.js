const axios = require('axios');

async function testSimpleView() {
  try {
    console.log('🔍 Simple View Endpoint Test...\n');
    
    // Test with curl-like approach
    console.log('1. Testing basic connectivity...');
    try {
      const response = await axios.get('http://localhost:5000', { timeout: 2000 });
      console.log('✅ Server responding on port 5000');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server not running - Connection refused');
        console.log('   Please start the server with: node server.js');
        return;
      } else {
        console.log('⚠️ Server responding but with error:', error.response?.status);
      }
    }
    
    // Test login endpoint
    console.log('\n2. Testing login endpoint...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@resources.com',
        password: 'admin123'
      }, { timeout: 5000 });
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful');
        const token = loginResponse.data.token;
        
        // Test view endpoint
        console.log('\n3. Testing view endpoint...');
        const viewResponse = await axios.post('http://localhost:5000/api/resources/22/view', {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        console.log('✅ View endpoint response:', viewResponse.data);
        
      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
      }
      
    } catch (error) {
      console.log('❌ Login/View error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

testSimpleView();

