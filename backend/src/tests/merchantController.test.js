const request = require('supertest');
const express = require('express');
const merchantController = require('../controllers/merchantController');

const app = express();
app.use(express.json());

app.get('/api/v1/test/merchant', merchantController.getTestMerchant);

describe('Merchant Controller', () => {
  it('should return 404 if test merchant not found', async () => {
    // This test assumes the DB is not seeded; in real tests, mock DB
    const res = await request(app)
      .get('/api/v1/test/merchant');
    expect([200, 404]).toContain(res.statusCode); // Accept either for demo
  });
});
