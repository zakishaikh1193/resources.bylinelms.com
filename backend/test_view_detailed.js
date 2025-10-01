const axios = require('axios');

async function testViewDetailed() {
  try {
    console.log('🔍 Testing View Endpoint with Detailed Logging...\n');
    
    // First check if server is running
    console.log('1. Checking if server is running...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/auth/health', { timeout: 5000 });
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running or not responding');
      console.log('Error:', error.message);
      return;
    }
    
    // Test admin login
    console.log('\n2. Testing admin login...');
    let adminToken;
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@resources.com',
        password: 'admin123'
      });
      
      if (loginResponse.data.success) {
        adminToken = loginResponse.data.token;
        console.log('✅ Admin login successful');
        console.log('Token length:', adminToken.length);
      } else {
        console.log('❌ Admin login failed:', loginResponse.data.message);
        return;
      }
    } catch (error) {
      console.log('❌ Admin login error:', error.response?.data || error.message);
      return;
    }
    
    // Test view endpoint with detailed error handling
    console.log('\n3. Testing view endpoint...');
    try {
      const viewResponse = await axios.post('http://localhost:5000/api/resources/22/view', {}, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ View endpoint successful!');
      console.log('Response:', JSON.stringify(viewResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ View endpoint failed');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.log('Full Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

testViewDetailed();

