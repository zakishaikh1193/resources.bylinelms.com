const path = require('path');
const fs = require('fs');

console.log('=== Upload Configuration Test ===');

// Check environment variables
console.log('\n1. Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('UPLOAD_PATH:', process.env.UPLOAD_PATH);

// Check current working directory
console.log('\n2. Current Working Directory:');
console.log('process.cwd():', process.cwd());
console.log('__dirname:', __dirname);

// Check upload directory
const uploadDir = process.env.UPLOAD_PATH || './uploads';
console.log('\n3. Upload Directory:');
console.log('uploadDir:', uploadDir);
console.log('Absolute path:', path.resolve(uploadDir));

// Check if directory exists
console.log('\n4. Directory Existence:');
console.log('uploadDir exists:', fs.existsSync(uploadDir));
console.log('Absolute path exists:', fs.existsSync(path.resolve(uploadDir)));

// Test directory creation
console.log('\n5. Directory Creation Test:');
try {
  if (!fs.existsSync(uploadDir)) {
    console.log('Creating directory:', uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Directory created successfully');
  } else {
    console.log('Directory already exists');
  }
} catch (error) {
  console.error('Error creating directory:', error.message);
}

// Test write permissions
console.log('\n6. Write Permission Test:');
try {
  const testFile = path.join(uploadDir, 'test-write-permission.tmp');
  console.log('Test file path:', testFile);
  fs.writeFileSync(testFile, 'test content');
  console.log('Write test successful');
  fs.unlinkSync(testFile);
  console.log('Delete test successful');
} catch (error) {
  console.error('Write permission error:', error.message);
}

// List directory contents
console.log('\n7. Directory Contents:');
try {
  const files = fs.readdirSync(uploadDir);
  console.log('Files in upload directory:', files);
} catch (error) {
  console.error('Error reading directory:', error.message);
}

console.log('\n=== Test Complete ===');
