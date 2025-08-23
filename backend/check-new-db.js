const mysql = require('mysql2/promise');
require('dotenv').config();

const checkNewDatabase = async () => {
  try {
    // Connect to bylinelm_resources_db
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'bylinelm_resources_db'
    });

    console.log('✅ Connected to bylinelm_resources_db successfully!');
    console.log('=====================================');

    // Get all tables
    console.log('\n📋 Tables in bylinelm_resources_db:');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('   No tables found. Database is empty.');
      console.log('\n💡 You need to import the database schema.');
      console.log('   You can use the SQL file: resources_db.sql');
    } else {
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });

      // Get row counts for each table
      console.log('\n📊 Table Row Counts:');
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        try {
          const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`   ${tableName}: ${countResult[0].count} rows`);
        } catch (error) {
          console.log(`   ${tableName}: Error getting count - ${error.message}`);
        }
      }
    }

    await connection.end();
    console.log('\n✅ Database check completed!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the database "bylinelm_resources_db" exists');
    console.log('2. Check your database credentials');
    console.log('3. Import the schema from resources_db.sql if needed');
  }
};

checkNewDatabase();
