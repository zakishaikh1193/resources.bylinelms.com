const fs = require('fs');
const path = require('path');

const updateEnvFile = () => {
  const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=resources_db

# JWT Configuration
JWT_SECRET=bylinelm_resources_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=pdf,doc,docx,ppt,pptx,xls,xlsx,zip,rar,mp4,avi,mov,jpg,jpeg,png,gif

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
`;

  const envPath = path.join(__dirname, '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated successfully!');
    console.log('📁 Location:', envPath);
    console.log('\n🗄️  Database name updated to: resources_db');
    console.log('\n🚀 You can now restart the server');
  } catch (error) {
    console.error('❌ Failed to update .env file:', error.message);
  }
};

updateEnvFile();
