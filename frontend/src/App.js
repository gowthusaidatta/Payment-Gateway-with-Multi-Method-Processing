import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import './App.css';

function App() {
  const hasCreds = () => !!(localStorage.getItem('apiKey') && localStorage.getItem('apiSecret'));
  const [isAuthenticated, setIsAuthenticated] = useState(hasCreds());
  
  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(hasCreds());
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/dashboard/transactions" element={isAuthenticated ? <Transactions /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      </Routes>
    </Router>
  );
}

export default App;
