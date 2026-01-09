# Payment Gateway with Multi-Method Processing

A comprehensive payment gateway system similar to Razorpay or Stripe, featuring merchant onboarding, payment order management, multi-method payment processing (UPI and Cards), and a hosted checkout page.

## 🏗️ Architecture

This project consists of four main services:

- **Backend API** (Port 8000) - Express.js REST API with PostgreSQL
- **Dashboard Frontend** (Port 3000) - React-based merchant dashboard
- **Checkout Page** (Port 3001) - React-based hosted checkout interface
- **PostgreSQL Database** (Port 5432) - Data persistence layer

## 📑 Additional Documentation

- API reference: see API_DOCUMENTATION.md
- System overview: see ARCHITECTURE.md
- Quick commands: see QUICKSTART.md

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- No other services running on ports 8000, 3000, 3001, or 5432

### Running the Application

1. Clone the repository:
```bash
git clone https://github.com/gowthusaidatta/Payment-Gateway-with-Multi-Method-Processing
cd "Payment Gateway with Multi-Method Processing"
```

2. Start all services:
```bash
docker-compose up -d
```

3. Wait for services to initialize (about 30-60 seconds)

4. Access the applications:
   - **API**: http://localhost:8000
   - **Dashboard**: http://localhost:3000
   - **Checkout**: http://localhost:3001

### Clean Reset and Rebuild (Docker)

If you need to fully reset containers, clear Docker cache, rebuild images from scratch, and start fresh, run:

```powershell
# Stop and remove containers, networks, and volumes
docker-compose down -v --remove-orphans

# Prune caches and builder layers (cleans up disk space)
docker system prune -af --volumes; docker builder prune -af

# Rebuild images without cache
docker-compose build --no-cache

# Start services
docker-compose up -d

# Verify API health (PowerShell)
Invoke-WebRequest -UseBasicParsing http://localhost:8000/health | Select-Object -ExpandProperty Content
```

Note for PowerShell users: `curl` is an alias for `Invoke-WebRequest`. To use real cURL, run `curl.exe` explicitly.

### Test Credentials

The system automatically seeds a test merchant on startup:

- **Email**: test@example.com
- **API Key**: key_test_abc123
- **API Secret**: secret_test_xyz789
- **Dashboard Password**: test@123 (for dashboard login)

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication

All protected endpoints require authentication via headers:
```
X-Api-Key: key_test_abc123
X-Api-Secret: secret_test_xyz789
```

### Endpoints

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 2. Create Order
```http
POST /api/v1/orders
```

**Headers:**
```
X-Api-Key: key_test_abc123
X-Api-Secret: secret_test_xyz789
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_123",
  "notes": {
    "customer_name": "John Doe"
  }
}
```

**Response (201):**
```json
{
  "id": "order_NXhj67fGH2jk9mPq",
  "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_123",
  "notes": {
    "customer_name": "John Doe"
  },
  "status": "created",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### 3. Get Order
```http
GET /api/v1/orders/{order_id}
```

#### 4. Create Payment
```http
POST /api/v1/payments
```

**UPI Payment:**
```json
{
  "order_id": "order_NXhj67fGH2jk9mPq",
  "method": "upi",
  "vpa": "user@paytm"
}
```

**Card Payment:**
```json
{
  "order_id": "order_NXhj67fGH2jk9mPq",
  "method": "card",
  "card": {
    "number": "4111111111111111",
    "expiry_month": "12",
    "expiry_year": "2025",
    "cvv": "123",
    "holder_name": "John Doe"
  }
}
```

#### 5. Get Payment
```http
GET /api/v1/payments/{payment_id}
```

#### 6. Test Merchant Endpoint
```http
GET /api/v1/test/merchant
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "api_key": "key_test_abc123",
  "seeded": true
}
```

### Public Endpoints (for Checkout Page)

```http
GET /api/v1/orders/{order_id}/public
POST /api/v1/payments/public
GET /api/v1/payments/{payment_id}/public
```

## 🎯 Testing the System

### Using cURL

1. **Create an order:**
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "currency": "INR", "receipt": "test_123"}'
```

PowerShell equivalent:

```powershell
$headers = @{ 'X-Api-Key'='key_test_abc123'; 'X-Api-Secret'='secret_test_xyz789'; 'Content-Type'='application/json' }
$body    = '{"amount":50000,"currency":"INR","receipt":"test_123"}'
Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/v1/orders -Headers $headers -Body $body
```

2. **Access the checkout page:**
```
http://localhost:3001/checkout?order_id=<order_id_from_step_1>
```

3. **Complete the payment:**
   - Select UPI or Card payment method
   - Fill in payment details
   - Submit and wait for processing

### Test Payment Details

**Valid UPI IDs:**
- user@paytm
- test@okaxis
- john.doe@okhdfcbank

**Valid Test Card Numbers:**
- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **Amex**: 378282246310005
- **RuPay**: 6521234567890123

**Card Details:**
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3-4 digits

## 🎨 Dashboard Features

Access the dashboard at http://localhost:3000

1. **Login Page** - Enter test@example.com with password test@123
2. **Dashboard Home** - View API credentials and statistics
3. **Transactions** - View all payment transactions with status

## 💳 Checkout Flow

1. Merchant creates order via API
2. Customer is redirected to checkout page with order_id
3. Customer selects payment method (UPI/Card)
4. Customer enters payment details
5. Payment is processed (5-10 seconds simulation)
6. Success or failure result is displayed

## 🔐 Payment Validation

### VPA Validation
- Format: `username@bank`
- Pattern: `^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$`

### Card Validation
- **Luhn Algorithm**: Validates card number checksum
- **Network Detection**: Identifies Visa, Mastercard, Amex, RuPay
- **Expiry Validation**: Ensures card hasn't expired

## 📊 Database Schema

### Merchants Table
```sql
- id (UUID, primary key)
- name (VARCHAR 255)
- email (VARCHAR 255, unique)
- api_key (VARCHAR 64, unique)
- api_secret (VARCHAR 64)
- webhook_url (TEXT, optional)
- is_active (BOOLEAN, default true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Orders Table
```sql
- id (VARCHAR 64, primary key, format: order_*)
- merchant_id (UUID, foreign key)
- amount (INTEGER, min 100)
- currency (VARCHAR 3, default INR)
- receipt (VARCHAR 255, optional)
- notes (JSONB, optional)
- status (VARCHAR 20, default created)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Payments Table
```sql
- id (VARCHAR 64, primary key, format: pay_*)
- order_id (VARCHAR 64, foreign key)
- merchant_id (UUID, foreign key)
- amount (INTEGER)
- currency (VARCHAR 3, default INR)
- method (VARCHAR 20: upi/card)
- status (VARCHAR 20: processing/success/failed)
- vpa (VARCHAR 255, for UPI)
- card_network (VARCHAR 20, for cards)
- card_last4 (VARCHAR 4, for cards)
- error_code (VARCHAR 50, optional)
- error_description (TEXT, optional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React 18
- **Database**: PostgreSQL 15
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx (for frontend serving)

## 🧪 Testing Configuration

The system supports test mode for deterministic behavior:

```env
TEST_MODE=true
TEST_PAYMENT_SUCCESS=true
TEST_PROCESSING_DELAY=1000
```

When enabled:
- Payments succeed/fail deterministically
- Processing delay is fixed (not random)
- Useful for automated testing

Quick usage with Docker Compose:

```powershell
$env:TEST_MODE = "true"
$env:TEST_PAYMENT_SUCCESS = "true"   # or "false"
$env:TEST_PROCESSING_DELAY = "1000"  # milliseconds
docker-compose up -d --build
Invoke-WebRequest -UseBasicParsing http://localhost:8000/health | Select-Object -ExpandProperty Content
```

## 🐛 Troubleshooting

### Services won't start
```bash
# Check if ports are in use
docker-compose down
docker-compose up -d
```

### Compose version warning

If you see a warning like:

> the attribute `version` is obsolete, it will be ignored

This is harmless. You can ignore it or remove the top-level `version:` key from `docker-compose.yml`.

### Database connection errors
```bash
# Wait for database to be fully ready
docker-compose logs postgres
```

### Frontend not loading
```bash
# Rebuild containers
docker-compose up -d --build
```

### View logs
```bash
docker-compose logs -f api
docker-compose logs -f dashboard
docker-compose logs -f checkout
```

## 📝 Important Notes

1. **Amounts**: All amounts are in paise (smallest currency unit)
   - ₹500.00 = 50000 paise
   - Minimum amount: 100 paise (₹1.00)

2. **Payment Status Flow**: `processing → success/failed`
   - Payments are created directly with "processing" status
   - Never use "created" status for payments

3. **Security**: Never store full card numbers or CVV
   - Only store last 4 digits and card network

4. **Success Rates**:
   - UPI: 90% (configurable)
   - Card: 95% (configurable)

## 📦 Project Structure

```
Payment Gateway with Multi-Method Processing/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── healthController.js
│   │   │   ├── orderController.js
│   │   │   ├── paymentController.js
│   │   │   └── merchantController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   └── validation.js
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   └── Transactions.js
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── checkout-page/
│   ├── src/
│   │   ├── Checkout.js
│   │   └── index.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 🎓 Learning Outcomes

This project demonstrates:
- RESTful API design and implementation
- Authentication and authorization patterns
- Payment validation algorithms (Luhn, VPA)
- State machine for transaction lifecycle
- Docker containerization
- React frontend development
- Database design and relationships
- Asynchronous payment processing simulation
- Professional UI/UX for financial applications

## 📄 License

This is an educational project for learning purposes.

## 🤝 Support

For issues or questions, please refer to the project documentation or contact the development team.
