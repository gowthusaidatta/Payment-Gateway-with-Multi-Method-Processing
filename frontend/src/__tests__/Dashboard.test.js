import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';
import axios from 'axios';

jest.mock('axios');

describe('Dashboard Component', () => {
  const mockStats = {
    total_amount: 5000000,
    total_transactions: 2843,
    success_rate: 96.8,
  };

  beforeEach(() => {
    localStorage.setItem('merchantCredentials', JSON.stringify({
      id: 1,
      name: 'Test Merchant',
      email: 'test@example.com',
      api_key: 'test_key',
      api_secret: 'test_secret',
    }));
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders dashboard with merchant credentials', () => {
    axios.get.mockResolvedValue({ data: mockStats });
    render(<Dashboard />);
    
    expect(screen.getByText(/Test Merchant/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  test('displays stats after fetch', async () => {
    axios.get.mockResolvedValue({ data: mockStats });
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/50 lakhs/i)).toBeInTheDocument();
      expect(screen.getByText(/2843/i)).toBeInTheDocument();
    });
  });

  test('handles stats fetch error gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Failed to load stats/i)).not.toBeInTheDocument();
    });
  });
});
