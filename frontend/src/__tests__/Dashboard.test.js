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

  test('renders dashboard with merchant credentials', async () => {
    axios.get.mockResolvedValue({ data: mockStats });
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  test('displays stats after fetch', async () => {
    axios.get.mockResolvedValue({ data: mockStats });
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      // Check that stats are rendered
      expect(screen.getByTestId('stats-container')).toBeInTheDocument();
      // Verify the numeric values are displayed
      expect(screen.getByText('2843')).toBeInTheDocument();
      expect(screen.getByText('96.8%')).toBeInTheDocument();
    });
  });

  test('handles stats fetch error gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Component should still render the error message on API failure
    await waitFor(() => {
      expect(screen.queryByText(/Failed to load stats/i)).toBeInTheDocument();
    });
  });
});
