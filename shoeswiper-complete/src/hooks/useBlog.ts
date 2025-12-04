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

import { useMemo } from 'react';
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
import { AFFILIATE_TAG } from '../lib/config';

// ============================================
// Types for Local Blog Post Management
// ============================================

export type BlogCategory = 'sneaker' | 'shoes' | 'workwear' | 'music';

export interface BlogMetadata {
  title: string;
  slug: string;
  description: string;
  keywords: string[];
  author: string;
  publishDate: string;
  featuredImage: string;
  readTime: number;
  tags: string[];
  category: BlogCategory;
}

export interface AffiliateProduct {
  name: string;
  asin: string;
  affiliateUrl: string;
  description: string;
  price?: number;
  image?: string;
}

export interface BlogPost {
  id: string;
  metadata: BlogMetadata;
  content: string;
  excerpt: string;
  affiliateProducts: AffiliateProduct[];
  isPublished: boolean;
}

// ============================================
// Affiliate URL Generation
// ============================================

/**
 * Generate an Amazon affiliate URL from an ASIN
 */
export function generateAffiliateUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

// ============================================
// Daily Blog Post Data
// ============================================

const TODAYS_DATE = new Date().toISOString().split('T')[0];

function createDailyBlogPosts(): BlogPost[] {
  return [
    // Sneaker Post
    {
      id: `blog-sneaker-${TODAYS_DATE}`,
      metadata: {
        title: 'Top 5 Must-Have Sneakers for December 2025',
        slug: 'top-5-must-have-sneakers-december-2025',
        description: 'Discover the hottest sneakers dropping this month that every collector needs.',
        keywords: ['sneakers', 'December 2025', 'Nike', 'Jordan', 'Adidas', 'releases'],
        author: 'ShoeSwiper Team',
        publishDate: TODAYS_DATE,
        featuredImage: '/images/blog/sneakers-december-2025.jpg',
        readTime: 8,
        tags: ['releases', 'must-have', 'collection'],
        category: 'sneaker',
      },
      content: `
        <h2>The Sneaker Scene in December 2025</h2>
        <p>December brings some of the most anticipated releases of the year. From retro Jordans to innovative Nike designs, here are our top picks.</p>
        
        <h3>1. Air Jordan 1 Retro High OG "Holiday"</h3>
        <p>The classic silhouette returns with festive colorways that are perfect for the season. Premium leather and iconic design make this a must-cop.</p>
        <a href="https://www.amazon.com/dp/B07QXLFLXT?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h3>2. Nike Air Max 95 "Winter Pack"</h3>
        <p>Built for cold weather with enhanced insulation while maintaining the timeless Air Max 95 aesthetic.</p>
        <a href="https://www.amazon.com/dp/B09NLN47LP?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h3>3. Adidas Yeezy Boost 350 V2 "Slate"</h3>
        <p>Kanye's iconic design continues to dominate with this subtle yet striking colorway.</p>
        <a href="https://www.amazon.com/dp/B08KG6WRN3?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h3>4. New Balance 550 "Collegiate Pack"</h3>
        <p>The retro basketball shoe that's taken the fashion world by storm gets new university-inspired colors.</p>
        <a href="https://www.amazon.com/dp/B09DTHG8CH?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h3>5. Puma Suede Classic XXI</h3>
        <p>A timeless classic reimagined for the modern era with sustainable materials.</p>
        <a href="https://www.amazon.com/dp/B07H8QGGXJ?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h2>Conclusion</h2>
        <p>This December offers something for every sneakerhead. Whether you're into retros, running-inspired designs, or sustainable fashion, there's a pair waiting for you.</p>
      `,
      excerpt: 'December brings some of the most anticipated sneaker releases of the year. From retro Jordans to innovative Nike designs, here are our top picks for the month.',
      affiliateProducts: [
        {
          name: 'Air Jordan 1 Retro High OG',
          asin: 'B07QXLFLXT',
          affiliateUrl: `https://www.amazon.com/dp/B07QXLFLXT?tag=${AFFILIATE_TAG}`,
          description: 'Classic Jordan 1 in premium leather with iconic colorway.',
        },
        {
          name: 'Nike Air Max 95',
          asin: 'B09NLN47LP',
          affiliateUrl: `https://www.amazon.com/dp/B09NLN47LP?tag=${AFFILIATE_TAG}`,
          description: 'Winter-ready Air Max 95 with enhanced insulation.',
        },
        {
          name: 'Adidas Yeezy Boost 350 V2',
          asin: 'B08KG6WRN3',
          affiliateUrl: `https://www.amazon.com/dp/B08KG6WRN3?tag=${AFFILIATE_TAG}`,
          description: 'Iconic Yeezy design in the Slate colorway.',
        },
      ],
      isPublished: true,
    },
    // Shoes Post
    {
      id: `blog-shoes-${TODAYS_DATE}`,
      metadata: {
        title: 'Best Casual Shoe Styles for Winter 2025',
        slug: 'best-casual-shoe-styles-winter-2025',
        description: 'Stay stylish and comfortable with these versatile shoe picks for the colder months.',
        keywords: ['shoes', 'winter 2025', 'casual', 'style', 'fashion', 'comfortable'],
        author: 'ShoeSwiper Team',
        publishDate: TODAYS_DATE,
        featuredImage: '/images/blog/casual-shoes-winter-2025.jpg',
        readTime: 6,
        tags: ['style', 'winter', 'casual'],
        category: 'shoes',
      },
      content: `
        <h2>Casual Shoe Style Guide for Winter 2025</h2>
        <p>Finding the perfect balance between style and warmth doesn't have to be a challenge. Here are our top casual shoe picks for this winter.</p>
        
        <h3>1. Leather Chelsea Boots</h3>
        <p>The quintessential winter boot that pairs well with everything from jeans to chinos. Look for water-resistant options.</p>
        <a href="https://www.amazon.com/dp/B07PQVFMK9?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h3>2. Suede Desert Boots</h3>
        <p>A classic Clarks-style desert boot adds sophistication to any casual outfit.</p>
        <a href="https://www.amazon.com/dp/B00AYCN7S0?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h3>3. Wool-Lined Loafers</h3>
        <p>Slip-on convenience meets winter warmth with these cozy lined loafers.</p>
        <a href="https://www.amazon.com/dp/B08WRWX2TL?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h3>4. Canvas High-Tops</h3>
        <p>Layer with thick socks for a trendy winter streetwear look.</p>
        <a href="https://www.amazon.com/dp/B07VFZCL5X?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h2>Styling Tips</h2>
        <p>Remember to waterproof your shoes before the season and consider adding insoles for extra warmth on the coldest days.</p>
      `,
      excerpt: 'Finding the perfect balance between style and warmth doesn\'t have to be a challenge. Here are our top casual shoe picks for this winter.',
      affiliateProducts: [
        {
          name: 'Leather Chelsea Boots',
          asin: 'B07PQVFMK9',
          affiliateUrl: `https://www.amazon.com/dp/B07PQVFMK9?tag=${AFFILIATE_TAG}`,
          description: 'Water-resistant leather Chelsea boots for winter.',
        },
        {
          name: 'Clarks Desert Boot',
          asin: 'B00AYCN7S0',
          affiliateUrl: `https://www.amazon.com/dp/B00AYCN7S0?tag=${AFFILIATE_TAG}`,
          description: 'Classic suede desert boots for sophisticated casual style.',
        },
        {
          name: 'Wool-Lined Loafers',
          asin: 'B08WRWX2TL',
          affiliateUrl: `https://www.amazon.com/dp/B08WRWX2TL?tag=${AFFILIATE_TAG}`,
          description: 'Cozy wool-lined loafers for winter comfort.',
        },
      ],
      isPublished: true,
    },
    // Workwear Post
    {
      id: `blog-workwear-${TODAYS_DATE}`,
      metadata: {
        title: 'Professional Work Boots: A Complete Buying Guide',
        slug: 'professional-work-boots-buying-guide-2025',
        description: 'Everything you need to know about choosing the right work boots for your profession.',
        keywords: ['work boots', 'professional', 'safety', 'construction', 'durable', 'steel toe'],
        author: 'ShoeSwiper Team',
        publishDate: TODAYS_DATE,
        featuredImage: '/images/blog/work-boots-guide-2025.jpg',
        readTime: 10,
        tags: ['safety', 'work', 'guide'],
        category: 'workwear',
      },
      content: `
        <h2>The Complete Professional Work Boot Guide</h2>
        <p>Choosing the right work boots is crucial for your safety and comfort on the job. This guide covers everything from safety ratings to comfort features.</p>
        
        <h3>Understanding Safety Standards</h3>
        <p>Look for ASTM F2413 certification which covers impact resistance, compression resistance, and electrical hazard protection.</p>
        
        <h3>Top Work Boot Picks</h3>
        
        <h4>1. Timberland PRO Pit Boss</h4>
        <p>Industry-leading comfort with steel toe protection. Perfect for construction and warehouse work.</p>
        <a href="https://www.amazon.com/dp/B000XEWFNA?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h4>2. Red Wing Heritage Iron Ranger</h4>
        <p>Premium American-made boots built to last decades. Exceptional for industrial settings.</p>
        <a href="https://www.amazon.com/dp/B001IOLGE0?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h4>3. Carhartt CMF6366</h4>
        <p>Waterproof with composite toe for those who prefer lightweight protection.</p>
        <a href="https://www.amazon.com/dp/B00E0GEI26?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h4>4. Wolverine Overpass</h4>
        <p>Excellent slip resistance and arch support for long shifts on your feet.</p>
        <a href="https://www.amazon.com/dp/B075Y2GGKX?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h2>Maintenance Tips</h2>
        <p>Regular cleaning and conditioning will extend the life of your work boots significantly. Inspect them weekly for wear and damage.</p>
      `,
      excerpt: 'Choosing the right work boots is crucial for your safety and comfort on the job. This guide covers everything from safety ratings to comfort features.',
      affiliateProducts: [
        {
          name: 'Timberland PRO Pit Boss',
          asin: 'B000XEWFNA',
          affiliateUrl: `https://www.amazon.com/dp/B000XEWFNA?tag=${AFFILIATE_TAG}`,
          description: 'Steel toe work boots with superior comfort for construction.',
        },
        {
          name: 'Red Wing Iron Ranger',
          asin: 'B001IOLGE0',
          affiliateUrl: `https://www.amazon.com/dp/B001IOLGE0?tag=${AFFILIATE_TAG}`,
          description: 'Premium American-made heritage work boots.',
        },
        {
          name: 'Carhartt Composite Toe Boot',
          asin: 'B00E0GEI26',
          affiliateUrl: `https://www.amazon.com/dp/B00E0GEI26?tag=${AFFILIATE_TAG}`,
          description: 'Lightweight waterproof composite toe boots.',
        },
      ],
      isPublished: true,
    },
    // Music Post
    {
      id: `blog-music-${TODAYS_DATE}`,
      metadata: {
        title: 'Hip-Hop and Sneaker Culture: The Connection',
        slug: 'hip-hop-sneaker-culture-connection-2025',
        description: 'Exploring the deep ties between hip-hop music and sneaker culture through the decades.',
        keywords: ['hip-hop', 'sneakers', 'culture', 'music', 'fashion', 'artists'],
        author: 'ShoeSwiper Team',
        publishDate: TODAYS_DATE,
        featuredImage: '/images/blog/hip-hop-sneakers-2025.jpg',
        readTime: 7,
        tags: ['culture', 'music', 'history'],
        category: 'music',
      },
      content: `
        <h2>The Unbreakable Bond: Hip-Hop and Sneakers</h2>
        <p>From Run-DMC's "My Adidas" to Travis Scott's Nike collaborations, hip-hop and sneaker culture have been inseparable for decades.</p>
        
        <h3>The Origins</h3>
        <p>In 1986, Run-DMC changed the game forever. Their Adidas Superstar became a cultural symbol, leading to the first-ever non-athlete sneaker endorsement deal.</p>
        
        <h3>Modern Artist Collaborations</h3>
        
        <h4>Travis Scott x Nike</h4>
        <p>The Cactus Jack collaborations have become some of the most sought-after sneakers in history.</p>
        <a href="https://www.amazon.com/dp/B07RQXKNDF?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h4>Kanye West x Adidas</h4>
        <p>The Yeezy line redefined what celebrity sneaker collaborations could achieve.</p>
        <a href="https://www.amazon.com/dp/B08KG6WRN3?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h4>J Balvin x Jordan</h4>
        <p>Bringing Latin music influence to Jordan Brand with vibrant, colorful designs.</p>
        <a href="https://www.amazon.com/dp/B08YNQN5PW?tag=${AFFILIATE_TAG}">Shop Now</a>
        
        <h3>The Future of Music and Sneakers</h3>
        <p>With NFTs and digital fashion on the rise, the connection between music artists and footwear is evolving into new digital territories.</p>
        
        <h2>Iconic Albums That Influenced Sneaker Culture</h2>
        <p>From "Paid in Full" to "Graduation," many albums have directly influenced sneaker trends and releases.</p>
      `,
      excerpt: 'From Run-DMC\'s "My Adidas" to Travis Scott\'s Nike collaborations, hip-hop and sneaker culture have been inseparable for decades.',
      affiliateProducts: [
        {
          name: 'Nike Air Force 1 Low',
          asin: 'B07RQXKNDF',
          affiliateUrl: `https://www.amazon.com/dp/B07RQXKNDF?tag=${AFFILIATE_TAG}`,
          description: 'The iconic sneaker beloved by hip-hop artists worldwide.',
        },
        {
          name: 'Adidas Superstar',
          asin: 'B00LNLV9TQ',
          affiliateUrl: `https://www.amazon.com/dp/B00LNLV9TQ?tag=${AFFILIATE_TAG}`,
          description: 'The original hip-hop sneaker, made famous by Run-DMC.',
        },
        {
          name: 'Jordan 1 Mid',
          asin: 'B08YNQN5PW',
          affiliateUrl: `https://www.amazon.com/dp/B08YNQN5PW?tag=${AFFILIATE_TAG}`,
          description: 'Classic Jordan silhouette with modern colorways.',
        },
      ],
      isPublished: true,
    },
  ];
}

// ============================================
// useBlog Hook for Local Blog Management
// ============================================

/**
 * Hook for managing local blog posts with methods for fetching,
 * filtering, and validating blog content.
 */
export function useBlog() {
  const posts = useMemo(() => createDailyBlogPosts(), []);

  const todaysDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todaysPosts = useMemo(() => posts.filter(p => p.metadata.publishDate === todaysDate), [posts, todaysDate]);
  const publishedPosts = useMemo(() => posts.filter(p => p.isPublished), [posts]);

  const getTodaysPosts = () => todaysPosts;

  const getPostByCategory = (category: BlogCategory): BlogPost => {
    const post = posts.find(p => p.metadata.category === category);
    if (!post) {
      throw new Error(`No post found for category: ${category}`);
    }
    return post;
  };

  const getPostById = (id: string): BlogPost | undefined => {
    return posts.find(p => p.id === id);
  };

  const getPostBySlug = (slug: string): BlogPost | undefined => {
    return posts.find(p => p.metadata.slug === slug);
  };

  const getAffiliateProducts = (postId: string): AffiliateProduct[] => {
    const post = getPostById(postId);
    return post?.affiliateProducts || [];
  };

  const getCategories = (): BlogCategory[] => {
    return ['sneaker', 'shoes', 'workwear', 'music'];
  };

  const validateAffiliateLinks = (post: BlogPost): boolean => {
    // Check that all affiliate products have proper affiliate tag
    const productsValid = post.affiliateProducts.every(
      product => product.affiliateUrl.includes(`tag=${AFFILIATE_TAG}`)
    );
    
    // Check that content contains affiliate links with proper tag
    const contentValid = post.content.includes(`tag=${AFFILIATE_TAG}`);
    
    return productsValid && contentValid;
  };

  const createAffiliateUrl = (asin: string): string => {
    return generateAffiliateUrl(asin);
  };

  return {
    // Methods
    getTodaysPosts,
    getPostByCategory,
    getPostById,
    getPostBySlug,
    getAffiliateProducts,
    getCategories,
    validateAffiliateLinks,
    createAffiliateUrl,
    // Memoized values
    todaysPosts,
    publishedPosts,
    affiliateTag: AFFILIATE_TAG,
  };
}

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
