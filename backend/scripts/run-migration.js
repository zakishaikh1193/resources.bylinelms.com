const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

// Run migration script
const runMigration = async () => {
  try {
    console.log('🔄 Running school subject permissions migration...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/2025_10_01_school_subject_permissions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await pool.execute(statement);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📋 New table: school_subject_permissions');
    console.log('📋 New view: school_allowed_resources');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

runMigration();


