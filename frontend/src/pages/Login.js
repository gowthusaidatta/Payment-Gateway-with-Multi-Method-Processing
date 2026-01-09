import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/v1/merchant/login`, {
        email,
        password
      });

      if (response.data && response.data.api_key && response.data.api_secret) {
        localStorage.setItem('apiKey', response.data.api_key);
        localStorage.setItem('apiSecret', response.data.api_secret);
        localStorage.setItem('merchantEmail', response.data.email || email);
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        setError('Invalid login response');
      }
    } catch (err) {
      setError(err.response?.data?.error?.description || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-bg" aria-hidden="true" />
      <div className="auth-card">
        <div className="brand-header">
          <div className="brand-icon">⚡</div>
          <div>
            <p className="brand-kicker">Payment Gateway</p>
            <h1>Merchant Console</h1>
          </div>
        </div>

        <div className="card-headline">
          <h2>Merchant Login</h2>
          <p>Securely access your payments workspace</p>
        </div>

        <form data-test-id="login-form" onSubmit={handleLogin} className="login-form">
          <label className="input-group">
            <span className="input-icon">@</span>
            <input
              data-test-id="email-input"
              type="email"
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="input-group">
            <span className="input-icon">••</span>
            <input
              data-test-id="password-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="error-message">{error}</div>}

          <button className="primary-btn" data-test-id="login-button" disabled={loading}>
            {loading ? <span className="spinner" aria-label="Loading" /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
