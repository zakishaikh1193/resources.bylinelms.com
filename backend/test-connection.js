const mysql = require('mysql2/promise');

const testConnection = async () => {
  try {
    console.log('🔍 Testing connection to bylinelm_resources_db...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'bylinelm_resources_db'
    });

    console.log('✅ Successfully connected to bylinelm_resources_db!');
    
    // Test if we can query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database query test passed!');
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables in the database`);
    
    if (tables.length > 0) {
      console.log('Tables:');
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`  ${index + 1}. ${tableName}`);
      });
    } else {
      console.log('⚠️  No tables found. Database is empty.');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Make sure database "bylinelm_resources_db" exists');
    console.log('3. Check if you need a password for root user');
  }
};

testConnection();
