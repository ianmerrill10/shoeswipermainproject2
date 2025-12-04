import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBlog, generateAffiliateUrl } from '../useBlog';
import { AFFILIATE_TAG } from '../../lib/config';

describe('useBlog', () => {
  describe('getTodaysPosts', () => {
    it('should return four blog posts for today', () => {
      const { result } = renderHook(() => useBlog());
      const posts = result.current.getTodaysPosts();
      
      expect(posts).toHaveLength(4);
    });

    it('should return posts for all four categories', () => {
      const { result } = renderHook(() => useBlog());
      const posts = result.current.getTodaysPosts();
      const categories = posts.map(p => p.metadata.category);
      
      expect(categories).toContain('sneaker');
      expect(categories).toContain('shoes');
      expect(categories).toContain('workwear');
      expect(categories).toContain('music');
    });

    it('should have all posts published', () => {
      const { result } = renderHook(() => useBlog());
      const posts = result.current.getTodaysPosts();
      
      expect(posts.every(p => p.isPublished)).toBe(true);
    });
  });

  describe('getPostByCategory', () => {
    it('should return sneaker post', () => {
      const { result } = renderHook(() => useBlog());
      const post = result.current.getPostByCategory('sneaker');
      
      expect(post.metadata.category).toBe('sneaker');
      expect(post.metadata.title).toContain('Sneaker');
    });

    it('should return shoes post', () => {
      const { result } = renderHook(() => useBlog());
      const post = result.current.getPostByCategory('shoes');
      
      expect(post.metadata.category).toBe('shoes');
      expect(post.metadata.title).toContain('Shoe');
    });

    it('should return workwear post', () => {
      const { result } = renderHook(() => useBlog());
      const post = result.current.getPostByCategory('workwear');
      
      expect(post.metadata.category).toBe('workwear');
      expect(post.metadata.title).toContain('Professional');
    });

    it('should return music post', () => {
      const { result } = renderHook(() => useBlog());
      const post = result.current.getPostByCategory('music');
      
      expect(post.metadata.category).toBe('music');
      expect(post.metadata.title).toContain('Hip-Hop');
    });
  });

  describe('affiliate links', () => {
    it('should include affiliate tag in all product URLs', () => {
      const { result } = renderHook(() => useBlog());
      const posts = result.current.getTodaysPosts();
      
      posts.forEach(post => {
        post.affiliateProducts.forEach(product => {
          expect(product.affiliateUrl).toContain(`tag=${AFFILIATE_TAG}`);
        });
      });
    });

    it('should include affiliate tag in blog content', () => {
      const { result } = renderHook(() => useBlog());
      const posts = result.current.getTodaysPosts();
      
      posts.forEach(post => {
        expect(post.content).toContain(`tag=${AFFILIATE_TAG}`);
      });
    });

    it('should validate affiliate links correctly', () => {
      const { result } = renderHook(() => useBlog());
      const posts = result.current.getTodaysPosts();
      
      posts.forEach(post => {
        expect(result.current.validateAffiliateLinks(post)).toBe(true);
      });
    });
  });

  describe('generateAffiliateUrl', () => {
    it('should generate correct affiliate URL', () => {
      const url = generateAffiliateUrl('B07QXLFLXT');
      
      expect(url).toBe(`https://www.amazon.com/dp/B07QXLFLXT?tag=${AFFILIATE_TAG}`);
    });

    it('should work via hook method', () => {
      const { result } = renderHook(() => useBlog());
      const url = result.current.createAffiliateUrl('B09NLN47LP');
      
      expect(url).toBe(`https://www.amazon.com/dp/B09NLN47LP?tag=${AFFILIATE_TAG}`);
    });
  });

  describe('metadata', () => {
    it('should have proper metadata structure', () => {
      const { result } = renderHook(() => useBlog());
      const posts = result.current.getTodaysPosts();
      
      posts.forEach(post => {
        expect(post.metadata.title).toBeTruthy();
        expect(post.metadata.slug).toBeTruthy();
        expect(post.metadata.description).toBeTruthy();
        expect(post.metadata.keywords.length).toBeGreaterThan(0);
        expect(post.metadata.author).toBe('ShoeSwiper Team');
        expect(post.metadata.publishDate).toBe(new Date().toISOString().split('T')[0]);
        expect(post.metadata.featuredImage).toBeTruthy();
        expect(post.metadata.readTime).toBeGreaterThan(0);
        expect(post.metadata.tags.length).toBeGreaterThan(0);
      });
    });

    it('should have unique slugs', () => {
      const { result } = renderHook(() => useBlog());
      const posts = result.current.getTodaysPosts();
      const slugs = posts.map(p => p.metadata.slug);
      
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('should have unique IDs', () => {
      const { result } = renderHook(() => useBlog());
      const posts = result.current.getTodaysPosts();
      const ids = posts.map(p => p.id);
      
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('getPostById', () => {
    it('should find post by ID', () => {
      const { result } = renderHook(() => useBlog());
      const todaysDate = new Date().toISOString().split('T')[0];
      const post = result.current.getPostById(`blog-sneaker-${todaysDate}`);
      
      expect(post).toBeDefined();
      expect(post?.metadata.category).toBe('sneaker');
    });

    it('should return undefined for invalid ID', () => {
      const { result } = renderHook(() => useBlog());
      const post = result.current.getPostById('invalid-id');
      
      expect(post).toBeUndefined();
    });
  });

  describe('getPostBySlug', () => {
    it('should find post by slug', () => {
      const { result } = renderHook(() => useBlog());
      const post = result.current.getPostBySlug('top-5-must-have-sneakers-december-2025');
      
      expect(post).toBeDefined();
      expect(post?.metadata.category).toBe('sneaker');
    });

    it('should return undefined for invalid slug', () => {
      const { result } = renderHook(() => useBlog());
      const post = result.current.getPostBySlug('invalid-slug');
      
      expect(post).toBeUndefined();
    });
  });

  describe('getAffiliateProducts', () => {
    it('should return affiliate products for a post', () => {
      const { result } = renderHook(() => useBlog());
      const todaysDate = new Date().toISOString().split('T')[0];
      const products = result.current.getAffiliateProducts(`blog-sneaker-${todaysDate}`);
      
      expect(products.length).toBeGreaterThan(0);
      products.forEach(product => {
        expect(product.name).toBeTruthy();
        expect(product.asin).toBeTruthy();
        expect(product.affiliateUrl).toContain(`tag=${AFFILIATE_TAG}`);
        expect(product.description).toBeTruthy();
      });
    });

    it('should return empty array for invalid post ID', () => {
      const { result } = renderHook(() => useBlog());
      const products = result.current.getAffiliateProducts('invalid-id');
      
      expect(products).toEqual([]);
    });
  });

  describe('getCategories', () => {
    it('should return all four categories', () => {
      const { result } = renderHook(() => useBlog());
      const categories = result.current.getCategories();
      
      expect(categories).toEqual(['sneaker', 'shoes', 'workwear', 'music']);
    });
  });

  describe('content quality', () => {
    it('should have substantial content in each post', () => {
      const { result } = renderHook(() => useBlog());
      const posts = result.current.getTodaysPosts();
      
      posts.forEach(post => {
        // Content should be at least 1000 characters
        expect(post.content.length).toBeGreaterThan(1000);
        // Should have an excerpt
        expect(post.excerpt.length).toBeGreaterThan(50);
      });
    });

    it('should have product recommendations with Amazon links', () => {
      const { result } = renderHook(() => useBlog());
      const posts = result.current.getTodaysPosts();
      
      posts.forEach(post => {
        // Each post should have at least 3 affiliate products
        expect(post.affiliateProducts.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('memoized values', () => {
    it('should expose todaysPosts as memoized value', () => {
      const { result } = renderHook(() => useBlog());
      
      expect(result.current.todaysPosts).toHaveLength(4);
    });

    it('should expose publishedPosts as memoized value', () => {
      const { result } = renderHook(() => useBlog());
      
      expect(result.current.publishedPosts).toHaveLength(4);
    });

    it('should expose affiliateTag', () => {
      const { result } = renderHook(() => useBlog());
      
      expect(result.current.affiliateTag).toBe(AFFILIATE_TAG);
    });
  });
});
