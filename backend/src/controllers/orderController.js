const { pool } = require('../config/database');
const { generateOrderId } = require('../utils/validation');

// Create Order
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;
    const merchantId = req.merchant.id;

    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'amount must be at least 100'
        }
      });
    }

    // Generate unique order ID
    let orderId = generateOrderId();
    let isUnique = false;
    
    while (!isUnique) {
      const existingOrder = await pool.query('SELECT id FROM orders WHERE id = $1', [orderId]);
      if (existingOrder.rows.length === 0) {
        isUnique = true;
      } else {
        orderId = generateOrderId();
      }
    }

    // Create order
    const result = await pool.query(
      `INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'created', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [orderId, merchantId, amount, currency, receipt, notes ? JSON.stringify(notes) : null]
    );

    const order = result.rows[0];

    res.status(201).json({
      id: order.id,
      merchant_id: order.merchant_id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes || {},
      status: order.status,
      created_at: order.created_at.toISOString()
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        description: 'Internal server error'
      }
    });
  }
};

// Get Order
const getOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const merchantId = req.merchant.id;

    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND merchant_id = $2',
      [order_id, merchantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND_ERROR',
          description: 'Order not found'
        }
      });
    }

    const order = result.rows[0];

    res.status(200).json({
      id: order.id,
      merchant_id: order.merchant_id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes || {},
      status: order.status,
      created_at: order.created_at.toISOString(),
      updated_at: order.updated_at.toISOString()
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        description: 'Internal server error'
      }
    });
  }
};

// Get Order (Public - for checkout page)
const getOrderPublic = async (req, res) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query(
      'SELECT id, amount, currency, status FROM orders WHERE id = $1',
      [order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND_ERROR',
          description: 'Order not found'
        }
      });
    }

    const order = result.rows[0];

    res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        description: 'Internal server error'
      }
    });
  }
};

module.exports = { createOrder, getOrder, getOrderPublic };
