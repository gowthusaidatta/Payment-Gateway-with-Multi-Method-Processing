import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Login from './Login';

jest.mock('axios');

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<Login setIsAuthenticated={() => {}} />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('displays error on failed login', async () => {
    const user = userEvent.setup();
    axios.post.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<Login setIsAuthenticated={() => {}} />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to login/i)).toBeInTheDocument();
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
    const mockNavigate = jest.fn();
    
    render(<Login setIsAuthenticated={mockSetAuth} />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'test@123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(localStorage.getItem('apiKey')).toBe('key_test_abc123');
      expect(localStorage.getItem('apiSecret')).toBe('secret_test_xyz789');
    });
  });

  test('validates email format', async () => {
    const user = userEvent.setup();
    render(<Login setIsAuthenticated={() => {}} />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'invalidemail');
    await user.click(loginButton);

    expect(axios.post).not.toHaveBeenCalled();
  });
});
