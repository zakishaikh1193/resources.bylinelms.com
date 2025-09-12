// Use built-in fetch (Node.js 18+) or axios
const axios = require('axios');

async function testActivityLogsAuth() {
  try {
    console.log('Testing activity logs authentication...');
    
    // First, let's login to get a token
    console.log('1. Logging in to get admin token...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@bylinelms.com', // Use your admin email
      password: 'admin123' // Use your admin password
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const loginData = loginResponse.data;
    console.log('✅ Login successful');
    console.log('User:', loginData.data.user.name, '- Role:', loginData.data.user.role);
    
    const token = loginData.data.token;
    console.log('Token received:', token ? 'Yes' : 'No');
    console.log('Token length:', token ? token.length : 0);
    
    // Test activity logs endpoint with token
    console.log('\n2. Testing activity logs endpoint...');
    const activityResponse = await axios.get('http://localhost:5000/api/admin/activity/logs?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Activity logs response status:', activityResponse.status);
    console.log('Activity logs response headers:', activityResponse.headers);
    
    const activityData = activityResponse.data;
    console.log('✅ Activity logs request successful');
    console.log('Response data:', JSON.stringify(activityData, null, 2));
    
    // Test without token
    console.log('\n3. Testing activity logs endpoint without token...');
    try {
      const noTokenResponse = await axios.get('http://localhost:5000/api/admin/activity/logs?page=1&limit=5', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('No token response status:', noTokenResponse.status);
      console.log('No token response:', JSON.stringify(noTokenResponse.data, null, 2));
    } catch (error) {
      console.log('No token response status:', error.response?.status);
      console.log('No token response:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Test with invalid token
    console.log('\n4. Testing activity logs endpoint with invalid token...');
    try {
      const invalidTokenResponse = await axios.get('http://localhost:5000/api/admin/activity/logs?page=1&limit=5', {
        headers: {
          'Authorization': 'Bearer invalid_token_here',
          'Content-Type': 'application/json',
        }
      });
      console.log('Invalid token response status:', invalidTokenResponse.status);
      console.log('Invalid token response:', JSON.stringify(invalidTokenResponse.data, null, 2));
    } catch (error) {
      console.log('Invalid token response status:', error.response?.status);
      console.log('Invalid token response:', JSON.stringify(error.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testActivityLogsAuth();
