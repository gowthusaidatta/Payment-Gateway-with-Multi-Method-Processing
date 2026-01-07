require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/database');
const { healthCheck } = require('./controllers/healthController');
const { createOrder, getOrder, getOrderPublic } = require('./controllers/orderController');
const { createPayment, getPayment, createPaymentPublic, getPaymentPublic } = require('./controllers/paymentController');
const { getTestMerchant, getMerchantStats, getMerchantTransactions, merchantLogin } = require('./controllers/merchantController');
const { authenticateMerchant } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = allowedOrigins.length ? {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
} : {};
app.disable('x-powered-by');
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint (no auth required)
app.get('/health', healthCheck);

// Test endpoints (no auth required)
app.get('/api/v1/test/merchant', getTestMerchant);

// Public endpoints for checkout page (no auth required)
app.get('/api/v1/orders/:order_id/public', getOrderPublic);
app.post('/api/v1/payments/public', createPaymentPublic);
app.get('/api/v1/payments/:payment_id/public', getPaymentPublic);

// Merchant login endpoint (no auth required)
app.post('/api/v1/merchant/login', merchantLogin);

// Protected endpoints (require authentication)
app.post('/api/v1/orders', authenticateMerchant, createOrder);
app.get('/api/v1/orders/:order_id', authenticateMerchant, getOrder);
app.post('/api/v1/payments', authenticateMerchant, createPayment);
app.get('/api/v1/payments/:payment_id', authenticateMerchant, getPayment);

// Merchant dashboard endpoints (require authentication)
app.get('/api/v1/merchant/stats', authenticateMerchant, getMerchantStats);
app.get('/api/v1/merchant/transactions', authenticateMerchant, getMerchantTransactions);

// Start server
const startServer = async () => {
  try {
    // Initialize database
    console.log('Initializing database...');
    await initializeDatabase();
    
    // Start listening
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Payment Gateway API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
