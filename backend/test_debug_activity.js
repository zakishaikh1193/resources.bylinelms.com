const axios = require('axios');

async function testActivityLogsWithDebug() {
  try {
    console.log('🧪 Testing activity logs endpoint with debug...');
    
    // First, let's try to login with a known admin user
    console.log('1. Attempting login...');
    
    // Try different admin credentials
    const adminCredentials = [
      { email: 'admin@resources.com', password: 'admin123' },
      { email: 'info@bylinelearning.com', password: 'admin123' },
      { email: 'admin@bylinelms.com', password: 'admin123' },
      { email: 'admin@example.com', password: 'password' },
      { email: 'admin', password: 'admin' }
    ];
    
    let token = null;
    let loginSuccess = false;
    
    for (const creds of adminCredentials) {
      try {
        console.log(`   Trying: ${creds.email}`);
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', creds);
        token = loginResponse.data.data.token;
        console.log('   ✅ Login successful with:', creds.email);
        loginSuccess = true;
        break;
      } catch (error) {
        console.log('   ❌ Login failed:', error.response?.data?.message || error.message);
      }
    }
    
    if (!loginSuccess) {
      console.log('❌ All login attempts failed. Please check admin credentials.');
      return;
    }
    
    console.log('2. Testing activity logs endpoint...');
    console.log('   Token length:', token ? token.length : 0);
    
    try {
      const response = await axios.get('http://localhost:5000/api/admin/activity/logs?page=1&limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Activity logs request successful');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ Activity logs request failed');
      console.log('Status:', error.response?.status);
      console.log('Response:', JSON.stringify(error.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testActivityLogsWithDebug();
