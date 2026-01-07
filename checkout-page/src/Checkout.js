import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Checkout.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Checkout() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [error, setError] = useState('');

  // UPI Form
  const [vpa, setVpa] = useState('');

  // Card Form
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    // Get order_id from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get('order_id');
    
    if (orderIdParam) {
      setOrderId(orderIdParam);
      fetchOrder(orderIdParam);
    } else {
      setError('Order ID not provided');
      setLoading(false);
    }
  }, []);

  const fetchOrder = async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/orders/${orderId}/public`);
      setOrder(response.data);
      setLoading(false);
    } catch (err) {
      setError('Order not found');
      setLoading(false);
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setError('');
  };

  const handleUPISubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      const response = await axios.post(`${API_URL}/api/v1/payments/public`, {
        order_id: orderId,
        method: 'upi',
        vpa: vpa
      });

      setPaymentId(response.data.id);
      pollPaymentStatus(response.data.id);
    } catch (err) {
      setError(err.response?.data?.error?.description || 'Payment failed');
      setProcessing(false);
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      // Parse expiry (MM/YY format)
      const expiry = e.target.querySelector('[data-test-id="expiry-input"]').value;
      const [month, year] = expiry.split('/');

      const response = await axios.post(`${API_URL}/api/v1/payments/public`, {
        order_id: orderId,
        method: 'card',
        card: {
          number: cardNumber,
          expiry_month: month.trim(),
          expiry_year: year.trim(),
          cvv: cvv,
          holder_name: cardholderName
        }
      });

      setPaymentId(response.data.id);
      pollPaymentStatus(response.data.id);
    } catch (err) {
      setError(err.response?.data?.error?.description || 'Payment failed');
      setProcessing(false);
    }
  };

  const pollPaymentStatus = (paymentId) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/payments/${paymentId}/public`);
        const status = response.data.status;

        if (status === 'success' || status === 'failed') {
          clearInterval(interval);
          setPaymentStatus(status);
          setProcessing(false);
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    }, 2000);

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (!paymentStatus) {
        setError('Payment timeout');
        setProcessing(false);
      }
    }, 120000);
  };

  const handleRetry = () => {
    setPaymentStatus('');
    setPaymentId('');
    setError('');
    setSelectedMethod('');
    setVpa('');
    setCardNumber('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    setCardholderName('');
  };

  const formatAmount = (amount) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-card">
          <div className="loading">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="checkout-page">
        <div className="checkout-card">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-card" data-test-id="checkout-container">
        <div className="header">
          <h1>Payment Gateway</h1>
          <p>Secure Checkout</p>
        </div>

        {/* Order Summary */}
        <div data-test-id="order-summary" className="order-summary">
          <h2>Complete Payment</h2>
          <div className="order-details">
            <div className="order-row">
              <span>Amount:</span>
              <span data-test-id="order-amount" className="amount">
                {formatAmount(order.amount)}
              </span>
            </div>
            <div className="order-row">
              <span>Order ID:</span>
              <span data-test-id="order-id" className="order-id">
                {order.id}
              </span>
            </div>
          </div>
        </div>

        {/* Success State */}
        {paymentStatus === 'success' && (
          <div data-test-id="success-state" className="success-state">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <div className="payment-details">
              <div>
                <span>Payment ID:</span>
                <span data-test-id="payment-id">{paymentId}</span>
              </div>
            </div>
            <span data-test-id="success-message" className="success-message">
              Your payment has been processed successfully
            </span>
          </div>
        )}

        {/* Error State */}
        {paymentStatus === 'failed' && (
          <div data-test-id="error-state" className="error-state">
            <div className="error-icon">✗</div>
            <h2>Payment Failed</h2>
            <span data-test-id="error-message" className="error-message">
              Payment could not be processed
            </span>
            <button data-test-id="retry-button" onClick={handleRetry} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {/* Processing State */}
        {processing && (
          <div data-test-id="processing-state" className="processing-state">
            <div className="spinner"></div>
            <span data-test-id="processing-message">Processing payment...</span>
          </div>
        )}

        {/* Payment Methods and Forms */}
        {!paymentStatus && !processing && (
          <>
            {/* Payment Method Selection */}
            <div data-test-id="payment-methods" className="payment-methods">
              <h3>Select Payment Method</h3>
              <div className="method-buttons">
                <button
                  data-test-id="method-upi"
                  data-method="upi"
                  className={`method-button ${selectedMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => handleMethodSelect('upi')}
                >
                  <span className="method-icon">📱</span>
                  <span>UPI</span>
                </button>
                <button
                  data-test-id="method-card"
                  data-method="card"
                  className={`method-button ${selectedMethod === 'card' ? 'active' : ''}`}
                  onClick={() => handleMethodSelect('card')}
                >
                  <span className="method-icon">💳</span>
                  <span>Card</span>
                </button>
              </div>
            </div>

            {/* UPI Form */}
            {selectedMethod === 'upi' && (
              <form data-test-id="upi-form" onSubmit={handleUPISubmit} className="payment-form">
                <div className="form-group">
                  <label htmlFor="vpa">UPI ID</label>
                  <input
                    data-test-id="vpa-input"
                    id="vpa"
                    type="text"
                    placeholder="username@bank"
                    value={vpa}
                    onChange={(e) => setVpa(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="form-error">{error}</div>}
                <button data-test-id="pay-button" type="submit" className="pay-button">
                  Pay {formatAmount(order.amount)}
                </button>
              </form>
            )}

            {/* Card Form */}
            {selectedMethod === 'card' && (
              <form data-test-id="card-form" onSubmit={handleCardSubmit} className="payment-form">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    data-test-id="card-number-input"
                    id="cardNumber"
                    type="text"
                    placeholder="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength="19"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiry">Expiry (MM/YY)</label>
                    <input
                      data-test-id="expiry-input"
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        e.target.value = value;
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      data-test-id="cvv-input"
                      id="cvv"
                      type="text"
                      placeholder="CVV"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength="4"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="cardholderName">Cardholder Name</label>
                  <input
                    data-test-id="cardholder-name-input"
                    id="cardholderName"
                    type="text"
                    placeholder="Name on Card"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="form-error">{error}</div>}
                <button data-test-id="pay-button" type="submit" className="pay-button">
                  Pay {formatAmount(order.amount)}
                </button>
              </form>
            )}
          </>
        )}

        <div className="secure-badge">
          <span>🔒</span>
          <span>Secure Payment</span>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
