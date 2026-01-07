const { pool } = require('../config/database');
const { version, name } = require('../../package.json');

// Health check endpoint
const healthCheck = async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      service: name,
      version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(200).json({
      status: 'unhealthy',
      database: 'disconnected',
      service: name,
      version,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = { healthCheck };
