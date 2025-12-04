import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  fetchBlogPosts,
  fetchBlogPost,
  fetchRelatedPosts,
  fetchPostsByCategory,
  fetchPostsByTag,
  searchBlogPosts,
  fetchFeaturedPosts,
  fetchLatestAcrossBlogs,
  recordPostView,
  recordAffiliateClick,
  subscribeToBlog,
  getAllPostSlugs,
} from '../blogApi';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('blogApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchBlogPosts', () => {
    it('should fetch blog posts successfully', async () => {
      const mockResponse = {
        posts: [{ id: '1', title: 'Test Post' }],
        total: 1,
        page: 1,
        pageSize: 10,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchBlogPosts('sneakers');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it('should include query parameters when provided', async () => {
      const mockResponse = { posts: [], total: 0, page: 1, pageSize: 10 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchBlogPosts('sneakers', {
        query: 'nike',
        category: 'shoes',
        tag: 'streetwear',
        author: 'John',
        page: 2,
        pageSize: 20,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('sneakers/posts');
      expect(calledUrl).toContain('q=nike');
      expect(calledUrl).toContain('category=shoes');
      expect(calledUrl).toContain('tag=streetwear');
      expect(calledUrl).toContain('author=John');
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('pageSize=20');
      expect(calledUrl).toContain('sortBy=publishedAt');
      expect(calledUrl).toContain('sortOrder=desc');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error',
      });

      await expect(fetchBlogPosts('sneakers')).rejects.toThrow('Failed to fetch blog posts: Server Error');
    });
  });

  describe('fetchBlogPost', () => {
    it('should fetch a single blog post by slug', async () => {
      const mockPost = { id: '1', title: 'Test Post', slug: 'test-post' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPost),
      });

      const result = await fetchBlogPost('sneakers', 'test-post');

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sneakers/posts/test-post'));
      expect(result).toEqual(mockPost);
    });

    it('should throw error when post not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchBlogPost('sneakers', 'nonexistent')).rejects.toThrow('Blog post not found');
    });

    it('should throw generic error for other failures', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      });

      await expect(fetchBlogPost('sneakers', 'test')).rejects.toThrow('Failed to fetch blog post: Server Error');
    });
  });

  describe('fetchRelatedPosts', () => {
    it('should fetch related posts', async () => {
      const mockPosts = [{ id: '2', title: 'Related Post' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      });

      const result = await fetchRelatedPosts('sneakers', 'post-1', 5);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sneakers/posts/post-1/related?limit=5'));
      expect(result).toEqual(mockPosts);
    });

    it('should return empty array on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Error',
      });

      const result = await fetchRelatedPosts('sneakers', 'post-1');

      expect(result).toEqual([]);
    });

    it('should use default limit of 3', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await fetchRelatedPosts('sneakers', 'post-1');

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=3'));
    });
  });

  describe('fetchPostsByCategory', () => {
    it('should fetch posts by category', async () => {
      const mockResponse = { posts: [], total: 0, page: 1, pageSize: 10 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchPostsByCategory('sneakers', 'nike', 2, 15);

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('category=nike');
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('pageSize=15');
      expect(calledUrl).toContain('sortBy=publishedAt');
      expect(calledUrl).toContain('sortOrder=desc');
    });
  });

  describe('fetchPostsByTag', () => {
    it('should fetch posts by tag', async () => {
      const mockResponse = { posts: [], total: 0, page: 1, pageSize: 10 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchPostsByTag('sneakers', 'streetwear', 1, 10);

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('tag=streetwear');
    });
  });

  describe('searchBlogPosts', () => {
    it('should search blog posts', async () => {
      const mockResponse = { posts: [], total: 0, page: 1, pageSize: 10 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await searchBlogPosts('sneakers', 'jordan', 1, 10);

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('q=jordan');
    });
  });

  describe('fetchFeaturedPosts', () => {
    it('should fetch featured posts', async () => {
      const mockPosts = [{ id: '1', title: 'Featured Post' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      });

      const result = await fetchFeaturedPosts('sneakers', 5);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sneakers/posts/featured?limit=5'));
      expect(result).toEqual(mockPosts);
    });

    it('should return empty array on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Error',
      });

      const result = await fetchFeaturedPosts('sneakers');

      expect(result).toEqual([]);
    });
  });

  describe('fetchLatestAcrossBlogs', () => {
    it('should fetch latest posts across all blogs', async () => {
      const mockPosts = [{ blogType: 'sneakers', post: { id: '1' } }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      });

      const result = await fetchLatestAcrossBlogs(10);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('latest?limit=10'));
      expect(result).toEqual(mockPosts);
    });

    it('should return empty array on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Error',
      });

      const result = await fetchLatestAcrossBlogs();

      expect(result).toEqual([]);
    });
  });

  describe('recordPostView', () => {
    it('should record post view', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await recordPostView('sneakers', 'post-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sneakers/posts/post-1/view'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should fail silently on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect(recordPostView('sneakers', 'post-1')).resolves.toBeUndefined();
    });
  });

  describe('recordAffiliateClick', () => {
    it('should record affiliate click', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await recordAffiliateClick('sneakers', 'post-1', 'product-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sneakers/affiliate-click'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: 'post-1', productId: 'product-1' }),
        })
      );
    });

    it('should fail silently on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect(recordAffiliateClick('sneakers', 'post-1', 'product-1')).resolves.toBeUndefined();
    });
  });

  describe('subscribeToBlog', () => {
    it('should subscribe to blog newsletter', async () => {
      const mockResponse = { success: true, message: 'Subscribed!' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await subscribeToBlog('sneakers', 'test@example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sneakers/subscribe'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAllPostSlugs', () => {
    it('should get all post slugs', async () => {
      const mockSlugs = ['post-1', 'post-2', 'post-3'];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSlugs),
      });

      const result = await getAllPostSlugs('sneakers');

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sneakers/slugs'));
      expect(result).toEqual(mockSlugs);
    });

    it('should return empty array on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Error',
      });

      const result = await getAllPostSlugs('sneakers');

      expect(result).toEqual([]);
    });
  });
});
