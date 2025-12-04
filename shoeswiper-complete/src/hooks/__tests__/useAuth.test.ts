import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock Supabase client
const mockUser = { id: 'test-user-id', email: 'test@example.com' };
const mockSession = { user: mockUser, access_token: 'test-token' };
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
        mockOnAuthStateChange(callback);
        return {
          data: {
            subscription: {
              unsubscribe: mockUnsubscribe,
            },
          },
        };
      },
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      signOut: () => mockSignOut(),
    },
  },
}));

// Mock window.location
const originalLocation = window.location;

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });
    mockSignUp.mockResolvedValue({ data: {}, error: null });
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });
    mockSignOut.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('should set user and session from initial session', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should set isAuthenticated to false when no user', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle auth state changes', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();

    // Simulate auth state change
    const callback = mockOnAuthStateChange.mock.calls[0][0];
    act(() => {
      callback('SIGNED_IN', mockSession);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
  });

  it('should unsubscribe from auth changes on unmount', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { unmount } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  describe('signIn', () => {
    it('should sign in user with email and password', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signInResult = await act(async () => {
        return result.current.signIn('test@example.com', 'password123');
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(signInResult).toBeDefined();
    });

    it('should throw error when sign in fails', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: new Error('Invalid credentials'),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => result.current.signIn('test@example.com', 'wrong'))
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should sign up user with email, password, and username', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSignUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', 'testuser');
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { username: 'testuser' },
        },
      });
    });

    it('should sign up user without username', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSignUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123');
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { username: undefined },
        },
      });
    });

    it('should throw error when sign up fails', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSignUp.mockResolvedValue({
        data: null,
        error: new Error('Email already exists'),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => result.current.signUp('test@example.com', 'password123'))
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('signInWithGoogle', () => {
    it('should initiate Google OAuth sign in', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSignInWithOAuth.mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth' },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/'),
        },
      });
    });

    it('should throw error when Google OAuth fails', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSignInWithOAuth.mockResolvedValue({
        data: null,
        error: new Error('OAuth failed'),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => result.current.signInWithGoogle())
      ).rejects.toThrow('OAuth failed');
    });
  });

  describe('signOut', () => {
    it('should sign out the user', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockSignOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should throw error when sign out fails', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockSignOut.mockResolvedValue({ error: new Error('Sign out failed') });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => result.current.signOut())
      ).rejects.toThrow('Sign out failed');
    });
  });
});
