import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock supabase
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  },
}));

import { useAuth } from './useAuth';

describe('useAuth', () => {
  const mockUnsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  it('should initialize with no user when not authenticated', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('should load user from localStorage on initialization', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ user: mockUser })
    );

    const { result } = renderHook(() => useAuth());

    // Should have user immediately from localStorage
    expect(result.current.user).toEqual(mockUser);
  });

  it('should set up auth state listener on mount', () => {
    renderHook(() => useAuth());

    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });

  it('should clean up subscription on unmount', () => {
    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should sign in successfully', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let signInResult: { error: unknown };
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'password123');
    });

    expect(signInResult!.error).toBeNull();
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle sign in error', async () => {
    const mockError = { message: 'Invalid credentials' };
    mockSignInWithPassword.mockResolvedValue({ error: mockError });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let signInResult: { error: unknown };
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'wrong');
    });

    expect(signInResult!.error).toEqual(mockError);
  });

  it('should sign up with redirect URL', async () => {
    mockSignUp.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp('new@example.com', 'password123');
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      options: {
        emailRedirectTo: expect.stringContaining('/'),
      },
    });
  });

  it('should sign out successfully', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let signOutResult: { error: unknown };
    await act(async () => {
      signOutResult = await result.current.signOut();
    });

    expect(signOutResult!.error).toBeNull();
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should update user when auth state changes', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const mockSession = { user: mockUser, access_token: 'token' };

    let authStateCallback: (event: string, session: typeof mockSession | null) => void;
    mockOnAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Simulate auth state change
    act(() => {
      authStateCallback('SIGNED_IN', mockSession);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
  });

  it('should handle localStorage parse error gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
  });
});
