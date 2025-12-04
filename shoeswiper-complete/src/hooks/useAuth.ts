import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

/**
 * Authentication hook for user sign-in, sign-up, and session management.
 * Wraps Supabase Auth with React state management.
 * 
 * @returns Object containing auth state and methods
 * @example
 * const { user, signIn, signOut, isAuthenticated } = useAuth();
 * 
 * // Sign in with email/password
 * await signIn('user@example.com', 'password');
 * 
 * // Sign in with Google OAuth
 * await signInWithGoogle();
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Signs in a user with email and password.
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to auth data
   * @throws Error if sign in fails
   */
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  /**
   * Creates a new user account.
   * @param email - User's email address
   * @param password - User's password
   * @param username - Optional username for display
   * @returns Promise resolving to auth data
   * @throws Error if sign up fails
   */
  const signUp = async (email: string, password: string, username?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    if (error) throw error;
    return data;
  };

  /**
   * Initiates Google OAuth sign in flow.
   * Redirects to Google for authentication.
   * @returns Promise resolving to OAuth data
   * @throws Error if OAuth fails
   */
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
    return data;
  };

  /**
   * Signs out the current user.
   * Clears session and user state.
   * @throws Error if sign out fails
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  };
};
