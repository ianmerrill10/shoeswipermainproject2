import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

const ALLOWED_EMAILS = ['ianmerrill10@gmail.com'];

const isEmailAllowed = (email: string | undefined): boolean => {
  return email ? ALLOWED_EMAILS.includes(email) : false;
};

export const useAuthGuard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAllowed(isEmailAllowed(currentUser?.email));
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
  }, []);

  return { user, loading, isAllowed };
};
