import { useState, useEffect } from 'react';
import { Shoe } from '../lib/types';
import { DEMO_MODE, MOCK_SHOES } from '../lib/mockData';
import { supabase, ADMIN_EMAIL } from '../lib/supabaseClient';
import {
  getAmazonProductsByAsin,
  amazonProductToShoe,
  ensureAffiliateTag,
} from '../lib/amazonApi';
import { AMAZON_API_CONFIG } from '../lib/config';

/**
 * Admin dashboard hook for product management, user oversight, and analytics.
 * Provides CRUD operations for products and access to analytics data.
 * Admin access is restricted to ADMIN_EMAIL (dadsellsgadgets@gmail.com).
 * 
 * When Amazon API is enabled, provides methods to import products from Amazon.
 * 
 * @returns Object containing admin state and methods
 * @example
 * const { isAdmin, getProducts, saveProduct, deleteProduct, getAnalytics, importFromAmazon } = useAdmin();
 * 
 * // Check admin status before rendering admin UI
 * if (!isAdmin) return <AccessDenied />;
 * 
 * // Fetch all products
 * const products = await getProducts();
 * 
 * // Import product from Amazon by ASIN
 * await importFromAmazon('B07QXLFLXT');
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
    return ensureAffiliateTag(url);
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
        clicks: [],
        amazonApiEnabled: AMAZON_API_CONFIG.enabled,
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
      clicks: clicks || [],
      amazonApiEnabled: AMAZON_API_CONFIG.enabled,
    };
  };

  /**
   * Import a product from Amazon by ASIN.
   * Fetches product data from Amazon PA-API and creates a new product in the database.
   * Only available when Amazon API is enabled.
   * 
   * @param asin - Amazon Standard Identification Number
   * @param additionalData - Additional shoe data (style_tags, gender, etc.)
   * @returns The created product or null if import failed
   */
  const importFromAmazon = async (
    asin: string,
    additionalData?: Partial<Shoe>
  ): Promise<Shoe | null> => {
    if (!AMAZON_API_CONFIG.enabled) {
      console.error('[useAdmin] Amazon API not enabled');
      return null;
    }

    // Validate ASIN format
    if (!/^[A-Z0-9]{10}$/i.test(asin)) {
      console.error('[useAdmin] Invalid ASIN format:', asin);
      return null;
    }

    setLoading(true);
    try {
      const products = await getAmazonProductsByAsin([asin]);

      if (!products || products.length === 0) {
        console.error('[useAdmin] Product not found on Amazon:', asin);
        return null;
      }

      const amazonProduct = products[0];
      const shoe = amazonProductToShoe(amazonProduct, additionalData);

      // Save to database
      const saved = await saveProduct({
        ...shoe,
        style_tags: additionalData?.style_tags || [],
        color_tags: additionalData?.color_tags || [],
        gender: additionalData?.gender,
        is_featured: additionalData?.is_featured || false,
      });

      if (saved && saved.length > 0) {
        await logAction('IMPORT_FROM_AMAZON', 'shoes', saved[0].id, {
          asin,
          amazon_data: amazonProduct,
        });
        return saved[0] as Shoe;
      }

      return null;
    } catch (err) {
      console.error('[useAdmin] Import from Amazon failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh product data from Amazon for existing products.
   * Updates price, availability, and other Amazon data.
   * 
   * @param productIds - Array of product IDs to refresh
   * @returns Number of products successfully updated
   */
  const refreshAmazonData = async (productIds: string[]): Promise<number> => {
    if (!AMAZON_API_CONFIG.enabled) {
      console.error('[useAdmin] Amazon API not enabled');
      return 0;
    }

    setLoading(true);
    let updatedCount = 0;

    try {
      // Get existing products
      const { data: existingProducts, error } = await supabase
        .from('shoes')
        .select('*')
        .in('id', productIds);

      if (error || !existingProducts) {
        throw error || new Error('No products found');
      }

      // Get ASINs
      const asins = existingProducts
        .map((p) => p.amazon_asin)
        .filter((asin): asin is string => !!asin);

      if (asins.length === 0) {
        return 0;
      }

      // Fetch fresh Amazon data
      const amazonProducts = await getAmazonProductsByAsin(asins);

      if (!amazonProducts) {
        return 0;
      }

      // Update each product
      const productMap = new Map(amazonProducts.map((p) => [p.asin, p]));

      for (const product of existingProducts) {
        if (!product.amazon_asin) continue;

        const amazonData = productMap.get(product.amazon_asin);
        if (!amazonData) continue;

        const updatedShoe = amazonProductToShoe(amazonData, product as Shoe);

        const { error: updateError } = await supabase
          .from('shoes')
          .update({
            price: updatedShoe.price,
            image_url: updatedShoe.image_url,
            amazon_url: updatedShoe.amazon_url,
            stock_status: updatedShoe.stock_status,
            price_last_updated: updatedShoe.price_last_updated,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (!updateError) {
          updatedCount++;
        }
      }

      await logAction('REFRESH_AMAZON_DATA', 'shoes', undefined, {
        productIds,
        updatedCount,
      });

      return updatedCount;
    } catch (err) {
      console.error('[useAdmin] Refresh Amazon data failed:', err);
      return updatedCount;
    } finally {
      setLoading(false);
    }
  };

  return {
    isAdmin,
    loading,
    getProducts,
    saveProduct,
    deleteProduct,
    getAnalytics,
    importFromAmazon,
    refreshAmazonData,
    isAmazonEnabled: AMAZON_API_CONFIG.enabled,
  };
};
