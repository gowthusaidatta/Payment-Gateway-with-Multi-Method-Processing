const { pool } = require('../config/database');

// Get test merchant details
const getTestMerchant = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, api_key FROM merchants WHERE email = $1',
      ['test@example.com']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND_ERROR',
          description: 'Test merchant not found'
        }
      });
    }

    const merchant = result.rows[0];

    res.status(200).json({
      id: merchant.id,
      email: merchant.email,
      api_key: merchant.api_key,
      seeded: true
    });
  } catch (error) {
    console.error('Error getting test merchant:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        description: 'Internal server error'
      }
    });
  }
};

// Get merchant stats
const getMerchantStats = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    // Get total transactions
    const totalTransactionsResult = await pool.query(
      'SELECT COUNT(*) as count FROM payments WHERE merchant_id = $1',
      [merchantId]
    );
    const totalTransactions = parseInt(totalTransactionsResult.rows[0].count);

    // Get total amount (sum of successful payments)
    const totalAmountResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE merchant_id = $1 AND status = $2',
      [merchantId, 'success']
    );
    const totalAmount = parseInt(totalAmountResult.rows[0].total);

    // Get success rate
    const successfulResult = await pool.query(
      'SELECT COUNT(*) as count FROM payments WHERE merchant_id = $1 AND status = $2',
      [merchantId, 'success']
    );
    const successfulCount = parseInt(successfulResult.rows[0].count);
    const successRate = totalTransactions > 0 
      ? Math.round((successfulCount / totalTransactions) * 100) 
      : 0;

    res.status(200).json({
      total_transactions: totalTransactions,
      total_amount: totalAmount,
      success_rate: successRate
    });
  } catch (error) {
    console.error('Error getting merchant stats:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        description: 'Internal server error'
      }
    });
  }
};

// Get merchant transactions
const getMerchantTransactions = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    const result = await pool.query(
      `SELECT * FROM payments 
       WHERE merchant_id = $1 
       ORDER BY created_at DESC 
       LIMIT 100`,
      [merchantId]
    );

    const transactions = result.rows.map(payment => ({
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      created_at: payment.created_at.toISOString(),
      updated_at: payment.updated_at.toISOString()
    }));

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error getting merchant transactions:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        description: 'Internal server error'
      }
    });
  }
};

// Merchant login (simple implementation for deliverable 1)
const merchantLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Email is required'
        }
      });
    }

    const result = await pool.query(
      'SELECT id, name, email, api_key, api_secret FROM merchants WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          description: 'Invalid credentials'
        }
      });
    }

    const merchant = result.rows[0];

    res.status(200).json({
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
      api_key: merchant.api_key,
      api_secret: merchant.api_secret
    });
  } catch (error) {
    console.error('Error during merchant login:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        description: 'Internal server error'
      }
    });
  }
};

module.exports = { 
  getTestMerchant, 
  getMerchantStats, 
  getMerchantTransactions,
  merchantLogin 
};
