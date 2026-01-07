# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐           ┌─────────────────────┐      │
│  │  Merchant Dashboard │           │   Checkout Page     │      │
│  │   (Port 3000)       │           │   (Port 3001)       │      │
│  │                     │           │                     │      │
│  │  - Login            │           │  - Order Display    │      │
│  │  - API Credentials  │           │  - Payment Methods  │      │
│  │  - Statistics       │           │  - UPI Form         │      │
│  │  - Transactions     │           │  - Card Form        │      │
│  └──────────┬──────────┘           └──────────┬──────────┘      │
│             │                                   │                 │
└─────────────┼───────────────────────────────────┼─────────────────┘
              │                                   │
              │ REST API                          │ REST API
              │ (Authenticated)                   │ (Public)
              │                                   │
┌─────────────┴───────────────────────────────────┴─────────────────┐
│                       BACKEND API SERVER                           │
│                         (Port 8000)                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐         │
│  │  Controllers │  │  Middleware  │  │   Utilities     │         │
│  │              │  │              │  │                 │         │
│  │  - Health    │  │  - Auth      │  │  - Validation   │         │
│  │  - Orders    │  │              │  │    • VPA        │         │
│  │  - Payments  │  └──────────────┘  │    • Luhn Algo  │         │
│  │  - Merchants │                    │    • Card Detect│         │
│  └──────────────┘                    │    • Expiry     │         │
│                                      └─────────────────┘         │
│                                                                    │
│  ┌────────────────────────────────────────────────────┐           │
│  │          Payment Processing Engine                 │           │
│  │                                                    │           │
│  │  1. Validate payment details                      │           │
│  │  2. Create payment record (status: processing)    │           │
│  │  3. Simulate processing delay (5-10 seconds)      │           │
│  │  4. Determine success/failure (90% UPI, 95% Card) │           │
│  │  5. Update payment status                         │           │
│  └────────────────────────────────────────────────────┘           │
│                                                                    │
└────────────────────────────────┬───────────────────────────────────┘
                                 │
                                 │ SQL Queries
                                 │
┌────────────────────────────────┴───────────────────────────────────┐
│                      PostgreSQL Database                           │
│                         (Port 5432)                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  merchants   │  │    orders    │  │   payments   │            │
│  │              │  │              │  │              │            │
│  │  - id (PK)   │  │  - id (PK)   │  │  - id (PK)   │            │
│  │  - name      │  │  - merchant  │  │  - order_id  │            │
│  │  - email     │  │  - amount    │  │  - method    │            │
│  │  - api_key   │  │  - currency  │  │  - status    │            │
│  │  - api_secret│  │  - status    │  │  - vpa       │            │
│  └──────────────┘  └──────────────┘  │  - card_*    │            │
│                                      └──────────────┘            │
│                                                                    │
│  Relationships:                                                   │
│  • orders.merchant_id → merchants.id                              │
│  • payments.merchant_id → merchants.id                            │
│  • payments.order_id → orders.id                                  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Applications

#### Dashboard (React + Nginx)
- **Technology**: React 18, React Router, Axios
- **Port**: 3000
- **Purpose**: Merchant portal for managing payments
- **Features**:
  - Merchant login
  - API credential display
  - Real-time statistics
  - Transaction history
- **Authentication**: Session-based (localStorage)

#### Checkout Page (React + Nginx)
- **Technology**: React 18, Axios
- **Port**: 3001
- **Purpose**: Customer-facing payment interface
- **Features**:
  - Order display
  - Payment method selection
  - UPI/Card forms with validation
  - Real-time payment status polling
  - Success/failure states
- **Authentication**: None (public)

### 2. Backend API (Node.js + Express)

#### Core Components

**Controllers**:
- `healthController.js` - System health checks
- `orderController.js` - Order creation and retrieval
- `paymentController.js` - Payment processing
- `merchantController.js` - Merchant management

**Middleware**:
- `auth.js` - API key/secret authentication

**Utilities**:
- `validation.js` - Payment validation logic
  - VPA format validation
  - Luhn algorithm for cards
  - Card network detection
  - Expiry date validation

**Database**:
- `database.js` - PostgreSQL connection and schema

#### API Endpoints

**Public Endpoints** (No Auth):
- `GET /health` - Health check
- `GET /api/v1/test/merchant` - Test merchant details
- `GET /api/v1/orders/:id/public` - Get order (checkout)
- `POST /api/v1/payments/public` - Create payment (checkout)
- `GET /api/v1/payments/:id/public` - Get payment (checkout)
- `POST /api/v1/merchant/login` - Dashboard login

**Protected Endpoints** (Require Auth):
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/:id` - Get order
- `POST /api/v1/payments` - Create payment
- `GET /api/v1/payments/:id` - Get payment
- `GET /api/v1/merchant/stats` - Get statistics
- `GET /api/v1/merchant/transactions` - Get transactions

### 3. Database (PostgreSQL)

#### Schema Design

```sql
merchants (1) ──< (many) orders
merchants (1) ──< (many) payments
orders (1) ──< (many) payments
```

#### Tables

**merchants**:
- Stores merchant account information
- API credentials for authentication
- Webhook URLs (future use)

**orders**:
- Payment order details
- Amount in smallest currency unit (paise)
- Custom receipt identifiers
- JSON metadata (notes)

**payments**:
- Payment transaction records
- Method-specific details (VPA for UPI, card info for cards)
- Status tracking (processing → success/failed)
- Error information for failed payments

#### Indexes:
- `orders.merchant_id` - Fast merchant order queries
- `payments.order_id` - Fast order payment queries
- `payments.status` - Fast status filtering

## Data Flow

### Order Creation Flow

```
Merchant → API (POST /api/v1/orders)
           ↓
      Authenticate merchant
           ↓
      Validate amount (≥100)
           ↓
      Generate order_id
           ↓
      Insert into orders table
           ↓
      Return order details
```

### Payment Flow (via Checkout Page)

```
Customer → Checkout Page
           ↓
      Fetch order details (GET /api/v1/orders/:id/public)
           ↓
      Display order summary
           ↓
      Customer selects payment method (UPI/Card)
           ↓
      Customer fills payment form
           ↓
      Submit payment (POST /api/v1/payments/public)
           ↓
      Backend validates payment details
           ↓
      Create payment record (status: processing)
           ↓
      Simulate processing (5-10 sec delay)
           ↓
      Random success/failure determination
           ↓
      Update payment status
           ↓
      Frontend polls status (GET /api/v1/payments/:id/public)
           ↓
      Display success/failure to customer
```

### Payment Processing State Machine

```
                ┌─────────────┐
                │   Order     │
                │  Created    │
                └──────┬──────┘
                       │
                       │ Customer initiates payment
                       ↓
                ┌─────────────┐
                │  Payment    │
                │ Processing  │
                └──────┬──────┘
                       │
              ┌────────┴────────┐
              │                 │
       90% UPI / 95% Card    10% UPI / 5% Card
              │                 │
              ↓                 ↓
       ┌─────────────┐   ┌─────────────┐
       │  Payment    │   │  Payment    │
       │  Success    │   │   Failed    │
       └─────────────┘   └─────────────┘
```

## Security Considerations

### Authentication
- API Key + Secret authentication for merchant endpoints
- Credentials sent via headers (not URL or body)
- Test merchant auto-seeded with fixed credentials

### Data Protection
- **Never store**:
  - Full card numbers (store only last 4 digits)
  - CVV codes
- **Store encrypted** (in production):
  - API secrets
  - Sensitive merchant data

### Validation
- Server-side validation for all inputs
- VPA format validation
- Luhn algorithm for card validation
- Expiry date validation
- Amount validation (minimum 100 paise)

## Scalability Considerations

### Current Architecture (Single Instance)
```
Load Balancer
     ↓
┌────────────┐
│  API       │ ← Single instance
└────────────┘
     ↓
┌────────────┐
│ PostgreSQL │
└────────────┘
```

### Future Architecture (Scalable)
```
      Load Balancer
           ↓
    ┌──────┴──────┐
    ↓             ↓
┌────────┐    ┌────────┐
│ API 1  │    │ API 2  │  ← Multiple instances
└────────┘    └────────┘
    ↓             ↓
┌────────────────────────┐
│    PostgreSQL          │
│    (Read Replicas)     │
└────────────────────────┘
         ↓
┌────────────────────────┐
│    Redis Cache         │
└────────────────────────┘
```

## Docker Architecture

```
Docker Host
│
├── Container: pg_gateway (PostgreSQL)
│   - Image: postgres:15-alpine
│   - Port: 5432
│   - Volume: postgres_data
│   - Health check enabled
│
├── Container: gateway_api (Backend)
│   - Built from: ./backend/Dockerfile
│   - Port: 8000
│   - Depends on: postgres (healthy)
│   - Environment: DATABASE_URL, TEST_* vars
│
├── Container: gateway_dashboard (Frontend)
│   - Built from: ./frontend/Dockerfile
│   - Port: 3000 (nginx)
│   - Depends on: api
│   - Serves: React build
│
└── Container: gateway_checkout (Checkout)
    - Built from: ./checkout-page/Dockerfile
    - Port: 3001 (nginx)
    - Depends on: api
    - Serves: React build
```

## Technology Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend | Node.js 18 + Express | REST API server |
| Frontend | React 18 | User interfaces |
| Database | PostgreSQL 15 | Data persistence |
| Web Server | Nginx (Alpine) | Serve frontend |
| Container | Docker + Compose | Deployment |
| HTTP Client | Axios | API requests |
| Routing | React Router | SPA routing |

## Performance Characteristics

### Response Times
- Health check: <10ms
- Create order: <50ms
- Get order/payment: <20ms
- Create payment: 5-10 seconds (simulated processing)

### Success Rates
- UPI payments: 90%
- Card payments: 95%

### Concurrency
- Current: Single-threaded Node.js
- Future: Horizontal scaling with load balancer

## Monitoring & Observability

### Current Capabilities
- Health check endpoint
- Docker logs via `docker-compose logs`
- Database connection status

### Future Enhancements
- Prometheus metrics
- Grafana dashboards
- Error tracking (Sentry)
- Request tracing
- Performance monitoring

---

This architecture provides a solid foundation for a payment gateway system with clear separation of concerns, scalable design, and production-ready patterns.
