// Use built-in fetch for Node.js 18+ or import for older versions
let fetch;
try {
  // Try to use built-in fetch (Node.js 18+)
  fetch = globalThis.fetch;
} catch (e) {
  // Fallback to node-fetch for older versions
  fetch = require('node-fetch');
}

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test functions
async function testLogin() {
  console.log('\n🔐 Testing Login...');
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'info@bylinelearning.com',
        password: 'admin@Byline25'
      })
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (data.success) {
      authToken = data.data.token;
      console.log('✅ Login successful!');
      console.log('Token received:', authToken.substring(0, 50) + '...');
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testActivityLogs() {
  console.log('\n📊 Testing Activity Logs API...');
  
  if (!authToken) {
    console.log('❌ No auth token available. Please login first.');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/activity/logs?page=1&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Activity logs fetched successfully!');
      console.log(`Total logs: ${data.data.logs.length}`);
      console.log(`Pagination: Page ${data.data.pagination.page} of ${data.data.pagination.pages}`);
    } else {
      console.log('❌ Failed to fetch activity logs:', data.message);
    }
  } catch (error) {
    console.log('❌ Activity logs error:', error.message);
  }
}

async function testActivityLogsWithFilters() {
  console.log('\n🔍 Testing Activity Logs with Filters...');
  
  if (!authToken) {
    console.log('❌ No auth token available. Please login first.');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/activity/logs?action=resource_download&page=1&limit=3`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Filtered activity logs fetched successfully!');
      console.log(`Filtered logs: ${data.data.logs.length}`);
    } else {
      console.log('❌ Failed to fetch filtered activity logs:', data.message);
    }
  } catch (error) {
    console.log('❌ Filtered activity logs error:', error.message);
  }
}

async function testActivitySummary() {
  console.log('\n📈 Testing Activity Summary API...');
  
  if (!authToken) {
    console.log('❌ No auth token available. Please login first.');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/activity/summary?days=30`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Activity summary fetched successfully!');
    } else {
      console.log('❌ Failed to fetch activity summary:', data.message);
    }
  } catch (error) {
    console.log('❌ Activity summary error:', error.message);
  }
}

async function testSchoolDownloads() {
  console.log('\n🏫 Testing School Downloads API...');
  
  if (!authToken) {
    console.log('❌ No auth token available. Please login first.');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/activity/school-downloads?page=1&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ School downloads fetched successfully!');
      console.log(`Total downloads: ${data.data.logs.length}`);
    } else {
      console.log('❌ Failed to fetch school downloads:', data.message);
    }
  } catch (error) {
    console.log('❌ School downloads error:', error.message);
  }
}

async function testDatabaseConnection() {
  console.log('\n🗄️ Testing Database Connection...');
  
  try {
    const { pool } = require('./config/database');
    
    // Test basic query
    const [result] = await pool.execute('SELECT COUNT(*) as total FROM school_activity_logs');
    console.log('✅ Database connected successfully!');
    console.log(`Total records in school_activity_logs: ${result[0].total}`);
    
    // Test sample data
    const [sampleData] = await pool.execute('SELECT * FROM school_activity_logs LIMIT 3');
    console.log('Sample data structure:', Object.keys(sampleData[0] || {}));
    
    return true;
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log('Base URL:', BASE_URL);
  
  // Test database connection first
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('❌ Cannot proceed without database connection');
    return;
  }
  
  // Test login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without successful login');
    return;
  }
  
  // Test all endpoints
  await testActivityLogs();
  await testActivityLogsWithFilters();
  await testActivitySummary();
  await testSchoolDownloads();
  
  console.log('\n✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);
