import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Dashboard() {
  const [merchant, setMerchant] = useState(null);
  const [stats, setStats] = useState({
    total_transactions: 0,
    total_amount: 0,
    success_rate: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if merchant is logged in
    const merchantData = localStorage.getItem('merchant');
    if (!merchantData) {
      navigate('/login');
      return;
    }

    const parsedMerchant = JSON.parse(merchantData);
    setMerchant(parsedMerchant);

    // Fetch stats
    fetchStats(parsedMerchant);
  }, [navigate]);

  const fetchStats = async (merchantData) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/merchant/stats`, {
        headers: {
          'X-Api-Key': merchantData.api_key,
          'X-Api-Secret': merchantData.api_secret
        }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('merchant');
    navigate('/login');
  };

  const formatAmount = (amount) => {
    return `₹${(amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!merchant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Payment Gateway</h1>
        </div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/dashboard/transactions">Transactions</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div data-test-id="dashboard" className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, {merchant.name}</h2>
          <p className="merchant-email">{merchant.email}</p>
        </div>

        <div data-test-id="api-credentials" className="credentials-section">
          <h3>API Credentials</h3>
          <div className="credential-item">
            <label>API Key</label>
            <div className="credential-value">
              <span data-test-id="api-key">{merchant.api_key}</span>
              <button onClick={() => navigator.clipboard.writeText(merchant.api_key)}>
                Copy
              </button>
            </div>
          </div>
          <div className="credential-item">
            <label>API Secret</label>
            <div className="credential-value">
              <span data-test-id="api-secret">{merchant.api_secret}</span>
              <button onClick={() => navigator.clipboard.writeText(merchant.api_secret)}>
                Copy
              </button>
            </div>
          </div>
        </div>

        <div data-test-id="stats-container" className="stats-section">
          <h3>Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Transactions</div>
              <div data-test-id="total-transactions" className="stat-value">
                {stats.total_transactions}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Amount</div>
              <div data-test-id="total-amount" className="stat-value">
                {formatAmount(stats.total_amount)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Success Rate</div>
              <div data-test-id="success-rate" className="stat-value">
                {stats.success_rate}%
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <Link to="/dashboard/transactions" className="action-card">
              <h4>View Transactions</h4>
              <p>See all payment transactions</p>
            </Link>
            <div className="action-card">
              <h4>API Documentation</h4>
              <p>Learn how to integrate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
