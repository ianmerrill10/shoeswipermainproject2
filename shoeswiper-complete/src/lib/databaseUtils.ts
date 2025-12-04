/**
 * Database Utility Functions for Supabase
 * 
 * This module provides TypeScript wrappers for the database stored procedures
 * and RPC functions created in migration 005_supabase_optimizations.sql
 */

import { supabase } from './supabaseClient';
import { DEMO_MODE } from './config';
import {
  Shoe,
  PaginationOptions,
  PaginatedShoesResult,
  ToggleFavoriteResult,
  AddToClosetResult,
  UserDashboardData,
  AnalyticsSummary,
  SearchRankedResult,
  SimilarShoe,
  CreatePriceAlertResult,
} from './types';

// ============================================
// CURSOR-BASED PAGINATION FUNCTIONS
// ============================================

/**
 * Fetch shoes with cursor-based pagination
 * Uses the get_shoes_paginated database function
 */
export async function fetchShoesPaginated(
  options: PaginationOptions = {}
): Promise<PaginatedShoesResult> {
  if (DEMO_MODE) {
    if (import.meta.env.DEV) {
      console.warn('[Demo] Pagination not available in demo mode');
    }
    return { shoes: [], hasMore: false };
  }

  const {
    limit = 20,
    cursor,
    brand,
    gender,
    categorySlug,
    minPrice,
    maxPrice,
    styleTags,
    colorTags,
  } = options;

  const { data, error } = await supabase.rpc('get_shoes_paginated', {
    p_limit: limit,
    p_cursor_created_at: cursor?.createdAt || null,
    p_cursor_id: cursor?.id || null,
    p_brand: brand || null,
    p_gender: gender || null,
    p_category_slug: categorySlug || null,
    p_min_price: minPrice || null,
    p_max_price: maxPrice || null,
    p_style_tags: styleTags || null,
    p_color_tags: colorTags || null,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching paginated shoes:', error);
    }
    throw error;
  }

  const shoes = data as (Shoe & { has_more: boolean })[];
  const hasMore = shoes.length > 0 ? shoes[0].has_more : false;
  
  // Get the last shoe for the next cursor
  const lastShoe = shoes[shoes.length - 1];
  const nextCursor = lastShoe
    ? { createdAt: lastShoe.created_at, id: lastShoe.id }
    : undefined;

  return {
    shoes: shoes.map(({ has_more: _, ...shoe }) => shoe as Shoe),
    hasMore,
    nextCursor,
  };
}

/**
 * Fetch trending shoes with cursor-based pagination
 */
export async function fetchTrendingShoesPaginated(
  options: {
    limit?: number;
    cursorViewCount?: number;
    cursorCreatedAt?: string;
    cursorId?: string;
    brand?: string;
    gender?: 'men' | 'women' | 'unisex' | 'kids';
  } = {}
): Promise<PaginatedShoesResult> {
  if (DEMO_MODE) {
    return { shoes: [], hasMore: false };
  }

  const { data, error } = await supabase.rpc('get_trending_shoes_paginated', {
    p_limit: options.limit || 20,
    p_cursor_view_count: options.cursorViewCount || null,
    p_cursor_created_at: options.cursorCreatedAt || null,
    p_cursor_id: options.cursorId || null,
    p_brand: options.brand || null,
    p_gender: options.gender || null,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching trending shoes:', error);
    }
    throw error;
  }

  const shoes = data as (Shoe & { has_more: boolean })[];
  const hasMore = shoes.length > 0 ? shoes[0].has_more : false;

  return {
    shoes: shoes.map(({ has_more: _, ...shoe }) => shoe as Shoe),
    hasMore,
    nextCursor: shoes[shoes.length - 1]
      ? {
          viewCount: shoes[shoes.length - 1].view_count,
          createdAt: shoes[shoes.length - 1].created_at,
          id: shoes[shoes.length - 1].id,
        }
      : undefined,
  };
}

/**
 * Fetch popular shoes with cursor-based pagination
 */
export async function fetchPopularShoesPaginated(
  options: {
    limit?: number;
    cursorFavoriteCount?: number;
    cursorCreatedAt?: string;
    cursorId?: string;
  } = {}
): Promise<PaginatedShoesResult> {
  if (DEMO_MODE) {
    return { shoes: [], hasMore: false };
  }

  const { data, error } = await supabase.rpc('get_popular_shoes_paginated', {
    p_limit: options.limit || 20,
    p_cursor_favorite_count: options.cursorFavoriteCount || null,
    p_cursor_created_at: options.cursorCreatedAt || null,
    p_cursor_id: options.cursorId || null,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching popular shoes:', error);
    }
    throw error;
  }

  const shoes = data as (Shoe & { has_more: boolean })[];
  const hasMore = shoes.length > 0 ? shoes[0].has_more : false;

  return {
    shoes: shoes.map(({ has_more: _, ...shoe }) => shoe as Shoe),
    hasMore,
    nextCursor: shoes[shoes.length - 1]
      ? {
          favoriteCount: shoes[shoes.length - 1].favorite_count,
          createdAt: shoes[shoes.length - 1].created_at,
          id: shoes[shoes.length - 1].id,
        }
      : undefined,
  };
}

// ============================================
// USER ACTION FUNCTIONS
// ============================================

/**
 * Toggle favorite status for a shoe atomically
 */
export async function toggleFavorite(
  userId: string,
  shoeId: string
): Promise<ToggleFavoriteResult> {
  if (DEMO_MODE) {
    if (import.meta.env.DEV) {
      console.warn('[Demo] Toggle favorite not available in demo mode');
    }
    return { action: 'added', isFavorited: true, newFavoriteCount: 0 };
  }

  const { data, error } = await supabase.rpc('toggle_favorite', {
    p_user_id: userId,
    p_shoe_id: shoeId,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error toggling favorite:', error);
    }
    throw error;
  }

  const result = data[0];
  return {
    action: result.action as 'added' | 'removed',
    isFavorited: result.is_favorited,
    newFavoriteCount: result.new_favorite_count,
  };
}

/**
 * Add a shoe to user's closet with validation
 */
export async function addToCloset(
  userId: string,
  shoeId: string
): Promise<AddToClosetResult> {
  if (DEMO_MODE) {
    if (import.meta.env.DEV) {
      console.warn('[Demo] Add to closet not available in demo mode');
    }
    return { success: true, message: 'Demo mode', closetCount: 0 };
  }

  const { data, error } = await supabase.rpc('add_to_closet', {
    p_user_id: userId,
    p_shoe_id: shoeId,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error adding to closet:', error);
    }
    throw error;
  }

  const result = data[0];
  return {
    success: result.success,
    message: result.message,
    closetCount: result.closet_count,
  };
}

/**
 * Track shoe engagement (view or click)
 */
export async function trackShoeEngagement(
  shoeId: string,
  engagementType: 'view' | 'click',
  userId?: string
): Promise<void> {
  if (DEMO_MODE) {
    if (import.meta.env.DEV) {
      console.warn(`[Demo] Engagement tracked: ${engagementType} for ${shoeId}`);
    }
    return;
  }

  const { error } = await supabase.rpc('track_shoe_engagement', {
    p_shoe_id: shoeId,
    p_user_id: userId || null,
    p_engagement_type: engagementType,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error tracking engagement:', error);
    }
  }
}

// ============================================
// USER DASHBOARD FUNCTIONS
// ============================================

/**
 * Get aggregated dashboard data for a user
 */
export async function getUserDashboard(
  userId: string
): Promise<UserDashboardData> {
  if (DEMO_MODE) {
    return {
      favoritesCount: 0,
      closetCount: 0,
      recentFavorites: [],
      recentCloset: [],
      priceAlertsCount: 0,
    };
  }

  const { data, error } = await supabase.rpc('get_user_dashboard', {
    p_user_id: userId,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching user dashboard:', error);
    }
    throw error;
  }

  const result = data[0];
  return {
    favoritesCount: result.favorites_count,
    closetCount: result.closet_count,
    recentFavorites: result.recent_favorites || [],
    recentCloset: result.recent_closet || [],
    priceAlertsCount: result.price_alerts_count,
  };
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

/**
 * Search shoes with full-text search and relevance ranking
 */
export async function searchShoesRanked(
  query: string,
  options: {
    limit?: number;
    offset?: number;
    brand?: string;
    gender?: 'men' | 'women' | 'unisex' | 'kids';
    minPrice?: number;
    maxPrice?: number;
  } = {}
): Promise<{ results: SearchRankedResult[]; totalCount: number }> {
  if (DEMO_MODE) {
    return { results: [], totalCount: 0 };
  }

  const { data, error } = await supabase.rpc('search_shoes_ranked', {
    p_query: query,
    p_limit: options.limit || 20,
    p_offset: options.offset || 0,
    p_brand: options.brand || null,
    p_gender: options.gender || null,
    p_min_price: options.minPrice || null,
    p_max_price: options.maxPrice || null,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error searching shoes:', error);
    }
    throw error;
  }

  const results = data as SearchRankedResult[];
  const totalCount = results.length > 0 ? results[0].total_count : 0;

  return { results, totalCount };
}

/**
 * Get similar shoes based on style and color tags
 */
export async function getSimilarShoes(
  shoeId: string,
  limit: number = 5
): Promise<SimilarShoe[]> {
  if (DEMO_MODE) {
    return [];
  }

  const { data, error } = await supabase.rpc('get_similar_shoes', {
    p_shoe_id: shoeId,
    p_limit: limit,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching similar shoes:', error);
    }
    throw error;
  }

  return data as SimilarShoe[];
}

// ============================================
// PRICE ALERT FUNCTIONS
// ============================================

/**
 * Create or update a price alert
 */
export async function createPriceAlert(
  userId: string,
  shoeId: string,
  targetPrice: number
): Promise<CreatePriceAlertResult> {
  if (DEMO_MODE) {
    return { success: true, message: 'Demo mode', alertId: null };
  }

  const { data, error } = await supabase.rpc('create_price_alert', {
    p_user_id: userId,
    p_shoe_id: shoeId,
    p_target_price: targetPrice,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error creating price alert:', error);
    }
    throw error;
  }

  const result = data[0];
  return {
    success: result.success,
    message: result.message,
    alertId: result.alert_id,
  };
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

/**
 * Get analytics summary for admin dashboard
 */
export async function getAnalyticsSummary(
  days: number = 30
): Promise<AnalyticsSummary> {
  if (DEMO_MODE) {
    return {
      totalViews: 0,
      totalClicks: 0,
      totalFavorites: 0,
      totalUsers: 0,
      topViewedShoes: [],
      topClickedShoes: [],
      dailyStats: [],
    };
  }

  const { data, error } = await supabase.rpc('get_analytics_summary', {
    p_days: days,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching analytics summary:', error);
    }
    throw error;
  }

  const result = data[0];
  return {
    totalViews: result.total_views,
    totalClicks: result.total_clicks,
    totalFavorites: result.total_favorites,
    totalUsers: result.total_users,
    topViewedShoes: result.top_viewed_shoes || [],
    topClickedShoes: result.top_clicked_shoes || [],
    dailyStats: result.daily_stats || [],
  };
}

/**
 * Batch update prices (for Amazon API integration)
 */
export async function batchUpdatePrices(
  priceUpdates: Array<{ asin: string; price: number }>
): Promise<{ updatedCount: number; failedAsins: string[] }> {
  if (DEMO_MODE) {
    return { updatedCount: 0, failedAsins: [] };
  }

  const { data, error } = await supabase.rpc('batch_update_prices', {
    p_price_updates: priceUpdates,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error batch updating prices:', error);
    }
    throw error;
  }

  const result = data[0];
  return {
    updatedCount: result.updated_count,
    failedAsins: result.failed_asins || [],
  };
}

/**
 * Clean up old analytics data
 */
export async function cleanupOldAnalytics(
  daysToKeep: number = 90
): Promise<{ deletedEvents: number; deletedClicks: number }> {
  if (DEMO_MODE) {
    return { deletedEvents: 0, deletedClicks: 0 };
  }

  const { data, error } = await supabase.rpc('cleanup_old_analytics', {
    p_days_to_keep: daysToKeep,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Error cleaning up analytics:', error);
    }
    throw error;
  }

  const result = data[0];
  return {
    deletedEvents: result.deleted_events,
    deletedClicks: result.deleted_clicks,
  };
}
