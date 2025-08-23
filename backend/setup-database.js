const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const setupDatabase = async () => {
  try {
    console.log('🔧 Setting up bylinelm_resources_db database...');
    
    // Connect without specifying database
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    });

    console.log('✅ Connected to MySQL server!');
    
    // Create database if it doesn't exist
    console.log('\n📦 Creating database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS bylinelm_resources_db');
    console.log('✅ Database created/verified!');
    
    // Use the database
    await connection.execute('USE bylinelm_resources_db');
    console.log('✅ Switched to bylinelm_resources_db');
    
    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('\n📋 No tables found. Importing schema...');
      
      // Read the SQL file
      const sqlFilePath = path.join(__dirname, 'resources_db.sql');
      
      if (fs.existsSync(sqlFilePath)) {
        console.log('📄 Found resources_db.sql file');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Split SQL into individual statements
        const statements = sqlContent
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📝 Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          if (statement.trim()) {
            try {
              await connection.execute(statement);
              console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
            } catch (error) {
              console.log(`⚠️  Statement ${i + 1} failed: ${error.message}`);
            }
          }
        }
        
        console.log('✅ Schema import completed!');
      } else {
        console.log('❌ resources_db.sql file not found');
        console.log('💡 Please make sure the SQL file exists in the backend directory');
      }
    } else {
      console.log(`✅ Database already has ${tables.length} tables`);
    }
    
    // Final check
    const [finalTables] = await connection.execute('SHOW TABLES');
    console.log(`\n📊 Final table count: ${finalTables.length} tables`);
    
    if (finalTables.length > 0) {
      console.log('Tables:');
      finalTables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`  ${index + 1}. ${tableName}`);
      });
    }
    
    await connection.end();
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
};

setupDatabase();
