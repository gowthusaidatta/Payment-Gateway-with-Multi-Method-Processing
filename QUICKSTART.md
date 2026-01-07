# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Application

```bash
cd "Payment Gateway with Multi-Method Processing"
docker-compose up -d
```

Wait 30-60 seconds for all services to initialize.

### Step 2: Verify Services are Running

```bash
# Check health
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","database":"connected","timestamp":"..."}
```

### Step 3: Test the Dashboard

1. Open browser: http://localhost:3000
2. Login with:
   - Email: `test@example.com`
   - Password: (any password)
3. View your API credentials and stats

### Step 4: Create a Test Payment

#### Option A: Using the Checkout Page

1. Create an order (using cURL or Postman):

```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "currency": "INR", "receipt": "test_001"}'
```

2. Copy the `order_id` from the response

3. Open in browser:
```
http://localhost:3001/checkout?order_id=<paste_order_id_here>
```

4. Select UPI, enter: `user@paytm`
5. Click "Pay ₹500.00"
6. Wait 5-10 seconds for processing
7. See success message!

#### Option B: Using API Directly

```bash
# Create order
ORDER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/orders \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "currency": "INR"}')

echo "Order created: $ORDER_RESPONSE"

# Extract order_id (manual step - copy from output)
ORDER_ID="<paste_order_id_here>"

# Create payment
curl -X POST http://localhost:8000/api/v1/payments \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d "{\"order_id\": \"$ORDER_ID\", \"method\": \"upi\", \"vpa\": \"user@paytm\"}"
```

### Step 5: View Transactions

1. Go to dashboard: http://localhost:3000/dashboard/transactions
2. See your test payment in the list

## 🧪 Test Different Scenarios

### Test UPI Payment

```bash
# Valid VPAs
user@paytm
john.doe@okhdfcbank
test@phonepe
```

### Test Card Payment

Via checkout page (http://localhost:3001/checkout?order_id=xxx):

**Visa Card:**
- Number: `4111111111111111`
- Expiry: `12/25`
- CVV: `123`
- Name: `John Doe`

**Mastercard:**
- Number: `5555555555554444`
- Expiry: `12/25`
- CVV: `123`
- Name: `John Doe`

### Test Validation Errors

**Invalid VPA:**
```bash
curl -X POST http://localhost:8000/api/v1/payments/public \
  -H "Content-Type: application/json" \
  -d '{"order_id": "order_xxx", "method": "upi", "vpa": "invalid@"}'

# Response: {"error":{"code":"INVALID_VPA","description":"Invalid VPA format"}}
```

**Invalid Card:**
```bash
curl -X POST http://localhost:8000/api/v1/payments/public \
  -H "Content-Type: application/json" \
  -d '{"order_id": "order_xxx", "method": "card", "card": {"number": "1234567890123456", "expiry_month": "12", "expiry_year": "25", "cvv": "123", "holder_name": "Test"}}'

# Response: {"error":{"code":"INVALID_CARD","description":"Invalid card number"}}
```

## 🛠️ Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f dashboard
docker-compose logs -f checkout
docker-compose logs -f postgres
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Rebuild Services

```bash
docker-compose up -d --build
```

### Clean Everything

```bash
docker-compose down -v  # Removes volumes too
```

## 📊 Understanding the System

### Ports

- **8000**: Backend API
- **3000**: Dashboard (Merchant Portal)
- **3001**: Checkout Page (Customer-facing)
- **5432**: PostgreSQL Database

### Test Credentials

- **Email**: test@example.com
- **API Key**: key_test_abc123
- **API Secret**: secret_test_xyz789

### Amount Format

All amounts are in **paise** (smallest currency unit):
- ₹1.00 = 100 paise
- ₹500.00 = 50000 paise
- Minimum: 100 paise (₹1.00)

### Payment Success Rates

- UPI: 90% success (10% random failures)
- Card: 95% success (5% random failures)
- Processing time: 5-10 seconds (random)

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Stop other services using these ports
docker-compose down

# Or change ports in docker-compose.yml
```

### Database Not Ready

```bash
# Wait longer or check database logs
docker-compose logs postgres

# Restart if needed
docker-compose restart postgres
docker-compose restart api
```

### Frontend Not Loading

```bash
# Clear browser cache
# Or rebuild frontend
docker-compose up -d --build dashboard checkout
```

### API Returns 500 Error

```bash
# Check API logs
docker-compose logs api

# Restart API
docker-compose restart api
```

## 📚 Next Steps

1. Read full [README.md](README.md) for detailed documentation
2. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API reference
3. Explore the dashboard features
4. Try different payment scenarios
5. Review the code structure

## 🎯 Success Checklist

- [ ] All services start successfully
- [ ] Health check returns "healthy"
- [ ] Can login to dashboard
- [ ] Can create orders via API
- [ ] Can complete payment on checkout page
- [ ] Transactions appear in dashboard
- [ ] Test merchant is seeded correctly

## 💡 Tips

1. Use Postman or Thunder Client for easier API testing
2. Keep docker-compose logs open while testing
3. Check the Transactions page to verify payments
4. Try both UPI and Card payment methods
5. Test with different amounts and payment methods

---

**Ready to build your payment gateway? Run `docker-compose up -d` and you're good to go!** 🚀
