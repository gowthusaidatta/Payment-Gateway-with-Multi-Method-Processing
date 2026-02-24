# Payment Gateway with Multi-Method Processing

Modern payment gateway stack with UPI and card support, merchant dashboard, and hosted checkout.

## Overview
- **Backend API (8000)**: Express.js + PostgreSQL
- **Merchant Dashboard (3000)**: React 18
- **Hosted Checkout (3001)**: React 18
- **Database (5432)**: PostgreSQL 15

## Stack
- Backend: Node.js, Express.js
- Frontend: React, Axios
- Database: PostgreSQL
- Infra: Docker, Docker Compose, Nginx (static serving)

## Prerequisites
- Docker + Docker Compose
- Ports 8000/3000/3001/5432 free

## Quick Start
1) Clone
```bash
git clone https://github.com/gowthusaidatta/Payment-Gateway-with-Multi-Method-Processing
cd "Payment Gateway with Multi-Method Processing"
```
2) Run
```bash
docker-compose up -d
```
3) Open
- API: http://localhost:8000
- Dashboard: http://localhost:3000
- Checkout: http://localhost:3001

## Test Credentials
- Email: test@example.com
- Dashboard password: test@123
- API Key: key_test_abc123
- API Secret: secret_test_xyz789

## Live Demo
You can try the live demo here:
**Live Demo URL:** https://your-demo-url.example.com

## Video Demo
A video demonstration of the project is available here:
**Video Demo URL:** https://www.youtube.com/watch?v=your-demo-video

## Common Commands
- Stop & clean: `docker-compose down -v --remove-orphans`
- Rebuild fresh: `docker-compose build --no-cache && docker-compose up -d`
- Health check: `curl http://localhost:8000/health`
- Logs: `docker-compose logs -f api` (or dashboard/checkout/postgres)

## Minimal API Cheatsheet
- Auth headers: `X-Api-Key`, `X-Api-Secret`
- Health: `GET /health`
- Create order: `POST /api/v1/orders` (body: amount in paise, currency)
- Create payment: `POST /api/v1/payments` (method upi/card)
- Get payment: `GET /api/v1/payments/{payment_id}`
- Public checkout:
  - `GET /api/v1/orders/{order_id}/public`
  - `POST /api/v1/payments/public`
  - `GET /api/v1/payments/{payment_id}/public`

## Frontend Usage
- Dashboard login: use test@example.com / test@123
- Transactions page: shows sample/mock transactions from API
- Checkout: `http://localhost:3001/checkout?order_id=<order_id>`

## Notes
- Amounts are in paise (₹1.00 = 100)
- UPI/Card success is simulated with configurable rates
- CORS is open to http://localhost:3000 and http://localhost:3001 by default

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
