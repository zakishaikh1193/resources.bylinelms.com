const mysql = require('mysql2/promise');

const testBylinelmDB = async () => {
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
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n📋 Found ${tables.length} tables in bylinelm_resources_db`);
    
    if (tables.length > 0) {
      console.log('\nTables:');
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`  ${index + 1}. ${tableName}`);
      });
      
      // Check if users table exists and has data
      const usersExists = tables.some(table => 
        Object.values(table)[0] === 'users'
      );
      
      if (usersExists) {
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log(`\n👥 Users table has ${userCount[0].count} records`);
        
        if (userCount[0].count > 0) {
          const [users] = await connection.execute('SELECT user_id, name, email, role FROM users LIMIT 5');
          console.log('\nSample users:');
          users.forEach(user => {
            console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
          });
        }
      }
    } else {
      console.log('\n⚠️  No tables found. Database is empty.');
    }
    
    await connection.end();
    console.log('\n✅ Database test completed!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

testBylinelmDB();
