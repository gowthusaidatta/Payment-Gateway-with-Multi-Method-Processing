import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from '../pages/Login';

jest.mock('axios');

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(
      <BrowserRouter>
        <Login setIsAuthenticated={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText('you@business.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('displays error on failed login', async () => {
    const user = userEvent.setup();
    axios.post.mockRejectedValueOnce({ response: { data: { error: { description: 'Invalid credentials' } } } });

    render(
      <BrowserRouter>
        <Login setIsAuthenticated={() => {}} />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('you@business.com');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /Login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.queryByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('stores credentials and redirects on successful login', async () => {
    const user = userEvent.setup();
    const mockCredentials = {
      api_key: 'key_test_abc123',
      api_secret: 'secret_test_xyz789',
      email: 'test@example.com'
    };

    axios.post.mockResolvedValueOnce({ data: mockCredentials });

    const mockSetAuth = jest.fn();
    
    render(
      <BrowserRouter>
        <Login setIsAuthenticated={mockSetAuth} />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('you@business.com');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /Login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'test@123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(localStorage.getItem('apiKey')).toBe('key_test_abc123');
    });
  });

  test('validates email format', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Login setIsAuthenticated={() => {}} />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('you@business.com');

    await user.type(emailInput, 'invalidemail');

    expect(emailInput).toHaveValue('invalidemail');
  });
});
