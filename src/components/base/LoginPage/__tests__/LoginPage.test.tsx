import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { toast } from 'react-hot-toast';

// Mock the dependencies
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useNavigate from react-router-dom
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any;
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('LoginPage Component', () => {
  const mockOnLogin = vi.fn();
  const defaultProps = {
    title: 'Test Login',
    onLogin: mockOnLogin,
    onSuccessRedirect: '/dashboard',
    onVerifyRedirect: '/verify',
    registerPath: '/register',
    forgotPasswordPath: '/forgot',
    switchViewPath: '/company',
    switchViewLabel: 'Switch to Company',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <LoginPage {...defaultProps} />
      </BrowserRouter>
    );
  };

  it('should render all input fields and the submit button', () => {
    renderComponent();
    expect(screen.getByLabelText(/emailLabel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/passwordLabel/i)).toBeInTheDocument();
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();
  });

  it('should show error toast if validation fails', async () => {
    renderComponent();
    const submitBtn = screen.getByTestId('login-submit');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Érvénytelen email cím formátum');
    });
  });

  it('should call onLogin and navigate on success', async () => {
    mockOnLogin.mockResolvedValue({ success: true });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/emailLabel/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/passwordLabel/i), { target: { value: 'Password123!' } });
    
    const submitBtn = screen.getByTestId('login-submit');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        rememberMe: false
      });
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show error toast if login fails', async () => {
    mockOnLogin.mockResolvedValue({ success: false, error: 'Wrong password' });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/emailLabel/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/passwordLabel/i), { target: { value: 'Password123!' } });
    
    const submitBtn = screen.getByTestId('login-submit');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Wrong password');
    });
  });
});
