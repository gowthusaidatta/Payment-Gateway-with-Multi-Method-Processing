import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Transactions from '../pages/Transactions';
import axios from 'axios';

describe('Transactions Component', () => {
  const mockTransactions = [
    { id: 1, order_id: 'ORD001', amount: 50000, method: 'upi', status: 'success', created_at: '2024-01-01' },
    { id: 2, order_id: 'ORD002', amount: 75000, method: 'card', status: 'pending', created_at: '2024-01-02' },
  ];

  beforeEach(() => {
    localStorage.setItem('apiKey', 'test_key');
    localStorage.setItem('apiSecret', 'test_secret');
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders transactions table', async () => {
    axios.get.mockResolvedValue({ data: mockTransactions });
    render(
      <BrowserRouter>
        <Transactions />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/ORD001/i)).toBeInTheDocument();
      expect(screen.getByText(/ORD002/i)).toBeInTheDocument();
    });
  });

  test('displays create transaction form', async () => {
    axios.get.mockResolvedValue({ data: [] });
    render(
      <BrowserRouter>
        <Transactions />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Create Transaction/i)).toBeInTheDocument();
      expect(screen.getByText(/Amount \(paise\)/i)).toBeInTheDocument();
    });
  });

  test('submits transaction on form submit', async () => {
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: { id: 3, status: 'success' } });
    
    render(
      <BrowserRouter>
        <Transactions />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Create Transaction/i)).toBeInTheDocument();
    });
    
    const submitBtn = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
