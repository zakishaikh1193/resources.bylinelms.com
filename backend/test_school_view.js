const axios = require('axios');

async function testSchoolView() {
  try {
    console.log('🔍 Testing School User View Tracking...\n');
    
    // First, login as a school user
    console.log('1. Logging in as school user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'manish@test.com', // Use the school user email from the logs
      password: 'password123' // You may need to adjust this
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed, trying with different credentials...');
      
      // Try with the email from the activity logs
      const loginResponse2 = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'info1@bylinelearning.com', // From the school users list
        password: 'password123'
      });
      
      if (!loginResponse2.data.success) {
        console.log('❌ Login failed with both attempts');
        console.log('Login response:', loginResponse2.data);
        return;
      }
      
      var token = loginResponse2.data.token;
      var user = loginResponse2.data.user;
    } else {
      var token = loginResponse.data.token;
      var user = loginResponse.data.user;
    }
    
    console.log(`✅ Logged in as: ${user.name} (${user.email})`);
    console.log(`Token: ${token.substring(0, 20)}...\n`);
    
    // Get available resources
    console.log('2. Getting available resources...');
    const resourcesResponse = await axios.get('http://localhost:5000/api/resources?limit=5&status=published', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!resourcesResponse.data.success) {
      console.log('❌ Failed to get resources:', resourcesResponse.data.message);
      return;
    }
    
    const resources = resourcesResponse.data.data.resources;
    console.log(`✅ Found ${resources.length} resources`);
    
    if (resources.length === 0) {
      console.log('❌ No resources available to test with');
      return;
    }
    
    // Test view tracking on the first resource
    const testResource = resources[0];
    console.log(`\n3. Testing view tracking for: ${testResource.title} (ID: ${testResource.resource_id})`);
    
    const viewResponse = await axios.post(`http://localhost:5000/api/resources/${testResource.resource_id}/view`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (viewResponse.data.success) {
      console.log('✅ View tracking successful!');
      console.log('Response:', viewResponse.data);
    } else {
      console.log('❌ View tracking failed:', viewResponse.data.message);
    }
    
    // Test a second resource
    if (resources.length > 1) {
      const testResource2 = resources[1];
      console.log(`\n4. Testing view tracking for: ${testResource2.title} (ID: ${testResource2.resource_id})`);
      
      const viewResponse2 = await axios.post(`http://localhost:5000/api/resources/${testResource2.resource_id}/view`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (viewResponse2.data.success) {
        console.log('✅ Second view tracking successful!');
      } else {
        console.log('❌ Second view tracking failed:', viewResponse2.data.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSchoolView();

