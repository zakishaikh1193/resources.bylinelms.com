const mysql = require('mysql2/promise');
require('dotenv').config();

const checkTables = async () => {
  try {
    // Connect directly to resources_db
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'resources_db'
    });

    console.log('✅ Connected to resources_db successfully!');
    console.log('=====================================');

    // Get all tables
    console.log('\n📋 Tables in resources_db:');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('   No tables found. Database is empty.');
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
  }
};

checkTables();
