import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';
import * as AuthContext from '../../src/context/AuthContext';

describe('ProtectedRoute Role-Based Access Control', () => {
  it('redirects unauthenticated users to /login', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      session: null,
      user: null,
      profile: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>Admin Secret</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects a student away from admin-only routes', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      session: null,
      user: { id: 'u1' } as never,
      profile: {
        id: 'u1',
        full_name: 'Student User',
        email: 's@ruet.ac.bd',
        role: 'student',
        created_at: '',
        updated_at: '',
      },
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/student/dashboard" element={<div>Student Dashboard</div>} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>Admin Secret</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
  });
});
