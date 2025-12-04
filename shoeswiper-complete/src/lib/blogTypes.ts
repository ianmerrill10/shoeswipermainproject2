// Blog Types - ShoeSwiper Blog System
// =====================================

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  htmlContent?: string;
  featuredImage: string;
  featuredImageAlt: string;
  author: BlogAuthor;
  category: BlogCategory;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readingTime: number; // minutes
  status: 'draft' | 'published' | 'scheduled';
  seo: BlogSEO;
  affiliateProducts?: AffiliateProduct[];
  relatedPosts?: string[]; // post IDs
  viewCount?: number;
  shareCount?: number;
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
    facebook?: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

export interface BlogSEO {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords: string[];
  noIndex?: boolean;
}

export interface AffiliateProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice?: number;
  affiliateUrl: string;
  affiliateTag: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  description?: string;
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface BlogSearchParams {
  query?: string;
  category?: string;
  tag?: string;
  author?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'publishedAt' | 'viewCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Blog type identifiers
export type BlogType = 'sneaker' | 'shoes' | 'workwear' | 'music';

// Syndication configuration for auto-posting to social media
export interface SyndicationConfig {
  enabled: boolean;
  platforms: ('twitter' | 'instagram' | 'facebook' | 'tiktok')[];
  autoPost: boolean; // Auto-post when blog is published
  delayMinutes: number; // Delay after publish before posting
  hashtagStrategy: 'brand' | 'category' | 'mixed';
  includeLink: boolean;
  customHashtags?: string[];
}

export interface BlogConfig {
  type: BlogType;
  name: string;
  tagline: string;
  domain: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  syndication?: SyndicationConfig;
}

// Default blog configurations
export const BLOG_CONFIGS: Record<BlogType, BlogConfig> = {
  sneaker: {
    type: 'sneaker',
    name: 'ShoeSwiper Sneaker Blog',
    tagline: 'Your Daily Dose of Sneaker Culture',
    domain: 'blog.shoeswiper.com',
    primaryColor: '#FF6B35',
    secondaryColor: '#1A1A2E',
    logo: '/logos/sneaker-blog.svg',
    socialLinks: {
      twitter: 'https://twitter.com/shoeswiper',
      instagram: 'https://instagram.com/shoeswiper',
      tiktok: 'https://tiktok.com/@shoeswiper',
    },
    syndication: {
      enabled: true,
      platforms: ['twitter', 'instagram', 'facebook'],
      autoPost: true,
      delayMinutes: 5,
      hashtagStrategy: 'mixed',
      includeLink: true,
      customHashtags: ['ShoeSwiper', 'Sneakers', 'SneakerCulture'],
    },
  },
  shoes: {
    type: 'shoes',
    name: 'ShoeSwiper Style',
    tagline: 'Footwear Fashion Forward',
    domain: 'shoes.shoeswiper.com',
    primaryColor: '#6C63FF',
    secondaryColor: '#2D2D44',
    logo: '/logos/shoes-blog.svg',
    socialLinks: {
      instagram: 'https://instagram.com/shoeswiperstyle',
    },
    syndication: {
      enabled: true,
      platforms: ['instagram'],
      autoPost: true,
      delayMinutes: 10,
      hashtagStrategy: 'category',
      includeLink: false,
      customHashtags: ['ShoeSwiper', 'Fashion', 'Style'],
    },
  },
  workwear: {
    type: 'workwear',
    name: 'WorkWear Weekly',
    tagline: 'Built for Work, Made to Last',
    domain: 'workwear.shoeswiper.com',
    primaryColor: '#F4A261',
    secondaryColor: '#264653',
    logo: '/logos/workwear-blog.svg',
    socialLinks: {
      instagram: 'https://instagram.com/workwearweekly',
    },
    syndication: {
      enabled: true,
      platforms: ['facebook', 'instagram'],
      autoPost: true,
      delayMinutes: 15,
      hashtagStrategy: 'brand',
      includeLink: true,
      customHashtags: ['WorkWear', 'BuiltTough', 'TradesLife'],
    },
  },
  music: {
    type: 'music',
    name: 'SoleSound',
    tagline: 'Where Sneakers Meet the Beat',
    domain: 'music.shoeswiper.com',
    primaryColor: '#E63946',
    secondaryColor: '#1D3557',
    logo: '/logos/music-blog.svg',
    socialLinks: {
      twitter: 'https://twitter.com/solesound',
      instagram: 'https://instagram.com/solesoundmusic',
      tiktok: 'https://tiktok.com/@solesound',
    },
    syndication: {
      enabled: true,
      platforms: ['twitter', 'instagram', 'tiktok'],
      autoPost: true,
      delayMinutes: 5,
      hashtagStrategy: 'mixed',
      includeLink: true,
      customHashtags: ['SoleSound', 'SneakersAndBeats', 'MusicCulture'],
    },
  },
};

// Default authors
export const DEFAULT_AUTHORS: Record<string, BlogAuthor> = {
  ai: {
    id: 'ai-writer',
    name: 'ShoeSwiper AI',
    avatar: '/avatars/ai-writer.png',
    bio: 'AI-powered content crafted with passion for sneakers and style.',
    socialLinks: {},
  },
  sneaker_expert: {
    id: 'sneaker-expert',
    name: 'Jordan Style',
    avatar: '/avatars/jordan-style.png',
    bio: 'Sneakerhead since \'95. Collector, curator, culture enthusiast.',
    socialLinks: {
      twitter: 'https://twitter.com/jordanstyle',
      instagram: 'https://instagram.com/jordanstyle',
    },
  },
  workwear_pro: {
    id: 'workwear-pro',
    name: 'Mike Builder',
    avatar: '/avatars/mike-builder.png',
    bio: '20+ years in construction. I know what boots can handle the job.',
    socialLinks: {},
  },
  music_curator: {
    id: 'music-curator',
    name: 'DJ Kicks',
    avatar: '/avatars/dj-kicks.png',
    bio: 'Producer, DJ, and sneaker collector. Music and kicks are my life.',
    socialLinks: {
      instagram: 'https://instagram.com/djkicks',
      tiktok: 'https://tiktok.com/@djkicks',
    },
  },
};

// Default categories
export const DEFAULT_CATEGORIES: BlogCategory[] = [
  {
    id: 'releases',
    name: 'New Releases',
    slug: 'releases',
    description: 'The latest drops and upcoming releases',
    color: '#FF6B35',
    icon: '🔥',
  },
  {
    id: 'reviews',
    name: 'Reviews',
    slug: 'reviews',
    description: 'In-depth reviews and comparisons',
    color: '#6C63FF',
    icon: '⭐',
  },
  {
    id: 'style',
    name: 'Style Guides',
    slug: 'style',
    description: 'How to wear and style your kicks',
    color: '#2EC4B6',
    icon: '👟',
  },
  {
    id: 'culture',
    name: 'Culture',
    slug: 'culture',
    description: 'Sneaker culture, history, and community',
    color: '#E63946',
    icon: '🎨',
  },
  {
    id: 'deals',
    name: 'Deals & Steals',
    slug: 'deals',
    description: 'Best prices and exclusive discounts',
    color: '#2A9D8F',
    icon: '💰',
  },
  {
    id: 'music',
    name: 'Music & Artists',
    slug: 'music',
    description: 'Artists, albums, and music culture',
    color: '#9B5DE5',
    icon: '🎵',
  },
  {
    id: 'workwear',
    name: 'Work Gear',
    slug: 'workwear',
    description: 'Boots and gear built for the job',
    color: '#F4A261',
    icon: '🔧',
  },
];
