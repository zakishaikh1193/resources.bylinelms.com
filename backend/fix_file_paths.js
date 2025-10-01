const { pool } = require('./config/database');

async function fixFilePaths() {
  try {
    console.log('🔧 Fixing file paths in database...\n');
    
    // Check current file paths
    console.log('1️⃣ Current file paths:');
    const [currentPaths] = await pool.execute('SELECT resource_id, title, file_path FROM resources LIMIT 5');
    currentPaths.forEach(resource => {
      console.log(`ID ${resource.resource_id}: ${resource.title}`);
      console.log(`  Path: ${resource.file_path}`);
    });
    
    // Fix the paths
    console.log('\n2️⃣ Updating file paths...');
    const [result] = await pool.execute(
      'UPDATE resources SET file_path = REPLACE(file_path, "backend/uploads/", "uploads/") WHERE file_path LIKE "backend/uploads/%"'
    );
    
    console.log(`✅ Updated ${result.affectedRows} file paths`);
    
    // Check updated paths
    console.log('\n3️⃣ Updated file paths:');
    const [updatedPaths] = await pool.execute('SELECT resource_id, title, file_path FROM resources LIMIT 5');
    updatedPaths.forEach(resource => {
      console.log(`ID ${resource.resource_id}: ${resource.title}`);
      console.log(`  Path: ${resource.file_path}`);
    });
    
    console.log('\n✅ File paths fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing file paths:', error.message);
  } finally {
    process.exit(0);
  }
}

fixFilePaths();
