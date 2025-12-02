import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shoe } from '../lib/types';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
const ADMIN_EMAIL = 'dadsellsgadgets@gmail.com';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.email === ADMIN_EMAIL);
    };
    checkUser();
  }, []);

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

  const logAction = async (action: string, table: string, id: string | undefined, details: any) => {
    await supabase.from('audit_logs').insert({
      admin_email: ADMIN_EMAIL,
      action,
      target_table: table,
      target_id: id,
      details
    });
  };

  const getProducts = async () => {
    const { data, error } = await supabase
      .from('shoes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Shoe[];
  };

  const saveProduct = async (product: Partial<Shoe>) => {
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

  const deleteProduct = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('shoes').delete().eq('id', id);
      if (error) throw error;
      await logAction('DELETE', 'shoes', id, {});
    } finally {
      setLoading(false);
    }
  };

  const getAnalytics = async () => {
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
