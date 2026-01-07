# Payment Gateway API Documentation

## Overview

This document provides detailed information about the Payment Gateway API endpoints, request/response formats, and integration guidelines.

## Base URL

```
http://localhost:8000
```

## Authentication

Most endpoints require authentication using API Key and Secret in request headers:

```http
X-Api-Key: your_api_key
X-Api-Secret: your_api_secret
```

## Error Codes

The API uses standard HTTP response codes and returns errors in the following format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "description": "Human-readable error message"
  }
}
```

### Standard Error Codes

- `AUTHENTICATION_ERROR` - Invalid API credentials
- `BAD_REQUEST_ERROR` - Validation errors or malformed requests
- `NOT_FOUND_ERROR` - Resource not found
- `INVALID_VPA` - VPA format invalid
- `INVALID_CARD` - Card validation failed
- `EXPIRED_CARD` - Card expiry date invalid
- `PAYMENT_FAILED` - Payment processing failed

## Endpoints

### 1. Health Check

Check API and database connectivity status.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Service is healthy

---

### 2. Create Order

Create a new payment order.

**Endpoint:** `POST /api/v1/orders`

**Authentication:** Required

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
    "customer_name": "John Doe",
    "customer_email": "john@example.com"
  }
}
```

**Parameters:**
- `amount` (required, integer) - Amount in smallest currency unit (paise). Minimum: 100
- `currency` (optional, string) - Three-letter currency code. Default: "INR"
- `receipt` (optional, string) - Custom receipt identifier
- `notes` (optional, object) - Additional key-value metadata

**Success Response (201 Created):**
```json
{
  "id": "order_NXhj67fGH2jk9mPq",
  "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_123",
  "notes": {
    "customer_name": "John Doe",
    "customer_email": "john@example.com"
  },
  "status": "created",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

400 Bad Request:
```json
{
  "error": {
    "code": "BAD_REQUEST_ERROR",
    "description": "amount must be at least 100"
  }
}
```

401 Unauthorized:
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "description": "Invalid API credentials"
  }
}
```

---

### 3. Get Order

Retrieve order details by ID.

**Endpoint:** `GET /api/v1/orders/{order_id}`

**Authentication:** Required

**Headers:**
```
X-Api-Key: key_test_abc123
X-Api-Secret: secret_test_xyz789
```

**URL Parameters:**
- `order_id` (required, string) - Order identifier

**Success Response (200 OK):**
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
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

404 Not Found:
```json
{
  "error": {
    "code": "NOT_FOUND_ERROR",
    "description": "Order not found"
  }
}
```

---

### 4. Create Payment

Process a payment for an order.

**Endpoint:** `POST /api/v1/payments`

**Authentication:** Required

**Headers:**
```
X-Api-Key: key_test_abc123
X-Api-Secret: secret_test_xyz789
Content-Type: application/json
```

#### UPI Payment

**Request Body:**
```json
{
  "order_id": "order_NXhj67fGH2jk9mPq",
  "method": "upi",
  "vpa": "user@paytm"
}
```

**Parameters:**
- `order_id` (required, string) - Order identifier
- `method` (required, string) - Payment method: "upi"
- `vpa` (required, string) - Virtual Payment Address (format: username@bank)

**Success Response (201 Created):**
```json
{
  "id": "pay_H8sK3jD9s2L1pQr",
  "order_id": "order_NXhj67fGH2jk9mPq",
  "amount": 50000,
  "currency": "INR",
  "method": "upi",
  "vpa": "user@paytm",
  "status": "success",
  "created_at": "2024-01-15T10:31:00Z"
}
```

#### Card Payment

**Request Body:**
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

**Parameters:**
- `order_id` (required, string) - Order identifier
- `method` (required, string) - Payment method: "card"
- `card` (required, object):
  - `number` (required, string) - Card number (13-19 digits)
  - `expiry_month` (required, string) - Expiry month (01-12)
  - `expiry_year` (required, string) - Expiry year (YY or YYYY format)
  - `cvv` (required, string) - Card CVV (3-4 digits)
  - `holder_name` (required, string) - Cardholder name

**Success Response (201 Created):**
```json
{
  "id": "pay_H8sK3jD9s2L1pQr",
  "order_id": "order_NXhj67fGH2jk9mPq",
  "amount": 50000,
  "currency": "INR",
  "method": "card",
  "card_network": "visa",
  "card_last4": "1111",
  "status": "success",
  "created_at": "2024-01-15T10:31:00Z"
}
```

**Error Responses:**

400 Bad Request - Invalid VPA:
```json
{
  "error": {
    "code": "INVALID_VPA",
    "description": "Invalid VPA format"
  }
}
```

400 Bad Request - Invalid Card:
```json
{
  "error": {
    "code": "INVALID_CARD",
    "description": "Invalid card number"
  }
}
```

400 Bad Request - Expired Card:
```json
{
  "error": {
    "code": "EXPIRED_CARD",
    "description": "Card has expired"
  }
}
```

---

### 5. Get Payment

Retrieve payment details by ID.

**Endpoint:** `GET /api/v1/payments/{payment_id}`

**Authentication:** Required

**Headers:**
```
X-Api-Key: key_test_abc123
X-Api-Secret: secret_test_xyz789
```

**URL Parameters:**
- `payment_id` (required, string) - Payment identifier

**Success Response (200 OK) - UPI:**
```json
{
  "id": "pay_H8sK3jD9s2L1pQr",
  "order_id": "order_NXhj67fGH2jk9mPq",
  "amount": 50000,
  "currency": "INR",
  "method": "upi",
  "vpa": "user@paytm",
  "status": "success",
  "created_at": "2024-01-15T10:31:00Z",
  "updated_at": "2024-01-15T10:31:10Z"
}
```

**Success Response (200 OK) - Card:**
```json
{
  "id": "pay_H8sK3jD9s2L1pQr",
  "order_id": "order_NXhj67fGH2jk9mPq",
  "amount": 50000,
  "currency": "INR",
  "method": "card",
  "card_network": "visa",
  "card_last4": "1111",
  "status": "success",
  "created_at": "2024-01-15T10:31:00Z",
  "updated_at": "2024-01-15T10:31:10Z"
}
```

**Failed Payment Response:**
```json
{
  "id": "pay_H8sK3jD9s2L1pQr",
  "order_id": "order_NXhj67fGH2jk9mPq",
  "amount": 50000,
  "currency": "INR",
  "method": "upi",
  "vpa": "user@paytm",
  "status": "failed",
  "error_code": "PAYMENT_FAILED",
  "error_description": "Payment processing failed",
  "created_at": "2024-01-15T10:31:00Z",
  "updated_at": "2024-01-15T10:31:10Z"
}
```

---

### 6. Test Merchant

Retrieve test merchant details (for evaluation purposes).

**Endpoint:** `GET /api/v1/test/merchant`

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "api_key": "key_test_abc123",
  "seeded": true
}
```

**Error Response (404 Not Found):**
```json
{
  "error": {
    "code": "NOT_FOUND_ERROR",
    "description": "Test merchant not found"
  }
}
```

---

## Public Endpoints (Checkout)

These endpoints are used by the checkout page and don't require authentication.

### Get Order (Public)

**Endpoint:** `GET /api/v1/orders/{order_id}/public`

**Response:**
```json
{
  "id": "order_NXhj67fGH2jk9mPq",
  "amount": 50000,
  "currency": "INR",
  "status": "created"
}
```

### Create Payment (Public)

**Endpoint:** `POST /api/v1/payments/public`

**Request/Response:** Same format as authenticated payment creation

### Get Payment (Public)

**Endpoint:** `GET /api/v1/payments/{payment_id}/public`

**Response:** Same format as authenticated payment retrieval

---

## Payment Status Flow

Payments go through the following status transitions:

```
processing → success
processing → failed
```

**Status Descriptions:**
- `processing` - Payment is being processed by the payment gateway
- `success` - Payment completed successfully
- `failed` - Payment failed (see error_code and error_description)

---

## Validation Rules

### VPA (Virtual Payment Address)

**Format:** `username@bankname`

**Pattern:** `^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$`

**Valid Examples:**
- user@paytm
- john.doe@okhdfcbank
- user_123@phonepe

**Invalid Examples:**
- user @paytm (contains space)
- @paytm (missing username)
- user@@bank (double @)
- user@ (missing bank name)

### Card Number

**Validation:** Luhn Algorithm

**Length:** 13-19 digits

**Supported Networks:**
- Visa (starts with 4)
- Mastercard (starts with 51-55)
- Amex (starts with 34 or 37)
- RuPay (starts with 60, 65, or 81-89)

**Test Card Numbers:**
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- Amex: 378282246310005
- RuPay: 6521234567890123

### Card Expiry

**Format:** MM/YY or MM/YYYY

**Validation:**
- Month must be 01-12
- Year can be 2-digit (YY) or 4-digit (YYYY)
- Expiry date must be in the future or current month

---

## Integration Guide

### Step 1: Create an Order

```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "order_rcpt_123"
  }'
```

### Step 2: Redirect to Checkout

Redirect customer to:
```
http://localhost:3001/checkout?order_id=<order_id>
```

### Step 3: Customer Completes Payment

Customer selects payment method and completes payment on the checkout page.

### Step 4: Verify Payment Status

```bash
curl -X GET http://localhost:8000/api/v1/payments/{payment_id} \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789"
```

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limits to prevent abuse.

---

## Support

For issues or questions, refer to the README.md or contact the development team.
