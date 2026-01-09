import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total_transactions: 0, total_amount: 0, success_rate: 0 });
  const [revealSecret, setRevealSecret] = useState(false);

  const apiKey = localStorage.getItem('apiKey');
  const apiSecret = localStorage.getItem('apiSecret');
  const merchantEmail = localStorage.getItem('merchantEmail') || 'Merchant';

  useEffect(() => {
    if (!apiKey || !apiSecret) {
      navigate('/login');
      return;
    }
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/merchant/stats`, {
          headers: {
            'X-Api-Key': apiKey,
            'X-Api-Secret': apiSecret
          }
        });
        setStats(response.data);
        setError(''); // Clear any previous errors
      } catch (err) {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiKey, apiSecret, navigate]);

  const copyToClipboard = async (value) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
    } catch (err) {
      // silent fallback
    }
  };

  const maskSecret = (secret) => {
    if (!secret) return '';
    if (revealSecret) return secret;
    return `${secret.slice(0, 4)}••••${secret.slice(-3)}`;
  };

  if (loading) {
    return (
      <div className="app-shell" data-test-id="dashboard">
        <div className="skeleton shimmer" />
      </div>
    );
  }

  return (
    <div className="app-shell" data-test-id="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-circle">⚡</div>
          <div>
            <p className="brand-mini">Payment Gateway</p>
            <h3>Merchant</h3>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">Dashboard</Link>
          <Link to="/dashboard/transactions" className="nav-item">Transactions</Link>
          <a className="nav-item" href="#api-creds">API Credentials</a>
          <a className="nav-item" href="#settings">Settings</a>
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>Welcome back</h2>
          </div>
          <div className="topbar-actions">
            <div className="badge">{merchantEmail}</div>
            <button className="icon-btn" aria-label="Notifications">🔔</button>
            <button className="avatar">{merchantEmail.charAt(0).toUpperCase()}</button>
          </div>
        </header>

        <section className="grid-3" data-test-id="stats-container">
          <div className="stat-card">
            <div className="stat-top">
              <p>Transactions</p>
              <span className="trend up">▲</span>
            </div>
            <h3 data-test-id="total-transactions">{stats.total_transactions}</h3>
            <div className="accent-bar" />
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <p>Total Volume</p>
              <span className="trend up">▲</span>
            </div>
            <h3 data-test-id="total-amount">₹{(stats.total_amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            <div className="accent-bar" />
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <p>Success Rate</p>
              <span className="trend">◎</span>
            </div>
            <h3 data-test-id="success-rate">{stats.success_rate}%</h3>
            <div className="accent-bar" />
          </div>
        </section>

        <section className="panels">
          <div className="panel" id="api-creds" data-test-id="api-credentials">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Security</p>
                <h4>API Credentials</h4>
              </div>
              <button className="ghost-btn" onClick={() => setRevealSecret(!revealSecret)}>
                {revealSecret ? 'Hide secret' : 'Reveal secret'}
              </button>
            </div>
            <div className="credential-row">
              <div className="label-col">
                <label>API Key</label>
                <span className="pill">Public</span>
              </div>
              <div className="value-col">
                <span data-test-id="api-key">{apiKey}</span>
                <button className="icon-btn" onClick={() => copyToClipboard(apiKey)} aria-label="Copy API Key">📋</button>
              </div>
            </div>
            <div className="credential-row">
              <div className="label-col">
                <label>API Secret</label>
                <span className="pill pill-warn">Secret</span>
              </div>
              <div className="value-col">
                <span data-test-id="api-secret">{maskSecret(apiSecret)}</span>
                <button className="icon-btn" onClick={() => copyToClipboard(apiSecret)} aria-label="Copy API Secret">📋</button>
              </div>
            </div>
          </div>

          <div className="panel" id="settings">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Shortcuts</p>
                <h4>Quick actions</h4>
              </div>
            </div>
            <div className="quick-grid">
              <Link to="/dashboard/transactions" className="quick-card">
                <div className="quick-icon">📄</div>
                <div>
                  <p className="quick-title">View Transactions</p>
                  <p className="quick-sub">Monitor live payment activity</p>
                </div>
              </Link>
              <a className="quick-card" href="#api-creds">
                <div className="quick-icon">🔑</div>
                <div>
                  <p className="quick-title">Manage API Keys</p>
                  <p className="quick-sub">Rotate and secure credentials</p>
                </div>
              </a>
              <a className="quick-card" href="#settings">
                <div className="quick-icon">⚙️</div>
                <div>
                  <p className="quick-title">Settings</p>
                  <p className="quick-sub">Configure webhooks & risk rules</p>
                </div>
              </a>
            </div>
          </div>
        </section>

        {error && <div className="error-banner">{error}</div>}
      </div>
    </div>
  );
}

export default Dashboard;
