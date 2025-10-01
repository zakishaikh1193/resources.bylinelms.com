const { pool } = require('./config/database');

async function updateExistingDownloads() {
  try {
    console.log('🔧 Updating existing download records with file_name...\n');
    
    // Step 1: Get all download activities that don't have file_name
    const [downloads] = await pool.execute(`
      SELECT sal.id, sal.resource_name, r.file_name
      FROM school_activity_logs sal
      LEFT JOIN resources r ON r.title = sal.resource_name
      WHERE sal.activity_type = 'resource_download' 
      AND (sal.file_name IS NULL OR sal.file_name = '')
    `);
    
    console.log(`Found ${downloads.length} download records to update`);
    
    if (downloads.length === 0) {
      console.log('✅ All download records already have file_name populated');
      return;
    }
    
    // Step 2: Update each record
    let updatedCount = 0;
    for (const download of downloads) {
      if (download.file_name) {
        await pool.execute(
          'UPDATE school_activity_logs SET file_name = ? WHERE id = ?',
          [download.file_name, download.id]
        );
        console.log(`✅ Updated record ${download.id}: ${download.resource_name} -> ${download.file_name}`);
        updatedCount++;
      } else {
        console.log(`⚠️  No file_name found for resource: ${download.resource_name}`);
      }
    }
    
    console.log(`\n🎉 Update completed! Updated ${updatedCount} records`);
    
    // Step 3: Verify the updates
    console.log('\n📊 Verification - Sample updated records:');
    const [sampleData] = await pool.execute(`
      SELECT id, school_name, resource_name, downloaded_file_name, file_name, file_size, file_extension
      FROM school_activity_logs 
      WHERE activity_type = 'resource_download'
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    sampleData.forEach((row, index) => {
      console.log(`\n   Download ${index + 1}:`);
      console.log(`     Resource Name: ${row.resource_name || 'NULL'}`);
      console.log(`     Downloaded File Name: ${row.downloaded_file_name || 'NULL'}`);
      console.log(`     File Name: ${row.file_name || 'NULL'}`);
      console.log(`     File Size: ${row.file_size || 'NULL'}`);
      console.log(`     Extension: ${row.file_extension || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

updateExistingDownloads();
