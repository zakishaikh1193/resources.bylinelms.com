const mysql = require('mysql2/promise');

const findDatabase = async () => {
  try {
    console.log('🔍 Connecting to MySQL server...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    });

    console.log('✅ Connected to MySQL server!');
    
    // List all databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('\n📋 All Available Databases:');
    console.log('==========================');
    
    databases.forEach((db, index) => {
      const dbName = Object.values(db)[0];
      console.log(`${index + 1}. "${dbName}"`);
    });
    
    // Look for databases with similar names
    console.log('\n🔍 Looking for similar database names...');
    const similarNames = databases.filter(db => {
      const dbName = Object.values(db)[0].toLowerCase();
      return dbName.includes('bylinelm') || 
             dbName.includes('resource') || 
             dbName.includes('resources');
    });
    
    if (similarNames.length > 0) {
      console.log('\n🎯 Found similar database names:');
      similarNames.forEach((db, index) => {
        const dbName = Object.values(db)[0];
        console.log(`${index + 1}. "${dbName}"`);
      });
    } else {
      console.log('\n❌ No similar database names found');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

findDatabase();
