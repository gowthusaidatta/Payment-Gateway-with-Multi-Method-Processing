import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Dashboard from '../pages/Dashboard';
import axios from 'axios';

describe('Dashboard Component', () => {
  const mockStats = {
    total_amount: 5000000,
    total_transactions: 2843,
    success_rate: 96.8,
  };

  beforeEach(() => {
    localStorage.setItem('apiKey', 'test_key');
    localStorage.setItem('apiSecret', 'test_secret');
    localStorage.setItem('merchantEmail', 'test@example.com');
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders dashboard with merchant credentials', () => {
    axios.get.mockResolvedValue({ data: mockStats });
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Merchant/i)).toBeInTheDocument();
  });

  test('displays stats after fetch', async () => {
    axios.get.mockResolvedValue({ data: mockStats });
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/50 lakhs/i)).toBeInTheDocument();
      expect(screen.getByText(/2843/i)).toBeInTheDocument();
    });
  });

  test('handles stats fetch error gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/Failed to load stats/i)).not.toBeInTheDocument();
    });
  });
});
