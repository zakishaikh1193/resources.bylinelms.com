const { pool } = require('./config/database');
const fs = require('fs').promises;
const path = require('path');

async function testResourceDownload() {
  try {
    console.log('🧪 Testing Resource Download Functionality...\n');
    
    // Step 1: Check if resources exist
    console.log('1️⃣ Checking available resources...');
    const [resources] = await pool.execute(`
      SELECT resource_id, title, file_path, file_name, file_size, file_extension, status 
      FROM resources 
      WHERE status = 'published' 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (resources.length === 0) {
      console.log('❌ No published resources found');
      return;
    }
    
    console.log(`✅ Found ${resources.length} published resources:`);
    resources.forEach((resource, index) => {
      console.log(`\n${index + 1}. ${resource.title}`);
      console.log(`   ID: ${resource.resource_id}`);
      console.log(`   File: ${resource.file_name} (${resource.file_extension})`);
      console.log(`   Size: ${resource.file_size} bytes`);
      console.log(`   Path: ${resource.file_path}`);
      console.log(`   Status: ${resource.status}`);
    });
    
    // Step 2: Check file existence
    console.log('\n2️⃣ Checking file existence...');
    for (const resource of resources) {
      try {
        await fs.access(resource.file_path);
        console.log(`✅ File exists: ${resource.file_name}`);
        
        // Check file stats
        const stats = await fs.stat(resource.file_path);
        console.log(`   Size: ${stats.size} bytes`);
        console.log(`   Modified: ${stats.mtime}`);
        
      } catch (error) {
        console.log(`❌ File not found: ${resource.file_name}`);
        console.log(`   Path: ${resource.file_path}`);
        console.log(`   Error: ${error.message}`);
        
        // Check if it's a path issue
        const absolutePath = path.resolve(resource.file_path);
        console.log(`   Absolute path: ${absolutePath}`);
        
        try {
          await fs.access(absolutePath);
          console.log(`✅ File found with absolute path`);
        } catch (absError) {
          console.log(`❌ Still not found with absolute path`);
        }
      }
    }
    
    // Step 3: Check uploads directory
    console.log('\n3️⃣ Checking uploads directory...');
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const absoluteUploadDir = path.resolve(uploadDir);
    
    console.log(`Upload directory: ${uploadDir}`);
    console.log(`Absolute path: ${absoluteUploadDir}`);
    
    try {
      const uploadStats = await fs.stat(uploadDir);
      console.log(`✅ Upload directory exists`);
      console.log(`   Size: ${uploadStats.size} bytes`);
      console.log(`   Modified: ${uploadStats.mtime}`);
      
      // List files in uploads directory
      const uploadFiles = await fs.readdir(uploadDir);
      console.log(`   Files in directory: ${uploadFiles.length}`);
      if (uploadFiles.length > 0) {
        console.log(`   Sample files: ${uploadFiles.slice(0, 5).join(', ')}`);
      }
      
    } catch (error) {
      console.log(`❌ Upload directory error: ${error.message}`);
    }
    
    // Step 4: Check resource_downloads table
    console.log('\n4️⃣ Checking resource downloads table...');
    try {
      const [downloads] = await pool.execute('SELECT COUNT(*) as total FROM resource_downloads');
      console.log(`✅ Total downloads recorded: ${downloads[0].total}`);
      
      if (downloads[0].total > 0) {
        const [recentDownloads] = await pool.execute(`
          SELECT rd.*, r.title, u.name as user_name 
          FROM resource_downloads rd
          JOIN resources r ON rd.resource_id = r.resource_id
          LEFT JOIN users u ON rd.user_id = u.user_id
          ORDER BY rd.downloaded_at DESC
          LIMIT 3
        `);
        
        console.log('\nRecent downloads:');
        recentDownloads.forEach((download, index) => {
          console.log(`\n${index + 1}. ${download.title}`);
          console.log(`   User: ${download.user_name || 'Anonymous'}`);
          console.log(`   IP: ${download.ip_address}`);
          console.log(`   Date: ${download.downloaded_at}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Downloads table error: ${error.message}`);
    }
    
    // Step 5: Check school_activity_logs for downloads
    console.log('\n5️⃣ Checking school activity logs for downloads...');
    try {
      const [downloadLogs] = await pool.execute(`
        SELECT COUNT(*) as total 
        FROM school_activity_logs 
        WHERE activity_type = 'resource_download'
      `);
      console.log(`✅ Download activities in school_activity_logs: ${downloadLogs[0].total}`);
      
      if (downloadLogs[0].total > 0) {
        const [recentDownloadLogs] = await pool.execute(`
          SELECT school_name, resource_name, ip_address, created_at
          FROM school_activity_logs
          WHERE activity_type = 'resource_download'
          ORDER BY created_at DESC
          LIMIT 3
        `);
        
        console.log('\nRecent download logs:');
        recentDownloadLogs.forEach((log, index) => {
          console.log(`\n${index + 1}. ${log.school_name}`);
          console.log(`   Resource: ${log.resource_name}`);
          console.log(`   IP: ${log.ip_address}`);
          console.log(`   Date: ${log.created_at}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ School activity logs error: ${error.message}`);
    }
    
    console.log('\n✅ Resource download test completed!');
    console.log('\n📋 Summary:');
    console.log('- Check if files exist in the specified paths');
    console.log('- Verify uploads directory permissions');
    console.log('- Ensure resource_downloads table is working');
    console.log('- Confirm school_activity_logs are being created for downloads');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testResourceDownload();
