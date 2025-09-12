const mysql = require('mysql2/promise');

async function checkResources() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resources_db'
  });
  
  try {
    const [rows] = await pool.execute('SELECT resource_id, title FROM resources LIMIT 5');
    console.log('Available resources:');
    if (rows.length > 0) {
      rows.forEach(row => {
        console.log(`- ID: ${row.resource_id}, Title: ${row.title}`);
      });
    } else {
      console.log('No resources found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkResources();

