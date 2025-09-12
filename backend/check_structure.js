const { pool } = require('./config/database');

async function checkStructure() {
  try {
    const [columns] = await pool.execute('DESCRIBE school_activity_logs');
    console.log('Table structure:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkStructure();
