import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Transactions from '../pages/Transactions';
import axios from 'axios';

jest.mock('axios');

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

  test('displays create transaction form', () => {
    axios.get.mockResolvedValue({ data: [] });
    render(
      <BrowserRouter>
        <Transactions />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/order id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByText(/create transaction/i)).toBeInTheDocument();
  });

  test('submits transaction on form submit', async () => {
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: { id: 3, status: 'success' } });
    
    render(
      <BrowserRouter>
        <Transactions />
      </BrowserRouter>
    );
    
    const orderInput = screen.getByLabelText(/order id/i);
    const amountInput = screen.getByLabelText(/amount/i);
    const submitBtn = screen.getByText(/create transaction/i);
    
    fireEvent.change(orderInput, { target: { value: 'ORD003' } });
    fireEvent.change(amountInput, { target: { value: '100000' } });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
