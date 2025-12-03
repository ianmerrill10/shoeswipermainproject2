/**
 * AI Agent Types - ShoeSwiper
 * ===========================
 * Shared types for all AI agents
 */

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'paused';
export type AgentPriority = 'critical' | 'high' | 'medium' | 'low';
export type BlogType = 'sneaker' | 'shoes' | 'workwear' | 'music';

export interface AgentTask {
  id: string;
  agentId: string;
  type: string;
  status: AgentStatus;
  priority: AgentPriority;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  maxConcurrentTasks: number;
  rateLimitPerMinute: number;
  retryOnError: boolean;
  maxRetries: number;
  timeout: number; // ms
}

export interface AgentMetrics {
  agentId: string;
  tasksCompleted: number;
  tasksFailed: number;
  averageExecutionTime: number;
  lastRunAt?: Date;
  successRate: number;
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime: number;
  tokensUsed?: number;
}

// Content Generator Types
export interface BlogPostInput {
  blogType: BlogType;
  topic: string;
  keywords: string[];
  targetWordCount: number;
  tone: 'professional' | 'casual' | 'enthusiastic' | 'educational';
  includeAffiliateProducts: boolean;
}

export interface GeneratedBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  suggestedProducts: string[];
  estimatedReadTime: number;
}

// Social Media Types
export interface SocialPostInput {
  platform: 'tiktok' | 'instagram' | 'twitter' | 'facebook';
  contentType: 'product' | 'blog' | 'promotion' | 'engagement';
  productId?: string;
  blogPostId?: string;
  tone: 'hype' | 'informative' | 'funny' | 'urgent';
}

export interface GeneratedSocialPost {
  platform: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  suggestedPostTime: string;
  mediaRequirements: string;
}

// Email Marketing Types
export interface EmailCampaignInput {
  campaignType: 'welcome' | 'abandoned_cart' | 'price_drop' | 'new_release' | 'newsletter' | 're_engagement';
  segment: string;
  productIds?: string[];
}

export interface GeneratedEmail {
  subject: string;
  preheader: string;
  htmlContent: string;
  textContent: string;
  ctaText: string;
  ctaUrl: string;
}

// Product Data Types
export interface ProductEnrichmentInput {
  productId: string;
  brand: string;
  name: string;
  existingData: Record<string, unknown>;
}

export interface EnrichedProductData {
  description: string;
  features: string[];
  materials: string[];
  styleTags: string[];
  searchKeywords: string[];
  competitorPrices: Array<{ source: string; price: number }>;
  marketDemand: 'high' | 'medium' | 'low';
}

// Pricing Intelligence Types
export interface PricingInput {
  productId: string;
  currentPrice: number;
  competitorPrices: Array<{ source: string; price: number }>;
  demandLevel: string;
  inventory: number;
}

export interface PricingRecommendation {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  reasoning: string;
  expectedConversionRate: number;
}

// Trend Analysis Types
export interface TrendInput {
  category: string;
  timeframe: '7d' | '30d' | '90d';
  region?: string;
}

export interface TrendAnalysis {
  trendingBrands: Array<{ brand: string; momentum: number }>;
  trendingStyles: Array<{ style: string; growth: number }>;
  upcomingReleases: Array<{ product: string; releaseDate: string; hypeScore: number }>;
  predictions: string[];
}

// SEO Types
export interface SEOInput {
  pageType: 'product' | 'category' | 'blog' | 'landing';
  title: string;
  content: string;
  targetKeywords: string[];
}

export interface SEOOutput {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  structuredData: Record<string, unknown>;
  internalLinkSuggestions: string[];
  keywordDensity: Record<string, number>;
  seoScore: number;
}

// Code Quality Types
export interface CodeQualityInput {
  filePath: string;
  fileContent: string;
  language: 'typescript' | 'javascript' | 'python';
}

export interface CodeQualityOutput {
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    line: number;
    message: string;
    fix?: string;
  }>;
  score: number;
  suggestions: string[];
  autoFixable: boolean;
}

// Security Audit Types
export interface SecurityScanInput {
  scanType: 'full' | 'dependencies' | 'code' | 'config';
  targetPath?: string;
}

export interface SecurityScanOutput {
  vulnerabilities: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    type: string;
    location: string;
    description: string;
    recommendation: string;
  }>;
  riskScore: number;
  compliant: {
    pciDss: boolean;
    gdpr: boolean;
    owasp: boolean;
  };
}

// Customer Support Types
export interface SupportQueryInput {
  query: string;
  userId?: string;
  context?: {
    previousMessages?: string[];
    userOrders?: string[];
    userProfile?: Record<string, unknown>;
  };
}

export interface SupportResponse {
  response: string;
  confidence: number;
  suggestedActions: string[];
  escalateToHuman: boolean;
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

// Growth Hacking Types
export interface GrowthExperimentInput {
  experimentType: 'ab_test' | 'funnel' | 'retention' | 'viral';
  hypothesis: string;
  metrics: string[];
  duration: number; // days
}

export interface GrowthExperimentOutput {
  experimentId: string;
  variants: Array<{
    id: string;
    name: string;
    config: Record<string, unknown>;
  }>;
  trackingSetup: Record<string, unknown>;
  successCriteria: string;
  estimatedImpact: string;
}

// Deployment Types
export interface DeploymentInput {
  environment: 'development' | 'staging' | 'production';
  version: string;
  changes: string[];
}

export interface DeploymentOutput {
  success: boolean;
  deploymentId: string;
  url: string;
  healthCheck: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Array<{ name: string; passed: boolean }>;
  };
  rollbackAvailable: boolean;
}
