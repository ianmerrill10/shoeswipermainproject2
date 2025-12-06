/**
 * Advertising Agent - ShoeSwiper
 * ===============================
 * Comprehensive paid advertising strategies across all major platforms
 *
 * Platforms covered:
 * - TikTok Ads
 * - Meta (Facebook/Instagram) Ads
 * - Google Ads (Search, Shopping, YouTube, Display)
 * - Snapchat Ads
 * - Pinterest Ads
 * - Twitter/X Ads
 * - Reddit Ads
 * - Programmatic/Display
 * - Influencer Paid Partnerships
 *
 * Revenue Model: 100% Affiliate Commission (No subscriptions)
 */

import { AFFILIATE_TAG } from '../lib/config';

// ============================================
// ADVERTISING STRATEGY OVERVIEW
// ============================================

export const ADVERTISING_OVERVIEW = {
  revenueModel: 'Affiliate commissions from Amazon Associates (4-8% per sale)',
  primaryGoal: 'Drive qualified traffic that converts to affiliate clicks and purchases',
  secondaryGoals: [
    'App downloads and daily active users',
    'Email list growth for remarketing',
    'Brand awareness in sneaker community',
    'Community building and engagement',
  ],
  noSubscriptions: true, // Revenue is 100% affiliate-based
};

// ============================================
// TIKTOK ADS
// ============================================

export const TIKTOK_ADS = {
  platform: 'TikTok Ads',
  monthlyBudget: { min: 1000, recommended: 5000, aggressive: 15000 },

  adFormats: [
    {
      format: 'In-Feed Ads',
      description: 'Native video ads in For You feed',
      specs: '9:16 vertical, 5-60 seconds',
      cpc: '$0.50-2.00',
      bestFor: 'Conversions, app installs',
    },
    {
      format: 'Spark Ads',
      description: 'Boost organic posts or creator content',
      specs: 'Uses existing TikToks',
      cpc: '$0.30-1.50',
      bestFor: 'Authenticity, lower CPA',
    },
    {
      format: 'TopView',
      description: 'First ad users see when opening app',
      specs: '60 seconds max, 9:16',
      cpm: '$50-100',
      bestFor: 'Brand awareness, launches',
    },
    {
      format: 'Branded Hashtag Challenge',
      description: 'Sponsored challenge with dedicated page',
      cost: '$50,000-150,000',
      bestFor: 'Viral campaigns, UGC',
    },
    {
      format: 'Branded Effects',
      description: 'Custom AR filters and effects',
      cost: '$20,000-80,000',
      bestFor: 'Engagement, brand recall',
    },
  ],

  targeting: {
    demographics: ['Age 16-35', 'US primary', 'Interest in fashion/sneakers'],
    interests: [
      'Sneakers', 'Streetwear', 'Fashion', 'Nike', 'Jordan', 'Adidas',
      'Shopping', 'Hypebeast', 'Basketball', 'Hip-hop', 'Sports',
    ],
    behaviors: ['Engaged shoppers', 'Video creators', 'App installers'],
    customAudiences: ['Website visitors', 'App users', 'Email list'],
    lookalikes: ['Based on purchasers', 'Based on app engagers'],
  },

  creativeStrategy: [
    {
      type: 'UGC-Style',
      description: 'Ads that look like organic TikToks',
      hook: 'Talking head, POV, trending format',
      performance: 'Best CTR and conversion',
    },
    {
      type: 'Product Showcase',
      description: 'Clean product-focused videos',
      hook: 'Satisfying unboxing, transitions',
      performance: 'Good for retargeting',
    },
    {
      type: 'Social Proof',
      description: 'User testimonials and reviews',
      hook: '"I found this app and..." format',
      performance: 'High trust, good CVR',
    },
    {
      type: 'FOMO/Urgency',
      description: 'Limited drops, price alerts',
      hook: '"These are selling out..." format',
      performance: 'High CTR, immediate action',
    },
  ],

  copyFormulas: [
    'POV: You just found the best sneaker app',
    'Stop scrolling if you love sneakers 👟',
    'I found [product] for [price] using this app',
    'Sneakerheads, you NEED this app',
    'How I find every sneaker deal',
    'This app is like Tinder for sneakers',
  ],
};

// ============================================
// META ADS (Facebook/Instagram)
// ============================================

export const META_ADS = {
  platform: 'Meta (Facebook/Instagram)',
  monthlyBudget: { min: 2000, recommended: 8000, aggressive: 25000 },

  adFormats: {
    instagram: [
      {
        format: 'Reels Ads',
        specs: '9:16, up to 60 seconds',
        placement: 'Between organic Reels',
        cpc: '$0.50-2.00',
        bestFor: 'Engagement, younger audience',
      },
      {
        format: 'Story Ads',
        specs: '9:16, up to 15 seconds',
        placement: 'Between Stories',
        cpc: '$0.30-1.50',
        bestFor: 'Swipe-up actions, quick CTAs',
      },
      {
        format: 'Feed Ads',
        specs: '1:1 or 4:5, image or video',
        placement: 'In-feed',
        cpc: '$0.50-2.50',
        bestFor: 'Detailed messaging',
      },
      {
        format: 'Explore Ads',
        specs: 'Various',
        placement: 'Explore tab',
        cpc: '$0.40-1.80',
        bestFor: 'Discovery audience',
      },
      {
        format: 'Shopping Ads',
        specs: 'Product catalog',
        placement: 'Shop tab, feed',
        cpc: '$0.60-2.00',
        bestFor: 'Direct product sales',
      },
    ],
    facebook: [
      {
        format: 'Feed Ads',
        specs: 'Various aspect ratios',
        placement: 'News Feed',
        cpc: '$0.50-3.00',
        bestFor: 'Older demographic (25+)',
      },
      {
        format: 'Marketplace Ads',
        specs: 'Product listings',
        placement: 'Marketplace',
        cpc: '$0.40-2.00',
        bestFor: 'Purchase intent',
      },
      {
        format: 'Video Ads',
        specs: 'Various, in-stream',
        placement: 'Feed, Watch',
        cpv: '$0.01-0.05',
        bestFor: 'Brand awareness',
      },
    ],
  },

  campaignStructure: {
    awareness: {
      objective: 'Brand Awareness / Reach',
      audience: 'Broad sneaker interests',
      budget: '20% of total',
      creative: 'Brand intro, value prop',
    },
    consideration: {
      objective: 'Traffic / Engagement',
      audience: 'Video viewers, engagers',
      budget: '30% of total',
      creative: 'Product showcases, social proof',
    },
    conversion: {
      objective: 'Conversions / App Installs',
      audience: 'Website visitors, cart abandoners',
      budget: '50% of total',
      creative: 'Strong CTA, urgency, testimonials',
    },
  },

  targeting: {
    coreAudiences: {
      demographics: ['18-44', 'All genders', 'US'],
      interests: [
        'Sneaker culture', 'Streetwear', 'Nike', 'Jordan Brand', 'Adidas',
        'New Balance', 'Foot Locker', 'StockX', 'GOAT', 'Sneaker News',
        'Hypebeast', 'Complex', 'Sole Collector',
      ],
      behaviors: ['Engaged shoppers', 'Online buyers', 'Mobile users'],
    },
    customAudiences: [
      { name: 'Website Visitors', retention: '180 days' },
      { name: 'App Users', retention: '180 days' },
      { name: 'Email Subscribers', source: 'Upload' },
      { name: 'Video Viewers', retention: '365 days' },
      { name: 'Engagers', retention: '365 days' },
    ],
    lookalikeAudiences: [
      { source: 'Purchasers', percentage: '1-3%' },
      { source: 'App Installers', percentage: '1-5%' },
      { source: 'High-Value Users', percentage: '1-2%' },
    ],
  },

  creativeTypes: [
    {
      type: 'Carousel Ads',
      description: 'Multiple products/benefits',
      cards: '3-10 cards',
      bestFor: 'Product variety, storytelling',
    },
    {
      type: 'Collection Ads',
      description: 'Immersive product catalog',
      format: 'Cover + product grid',
      bestFor: 'Shopping experience',
    },
    {
      type: 'Dynamic Ads',
      description: 'Auto-personalized products',
      source: 'Product catalog',
      bestFor: 'Retargeting, personalization',
    },
    {
      type: 'UGC Ads',
      description: 'Creator/user content',
      format: 'Native-looking content',
      bestFor: 'Authenticity, trust',
    },
  ],
};

// ============================================
// GOOGLE ADS
// ============================================

export const GOOGLE_ADS = {
  platform: 'Google Ads',
  monthlyBudget: { min: 1500, recommended: 6000, aggressive: 20000 },

  campaignTypes: {
    search: {
      name: 'Search Campaigns',
      description: 'Text ads on Google search results',
      cpc: '$1.00-5.00',
      conversionRate: '3-8%',
      keywords: {
        brandTerms: ['shoeswiper', 'shoe swiper app'],
        productTerms: [
          'buy nike dunk low', 'jordan 1 for sale', 'where to buy yeezys',
          'air max 90 price', 'new balance 550 buy', 'best price jordans',
        ],
        informational: [
          'best sneakers 2024', 'sneaker release calendar', 'upcoming jordan releases',
          'cheap jordans', 'sneaker deals', 'discount sneakers',
        ],
        competitor: [
          'stockx alternative', 'goat app alternative', 'sneaker app',
        ],
      },
      adCopyTemplates: [
        {
          headline1: 'Find Your Perfect Sneakers',
          headline2: 'Swipe to Discover New Kicks',
          headline3: 'Best Deals on Sneakers',
          description1: 'Discover sneakers you\'ll love with our swipe-to-shop app. New drops daily.',
          description2: 'Get price alerts, find deals, and shop from Amazon. Download free today!',
        },
      ],
    },

    shopping: {
      name: 'Shopping Campaigns',
      description: 'Product listings in search and Shopping tab',
      cpc: '$0.50-3.00',
      requirements: 'Product feed via Merchant Center',
      strategy: 'Use for specific product promotion with affiliate links',
    },

    youtube: {
      name: 'YouTube Ads',
      description: 'Video ads on YouTube',
      formats: [
        {
          type: 'Skippable In-Stream',
          length: '15-60 seconds recommended',
          billing: 'CPV after 30s or interaction',
          cpv: '$0.02-0.10',
        },
        {
          type: 'Non-Skippable In-Stream',
          length: '15-20 seconds',
          billing: 'CPM',
          cpm: '$10-30',
        },
        {
          type: 'Bumper Ads',
          length: '6 seconds',
          billing: 'CPM',
          cpm: '$5-15',
        },
        {
          type: 'Discovery Ads',
          placement: 'Search results, related videos',
          billing: 'CPC',
          cpc: '$0.10-0.50',
        },
        {
          type: 'Shorts Ads',
          placement: 'YouTube Shorts feed',
          billing: 'CPM/CPV',
          bestFor: 'Younger audience',
        },
      ],
      targeting: [
        'Custom intent (sneaker searches)',
        'Affinity (sneaker enthusiasts)',
        'In-market (apparel shoppers)',
        'Placement (sneaker channels)',
      ],
    },

    display: {
      name: 'Display Network',
      description: 'Banner ads across websites',
      cpm: '$1-5',
      formats: ['Responsive display', 'Image ads', 'HTML5 ads'],
      targeting: ['Contextual (sneaker sites)', 'Remarketing', 'Similar audiences'],
      placements: ['Sneaker blogs', 'Fashion sites', 'Sports news', 'YouTube'],
    },

    performanceMax: {
      name: 'Performance Max',
      description: 'AI-optimized across all Google properties',
      recommendation: 'Best for broad reach with smart bidding',
      assets: ['Headlines', 'Descriptions', 'Images', 'Videos', 'Logos'],
    },

    appCampaigns: {
      name: 'App Campaigns',
      description: 'Automated app install campaigns',
      platforms: ['Search', 'Play Store', 'YouTube', 'Display', 'Discover'],
      cpi: '$1-5',
      optimization: ['Installs', 'In-app actions', 'ROAS'],
    },
  },
};

// ============================================
// SNAPCHAT ADS
// ============================================

export const SNAPCHAT_ADS = {
  platform: 'Snapchat Ads',
  monthlyBudget: { min: 500, recommended: 3000, aggressive: 10000 },

  adFormats: [
    {
      format: 'Snap Ads',
      description: 'Full-screen vertical video',
      specs: '9:16, 3-180 seconds',
      cpm: '$3-8',
      swipeUp: 'App install, website, AR lens',
    },
    {
      format: 'Story Ads',
      description: 'Branded tile in Discover',
      specs: 'Collection of 3-20 Snaps',
      cpm: '$5-15',
      bestFor: 'Brand storytelling',
    },
    {
      format: 'Collection Ads',
      description: 'Product tiles with video',
      specs: 'Video + 4 product tiles',
      cpm: '$4-10',
      bestFor: 'Product catalog',
    },
    {
      format: 'Dynamic Ads',
      description: 'Auto-generated from catalog',
      specs: 'Template-based',
      bestFor: 'Retargeting, personalization',
    },
    {
      format: 'AR Lenses',
      description: 'Sponsored AR experiences',
      types: ['Face lenses', 'World lenses'],
      cost: '$5,000-500,000',
      bestFor: 'Virtual sneaker try-on',
    },
    {
      format: 'Filters',
      description: 'Location or branded overlays',
      cost: '$5-20/day/geofence',
      bestFor: 'Events, local targeting',
    },
    {
      format: 'Commercials',
      description: 'Non-skippable premium video',
      specs: '6 seconds',
      cpm: '$15-30',
      bestFor: 'Guaranteed views',
    },
  ],

  targeting: {
    demographics: ['13-34 primary', 'Slight female skew'],
    interests: ['Fashion', 'Sneakers', 'Shopping', 'Music', 'Sports'],
    behaviors: ['Frequent shoppers', 'AR enthusiasts'],
    snapchatLifestyles: ['Sneakerheads', 'Fashionistas', 'Deal seekers'],
  },

  creativeGuidelines: [
    'Hook in first 2 seconds',
    'Sound-on designed (90%+ use sound)',
    'Native-feeling content performs best',
    'Include clear CTA',
    'Use motion and bright colors',
    'Feature young, diverse talent',
  ],
};

// ============================================
// PINTEREST ADS
// ============================================

export const PINTEREST_ADS = {
  platform: 'Pinterest Ads',
  monthlyBudget: { min: 500, recommended: 2000, aggressive: 8000 },

  adFormats: [
    {
      format: 'Standard Pins',
      specs: '1000x1500 (2:3), single image',
      cpc: '$0.10-1.50',
      bestFor: 'Product discovery',
    },
    {
      format: 'Video Pins',
      specs: '1:1, 4:5, or 9:16, 4-15 seconds',
      cpv: '$0.02-0.10',
      bestFor: 'Engagement, tutorials',
    },
    {
      format: 'Carousel Pins',
      specs: '2-5 images, swipeable',
      cpc: '$0.10-1.00',
      bestFor: 'Multiple products, stories',
    },
    {
      format: 'Shopping Pins',
      specs: 'Linked to product catalog',
      cpc: '$0.20-2.00',
      bestFor: 'Direct product sales',
    },
    {
      format: 'Collections',
      specs: 'Hero + 3 secondary images',
      cpc: '$0.15-1.50',
      bestFor: 'Lifestyle + products',
    },
    {
      format: 'Idea Pins (ads)',
      specs: 'Multi-page, video-first',
      cpm: '$2-8',
      bestFor: 'Tutorials, inspiration',
    },
  ],

  targeting: {
    keywords: [
      'sneaker outfits', 'nike style', 'jordan outfit ideas',
      'streetwear inspo', 'shoe closet', 'sneaker collection',
      'mens fashion sneakers', 'womens sneaker style',
    ],
    interests: [
      'Men\'s fashion', 'Women\'s fashion', 'Sneakers', 'Streetwear',
      'Sports', 'Shopping', 'Style inspiration',
    ],
    audiences: ['Actalikes (Pinterest lookalikes)', 'Visitors', 'Engagers', 'Email list'],
  },

  strategy: [
    'Focus on aspirational, aesthetic content',
    'Use rich pins for product info',
    'Target high-intent keywords',
    'Seasonal campaigns perform well',
    'Long content lifespan (pins last months)',
  ],
};

// ============================================
// TWITTER/X ADS
// ============================================

export const TWITTER_ADS = {
  platform: 'Twitter/X Ads',
  monthlyBudget: { min: 500, recommended: 2500, aggressive: 8000 },

  adFormats: [
    {
      format: 'Promoted Tweets',
      description: 'Boosted tweets in timeline',
      engagement: '$0.50-3.00/engagement',
      bestFor: 'Awareness, engagement',
    },
    {
      format: 'Promoted Accounts',
      description: 'Follower growth ads',
      cpc: '$2-4/follower',
      bestFor: 'Building audience',
    },
    {
      format: 'Promoted Trends',
      description: 'Trending topic sponsorship',
      cost: '$200,000+/day',
      bestFor: 'Major launches',
    },
    {
      format: 'Video Ads',
      description: 'In-feed video content',
      specs: '15 seconds optimal',
      cpv: '$0.02-0.10',
      bestFor: 'Brand awareness',
    },
    {
      format: 'Carousel Ads',
      description: 'Multiple images/videos',
      cards: '2-6 cards',
      bestFor: 'Product showcases',
    },
    {
      format: 'App Install Cards',
      description: 'Direct app download',
      cpi: '$2-6',
      bestFor: 'App downloads',
    },
  ],

  targeting: {
    keywords: ['sneakers', 'kicks', 'jordans', 'nike', 'yeezy', 'sneakerhead'],
    followers: ['@sneakernews', '@nicekicks', '@hypebeast', '@complexsneakers'],
    interests: ['Sneaker culture', 'Fashion', 'Sports', 'Hip-hop'],
    events: ['Sneaker releases', 'NBA games', 'Fashion weeks'],
    conversations: ['Sneaker drops', 'Streetwear', 'Resale'],
  },
};

// ============================================
// REDDIT ADS
// ============================================

export const REDDIT_ADS = {
  platform: 'Reddit Ads',
  monthlyBudget: { min: 300, recommended: 1500, aggressive: 5000 },

  adFormats: [
    {
      format: 'Promoted Posts',
      description: 'Native posts in subreddit feeds',
      cpm: '$2-10',
      cpc: '$0.20-2.00',
    },
    {
      format: 'Video Ads',
      description: 'Video in feed',
      cpv: '$0.02-0.08',
    },
    {
      format: 'Carousel Ads',
      description: 'Multiple images',
      cards: '2-6 cards',
    },
    {
      format: 'Conversation Ads',
      description: 'AMA-style engagement',
      bestFor: 'Community building',
    },
  ],

  targeting: {
    subreddits: [
      'r/Sneakers', 'r/SneakerDeals', 'r/streetwear', 'r/malefashionadvice',
      'r/frugalmalefashion', 'r/Repsneakers', 'r/nike', 'r/airjordan',
    ],
    interests: ['Fashion', 'Sports', 'Deals', 'Technology'],
    communities: 'Interest communities related to sneakers',
  },

  bestPractices: [
    'Be authentic - Reddit hates obvious ads',
    'Provide value, not just promotion',
    'Engage with comments',
    'Use Reddit-native language',
    'Target specific subreddits for relevance',
    'Time posts for peak activity',
  ],
};

// ============================================
// PROGRAMMATIC/DISPLAY
// ============================================

export const PROGRAMMATIC_ADS = {
  platform: 'Programmatic Display',
  monthlyBudget: { min: 1000, recommended: 4000, aggressive: 15000 },

  dspOptions: [
    'Google DV360',
    'The Trade Desk',
    'Amazon DSP',
    'MediaMath',
    'Criteo',
  ],

  adFormats: {
    display: ['300x250', '728x90', '160x600', '300x600', '320x50 (mobile)'],
    native: 'In-feed native ads matching site design',
    video: ['Pre-roll', 'Mid-roll', 'Out-stream'],
    ctv: 'Connected TV ads',
    audio: 'Spotify, podcast ads',
  },

  targeting: {
    contextual: 'Sneaker content, fashion sites, sports news',
    behavioral: 'Sneaker shoppers, fashion enthusiasts',
    retargeting: 'Website visitors, app users',
    lookalike: 'Similar to converters',
    geographic: 'Major US metros',
  },

  placements: [
    'Sneaker blogs (Nice Kicks, Sneaker News)',
    'Fashion publications (GQ, Hypebeast)',
    'Sports sites (ESPN, Bleacher Report)',
    'Lifestyle sites (Complex, Highsnobiety)',
    'YouTube pre-roll',
    'Podcast sponsorships',
  ],
};

// ============================================
// INFLUENCER PAID PARTNERSHIPS
// ============================================

export const INFLUENCER_PAID = {
  category: 'Influencer Paid Partnerships',
  monthlyBudget: { min: 2000, recommended: 8000, aggressive: 25000 },

  tiers: {
    nano: {
      followers: '1K-10K',
      costPerPost: '$50-200',
      engagement: '5-10%',
      quantity: '20-50/month',
    },
    micro: {
      followers: '10K-100K',
      costPerPost: '$200-1000',
      engagement: '3-5%',
      quantity: '10-20/month',
    },
    mid: {
      followers: '100K-500K',
      costPerPost: '$1000-5000',
      engagement: '2-3%',
      quantity: '3-5/month',
    },
    macro: {
      followers: '500K-1M',
      costPerPost: '$5000-15000',
      engagement: '1-2%',
      quantity: '1-2/month',
    },
    mega: {
      followers: '1M+',
      costPerPost: '$15000-100000+',
      engagement: '1-2%',
      quantity: 'Quarterly',
    },
  },

  contentTypes: [
    {
      type: 'Dedicated Post',
      description: 'Full post about ShoeSwiper',
      pricing: 'Full rate',
    },
    {
      type: 'Integration',
      description: 'Mention within broader content',
      pricing: '50-70% of rate',
    },
    {
      type: 'Story/Reel',
      description: 'Short-form content',
      pricing: '30-50% of rate',
    },
    {
      type: 'Affiliate Content',
      description: 'Commission-based with bonus',
      pricing: 'Base + commission',
    },
    {
      type: 'Whitelisting',
      description: 'Run ads from influencer account',
      pricing: 'Additional 20-50%',
    },
    {
      type: 'UGC Creation',
      description: 'Content for brand use only',
      pricing: '$150-500/asset',
    },
  ],

  kpisToTrack: [
    'Cost per engagement',
    'Cost per click',
    'Cost per install',
    'Affiliate conversions',
    'Follower growth',
    'Brand mentions',
    'UGC generated',
  ],
};

// ============================================
// ADVERTISING BUDGET CALCULATOR
// ============================================

export function calculateAdBudget(totalBudget: number) {
  return {
    total: totalBudget,
    allocation: {
      tiktok: Math.round(totalBudget * 0.30),
      meta: Math.round(totalBudget * 0.25),
      google: Math.round(totalBudget * 0.15),
      influencer: Math.round(totalBudget * 0.15),
      snapchat: Math.round(totalBudget * 0.05),
      pinterest: Math.round(totalBudget * 0.05),
      reddit: Math.round(totalBudget * 0.03),
      programmatic: Math.round(totalBudget * 0.02),
    },
    breakdown: `
TikTok (30%): Best for awareness and young audience
Meta (25%): Proven conversion platform
Google (15%): High-intent search traffic
Influencer (15%): Authenticity and reach
Snapchat (5%): Gen Z targeting
Pinterest (5%): Long-tail discovery
Reddit (3%): Community engagement
Programmatic (2%): Retargeting reach
    `.trim(),
  };
}

// ============================================
// RETARGETING FUNNEL
// ============================================

export const RETARGETING_FUNNEL = {
  stages: [
    {
      stage: 'Awareness (Top)',
      audience: 'Cold - interest targeting, lookalikes',
      content: 'Brand introduction, value proposition',
      platforms: ['TikTok', 'YouTube', 'Instagram'],
      budget: '20%',
      goal: 'Video views, reach',
    },
    {
      stage: 'Interest (Upper-Mid)',
      audience: 'Warm - video viewers (25%+), engagers',
      content: 'Product showcases, app features',
      platforms: ['TikTok', 'Instagram', 'Facebook'],
      budget: '25%',
      goal: 'Clicks, app page visits',
    },
    {
      stage: 'Consideration (Lower-Mid)',
      audience: 'Hot - website visitors, app viewers',
      content: 'Social proof, testimonials, deals',
      platforms: ['Meta', 'Google Display', 'TikTok'],
      budget: '30%',
      goal: 'Installs, signups',
    },
    {
      stage: 'Conversion (Bottom)',
      audience: 'Ready - app installers, high engagers',
      content: 'Strong CTA, urgency, specific products',
      platforms: ['Meta', 'Google', 'Email'],
      budget: '25%',
      goal: 'Affiliate clicks, purchases',
    },
  ],

  retargetingAudiences: [
    { name: 'All Website Visitors', window: '180 days', priority: 'High' },
    { name: 'Product Page Viewers', window: '30 days', priority: 'Very High' },
    { name: 'App Installers', window: '365 days', priority: 'High' },
    { name: 'Non-Active Users', window: '7-30 days inactive', priority: 'High' },
    { name: 'Email Openers', window: '90 days', priority: 'Medium' },
    { name: 'Video Viewers 50%+', window: '30 days', priority: 'Medium' },
    { name: 'Social Engagers', window: '365 days', priority: 'Medium' },
  ],
};

// ============================================
// CREATIVE TESTING FRAMEWORK
// ============================================

export const CREATIVE_TESTING = {
  elements: [
    {
      element: 'Hook (First 3 seconds)',
      variations: [
        'Question hook: "Do you love sneakers?"',
        'Statement hook: "This app changed how I shop"',
        'Visual hook: Satisfying unboxing',
        'POV hook: "POV: You just found grails"',
        'Challenge hook: "Can you guess the price?"',
      ],
    },
    {
      element: 'Visual Style',
      variations: [
        'UGC/selfie style',
        'Professional product shots',
        'Screen recording/app demo',
        'Split screen comparison',
        'Text-on-screen only',
      ],
    },
    {
      element: 'CTA',
      variations: [
        'Download now',
        'Link in bio',
        'Try it free',
        'Start swiping',
        'Find your grails',
      ],
    },
    {
      element: 'Value Prop',
      variations: [
        'Like Tinder for sneakers',
        'Find deals instantly',
        'Discover your next kicks',
        'Never miss a drop',
        'Shop 1000+ sneakers',
      ],
    },
  ],

  testingProtocol: [
    'Test one element at a time',
    'Minimum $50-100 per variation',
    'Run for 3-5 days minimum',
    'Statistical significance before declaring winner',
    'Roll winning creative, iterate',
    'Refresh creatives every 2-4 weeks',
  ],
};

// ============================================
// EXPORTS
// ============================================

export const advertisingAgents = {
  tiktok: TIKTOK_ADS,
  meta: META_ADS,
  google: GOOGLE_ADS,
  snapchat: SNAPCHAT_ADS,
  pinterest: PINTEREST_ADS,
  twitter: TWITTER_ADS,
  reddit: REDDIT_ADS,
  programmatic: PROGRAMMATIC_ADS,
  influencer: INFLUENCER_PAID,
};

export const AdvertisingAgent = {
  overview: ADVERTISING_OVERVIEW,
  platforms: advertisingAgents,
  calculateBudget: calculateAdBudget,
  retargetingFunnel: RETARGETING_FUNNEL,
  creativeTesting: CREATIVE_TESTING,
};

export default AdvertisingAgent;
