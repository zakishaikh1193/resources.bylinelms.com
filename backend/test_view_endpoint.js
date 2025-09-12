const axios = require('axios');

async function testViewEndpoint() {
  try {
    console.log('🔍 Testing View Endpoint Directly...\n');
    
    // Test the endpoint without authentication first
    console.log('1. Testing view endpoint without authentication...');
    try {
      const response = await axios.post('http://localhost:5000/api/resources/22/view', {});
      console.log('✅ Response without auth:', response.data);
    } catch (error) {
      console.log('❌ Error without auth:', error.response?.data || error.message);
    }
    
    // Test with a simple token
    console.log('\n2. Testing view endpoint with dummy token...');
    try {
      const response = await axios.post('http://localhost:5000/api/resources/22/view', {}, {
        headers: {
          'Authorization': 'Bearer dummy-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Response with dummy token:', response.data);
    } catch (error) {
      console.log('❌ Error with dummy token:', error.response?.data || error.message);
    }
    
    // Test with admin token
    console.log('\n3. Testing view endpoint with admin token...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@resources.com',
        password: 'admin123'
      });
      
      if (loginResponse.data.success) {
        const token = loginResponse.data.token;
        console.log('✅ Admin login successful');
        
        const viewResponse = await axios.post('http://localhost:5000/api/resources/22/view', {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ View response with admin token:', viewResponse.data);
      } else {
        console.log('❌ Admin login failed:', loginResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Error with admin token:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

testViewEndpoint();