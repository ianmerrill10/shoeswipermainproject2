import { useEffect, useState } from 'react';
import { DEMO_MODE, ALLOWED_EMAILS } from '../lib/config';

// Only import Supabase types/client if not in demo mode
type User = {
  id: string;
  email?: string;
};

/**
 * Checks if an email is in the allowed list.
 * @param email - Email to check
 * @returns True if email is allowed
 */
const isEmailAllowed = (email: string | undefined): boolean => {
  return email ? ALLOWED_EMAILS.includes(email) : false;
};

/**
 * Protected route guard hook that checks if user's email is in the allowed list.
 * In DEMO_MODE, authentication is bypassed and all users are allowed.
 * 
 * @returns Object containing user, loading state, and allowed status
 * @example
 * const { user, loading, isAllowed } = useAuthGuard();
 * 
 * if (loading) return <LoadingSpinner />;
 * if (!isAllowed) return <AccessDenied />;
 * 
 * return <ProtectedContent />;
 */
export const useAuthGuard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // DEMO MODE: Bypass authentication
    if (DEMO_MODE) {
      setUser({ id: 'demo-user', email: 'demo@shoeswiper.com' });
      setIsAllowed(true);
      setLoading(false);
      if (import.meta.env.DEV) console.warn('[Demo] Authentication bypassed - Demo mode active');
      return;
    }

    // PRODUCTION MODE: Use Supabase auth
    const initAuth = async () => {
      const { supabase } = await import('../lib/supabaseClient');

      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsAllowed(isEmailAllowed(currentUser?.email));
        setLoading(false);
      }).catch((error: unknown) => {
        console.error('[AuthGuard] Error getting session:', error);
        setLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsAllowed(isEmailAllowed(currentUser?.email));
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, []);

  return { user, loading, isAllowed };
};
