const mysql = require('mysql2/promise');

const listDatabases = async () => {
  try {
    console.log('🔍 Connecting to MySQL server...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    });

    console.log('✅ Successfully connected to MySQL server!');
    
    // List all databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('\n📋 Available Databases:');
    console.log('=======================');
    
    databases.forEach((db, index) => {
      const dbName = Object.values(db)[0];
      console.log(`${index + 1}. ${dbName}`);
    });
    
    // Check if bylinelm_resources_db exists
    const bylinelmExists = databases.some(db => 
      Object.values(db)[0] === 'bylinelm_resources_db'
    );
    
    if (bylinelmExists) {
      console.log('\n✅ Database "bylinelm_resources_db" exists!');
    } else {
      console.log('\n❌ Database "bylinelm_resources_db" does not exist.');
      console.log('\n💡 To create it, run:');
      console.log('CREATE DATABASE bylinelm_resources_db;');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

listDatabases();
