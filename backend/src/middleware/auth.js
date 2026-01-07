const { pool } = require('../config/database');

const authenticateMerchant = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const apiSecret = req.headers['x-api-secret'];

    if (!apiKey || !apiSecret) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          description: 'Invalid API credentials'
        }
      });
    }

    // Query merchant by API key and secret
    const result = await pool.query(
      'SELECT * FROM merchants WHERE api_key = $1 AND api_secret = $2 AND is_active = true',
      [apiKey, apiSecret]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          description: 'Invalid API credentials'
        }
      });
    }

    // Attach merchant to request
    req.merchant = result.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        description: 'Internal server error'
      }
    });
  }
};

module.exports = { authenticateMerchant };
