const mysql = require('mysql2/promise');

const testResourcesDB = async () => {
  try {
    console.log('🔍 Testing connection to resources_db...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'resources_db'
    });

    console.log('✅ Successfully connected to resources_db!');
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n📋 Found ${tables.length} tables in resources_db`);
    
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
      console.log('\n💡 You may need to import the database schema.');
      console.log('   You can use the SQL file: resources_db.sql');
    }
    
    await connection.end();
    console.log('\n✅ Database test completed!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Make sure the database "resources_db" exists');
    console.log('2. Check if you need to import the schema');
    console.log('3. Verify database credentials');
  }
};

testResourcesDB();
