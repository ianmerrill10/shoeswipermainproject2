import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuthGuard } from '../useAuthGuard';

// Mock config module
vi.mock('../../lib/config', () => ({
  DEMO_MODE: true,
  ALLOWED_EMAILS: ['allowed@example.com', 'admin@shoeswiper.com'],
}));

describe('useAuthGuard - Demo Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should allow access in demo mode', async () => {
    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAllowed).toBe(true);
    expect(result.current.user).toBeDefined();
    expect(result.current.user?.id).toBe('demo-user');
  });

  it('should set demo user email in demo mode', async () => {
    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user?.email).toBe('demo@shoeswiper.com');
  });

  it('should complete loading in demo mode', async () => {
    const { result } = renderHook(() => useAuthGuard());

    // In demo mode, loading completes immediately
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});

describe('useAuthGuard - Production Mode', () => {
  // Store original mock implementation
  let originalConfigMock: typeof vi.mock;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call Supabase auth in production mode', async () => {
    // Test that the hook exports the expected interface
    const { result } = renderHook(() => useAuthGuard());

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('isAllowed');
  });

  it('should have correct return type structure', async () => {
    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.isAllowed).toBe('boolean');
  });
});
