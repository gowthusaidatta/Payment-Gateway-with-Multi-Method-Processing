import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Transactions.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const PAGE_SIZE = 10;

function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  // Create transaction form state
  const [creating, setCreating] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi');
  const [vpa, setVpa] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const apiKey = localStorage.getItem('apiKey');
  const apiSecret = localStorage.getItem('apiSecret');

  useEffect(() => {
    if (!apiKey || !apiSecret) {
      navigate('/login');
      return;
    }
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/merchant/transactions`, {
          headers: {
            'X-Api-Key': apiKey,
            'X-Api-Secret': apiSecret
          }
        });
        setError('');
        setTransactions(response.data || []);
      } catch (err) {
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [apiKey, apiSecret, navigate]);

  const filtered = useMemo(() => {
    return (transactions || []).filter((tx) => {
      const matchesSearch = search
        ? (tx.id || '').toLowerCase().includes(search.toLowerCase()) ||
          (tx.order_id || '').toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesStatus = statusFilter === 'all' ? true : tx.status === statusFilter;
      const createdAt = tx.created_at ? new Date(tx.created_at) : null;
      const afterFrom = dateFrom ? createdAt && createdAt >= new Date(dateFrom) : true;
      const beforeTo = dateTo ? createdAt && createdAt <= new Date(dateTo + 'T23:59:59') : true;
      return matchesSearch && matchesStatus && afterFrom && beforeTo;
    });
  }, [transactions, search, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const statusClass = (status) => {
    if (status === 'success') return 'badge success';
    if (status === 'failed') return 'badge failed';
    if (status === 'processing') return 'badge processing';
    return 'badge neutral';
  };

  const renderSkeleton = () => (
    <div className="table-wrapper">
      <table data-test-id="transactions-table">
        <tbody>
          {Array.from({ length: 5 }).map((_, idx) => (
            <tr key={idx} className="skeleton-row">
              {Array.from({ length: 6 }).map((__, cell) => (
                <td key={cell}><div className="skeleton shimmer" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) return renderSkeleton();

  return (
    <div className="tx-layout">
      <aside className="tx-sidebar">
        <div className="brand">Gateway</div>
        <nav>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/dashboard/transactions" className="nav-link active">Transactions</Link>
        </nav>
        <div className="create-card">
          <h4>Create Transaction</h4>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setFormError('');
              setFormSuccess('');
              if (!amount || isNaN(parseInt(amount)) || parseInt(amount) < 100) {
                setFormError('Amount must be at least ₹1.00 (100 paise)');
                return;
              }
              try {
                setCreating(true);
                // 1) Create order
                const orderRes = await axios.post(`${API_URL}/api/v1/orders`, {
                  amount: parseInt(amount),
                  currency: 'INR',
                  receipt: 'web-demo',
                  notes: { source: 'dashboard' }
                }, {
                  headers: { 'X-Api-Key': apiKey, 'X-Api-Secret': apiSecret }
                });
                const orderId = orderRes.data.id;

                // 2) Create payment
                const payload = { order_id: orderId, method };
                if (method === 'upi') {
                  payload.vpa = vpa || 'demo@upi';
                } else {
                  payload.card = {
                    number: cardNumber || '4111 1111 1111 1111',
                    expiry_month: expiryMonth || '12',
                    expiry_year: expiryYear || '2030',
                    cvv: cvv || '123',
                    holder_name: cardHolder || 'Demo User'
                  };
                }

                const payRes = await axios.post(`${API_URL}/api/v1/payments`, payload, {
                  headers: { 'X-Api-Key': apiKey, 'X-Api-Secret': apiSecret }
                });

                setFormSuccess(`Payment ${payRes.data.id} ${payRes.data.status}`);
                setAmount(''); setVpa(''); setCardNumber(''); setCardHolder(''); setExpiryMonth(''); setExpiryYear(''); setCvv('');

                // Refresh list
                const list = await axios.get(`${API_URL}/api/v1/merchant/transactions`, {
                  headers: { 'X-Api-Key': apiKey, 'X-Api-Secret': apiSecret }
                });
                setError('');
                setTransactions(list.data || []);
              } catch (err) {
                console.error(err);
                setFormError('Failed to create transaction');
              } finally {
                setCreating(false);
              }
            }}
          >
            <label className="field">
              <span>Amount (paise)</span>
              <input className="input" type="number" min="100" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </label>
            <label className="field">
              <span>Method</span>
              <div className="method-switch">
                <label><input type="radio" name="method" value="upi" checked={method==='upi'} onChange={() => setMethod('upi')} /> UPI</label>
                <label><input type="radio" name="method" value="card" checked={method==='card'} onChange={() => setMethod('card')} /> Card</label>
              </div>
            </label>
            {method === 'upi' ? (
              <label className="field">
                <span>VPA</span>
                <input className="input" placeholder="name@bank" value={vpa} onChange={(e) => setVpa(e.target.value)} />
              </label>
            ) : (
              <>
                <label className="field"><span>Card Number</span><input className="input" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4111 1111 1111 1111" /></label>
                <div className="grid2">
                  <label className="field"><span>Expiry MM</span><input className="input" value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)} placeholder="12" /></label>
                  <label className="field"><span>Expiry YYYY</span><input className="input" value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)} placeholder="2030" /></label>
                </div>
                <div className="grid2">
                  <label className="field"><span>CVV</span><input className="input" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" /></label>
                  <label className="field"><span>Card Holder</span><input className="input" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} placeholder="Demo User" /></label>
                </div>
              </>
            )}
            {formError && <div className="error-banner small">{formError}</div>}
            {formSuccess && <div className="success-banner">{formSuccess}</div>}
            <button className="primary-btn" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
          </form>
        </div>
      </aside>

      <main className="tx-shell">
        <header className="tx-header">
          <div>
            <p className="eyebrow">Transactions</p>
            <h2>Payment Activity</h2>
          </div>
          <div className="filters">
            <input
              className="input"
              placeholder="Search payment or order ID"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <select className="input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
            <input className="input" type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            <input className="input" type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <div className="table-wrapper">
          <table data-test-id="transactions-table">
            <tbody>
              {pageData.map((tx) => (
                <tr key={tx.id} data-test-id="transaction-row">
                  <td data-test-id="payment-id">{tx.id}</td>
                  <td data-test-id="order-id">{tx.order_id}</td>
                  <td data-test-id="amount">₹{(tx.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td data-test-id="method" className="method-col">{tx.method}</td>
                  <td data-test-id="status"><span className={statusClass(tx.status)}>{tx.status}</span></td>
                  <td data-test-id="created-at">{tx.created_at}</td>
                </tr>
              ))}
              {!pageData.length && (
                <tr>
                  <td colSpan="6" className="empty">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <span>{currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      </main>
    </div>
  );
}

export default Transactions;
