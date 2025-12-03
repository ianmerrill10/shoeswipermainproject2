import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Loading state with optional error information
 */
interface LoadingState<E = Error> {
  isLoading: boolean;
  error: E | null;
  startedAt: number | null;
}

/**
 * Return type for the useLoadingState hook
 */
interface UseLoadingStateReturn<T, E = Error> {
  /** Current loading state */
  isLoading: boolean;
  /** Current error (if any) */
  error: E | null;
  /** Data from the last successful operation */
  data: T | null;
  /** Start a loading operation */
  startLoading: () => void;
  /** Complete loading with success */
  setSuccess: (data: T) => void;
  /** Complete loading with error */
  setError: (error: E) => void;
  /** Reset all state */
  reset: () => void;
  /** Execute an async operation with automatic loading state management */
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>;
  /** Duration of the last completed operation in ms (null if not completed) */
  lastDuration: number | null;
}

/**
 * useLoadingState Hook
 * 
 * Provides consistent loading state management for async operations.
 * Handles loading, success, and error states automatically.
 * 
 * @example
 * const { isLoading, error, data, execute } = useLoadingState<User[]>();
 * 
 * const fetchUsers = async () => {
 *   const users = await execute(async () => {
 *     const response = await fetch('/api/users');
 *     return response.json();
 *   });
 * };
 * 
 * // In JSX:
 * {isLoading && <Spinner />}
 * {error && <ErrorMessage error={error} />}
 * {data && <UserList users={data} />}
 */
export const useLoadingState = <T, E = Error>(): UseLoadingStateReturn<T, E> => {
  const [state, setState] = useState<LoadingState<E>>({
    isLoading: false,
    error: null,
    startedAt: null,
  });
  
  const [data, setData] = useState<T | null>(null);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const mountedRef = useRef(true);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const startLoading = useCallback(() => {
    if (!mountedRef.current) return;
    setState({
      isLoading: true,
      error: null,
      startedAt: Date.now(),
    });
  }, []);

  const setSuccess = useCallback((newData: T) => {
    if (!mountedRef.current) return;
    const duration = state.startedAt ? Date.now() - state.startedAt : null;
    setLastDuration(duration);
    setData(newData);
    setState({
      isLoading: false,
      error: null,
      startedAt: null,
    });
  }, [state.startedAt]);

  const setError = useCallback((error: E) => {
    if (!mountedRef.current) return;
    const duration = state.startedAt ? Date.now() - state.startedAt : null;
    setLastDuration(duration);
    setState({
      isLoading: false,
      error,
      startedAt: null,
    });
  }, [state.startedAt]);

  const reset = useCallback(() => {
    if (!mountedRef.current) return;
    setState({
      isLoading: false,
      error: null,
      startedAt: null,
    });
    setData(null);
    setLastDuration(null);
  }, []);

  const execute = useCallback(async (
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    startLoading();
    
    try {
      const result = await asyncFn();
      if (mountedRef.current) {
        setSuccess(result);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err as E);
      }
      return null;
    }
  }, [startLoading, setSuccess, setError]);

  return {
    isLoading: state.isLoading,
    error: state.error,
    data,
    startLoading,
    setSuccess,
    setError,
    reset,
    execute,
    lastDuration,
  };
};

export default useLoadingState;
