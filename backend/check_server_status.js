const axios = require('axios');

async function checkServerStatus() {
  try {
    console.log('🔍 Checking Backend Server Status...\n');
    
    // Test basic connectivity
    console.log('1. Testing server connectivity...');
    try {
      const response = await axios.get('http://localhost:5000', { timeout: 3000 });
      console.log('✅ Server is responding on port 5000');
      console.log('Status:', response.status);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running on port 5000');
        console.log('   Connection refused - server needs to be started');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('❌ Server connection timed out');
      } else {
        console.log('❌ Server connection error:', error.message);
      }
    }
    
    // Test API endpoint
    console.log('\n2. Testing API endpoint...');
    try {
      const response = await axios.get('http://localhost:5000/api/auth/health', { timeout: 3000 });
      console.log('✅ API endpoint is responding');
      console.log('Response:', response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ API endpoint not found (404)');
        console.log('   Server might be running but API routes not configured');
      } else {
        console.log('❌ API endpoint error:', error.message);
      }
    }
    
    // Test view endpoint specifically
    console.log('\n3. Testing view endpoint...');
    try {
      const response = await axios.post('http://localhost:5000/api/resources/22/view', {}, { timeout: 3000 });
      console.log('✅ View endpoint is responding');
      console.log('Response:', response.data);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ View endpoint not accessible - server not running');
      } else {
        console.log('❌ View endpoint error:', error.response?.data || error.message);
      }
    }
    
    console.log('\n📋 Instructions:');
    console.log('================');
    console.log('1. Start the backend server by running: node server.js');
    console.log('2. Make sure the server is running on port 5000');
    console.log('3. Then test the view tracking functionality');
    
  } catch (error) {
    console.error('❌ Error checking server status:', error.message);
  }
}

checkServerStatus();

