const { pool } = require('../config/database');
const { 
  generatePaymentId, 
  validateVPA, 
  validateCardNumber, 
  detectCardNetwork, 
  validateExpiry 
} = require('../utils/validation');

// Simulate payment processing
const processPayment = async (method, paymentId) => {
  const testMode = process.env.TEST_MODE === 'true';
  
  let delay, successRate;
  
  if (testMode) {
    // Use test mode configuration
    delay = parseInt(process.env.TEST_PROCESSING_DELAY || '1000');
    const testSuccess = process.env.TEST_PAYMENT_SUCCESS !== 'false';
    successRate = testSuccess ? 1.0 : 0.0;
  } else {
    // Use normal configuration
    const minDelay = parseInt(process.env.PROCESSING_DELAY_MIN || '5000');
    const maxDelay = parseInt(process.env.PROCESSING_DELAY_MAX || '10000');
    delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    successRate = method === 'upi' 
      ? parseFloat(process.env.UPI_SUCCESS_RATE || '0.90')
      : parseFloat(process.env.CARD_SUCCESS_RATE || '0.95');
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Determine success/failure
  const success = Math.random() < successRate;
  
  if (success) {
    await pool.query(
      `UPDATE payments SET status = 'success', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [paymentId]
    );
  } else {
    await pool.query(
      `UPDATE payments 
       SET status = 'failed', 
           error_code = 'PAYMENT_FAILED', 
           error_description = 'Payment processing failed',
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [paymentId]
    );
  }
};

// Create Payment
const createPayment = async (req, res) => {
  try {
    const { order_id, method, vpa, card } = req.body;
    const merchantId = req.merchant.id;

    // Validate order exists and belongs to merchant
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND merchant_id = $2',
      [order_id, merchantId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Order not found or does not belong to merchant'
        }
      });
    }

    const order = orderResult.rows[0];

    // Validate method-specific fields
    let paymentData = {
      method,
      vpa: null,
      card_network: null,
      card_last4: null
    };

    if (method === 'upi') {
      if (!vpa || !validateVPA(vpa)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_VPA',
            description: 'Invalid VPA format'
          }
        });
      }
      paymentData.vpa = vpa;
    } else if (method === 'card') {
      if (!card || !card.number || !card.expiry_month || !card.expiry_year || !card.cvv || !card.holder_name) {
        return res.status(400).json({
          error: {
            code: 'BAD_REQUEST_ERROR',
            description: 'Missing required card fields'
          }
        });
      }

      // Validate card number using Luhn algorithm
      if (!validateCardNumber(card.number)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_CARD',
            description: 'Invalid card number'
          }
        });
      }

      // Validate expiry
      if (!validateExpiry(card.expiry_month, card.expiry_year)) {
        return res.status(400).json({
          error: {
            code: 'EXPIRED_CARD',
            description: 'Card has expired'
          }
        });
      }

      // Detect card network
      const cardNetwork = detectCardNetwork(card.number);
      const cleanedNumber = card.number.replace(/[\s-]/g, '');
      const last4 = cleanedNumber.slice(-4);

      paymentData.card_network = cardNetwork;
      paymentData.card_last4 = last4;
    } else {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Invalid payment method'
        }
      });
    }

    // Generate unique payment ID
    let paymentId = generatePaymentId();
    let isUnique = false;
    
    while (!isUnique) {
      const existingPayment = await pool.query('SELECT id FROM payments WHERE id = $1', [paymentId]);
      if (existingPayment.rows.length === 0) {
        isUnique = true;
      } else {
        paymentId = generatePaymentId();
      }
    }

    // Create payment with status 'processing'
    const result = await pool.query(
      `INSERT INTO payments (
        id, order_id, merchant_id, amount, currency, method, status,
        vpa, card_network, card_last4, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        paymentId,
        order_id,
        merchantId,
        order.amount,
        order.currency,
        method,
        paymentData.vpa,
        paymentData.card_network,
        paymentData.card_last4
      ]
    );

    const payment = result.rows[0];

    // Process payment asynchronously (but wait for it to complete for this deliverable)
    await processPayment(method, paymentId);

    // Fetch updated payment
    const updatedPayment = await pool.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
    const finalPayment = updatedPayment.rows[0];

    // Build response
    const response = {
      id: finalPayment.id,
      order_id: finalPayment.order_id,
      amount: finalPayment.amount,
      currency: finalPayment.currency,
      method: finalPayment.method,
      status: finalPayment.status,
      created_at: finalPayment.created_at.toISOString()
    };

    if (method === 'upi') {
      response.vpa = finalPayment.vpa;
    } else if (method === 'card') {
      response.card_network = finalPayment.card_network;
      response.card_last4 = finalPayment.card_last4;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        description: 'Internal server error'
      }
    });
  }
};

// Get Payment
const getPayment = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const merchantId = req.merchant.id;

    const result = await pool.query(
      'SELECT * FROM payments WHERE id = $1 AND merchant_id = $2',
      [payment_id, merchantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND_ERROR',
          description: 'Payment not found'
        }
      });
    }

    const payment = result.rows[0];

    const response = {
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      created_at: payment.created_at.toISOString(),
      updated_at: payment.updated_at.toISOString()
    };

    if (payment.method === 'upi') {
      response.vpa = payment.vpa;
    } else if (payment.method === 'card') {
      response.card_network = payment.card_network;
      response.card_last4 = payment.card_last4;
    }

    if (payment.error_code) {
      response.error_code = payment.error_code;
      response.error_description = payment.error_description;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        description: 'Internal server error'
      }
    });
  }
};

// Create Payment (Public - for checkout page)
const createPaymentPublic = async (req, res) => {
  try {
    const { order_id, method, vpa, card } = req.body;

    // Validate order exists
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);

    if (orderResult.rows.length === 0) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Order not found'
        }
      });
    }

    const order = orderResult.rows[0];

    // Validate method-specific fields
    let paymentData = {
      method,
      vpa: null,
      card_network: null,
      card_last4: null
    };

    if (method === 'upi') {
      if (!vpa || !validateVPA(vpa)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_VPA',
            description: 'Invalid VPA format'
          }
        });
      }
      paymentData.vpa = vpa;
    } else if (method === 'card') {
      if (!card || !card.number || !card.expiry_month || !card.expiry_year || !card.cvv || !card.holder_name) {
        return res.status(400).json({
          error: {
            code: 'BAD_REQUEST_ERROR',
            description: 'Missing required card fields'
          }
        });
      }

      if (!validateCardNumber(card.number)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_CARD',
            description: 'Invalid card number'
          }
        });
      }

      if (!validateExpiry(card.expiry_month, card.expiry_year)) {
        return res.status(400).json({
          error: {
            code: 'EXPIRED_CARD',
            description: 'Card has expired'
          }
        });
      }

      const cardNetwork = detectCardNetwork(card.number);
      const cleanedNumber = card.number.replace(/[\s-]/g, '');
      const last4 = cleanedNumber.slice(-4);

      paymentData.card_network = cardNetwork;
      paymentData.card_last4 = last4;
    } else {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Invalid payment method'
        }
      });
    }

    // Generate unique payment ID
    let paymentId = generatePaymentId();
    let isUnique = false;
    
    while (!isUnique) {
      const existingPayment = await pool.query('SELECT id FROM payments WHERE id = $1', [paymentId]);
      if (existingPayment.rows.length === 0) {
        isUnique = true;
      } else {
        paymentId = generatePaymentId();
      }
    }

    // Create payment
    await pool.query(
      `INSERT INTO payments (
        id, order_id, merchant_id, amount, currency, method, status,
        vpa, card_network, card_last4, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        paymentId,
        order_id,
        order.merchant_id,
        order.amount,
        order.currency,
        method,
        paymentData.vpa,
        paymentData.card_network,
        paymentData.card_last4
      ]
    );

    // Process payment asynchronously (don't wait)
    processPayment(method, paymentId).catch(err => console.error('Payment processing error:', err));

    // Return immediate response
    const response = {
      id: paymentId,
      order_id: order_id,
      amount: order.amount,
      currency: order.currency,
      method: method,
      status: 'processing',
      created_at: new Date().toISOString()
    };

    if (method === 'upi') {
      response.vpa = paymentData.vpa;
    } else if (method === 'card') {
      response.card_network = paymentData.card_network;
      response.card_last4 = paymentData.card_last4;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        description: 'Internal server error'
      }
    });
  }
};

// Get Payment (Public - for checkout page)
const getPaymentPublic = async (req, res) => {
  try {
    const { payment_id } = req.params;

    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [payment_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND_ERROR',
          description: 'Payment not found'
        }
      });
    }

    const payment = result.rows[0];

    const response = {
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      created_at: payment.created_at.toISOString(),
      updated_at: payment.updated_at.toISOString()
    };

    if (payment.method === 'upi') {
      response.vpa = payment.vpa;
    } else if (payment.method === 'card') {
      response.card_network = payment.card_network;
      response.card_last4 = payment.card_last4;
    }

    if (payment.error_code) {
      response.error_code = payment.error_code;
      response.error_description = payment.error_description;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        description: 'Internal server error'
      }
    });
  }
};

module.exports = { 
  createPayment, 
  getPayment, 
  createPaymentPublic, 
  getPaymentPublic 
};
