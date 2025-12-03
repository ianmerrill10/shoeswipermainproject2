/**
 * React Query hooks for blog content management.
 * Provides data fetching, caching, and mutation hooks for blog posts,
 * search, subscriptions, and analytics tracking.
 * 
 * Uses React Query for automatic caching with configurable stale times.
 * 
 * @example
 * // Fetch paginated blog posts
 * const { data: posts, isLoading } = useBlogPosts('sneakers', { page: 1 });
 * 
 * // Fetch single post by slug
 * const { data: post } = useBlogPost('sneakers', 'best-running-shoes-2024');
 * 
 * // Subscribe to blog newsletter
 * const subscribeMutation = useSubscribeToBlog('sneakers');
 * subscribeMutation.mutate('user@example.com');
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBlogPosts,
  fetchBlogPost,
  fetchRelatedPosts,
  fetchFeaturedPosts,
  fetchLatestAcrossBlogs,
  searchBlogPosts,
  recordPostView,
  recordAffiliateClick,
  subscribeToBlog,
} from '../lib/blogApi';
import { BlogType, BlogSearchParams } from '../lib/blogTypes';

// Query key factory
const blogKeys = {
  all: ['blog'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (blogType: BlogType, params: BlogSearchParams) =>
    [...blogKeys.lists(), blogType, params] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (blogType: BlogType, slug: string) =>
    [...blogKeys.details(), blogType, slug] as const,
  related: (blogType: BlogType, postId: string) =>
    [...blogKeys.all, 'related', blogType, postId] as const,
  featured: (blogType: BlogType) =>
    [...blogKeys.all, 'featured', blogType] as const,
  latest: () => [...blogKeys.all, 'latest'] as const,
  search: (blogType: BlogType, query: string) =>
    [...blogKeys.all, 'search', blogType, query] as const,
};

/**
 * Hook to fetch paginated blog posts
 */
export function useBlogPosts(blogType: BlogType, params: BlogSearchParams = {}) {
  return useQuery({
    queryKey: blogKeys.list(blogType, params),
    queryFn: () => fetchBlogPosts(blogType, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch a single blog post
 */
export function useBlogPost(blogType: BlogType, slug: string) {
  return useQuery({
    queryKey: blogKeys.detail(blogType, slug),
    queryFn: () => fetchBlogPost(blogType, slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!slug,
  });
}

/**
 * Hook to fetch related posts
 */
export function useRelatedPosts(
  blogType: BlogType,
  postId: string,
  limit: number = 3
) {
  return useQuery({
    queryKey: blogKeys.related(blogType, postId),
    queryFn: () => fetchRelatedPosts(blogType, postId, limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!postId,
  });
}

/**
 * Hook to fetch featured posts
 */
export function useFeaturedPosts(blogType: BlogType, limit: number = 5) {
  return useQuery({
    queryKey: blogKeys.featured(blogType),
    queryFn: () => fetchFeaturedPosts(blogType, limit),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch latest posts across all blogs
 */
export function useLatestPosts(limit: number = 10) {
  return useQuery({
    queryKey: blogKeys.latest(),
    queryFn: () => fetchLatestAcrossBlogs(limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to search blog posts
 */
export function useBlogSearch(
  blogType: BlogType,
  query: string,
  page: number = 1
) {
  return useQuery({
    queryKey: blogKeys.search(blogType, query),
    queryFn: () => searchBlogPosts(blogType, query, page),
    staleTime: 2 * 60 * 1000, // 2 minutes for search
    enabled: query.length >= 2,
  });
}

/**
 * Hook to record post view
 */
export function useRecordView() {
  return useMutation({
    mutationFn: ({ blogType, postId }: { blogType: BlogType; postId: string }) =>
      recordPostView(blogType, postId),
  });
}

/**
 * Hook to record affiliate click
 */
export function useRecordAffiliateClick() {
  return useMutation({
    mutationFn: ({
      blogType,
      postId,
      productId,
    }: {
      blogType: BlogType;
      postId: string;
      productId: string;
    }) => recordAffiliateClick(blogType, postId, productId),
  });
}

/**
 * Hook to subscribe to blog newsletter
 */
export function useSubscribeToBlog(blogType: BlogType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => subscribeToBlog(blogType, email),
    onSuccess: () => {
      // Could invalidate subscription status query here
      queryClient.invalidateQueries({ queryKey: ['subscription', blogType] });
    },
  });
}

/**
 * Hook for infinite scroll blog posts
 */
export function useInfiniteBlogPosts(
  blogType: BlogType,
  params: Omit<BlogSearchParams, 'page'> = {}
) {
  return useQuery({
    queryKey: blogKeys.list(blogType, { ...params, page: 1 }),
    queryFn: () => fetchBlogPosts(blogType, { ...params, page: 1 }),
    staleTime: 5 * 60 * 1000,
  });
}

// Export query keys for external use
export { blogKeys };
