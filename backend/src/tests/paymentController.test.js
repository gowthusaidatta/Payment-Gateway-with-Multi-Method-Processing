const request = require('supertest');
const express = require('express');
const paymentController = require('../controllers/paymentController');

const app = express();
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  req.merchant = { id: 'test-merchant-id' };
  next();
});

// Add payment endpoint (mocked, minimal)
app.post('/api/v1/payments', paymentController.createPayment);

describe('Payment Controller', () => {
  it('should return 400 if order_id is missing', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({ method: 'upi', vpa: 'test@upi' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
