const mysql = require('mysql2/promise');

const testCorrectDB = async () => {
  try {
    console.log('🔍 Testing connection to " bylinelm_resources_db"...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: ' bylinelm_resources_db'
    });

    console.log('✅ Successfully connected to " bylinelm_resources_db"!');
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n📋 Found ${tables.length} tables in the database`);
    
    if (tables.length > 0) {
      console.log('\nTables:');
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`  ${index + 1}. ${tableName}`);
      });
    } else {
      console.log('\n⚠️  No tables found. Database is empty.');
    }
    
    await connection.end();
    console.log('\n✅ Database test completed!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

testCorrectDB();
