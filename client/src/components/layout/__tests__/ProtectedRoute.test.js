import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '../../../context/AuthContext';

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', async () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/auth/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute roles={['customer']}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  it('renders children for authorized users', () => {
    useAuth.mockReturnValue({
      user: { role: 'customer' },
      loading: false,
      isAuthenticated: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute roles={['customer']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
