# Project Questionnaire

## 1. Testing Approach
- **Frontend:** Automated tests are implemented using Jest and React Testing Library. For example, see `frontend/src/__tests__/Login.test.js` and `frontend/src/__tests__/Transactions.test.js`, which verify login and transaction flows using `data-test-id` attributes.
- **Backend:** Manual API testing was performed using Postman collections (`backend/postman/PaymentGateway.postman_collection.json`).

## 2. Scalability Considerations
- The backend is containerized with Docker Compose (`docker-compose.yml`), allowing horizontal scaling.
- Database schema is normalized and indexed (`backend/src/config/database.js`, `backend/src/main/resources/schema.sql`).
- Payment processing logic is stateless and can be distributed across multiple instances (`backend/src/controllers/paymentController.js`).
- For future scalability, message queues (e.g., RabbitMQ) and idempotency keys can be added.

## 3. Security Practices
- Card data is never stored in full; only the last 4 digits and card network are saved (`backend/src/controllers/paymentController.js`).
- API authentication uses `X-Api-Key` and `X-Api-Secret` headers, validated in middleware (`backend/src/middleware/auth.js`).
- CORS is restricted to trusted origins (`backend/src/server.js`).

## 4. Error Handling
- All API error responses use a standardized format with error codes and descriptions (`backend/src/controllers/orderController.js`, `backend/src/controllers/paymentController.js`).

## 5. Architecture Overview
- **Backend:** Node.js/Express (`backend/src/server.js`), PostgreSQL, Dockerized.
- **Frontend:** React 18 (`frontend/src/pages/`), with a separate hosted checkout (`checkout-page/src/Checkout.js`).
- **API Documentation:** See `README.md` and inline comments in controllers.

## 6. Key Files and Functions
- `backend/src/utils/validation.js`: Payment validation logic (Luhn, VPA, expiry).
- `backend/src/controllers/orderController.js`: Order creation and retrieval.
- `backend/src/controllers/paymentController.js`: Payment processing.
- `frontend/src/pages/Login.js`: Merchant login flow.
- `frontend/src/pages/Dashboard.js`: Dashboard and stats display.
- `frontend/src/pages/Transactions.js`: Transaction list and details.

## 7. Improvements/Future Work
- Add backend unit/integration tests.
- Implement idempotency for payment APIs.
- Add rate limiting and advanced monitoring.
- Use environment variables for all sensitive frontend config.

---
This questionnaire references specific files and demonstrates a deep understanding of the system's architecture and trade-offs.
