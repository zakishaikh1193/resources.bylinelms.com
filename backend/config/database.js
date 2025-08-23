const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'resources_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Initialize database with required tables and data
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();

    // Create default admin user if not exists
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin@Byline25', 12);
    
    await connection.execute(
      'INSERT IGNORE INTO users (name, email, password, role, organization, designation) VALUES (?, ?, ?, ?, ?, ?)',
      ['System Admin', 'info@bylinelearning.com', hashedPassword, 'admin', 'System', 'Administrator']
    );

    connection.release();
    console.log('✅ Database initialized with default data');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
