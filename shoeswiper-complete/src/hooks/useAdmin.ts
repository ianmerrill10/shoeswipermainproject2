import { useState, useEffect } from 'react';
import { Shoe } from '../lib/types';
import { DEMO_MODE, MOCK_SHOES } from '../lib/mockData';
import { supabase, ADMIN_EMAIL } from '../lib/supabaseClient';

/**
 * Admin dashboard hook for product management, user oversight, and analytics.
 * Provides CRUD operations for products and access to analytics data.
 * Admin access is restricted to ADMIN_EMAIL (dadsellsgadgets@gmail.com).
 * 
 * @returns Object containing admin state and methods
 * @example
 * const { isAdmin, getProducts, saveProduct, deleteProduct, getAnalytics } = useAdmin();
 * 
 * // Check admin status before rendering admin UI
 * if (!isAdmin) return <AccessDenied />;
 * 
 * // Fetch all products
 * const products = await getProducts();
 */
export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // DEMO MODE: Always admin
    if (DEMO_MODE) {
      setIsAdmin(true);
      return;
    }

    // PRODUCTION MODE: Check user
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.email === ADMIN_EMAIL);
    };
    checkUser();
  }, []);

  /**
   * Formats an Amazon URL to include the affiliate tag.
   * All Amazon links MUST include `?tag=shoeswiper-20` for affiliate tracking.
   * @param url - The Amazon URL to format
   * @returns The URL with affiliate tag appended
   */
  const formatAmazonUrl = (url: string) => {
    if (!url.includes('amazon.com')) return url;
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('tag', 'shoeswiper-20');
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  };

  /**
   * Logs an admin action to the audit_logs table for accountability.
   * In DEMO_MODE, logs to console instead.
   * @param action - The action performed (CREATE, UPDATE, DELETE)
   * @param table - The target table name
   * @param id - The ID of the affected record
   * @param details - Additional details about the action
   */
  const logAction = async (action: string, table: string, id: string | undefined, details: Record<string, unknown>) => {
    // DEMO MODE: Just log to console
    if (DEMO_MODE) {
      if (import.meta.env.DEV) console.warn(`[Demo] Audit: ${action} on ${table}`, details);
      return;
    }

    // PRODUCTION MODE: Log to Supabase
    await supabase.from('audit_logs').insert({
      admin_email: ADMIN_EMAIL,
      action,
      target_table: table,
      target_id: id,
      details
    });
  };

  /**
   * Fetches all products from the database.
   * In DEMO_MODE, returns mock data.
   * @returns Promise resolving to array of Shoe objects
   */
  const getProducts = async () => {
    // DEMO MODE: Return mock data
    if (DEMO_MODE) {
      return MOCK_SHOES;
    }

    // PRODUCTION MODE: Use Supabase
    const { data, error } = await supabase
      .from('shoes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Shoe[];
  };

  /**
   * Creates or updates a product in the database.
   * Automatically formats Amazon URLs with affiliate tag.
   * @param product - Partial Shoe object (include id for update)
   * @returns Promise resolving to the saved product(s)
   */
  const saveProduct = async (product: Partial<Shoe>) => {
    // DEMO MODE: Just log
    if (DEMO_MODE) {
      if (import.meta.env.DEV) console.warn('[Demo] Save product:', product);
      return [product];
    }

    // PRODUCTION MODE: Use Supabase
    setLoading(true);
    try {
      const cleanProduct = {
        ...product,
        amazon_url: formatAmazonUrl(product.amazon_url || ''),
      };

      let result;
      if (product.id) {
        result = await supabase.from('shoes').update(cleanProduct).eq('id', product.id).select();
        await logAction('UPDATE', 'shoes', product.id, cleanProduct);
      } else {
        result = await supabase.from('shoes').insert(cleanProduct).select();
        await logAction('CREATE', 'shoes', result.data?.[0]?.id, cleanProduct);
      }

      if (result.error) throw result.error;
      return result.data;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes a product from the database.
   * Action is logged to audit_logs.
   * @param id - The ID of the product to delete
   */
  const deleteProduct = async (id: string) => {
    // DEMO MODE: Just log
    if (DEMO_MODE) {
      if (import.meta.env.DEV) console.warn('[Demo] Delete product:', id);
      return;
    }

    // PRODUCTION MODE: Use Supabase
    setLoading(true);
    try {
      const { error } = await supabase.from('shoes').delete().eq('id', id);
      if (error) throw error;
      await logAction('DELETE', 'shoes', id, {});
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches analytics data for the admin dashboard.
   * Includes user counts, product counts, and recent affiliate clicks.
   * @returns Promise resolving to analytics data object
   */
  const getAnalytics = async () => {
    // DEMO MODE: Return mock analytics
    if (DEMO_MODE) {
      return {
        totalUsers: 1,
        totalProducts: MOCK_SHOES.length,
        clicks: []
      };
    }

    // PRODUCTION MODE: Use Supabase
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: productCount } = await supabase.from('shoes').select('*', { count: 'exact', head: true });

    const { data: clicks } = await supabase
      .from('affiliate_clicks')
      .select('clicked_at')
      .gte('clicked_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    return {
      totalUsers: userCount || 0,
      totalProducts: productCount || 0,
      clicks: clicks || []
    };
  };

  return {
    isAdmin,
    loading,
    getProducts,
    saveProduct,
    deleteProduct,
    getAnalytics
  };
};
