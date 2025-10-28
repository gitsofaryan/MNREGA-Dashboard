require('dotenv').config();
const { syncAllStatesData } = require('../services/syncService');
const db = require('../db/database');
const logger = require('../utils/logger');

async function syncData() {
  try {
    logger.info('Starting manual data sync...');
    
    // Connect to database
    await db.connect();
    logger.info('Connected to database');
    
    // Sync all states data
    const results = await syncAllStatesData();
    
    logger.info('Sync results:', results);
    
    // Disconnect
    await db.disconnect();
    logger.info('Data sync completed successfully');
    
    process.exit(0);
  } catch (error) {
    logger.error('Data sync failed:', error);
    process.exit(1);
  }
}

syncData();
