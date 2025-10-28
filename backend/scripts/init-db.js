require('dotenv').config();
const db = require('../db/database');
const logger = require('../utils/logger');

async function initDatabase() {
  try {
    logger.info('Starting database initialization...');
    
    // Connect to database
    await db.connect();
    logger.info('Connected to database');
    
    // Initialize tables
    await db.initTables();
    logger.info('Database tables created successfully');
    
    // Disconnect
    await db.disconnect();
    logger.info('Database initialization completed successfully');
    
    process.exit(0);
  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
