// Blog API Service - ShoeSwiper
// ================================

import { BlogPost, BlogListResponse, BlogSearchParams, BlogType } from './blogTypes';

const BLOG_API_BASE = import.meta.env.VITE_BLOG_API_URL || '/api/blog';

/**
 * Fetch a list of blog posts with optional filtering
 */
export async function fetchBlogPosts(
  blogType: BlogType,
  params: BlogSearchParams = {}
): Promise<BlogListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.query) searchParams.set('q', params.query);
  if (params.category) searchParams.set('category', params.category);
  if (params.tag) searchParams.set('tag', params.tag);
  if (params.author) searchParams.set('author', params.author);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const response = await fetch(
    `${BLOG_API_BASE}/${blogType}/posts?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch blog posts: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a single blog post by slug
 */
export async function fetchBlogPost(
  blogType: BlogType,
  slug: string
): Promise<BlogPost> {
  const response = await fetch(`${BLOG_API_BASE}/${blogType}/posts/${slug}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Blog post not found');
    }
    throw new Error(`Failed to fetch blog post: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch related posts for a given post
 */
export async function fetchRelatedPosts(
  blogType: BlogType,
  postId: string,
  limit: number = 3
): Promise<BlogPost[]> {
  const response = await fetch(
    `${BLOG_API_BASE}/${blogType}/posts/${postId}/related?limit=${limit}`
  );

  if (!response.ok) {
    return [];
  }

  return response.json();
}

/**
 * Fetch posts by category
 */
export async function fetchPostsByCategory(
  blogType: BlogType,
  categorySlug: string,
  page: number = 1,
  pageSize: number = 10
): Promise<BlogListResponse> {
  return fetchBlogPosts(blogType, {
    category: categorySlug,
    page,
    pageSize,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });
}

/**
 * Fetch posts by tag
 */
export async function fetchPostsByTag(
  blogType: BlogType,
  tag: string,
  page: number = 1,
  pageSize: number = 10
): Promise<BlogListResponse> {
  return fetchBlogPosts(blogType, {
    tag,
    page,
    pageSize,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });
}

/**
 * Search blog posts
 */
export async function searchBlogPosts(
  blogType: BlogType,
  query: string,
  page: number = 1,
  pageSize: number = 10
): Promise<BlogListResponse> {
  return fetchBlogPosts(blogType, {
    query,
    page,
    pageSize,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });
}

/**
 * Fetch featured posts (most viewed or pinned)
 */
export async function fetchFeaturedPosts(
  blogType: BlogType,
  limit: number = 5
): Promise<BlogPost[]> {
  const response = await fetch(
    `${BLOG_API_BASE}/${blogType}/posts/featured?limit=${limit}`
  );

  if (!response.ok) {
    return [];
  }

  return response.json();
}

/**
 * Fetch latest posts across all blogs
 */
export async function fetchLatestAcrossBlogs(
  limit: number = 10
): Promise<{ blogType: BlogType; post: BlogPost }[]> {
  const response = await fetch(`${BLOG_API_BASE}/latest?limit=${limit}`);

  if (!response.ok) {
    return [];
  }

  return response.json();
}

/**
 * Record a post view for analytics
 */
export async function recordPostView(
  blogType: BlogType,
  postId: string
): Promise<void> {
  try {
    await fetch(`${BLOG_API_BASE}/${blogType}/posts/${postId}/view`, {
      method: 'POST',
    });
  } catch {
    // Silently fail - analytics shouldn't break the page
  }
}

/**
 * Record an affiliate click for tracking
 */
export async function recordAffiliateClick(
  blogType: BlogType,
  postId: string,
  productId: string
): Promise<void> {
  try {
    await fetch(`${BLOG_API_BASE}/${blogType}/affiliate-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, productId }),
    });
  } catch {
    // Silently fail
  }
}

/**
 * Subscribe to blog newsletter
 */
export async function subscribeToBlog(
  blogType: BlogType,
  email: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${BLOG_API_BASE}/${blogType}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return response.json();
}

/**
 * Generate static paths for SSG
 */
export async function getAllPostSlugs(
  blogType: BlogType
): Promise<string[]> {
  const response = await fetch(`${BLOG_API_BASE}/${blogType}/slugs`);

  if (!response.ok) {
    return [];
  }

  return response.json();
}
