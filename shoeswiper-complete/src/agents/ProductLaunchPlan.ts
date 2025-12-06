/**
 * Product Launch Plan - ShoeSwiper
 * =================================
 * Comprehensive 90-day launch strategy for ShoeSwiper
 * TikTok-style sneaker discovery marketplace
 *
 * Target: 100,000 app downloads in first 90 days
 * Revenue Goal: $50,000 affiliate revenue in first 90 days
 */

import { AFFILIATE_TAG } from '../lib/config';

// ============================================
// LAUNCH PHASES OVERVIEW
// ============================================

export const LAUNCH_PHASES = {
  phase1: {
    name: 'Pre-Launch Hype',
    duration: 'Days 1-30',
    goal: 'Build waitlist of 10,000+ users',
    focus: 'Awareness, FOMO, Influencer Seeding',
  },
  phase2: {
    name: 'Soft Launch',
    duration: 'Days 31-45',
    goal: 'Onboard 5,000 beta users, gather feedback',
    focus: 'Testing, Iteration, Community Building',
  },
  phase3: {
    name: 'Public Launch',
    duration: 'Days 46-60',
    goal: 'Drive 50,000 downloads',
    focus: 'Paid Ads, PR, Viral Campaigns',
  },
  phase4: {
    name: 'Growth Acceleration',
    duration: 'Days 61-90',
    goal: 'Reach 100,000 users, optimize monetization',
    focus: 'Retention, Referrals, Revenue Optimization',
  },
};

// ============================================
// PHASE 1: PRE-LAUNCH HYPE (Days 1-30)
// ============================================

export const PHASE_1_PRE_LAUNCH = {
  name: 'Pre-Launch Hype',
  objectives: [
    'Build email waitlist of 10,000+ potential users',
    'Create buzz and anticipation on social media',
    'Secure 50+ influencer partnerships',
    'Generate 100+ pieces of user-generated content',
    'Establish brand identity and voice',
  ],

  // Week 1: Foundation
  week1: {
    name: 'Foundation Building',
    tasks: [
      {
        task: 'Launch landing page with waitlist',
        owner: 'Marketing',
        deliverables: [
          'Compelling headline: "Tinder for Sneakers"',
          'Email capture with 10% discount incentive',
          'Social proof elements (coming features)',
          'Countdown timer to launch',
          'Social sharing for priority access',
        ],
      },
      {
        task: 'Set up social media presence',
        owner: 'Marketing',
        deliverables: [
          '@shoeswiper on TikTok, Instagram, Twitter',
          'Profile optimization with consistent branding',
          'Link in bio setup with Linktree',
          'Content calendar for first 30 days',
        ],
      },
      {
        task: 'Create brand assets',
        owner: 'Design',
        deliverables: [
          'Logo variations',
          'Color palette and typography',
          'Social media templates',
          'Email templates',
          'Presentation deck for partners',
        ],
      },
      {
        task: 'Begin influencer outreach',
        owner: 'Marketing',
        deliverables: [
          'List of 200 target influencers',
          'Outreach templates (DM and email)',
          'Partnership proposal document',
          'Affiliate program setup',
        ],
      },
    ],
    metrics: {
      waitlistSignups: 500,
      socialFollowers: 1000,
      influencerResponses: 30,
    },
  },

  // Week 2: Content Engine
  week2: {
    name: 'Content Engine Activation',
    tasks: [
      {
        task: 'Launch TikTok content strategy',
        owner: 'Content',
        deliverables: [
          'Post 3x daily on TikTok',
          'Test viral formats (see MarketingAgent)',
          'Engage with sneaker community',
          'Use trending sounds and hashtags',
        ],
      },
      {
        task: 'Start Instagram Reels',
        owner: 'Content',
        deliverables: [
          'Daily Reels content',
          'Story engagement features',
          'Collab requests sent',
          'User polls and quizzes',
        ],
      },
      {
        task: 'Seed product to influencers',
        owner: 'Marketing',
        deliverables: [
          'Send 25 early access invites',
          'Create influencer onboarding guide',
          'Provide content guidelines',
          'Set up tracking links',
        ],
      },
      {
        task: 'Launch referral waitlist',
        owner: 'Product',
        deliverables: [
          'Referral link generation',
          'Leaderboard for top referrers',
          'Bonus rewards for milestones',
          'Viral share mechanics',
        ],
      },
    ],
    metrics: {
      waitlistSignups: 2000,
      socialFollowers: 5000,
      tiktokViews: 100000,
      influencerPartners: 15,
    },
  },

  // Week 3: Momentum Building
  week3: {
    name: 'Momentum Building',
    tasks: [
      {
        task: 'Launch #ShoeSwiper challenge',
        owner: 'Marketing',
        deliverables: [
          'Challenge concept and rules',
          'Prize package ($500 value)',
          'Influencer kickoff posts',
          'UGC collection system',
        ],
      },
      {
        task: 'PR outreach begins',
        owner: 'PR',
        deliverables: [
          'Press release draft',
          'Media list (sneaker blogs, tech)',
          'Pitch emails sent',
          'Press kit prepared',
        ],
      },
      {
        task: 'Discord community launch',
        owner: 'Community',
        deliverables: [
          'Server setup with channels',
          'Welcome flow automation',
          'Early access perks',
          'Community guidelines',
        ],
      },
      {
        task: 'Email nurture sequence',
        owner: 'Email',
        deliverables: [
          '5-email pre-launch sequence',
          'Countdown emails',
          'Exclusive previews',
          'Early access lottery',
        ],
      },
    ],
    metrics: {
      waitlistSignups: 5000,
      socialFollowers: 15000,
      discordMembers: 500,
      ugcSubmissions: 50,
    },
  },

  // Week 4: Final Countdown
  week4: {
    name: 'Final Countdown',
    tasks: [
      {
        task: 'Influencer content push',
        owner: 'Marketing',
        deliverables: [
          'Coordinate 50 influencer posts',
          'Stagger content throughout week',
          'Amplify top performing content',
          'Track affiliate signups',
        ],
      },
      {
        task: 'FOMO campaign',
        owner: 'Marketing',
        deliverables: [
          'Limited early access spots messaging',
          'Countdown everywhere',
          'Sneak peeks of features',
          'Testimonials from beta testers',
        ],
      },
      {
        task: 'Launch day preparation',
        owner: 'All Teams',
        deliverables: [
          'Launch day checklist complete',
          'Support team briefed',
          'Server capacity tested',
          'Marketing assets ready',
        ],
      },
    ],
    metrics: {
      waitlistSignups: 10000,
      socialFollowers: 30000,
      emailOpenRate: '45%',
      influencerPosts: 100,
    },
  },
};

// ============================================
// PHASE 2: SOFT LAUNCH (Days 31-45)
// ============================================

export const PHASE_2_SOFT_LAUNCH = {
  name: 'Soft Launch',
  objectives: [
    'Onboard 5,000 beta users smoothly',
    'Achieve 4.5+ star app rating',
    'Identify and fix critical bugs',
    'Validate product-market fit',
    'Build core community advocates',
  ],

  week5: {
    name: 'Beta User Onboarding',
    tasks: [
      {
        task: 'Invite-only launch',
        owner: 'Product',
        deliverables: [
          'Send first 1,000 invites to waitlist',
          'Prioritize top referrers',
          'Include influencer partners',
          'VIP onboarding experience',
        ],
      },
      {
        task: 'Collect feedback',
        owner: 'Product',
        deliverables: [
          'In-app feedback button',
          'User interviews (20 sessions)',
          'NPS survey at day 3',
          'Bug tracking system',
        ],
      },
      {
        task: 'Community engagement',
        owner: 'Community',
        deliverables: [
          'Welcome each new user personally',
          'Daily AMAs in Discord',
          'Feature request voting',
          'Bug bounty program',
        ],
      },
    ],
    metrics: {
      activeUsers: 1000,
      appRating: 4.5,
      npsScore: 40,
      bugReports: '< 50',
    },
  },

  week6: {
    name: 'Iteration & Growth',
    tasks: [
      {
        task: 'Ship quick wins',
        owner: 'Engineering',
        deliverables: [
          'Fix top 10 reported bugs',
          'Implement top 3 feature requests',
          'Performance optimizations',
          'UI/UX improvements',
        ],
      },
      {
        task: 'Expand beta',
        owner: 'Marketing',
        deliverables: [
          'Send 4,000 more invites',
          'Referral bonus for beta users',
          'Early bird pricing locked',
        ],
      },
      {
        task: 'Content amplification',
        owner: 'Content',
        deliverables: [
          'User testimonial videos',
          'Before/after stories',
          'Feature highlight reels',
          'Behind-the-scenes content',
        ],
      },
    ],
    metrics: {
      activeUsers: 5000,
      dailyActiveUsers: 2000,
      sessionDuration: '5+ min',
      affiliateClicks: 1000,
    },
  },
};

// ============================================
// PHASE 3: PUBLIC LAUNCH (Days 46-60)
// ============================================

export const PHASE_3_PUBLIC_LAUNCH = {
  name: 'Public Launch',
  objectives: [
    'Drive 50,000 app downloads',
    'Achieve viral moment on TikTok',
    'Secure major press coverage',
    'Hit $10,000 affiliate revenue',
    'Establish category leadership',
  ],

  launchDay: {
    name: 'Launch Day Playbook',
    timeline: [
      {
        time: '12:00 AM EST',
        action: 'App goes live on App Store/Play Store',
        owner: 'Engineering',
      },
      {
        time: '6:00 AM EST',
        action: 'Email blast to full waitlist (10,000+)',
        owner: 'Email Marketing',
      },
      {
        time: '7:00 AM EST',
        action: 'Press release goes out',
        owner: 'PR',
      },
      {
        time: '8:00 AM EST',
        action: 'All social channels post announcement',
        owner: 'Social',
      },
      {
        time: '9:00 AM EST',
        action: 'Influencer posts begin (coordinated)',
        owner: 'Influencer Marketing',
      },
      {
        time: '10:00 AM EST',
        action: 'Reddit AMA goes live',
        owner: 'Community',
      },
      {
        time: '12:00 PM EST',
        action: 'TikTok LIVE launch party',
        owner: 'Content',
      },
      {
        time: '2:00 PM EST',
        action: 'Twitter Spaces with sneakerheads',
        owner: 'Community',
      },
      {
        time: '6:00 PM EST',
        action: 'Launch day giveaway winner announced',
        owner: 'Marketing',
      },
      {
        time: '9:00 PM EST',
        action: 'Day 1 metrics review and celebration',
        owner: 'Leadership',
      },
    ],
  },

  week7_8: {
    name: 'Launch Week Campaigns',
    campaigns: [
      {
        campaign: 'Launch Week Giveaway',
        description: 'Win a year of free kicks ($2,000 value)',
        mechanics: 'Download app + follow + share for entries',
        budget: '$2,000 prize + $500 promotion',
        expectedDownloads: 10000,
      },
      {
        campaign: 'Influencer Blitz',
        description: '100 influencers post in 48 hours',
        mechanics: 'Coordinated posting schedule',
        budget: '$15,000',
        expectedReach: 5000000,
      },
      {
        campaign: 'Paid Ad Sprint',
        description: 'Heavy ad spend during launch momentum',
        platforms: ['TikTok Ads', 'Meta Ads', 'Google UAC'],
        budget: '$10,000/week',
        expectedCPA: '$0.50-2.00',
      },
      {
        campaign: 'PR Push',
        description: 'Secure coverage in major outlets',
        targets: ['TechCrunch', 'Hypebeast', 'Complex', 'Sole Collector'],
        approach: 'Exclusive angles for each outlet',
        expectedImpressions: 1000000,
      },
    ],
    metrics: {
      downloads: 50000,
      dailyActiveUsers: 15000,
      affiliateClicks: 10000,
      affiliateRevenue: 10000,
      appStoreRanking: 'Top 50 Shopping',
    },
  },
};

// ============================================
// PHASE 4: GROWTH ACCELERATION (Days 61-90)
// ============================================

export const PHASE_4_GROWTH = {
  name: 'Growth Acceleration',
  objectives: [
    'Reach 100,000 total users',
    'Achieve 30% D7 retention',
    'Hit $75,000 cumulative affiliate revenue',
    'Maximize affiliate click-through rates',
    'Establish sustainable growth engine',
  ],

  retentionOptimization: {
    strategies: [
      {
        strategy: 'Push Notification Optimization',
        description: 'Personalized drop alerts, price notifications, deal alerts',
        expectedImpact: '+15% D7 retention',
      },
      {
        strategy: 'Gamification Features',
        description: 'Daily streaks, collector badges, swipe leaderboards',
        expectedImpact: '+20% engagement',
      },
      {
        strategy: 'Social Features',
        description: 'Follow collectors, share wishlists, outfit showcases',
        expectedImpact: '+25% shares',
      },
      {
        strategy: 'Personalization Engine',
        description: 'AI-powered recommendations improve with each swipe',
        expectedImpact: '+30% click-through',
      },
      {
        strategy: 'Content Refresh',
        description: 'Daily new products, rotating featured items',
        expectedImpact: '+20% return visits',
      },
    ],
  },

  monetizationOptimization: {
    revenueModel: '100% Affiliate Commission - No Subscriptions',
    strategies: [
      {
        strategy: 'Affiliate CTA Optimization',
        description: 'A/B test button text, colors, placement',
        expectedImpact: '+25% affiliate clicks',
      },
      {
        strategy: 'Price Drop Alerts',
        description: 'Email/push when favorited items drop in price',
        expectedImpact: '+40% conversion on alerts',
      },
      {
        strategy: 'Strategic Product Placement',
        description: 'Feature high-commission products in prime positions',
        expectedImpact: '+15% revenue per user',
      },
      {
        strategy: 'Deal Aggregation',
        description: 'Curate best deals section with time-sensitive offers',
        expectedImpact: '+30% CTR on deal content',
      },
      {
        strategy: 'Seasonal Campaigns',
        description: 'Black Friday, Back to School, Holiday gift guides',
        expectedImpact: '3x revenue during peak periods',
      },
      {
        strategy: 'Seller Marketplace Pilot',
        description: 'Allow verified sellers (10% commission)',
        expectedRevenue: '$10,000+/month',
      },
      {
        strategy: 'Brand Partnerships',
        description: 'Featured placements for sneaker brands',
        expectedRevenue: '$5,000-20,000/campaign',
      },
    ],
  },

  sustainedGrowth: {
    strategies: [
      {
        strategy: 'Referral Program Optimization',
        description: 'Test reward amounts, viral mechanics, share incentives',
        goal: '30% of new users from referrals',
      },
      {
        strategy: 'SEO Content Engine',
        description: 'Blog publishing 7x/week, ranking for high-intent keywords',
        goal: '100,000 organic visitors/month',
      },
      {
        strategy: 'Partnership Expansion',
        description: 'Retail partners, brand integrations, cross-promotions',
        goal: '10 major partnerships',
      },
      {
        strategy: 'Geographic Expansion',
        description: 'Localize for UK, Canada, Australia, Germany',
        goal: '25% international users',
      },
      {
        strategy: 'YouTube Channel Growth',
        description: 'Daily sneaker content, reviews, deal roundups',
        goal: '50,000 subscribers in 6 months',
      },
    ],
  },

  week9_12_metrics: {
    downloads: 100000,
    dailyActiveUsers: 30000,
    monthlyActiveUsers: 75000,
    d7Retention: '30%',
    d30Retention: '15%',
    affiliateRevenue: 75000,
    affiliateClickRate: '8%',
    appStoreRating: 4.7,
  },
};

// ============================================
// BUDGET ALLOCATION
// ============================================

export const LAUNCH_BUDGET = {
  total: 100000,
  breakdown: [
    {
      category: 'Paid Advertising',
      budget: 40000,
      percentage: '40%',
      allocation: {
        tiktokAds: 15000,
        metaAds: 15000,
        googleAds: 7000,
        otherPlatforms: 3000,
      },
    },
    {
      category: 'Influencer Marketing',
      budget: 25000,
      percentage: '25%',
      allocation: {
        nanoInfluencers: 5000,
        microInfluencers: 10000,
        macroInfluencers: 8000,
        megaInfluencer: 2000,
      },
    },
    {
      category: 'Content Production',
      budget: 15000,
      percentage: '15%',
      allocation: {
        videoProduction: 8000,
        photography: 3000,
        graphicDesign: 2000,
        copywriting: 2000,
      },
    },
    {
      category: 'PR & Events',
      budget: 10000,
      percentage: '10%',
      allocation: {
        prAgency: 5000,
        pressRelease: 1000,
        launchEvent: 3000,
        mediaGifting: 1000,
      },
    },
    {
      category: 'Tools & Software',
      budget: 5000,
      percentage: '5%',
      allocation: {
        emailMarketing: 1500,
        analytics: 1000,
        socialManagement: 1000,
        designTools: 500,
        other: 1000,
      },
    },
    {
      category: 'Giveaways & Incentives',
      budget: 5000,
      percentage: '5%',
      allocation: {
        launchGiveaway: 2000,
        referralRewards: 2000,
        communityPrizes: 1000,
      },
    },
  ],
};

// ============================================
// KEY METRICS & KPIs
// ============================================

export const KEY_METRICS = {
  acquisition: [
    { metric: 'Total Downloads', target: 100000, period: '90 days' },
    { metric: 'Cost Per Install (CPI)', target: 0.50, period: 'Average' },
    { metric: 'Waitlist Signups', target: 10000, period: '30 days' },
    { metric: 'Organic vs Paid Ratio', target: '40/60', period: 'Launch' },
  ],
  engagement: [
    { metric: 'Daily Active Users (DAU)', target: 30000, period: 'Day 90' },
    { metric: 'Session Duration', target: 5, unit: 'minutes', period: 'Average' },
    { metric: 'Sessions per User', target: 3, period: 'Daily' },
    { metric: 'Swipes per Session', target: 50, period: 'Average' },
  ],
  retention: [
    { metric: 'D1 Retention', target: '50%', period: 'Day 90' },
    { metric: 'D7 Retention', target: '30%', period: 'Day 90' },
    { metric: 'D30 Retention', target: '15%', period: 'Day 90' },
    { metric: 'Monthly Churn Rate', target: '< 10%', period: 'Ongoing' },
  ],
  monetization: [
    { metric: 'Affiliate Click-Through Rate', target: '5%', period: 'Average' },
    { metric: 'Affiliate Conversion Rate', target: '3%', period: 'Average' },
    { metric: 'Affiliate Revenue', target: 50000, period: '90 days' },
    { metric: 'Revenue per User', target: 0.50, period: 'Monthly' },
  ],
  viral: [
    { metric: 'K-Factor', target: 1.2, period: 'Day 90' },
    { metric: 'Referral Rate', target: '25%', period: 'Of new users' },
    { metric: 'Social Shares per User', target: 2, period: 'Monthly' },
    { metric: 'App Store Rating', target: 4.7, period: 'Day 90' },
  ],
};

// ============================================
// RISK MITIGATION
// ============================================

export const RISK_MITIGATION = {
  risks: [
    {
      risk: 'App Store Rejection',
      probability: 'Medium',
      impact: 'High',
      mitigation: 'Early submission, follow guidelines strictly, backup web app',
    },
    {
      risk: 'Server Overload at Launch',
      probability: 'Medium',
      impact: 'Critical',
      mitigation: 'Load testing, auto-scaling, CDN, staged rollout',
    },
    {
      risk: 'Low Conversion Rate',
      probability: 'Medium',
      impact: 'High',
      mitigation: 'A/B test continuously, optimize funnel, user feedback',
    },
    {
      risk: 'Influencer No-Shows',
      probability: 'Low',
      impact: 'Medium',
      mitigation: 'Signed agreements, deposits, backup influencers',
    },
    {
      risk: 'Negative Reviews',
      probability: 'Medium',
      impact: 'High',
      mitigation: 'Rapid response team, in-app support, proactive fixes',
    },
    {
      risk: 'Amazon Affiliate Rejection',
      probability: 'Low',
      impact: 'Critical',
      mitigation: 'Comply with all terms, diversify affiliate networks',
    },
    {
      risk: 'Competitor Response',
      probability: 'High',
      impact: 'Medium',
      mitigation: 'First mover advantage, unique features, brand loyalty',
    },
  ],
};

// ============================================
// LAUNCH CHECKLIST
// ============================================

export const LAUNCH_CHECKLIST = {
  prelaunch: [
    { task: 'App submitted to App Store', completed: false, owner: 'Engineering' },
    { task: 'App submitted to Play Store', completed: false, owner: 'Engineering' },
    { task: 'Landing page live with waitlist', completed: false, owner: 'Marketing' },
    { task: 'Email sequences configured', completed: false, owner: 'Marketing' },
    { task: 'Social media profiles optimized', completed: false, owner: 'Marketing' },
    { task: 'Influencer contracts signed', completed: false, owner: 'Marketing' },
    { task: 'Press kit ready', completed: false, owner: 'PR' },
    { task: 'Support team briefed', completed: false, owner: 'Support' },
    { task: 'Analytics tracking verified', completed: false, owner: 'Data' },
    { task: 'Server capacity tested', completed: false, owner: 'Engineering' },
    { task: 'Affiliate links verified', completed: false, owner: 'Engineering' },
    { task: 'Privacy policy updated', completed: false, owner: 'Legal' },
    { task: 'Discord server ready', completed: false, owner: 'Community' },
    { task: 'Ad creatives approved', completed: false, owner: 'Marketing' },
    { task: 'Launch day schedule finalized', completed: false, owner: 'All' },
  ],
  launchDay: [
    { task: 'App live in stores', completed: false, time: '12:00 AM' },
    { task: 'Waitlist email sent', completed: false, time: '6:00 AM' },
    { task: 'Press release distributed', completed: false, time: '7:00 AM' },
    { task: 'Social announcement posted', completed: false, time: '8:00 AM' },
    { task: 'Influencer posts going live', completed: false, time: '9:00 AM' },
    { task: 'Ads activated', completed: false, time: '10:00 AM' },
    { task: 'Live stream started', completed: false, time: '12:00 PM' },
    { task: 'Giveaway announced', completed: false, time: '2:00 PM' },
    { task: 'Metrics check-in', completed: false, time: '6:00 PM' },
    { task: 'Day 1 celebration/retrospective', completed: false, time: '9:00 PM' },
  ],
  postLaunch: [
    { task: 'Daily metrics review', completed: false, frequency: 'Daily' },
    { task: 'Bug triage and fixes', completed: false, frequency: 'Ongoing' },
    { task: 'User feedback analysis', completed: false, frequency: 'Weekly' },
    { task: 'Content calendar execution', completed: false, frequency: 'Daily' },
    { task: 'Ad optimization', completed: false, frequency: '3x/week' },
    { task: 'Influencer relationship management', completed: false, frequency: 'Weekly' },
    { task: 'Community engagement', completed: false, frequency: 'Daily' },
    { task: 'PR follow-ups', completed: false, frequency: 'Weekly' },
    { task: 'Retention analysis', completed: false, frequency: 'Weekly' },
    { task: 'Revenue optimization', completed: false, frequency: 'Weekly' },
  ],
};

// ============================================
// LAUNCH PLAN SUMMARY
// ============================================

export const LAUNCH_PLAN_SUMMARY = {
  appName: 'ShoeSwiper',
  tagline: 'Tinder for Sneakers - Swipe. Match. Cop.',
  launchDate: 'TBD',
  targetMarket: 'Sneakerheads ages 16-35 in US',
  affiliateTag: AFFILIATE_TAG,

  valueProposition: [
    'Discover sneakers through addictive swipe experience',
    'Personalized recommendations powered by AI',
    'Price alerts and deal notifications',
    'Direct links to purchase (Amazon affiliate)',
    'Community of sneaker enthusiasts',
    'Music integration for the culture',
  ],

  uniqueSellingPoints: [
    'First TikTok-style interface for sneaker shopping',
    'AI-powered personalization from first swipe',
    'Music pairing creates emotional connection',
    'Gamification drives daily engagement',
    'Social features build community',
  ],

  revenueModel: [
    'Amazon Associates affiliate commissions (4-8% per sale)',
    'Brand partnership deals and sponsored placements',
    'Seller marketplace commission (10% on sales)',
    'In-app advertising (non-intrusive, relevant ads)',
    'Affiliate programs with other retailers (Foot Locker, Nike, etc.)',
  ],

  noSubscription: true, // Revenue is 100% affiliate/partnership based - NO user subscriptions

  successCriteria: {
    downloads: 100000,
    dau: 30000,
    affiliateRevenue: 75000,
    rating: 4.7,
    retention: '30% D7',
    affiliateClickRate: '8%',
  },

  teamNeeded: [
    'CEO/Founder - Strategy and vision',
    'CTO/Lead Engineer - Product development',
    'Marketing Lead - Growth and acquisition',
    'Content Creator - Social media and video',
    'Community Manager - Discord and support',
    'Data Analyst - Metrics and optimization',
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get current phase based on days since launch
 */
export function getCurrentPhase(daysSinceLaunch: number): string {
  if (daysSinceLaunch < 0) return 'Pre-Launch Hype';
  if (daysSinceLaunch <= 30) return 'Pre-Launch Hype';
  if (daysSinceLaunch <= 45) return 'Soft Launch';
  if (daysSinceLaunch <= 60) return 'Public Launch';
  return 'Growth Acceleration';
}

/**
 * Get tasks for current week
 */
export function getWeeklyTasks(weekNumber: number): unknown[] {
  const weekMap: Record<number, unknown> = {
    1: PHASE_1_PRE_LAUNCH.week1.tasks,
    2: PHASE_1_PRE_LAUNCH.week2.tasks,
    3: PHASE_1_PRE_LAUNCH.week3.tasks,
    4: PHASE_1_PRE_LAUNCH.week4.tasks,
    5: PHASE_2_SOFT_LAUNCH.week5.tasks,
    6: PHASE_2_SOFT_LAUNCH.week6.tasks,
  };
  return weekMap[weekNumber] as unknown[] || [];
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(completedTasks: number, totalTasks: number): number {
  return Math.round((completedTasks / totalTasks) * 100);
}

// ============================================
// EXPORTS
// ============================================

export const ProductLaunchPlan = {
  phases: LAUNCH_PHASES,
  phase1: PHASE_1_PRE_LAUNCH,
  phase2: PHASE_2_SOFT_LAUNCH,
  phase3: PHASE_3_PUBLIC_LAUNCH,
  phase4: PHASE_4_GROWTH,
  budget: LAUNCH_BUDGET,
  metrics: KEY_METRICS,
  risks: RISK_MITIGATION,
  checklist: LAUNCH_CHECKLIST,
  summary: LAUNCH_PLAN_SUMMARY,
  getCurrentPhase,
  getWeeklyTasks,
  calculateProgress,
};

export default ProductLaunchPlan;
