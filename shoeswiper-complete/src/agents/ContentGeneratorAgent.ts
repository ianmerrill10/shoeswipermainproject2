/**
 * Content Generator Agent - ShoeSwiper
 * =====================================
 * AI-powered blog content generation for 4 blog verticals:
 * - Sneaker: Latest releases, reviews, streetwear culture
 * - Shoes: Fashion, style guides, seasonal trends
 * - Workwear: Work boots, safety gear, professional reviews
 * - Music: Artist collaborations, hip-hop culture, sneaker tie-ins
 *
 * CRITICAL: All Amazon links MUST include ?tag=shoeswiper-20
 */

import {
  AgentConfig,
  AgentResult,
  BlogPostInput,
  BlogType,
  GeneratedBlogPost,
} from './types';
import { AFFILIATE_TAG, ADMIN_EMAIL } from '../lib/config';
import { BLOG_CONFIGS, DEFAULT_AUTHORS, DEFAULT_CATEGORIES } from '../lib/blogTypes';

// ============================================
// Constants
// ============================================

const AGENT_ID = 'content-generator';
const AGENT_NAME = 'Content Generator Agent';

/**
 * Default configuration for the Content Generator Agent
 */
export const CONTENT_GENERATOR_CONFIG: AgentConfig = {
  id: AGENT_ID,
  name: AGENT_NAME,
  description: 'AI-powered blog content generation for SEO-optimized posts across all 4 blog verticals',
  enabled: true,
  maxConcurrentTasks: 4,
  rateLimitPerMinute: 10,
  retryOnError: true,
  maxRetries: 3,
  timeout: 120000, // 2 minutes for content generation
};

/**
 * Topic templates for each blog type to ensure variety
 */
const TOPIC_TEMPLATES: Record<BlogType, string[]> = {
  sneaker: [
    'Top {number} Must-Have Sneakers for {month} {year}',
    'Ultimate Guide to {brand} Sneaker Releases',
    '{brand} vs {brand2}: Which Sneaker Wins?',
    'How to Style {sneaker_model} for Every Occasion',
    'Best Sneaker Deals This Week',
    'Upcoming Sneaker Drops You Can\'t Miss',
    '{colorway} Sneaker Trend: What to Buy Now',
    'Sneakerhead Essentials: Must-Have Accessories',
  ],
  shoes: [
    'Best {shoe_type} for {season} {year}',
    '{occasion} Shoe Guide: What to Wear',
    'How to Choose the Perfect {shoe_type}',
    '{brand} Shoe Review: Worth the Price?',
    'Shoe Care Tips: Make Your {shoe_type} Last',
    'Trending Shoe Styles for {season}',
    'Comfortable Shoes That Don\'t Sacrifice Style',
    'Budget vs Premium: {shoe_type} Comparison',
  ],
  workwear: [
    'Best Work Boots for {profession}',
    '{brand} Work Boot Review: Built to Last?',
    'Steel Toe vs Composite Toe: Which is Right for You?',
    'Waterproof Work Boots Guide for {season}',
    'Most Comfortable Work Boots for Long Shifts',
    'Safety Footwear Standards Explained',
    'Top {number} Work Boots Under ${price}',
    'Work Boot Maintenance: Extend Your Boot\'s Life',
  ],
  music: [
    '{artist}\'s Sneaker Collection: Inside Look',
    'Hip-Hop and Sneaker Culture: {decade} Edition',
    'Best Artist Sneaker Collaborations of {year}',
    '{artist} x {brand}: Collab Review',
    'Music Festival Footwear Guide',
    'Tour Style: What Artists Are Wearing',
    'Album Release Sneaker Drops to Watch',
    'Sneakers in Music Videos: Iconic Moments',
  ],
};

/**
 * SEO keyword sets for each blog type
 */
const SEO_KEYWORDS: Record<BlogType, string[]> = {
  sneaker: [
    'sneakers', 'kicks', 'sneaker releases', 'Jordan', 'Nike', 'Adidas', 'Yeezy',
    'streetwear', 'sneakerhead', 'limited edition', 'drop dates', 'resale',
    'sneaker collection', 'hype sneakers', 'retro sneakers', 'basketball shoes',
  ],
  shoes: [
    'shoes', 'footwear', 'fashion shoes', 'style guide', 'shoe trends',
    'comfortable shoes', 'dress shoes', 'casual shoes', 'loafers', 'boots',
    'sandals', 'heels', 'flats', 'shoe care', 'shoe sizing',
  ],
  workwear: [
    'work boots', 'safety boots', 'steel toe', 'composite toe', 'waterproof boots',
    'construction boots', 'industrial footwear', 'OSHA approved', 'slip resistant',
    'electrical hazard', 'work shoes', 'professional footwear', 'durable boots',
  ],
  music: [
    'music fashion', 'artist style', 'hip-hop fashion', 'concert style',
    'rapper sneakers', 'celebrity sneakers', 'music collaborations', 'tour merch',
    'music culture', 'artist collaborations', 'sneaker collabs', 'music and fashion',
  ],
};

/**
 * Author mapping for each blog type
 */
const AUTHOR_MAP: Record<BlogType, string> = {
  sneaker: 'sneaker_expert',
  shoes: 'ai',
  workwear: 'workwear_pro',
  music: 'music_curator',
};

// ============================================
// Content Generation Utilities
// ============================================

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
    .replace(/-$/, '');
}

/**
 * Calculate estimated read time from content
 */
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Ensure Amazon affiliate link includes the correct tag
 * CRITICAL: This function MUST always add the shoeswiper-20 tag
 */
export function ensureAffiliateTag(url: string): string {
  // If URL already has our tag, return as-is
  if (url.includes(`tag=${AFFILIATE_TAG}`)) {
    return url;
  }

  // Remove any existing tag parameter
  const urlWithoutTag = url.replace(/[?&]tag=[^&]*/g, '');

  // Add our affiliate tag
  const separator = urlWithoutTag.includes('?') ? '&' : '?';
  return `${urlWithoutTag}${separator}tag=${AFFILIATE_TAG}`;
}

/**
 * Generate an Amazon affiliate URL from ASIN
 */
export function generateAmazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

/**
 * Validate that all Amazon links in content have affiliate tags
 */
export function validateAffiliateLinks(content: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const amazonLinkRegex = /https?:\/\/(www\.)?amazon\.com[^\s"')>]*/gi;
  const matches = content.match(amazonLinkRegex) || [];

  for (const link of matches) {
    if (!link.includes(`tag=${AFFILIATE_TAG}`)) {
      issues.push(`Missing affiliate tag in: ${link}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Fix all Amazon links in content to include affiliate tag
 */
export function fixAffiliateLinks(content: string): string {
  const amazonLinkRegex = /(https?:\/\/(www\.)?amazon\.com[^\s"')>]*)/gi;
  return content.replace(amazonLinkRegex, (match) => ensureAffiliateTag(match));
}

// ============================================
// Blog-Specific Content Helpers
// ============================================

/**
 * Get blog configuration for a specific type
 */
export function getBlogConfig(blogType: BlogType) {
  return BLOG_CONFIGS[blogType];
}

/**
 * Get author for a specific blog type
 */
export function getAuthorForBlogType(blogType: BlogType) {
  const authorKey = AUTHOR_MAP[blogType];
  return DEFAULT_AUTHORS[authorKey];
}

/**
 * Get relevant categories for a blog type
 */
export function getCategoriesForBlogType(blogType: BlogType) {
  const categoryMapping: Record<BlogType, string[]> = {
    sneaker: ['releases', 'reviews', 'style', 'culture', 'deals'],
    shoes: ['reviews', 'style', 'deals'],
    workwear: ['reviews', 'workwear', 'deals'],
    music: ['music', 'culture', 'style'],
  };

  const categoryIds = categoryMapping[blogType];
  return DEFAULT_CATEGORIES.filter(cat => categoryIds.includes(cat.id));
}

/**
 * Generate topic suggestions for a blog type
 */
export function generateTopicSuggestions(blogType: BlogType, count: number = 5): string[] {
  const templates = TOPIC_TEMPLATES[blogType];
  const currentDate = new Date();
  const month = currentDate.toLocaleString('en-US', { month: 'long' });
  const year = currentDate.getFullYear().toString();

  const replacements: Record<string, string[]> = {
    number: ['5', '7', '10'],
    month,
    year,
    brand: ['Nike', 'Adidas', 'New Balance', 'Puma', 'Reebok'],
    brand2: ['Adidas', 'Nike', 'Jordan', 'Converse'],
    sneaker_model: ['Air Jordan 1', 'Air Max 90', 'Yeezy 350', 'Dunk Low'],
    colorway: ['Neutral', 'Bold', 'Earthy', 'Monochrome'],
    shoe_type: ['Loafers', 'Boots', 'Sneakers', 'Oxfords'],
    season: ['Winter', 'Spring', 'Summer', 'Fall'],
    occasion: ['Wedding', 'Office', 'Date Night', 'Travel'],
    profession: ['Construction', 'Warehouse', 'Electrical', 'Landscaping'],
    price: ['100', '150', '200'],
    artist: ['Travis Scott', 'Drake', 'Kanye West', 'J Balvin'],
    decade: ['80s', '90s', '2000s', '2010s'],
  };

  const suggestions: string[] = [];
  const shuffledTemplates = [...templates].sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(count, shuffledTemplates.length); i++) {
    let topic = shuffledTemplates[i];

    // Replace placeholders
    for (const [key, values] of Object.entries(replacements)) {
      const placeholder = `{${key}}`;
      if (topic.includes(placeholder)) {
        const randomValue = Array.isArray(values)
          ? values[Math.floor(Math.random() * values.length)]
          : values;
        topic = topic.replace(placeholder, randomValue);
      }
    }

    suggestions.push(topic);
  }

  return suggestions;
}

/**
 * Get SEO keywords for a blog type
 */
export function getSEOKeywords(blogType: BlogType): string[] {
  return SEO_KEYWORDS[blogType];
}

// ============================================
// Content Generator Agent Class
// ============================================

/**
 * ContentGeneratorAgent handles AI-powered blog content generation
 * for all 4 ShoeSwiper blog verticals.
 */
export class ContentGeneratorAgent {
  private config: AgentConfig;
  private edgeFunctionUrl: string;

  constructor(supabaseUrl?: string) {
    this.config = CONTENT_GENERATOR_CONFIG;
    // Use environment variable or provided URL
    const baseUrl = supabaseUrl || import.meta.env.VITE_SUPABASE_URL || '';
    this.edgeFunctionUrl = `${baseUrl}/functions/v1/generate-blog-content`;
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Check if the agent is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Generate a blog post using the Edge Function
   */
  async generateBlogPost(input: BlogPostInput): Promise<AgentResult<GeneratedBlogPost>> {
    const startTime = Date.now();

    try {
      if (!this.isEnabled()) {
        return {
          success: false,
          error: 'Content Generator Agent is disabled',
          executionTime: Date.now() - startTime,
        };
      }

      // Validate input
      const validationError = this.validateInput(input);
      if (validationError) {
        return {
          success: false,
          error: validationError,
          executionTime: Date.now() - startTime,
        };
      }

      // Call Edge Function
      const response = await fetch(this.edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogType: input.blogType,
          topic: input.topic,
          keywords: input.keywords,
          targetWordCount: input.targetWordCount,
          tone: input.tone,
          includeAffiliateProducts: input.includeAffiliateProducts,
          affiliateTag: AFFILIATE_TAG,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json() as GeneratedBlogPost;

      // Validate and fix affiliate links in the generated content
      const fixedContent = fixAffiliateLinks(data.content);
      const validationResult = validateAffiliateLinks(fixedContent);

      if (!validationResult.valid) {
        if (import.meta.env.DEV) {
          console.warn('Affiliate link validation issues:', validationResult.issues);
        }
      }

      const result: GeneratedBlogPost = {
        ...data,
        content: fixedContent,
        estimatedReadTime: calculateReadTime(fixedContent),
      };

      return {
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      if (import.meta.env.DEV) {
        console.error('ContentGeneratorAgent error:', error);
      }

      return {
        success: false,
        error: errorMessage,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Generate blog posts for all 4 blog types
   */
  async generateDailyPosts(): Promise<AgentResult<Map<BlogType, GeneratedBlogPost>>> {
    const startTime = Date.now();
    const results = new Map<BlogType, GeneratedBlogPost>();
    const errors: string[] = [];

    const blogTypes: BlogType[] = ['sneaker', 'shoes', 'workwear', 'music'];

    for (const blogType of blogTypes) {
      const topics = generateTopicSuggestions(blogType, 1);
      const keywords = getSEOKeywords(blogType);

      const input: BlogPostInput = {
        blogType,
        topic: topics[0],
        keywords: keywords.slice(0, 5),
        targetWordCount: 1200,
        tone: blogType === 'workwear' ? 'professional' : 'enthusiastic',
        includeAffiliateProducts: true,
      };

      const result = await this.generateBlogPost(input);

      if (result.success && result.data) {
        results.set(blogType, result.data);
      } else {
        errors.push(`${blogType}: ${result.error}`);
      }
    }

    return {
      success: errors.length === 0,
      data: results,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Validate blog post input
   */
  private validateInput(input: BlogPostInput): string | null {
    if (!input.blogType) {
      return 'Blog type is required';
    }

    const validBlogTypes: BlogType[] = ['sneaker', 'shoes', 'workwear', 'music'];
    if (!validBlogTypes.includes(input.blogType)) {
      return `Invalid blog type: ${input.blogType}`;
    }

    if (!input.topic || input.topic.trim().length < 5) {
      return 'Topic must be at least 5 characters';
    }

    if (input.targetWordCount && (input.targetWordCount < 300 || input.targetWordCount > 5000)) {
      return 'Target word count must be between 300 and 5000';
    }

    return null;
  }

  /**
   * Generate SEO metadata for a blog post
   */
  generateSEOMetadata(post: GeneratedBlogPost, blogType: BlogType): {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    structuredData: Record<string, unknown>;
  } {
    const blogConfig = getBlogConfig(blogType);
    const author = getAuthorForBlogType(blogType);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      author: {
        '@type': 'Person',
        name: author.name,
      },
      publisher: {
        '@type': 'Organization',
        name: blogConfig.name,
        logo: {
          '@type': 'ImageObject',
          url: blogConfig.logo,
        },
      },
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://${blogConfig.domain}/${post.slug}`,
      },
      keywords: post.tags.join(', '),
    };

    return {
      metaTitle: post.metaTitle || `${post.title} | ${blogConfig.name}`,
      metaDescription: post.metaDescription || post.excerpt.substring(0, 160),
      ogTitle: post.title,
      ogDescription: post.excerpt,
      structuredData,
    };
  }

  /**
   * Format content with affiliate product cards
   */
  formatContentWithProducts(
    content: string,
    products: Array<{ name: string; asin: string; description: string }>
  ): string {
    let formattedContent = content;

    // Add product showcase section
    if (products.length > 0) {
      const productSection = `
<div class="affiliate-products">
  <h3>Featured Products</h3>
  <div class="product-grid">
    ${products
      .map(
        (product) => `
    <div class="product-card">
      <h4>${product.name}</h4>
      <p>${product.description}</p>
      <a href="${generateAmazonUrl(product.asin)}" class="affiliate-link" rel="nofollow sponsored" target="_blank">
        Check Price on Amazon
      </a>
    </div>`
      )
      .join('\n')}
  </div>
</div>`;

      // Insert before conclusion if exists, otherwise append
      if (formattedContent.includes('<h2>Conclusion</h2>')) {
        formattedContent = formattedContent.replace(
          '<h2>Conclusion</h2>',
          `${productSection}\n<h2>Conclusion</h2>`
        );
      } else {
        formattedContent += productSection;
      }
    }

    return formattedContent;
  }
}

// ============================================
// Singleton Instance
// ============================================

let agentInstance: ContentGeneratorAgent | null = null;

/**
 * Get the Content Generator Agent singleton instance
 */
export function getContentGeneratorAgent(supabaseUrl?: string): ContentGeneratorAgent {
  if (!agentInstance) {
    agentInstance = new ContentGeneratorAgent(supabaseUrl);
  }
  return agentInstance;
}

// ============================================
// Exports
// ============================================

export {
  AGENT_ID,
  AGENT_NAME,
  TOPIC_TEMPLATES,
  SEO_KEYWORDS,
  AUTHOR_MAP,
};

// Export admin email for reference
export { ADMIN_EMAIL };
