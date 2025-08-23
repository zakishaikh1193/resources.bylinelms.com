const mysql = require('mysql2/promise');
require('dotenv').config();

const checkDatabase = async () => {
  try {
    // Create connection without specifying database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ Connected to MySQL server successfully!');
    console.log('=====================================');

    // Get all databases
    console.log('\n📋 Available Databases:');
    const [databases] = await connection.execute('SHOW DATABASES');
    databases.forEach(db => {
      console.log(`   - ${db.Database_information_schema || db.Database}`);
    });

    // Check if resources_db exists
    const resourcesDbExists = databases.some(db => 
      (db.Database_information_schema || db.Database) === 'resources_db'
    );

    if (resourcesDbExists) {
      console.log('\n✅ Database "resources_db" exists!');
      
      // Connect to resources_db
      await connection.execute('USE resources_db');
      
      // Get all tables in resources_db
      console.log('\n📋 Tables in resources_db:');
      const [tables] = await connection.execute('SHOW TABLES');
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });

      // Get table details
      console.log('\n📊 Table Details:');
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        console.log(`\n   Table: ${tableName}`);
        
        // Get table structure
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        columns.forEach(column => {
          console.log(`     - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(NOT NULL)' : ''} ${column.Key === 'PRI' ? '(PRIMARY KEY)' : ''}`);
        });

        // Get row count
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`     Rows: ${countResult[0].count}`);
      }

    } else {
      console.log('\n❌ Database "resources_db" does not exist!');
      console.log('\nTo create the database, run:');
      console.log('CREATE DATABASE resources_db;');
    }

    await connection.end();
    console.log('\n✅ Database check completed!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check your database credentials in .env file');
    console.log('3. Make sure the database user has proper permissions');
  }
};

checkDatabase();
