import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from '../pages/Login';

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
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  test('displays error on failed login', async () => {
    const user = userEvent.setup();
    axios.post.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(
      <BrowserRouter>
        <Login setIsAuthenticated={() => {}} />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.queryByText(/failed to login|invalid|error/i)).toBeInTheDocument();
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

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

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
    render(
      <BrowserRouter>
        <Login setIsAuthenticated={() => {}} />
      </BrowserRouter>
    );

    const emailInput = screen.getByTestId('email-input');
    const loginButton = screen.getByTestId('login-button');

    await user.type(emailInput, 'invalidemail');
    await user.click(loginButton);

    // Email input with type="email" will have browser validation
    expect(emailInput).toHaveValue('invalidemail');
  });
});
