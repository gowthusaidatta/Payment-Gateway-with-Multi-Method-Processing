const request = require('supertest');
const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

const app = express();
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  req.merchant = { id: 'test-merchant-id' };
  next();
});

app.post('/api/v1/orders', orderController.createOrder);

describe('Order Controller', () => {
  it('should return 400 if amount is missing', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST_ERROR');
  });
});
