/**
 * SHOESWIPER INPUT VALIDATION SCHEMAS
 * Phase 1 Security Hardening
 * 
 * Zod schemas for validating all user inputs
 * Prevents injection attacks and ensures data integrity
 */

import { z } from 'zod';

// ============================================
// COMMON VALIDATION PATTERNS
// ============================================

// Email validation with strict format
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(5, 'Email is too short')
  .max(254, 'Email is too long')
  .toLowerCase()
  .trim();

// Password validation (when implemented)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// UUID validation
export const uuidSchema = z
  .string()
  .uuid('Invalid ID format')
  .or(z.string().regex(/^[0-9]+$/, 'Invalid ID format')); // Also allow numeric IDs from mock data

// Safe string (prevents XSS)
export const safeStringSchema = z
  .string()
  .trim()
  .transform((val) => {
    // Basic XSS prevention - strip dangerous characters
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  });

// URL validation
export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .refine(
    (url) => url.startsWith('https://') || url.startsWith('http://'),
    'URL must start with http:// or https://'
  );

// Amazon URL validation
export const amazonUrlSchema = z
  .string()
  .url('Please enter a valid URL')
  .refine(
    (url) => url.includes('amazon.com') || url.includes('amzn.to'),
    'Must be an Amazon URL'
  );

// Price validation (in cents)
export const priceSchema = z
  .number()
  .int('Price must be a whole number')
  .min(0, 'Price cannot be negative')
  .max(100000000, 'Price is too high'); // Max $1,000,000

// Price in dollars (converted to cents)
export const priceDollarsSchema = z
  .number()
  .min(0, 'Price cannot be negative')
  .max(1000000, 'Price is too high')
  .transform((val) => Math.round(val * 100)); // Convert to cents

// ============================================
// USER INPUT SCHEMAS
// ============================================

// Email capture form
export const emailCaptureSchema = z.object({
  email: emailSchema,
  source: z.enum(['price_alert', 'newsletter', 'exit_intent', 'referral', 'checkout', 'waitlist']),
  shoeId: uuidSchema.optional(),
  shoeName: safeStringSchema.max(200).optional(),
  preferences: z.object({
    priceAlerts: z.boolean().default(true),
    newReleases: z.boolean().default(true),
    weeklyDigest: z.boolean().default(false),
    promotions: z.boolean().default(false),
  }).optional(),
});

// Price alert creation
export const priceAlertSchema = z.object({
  shoeId: uuidSchema,
  shoeName: safeStringSchema.min(1).max(200),
  shoeBrand: safeStringSchema.min(1).max(100),
  shoeImage: urlSchema.optional(),
  amazonUrl: amazonUrlSchema,
  targetPrice: priceDollarsSchema,
  originalPrice: priceDollarsSchema.optional(),
});

// User profile update
export const profileUpdateSchema = z.object({
  displayName: safeStringSchema
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name is too long')
    .optional(),
  bio: safeStringSchema
    .max(500, 'Bio is too long')
    .optional(),
  styleTags: z.array(safeStringSchema.max(50)).max(10).optional(),
  profileImage: urlSchema.optional(),
  sizePreference: z.object({
    us: z.string().regex(/^[0-9]+(\.[5])?$/).optional(),
    uk: z.string().regex(/^[0-9]+(\.[5])?$/).optional(),
    eu: z.string().regex(/^[0-9]+$/).optional(),
  }).optional(),
});

// ============================================
// SEARCH & FILTER SCHEMAS
// ============================================

export const searchFiltersSchema = z.object({
  query: safeStringSchema.max(200).optional(),
  brands: z.array(safeStringSchema.max(50)).max(20).optional(),
  styleTags: z.array(safeStringSchema.max(50)).max(20).optional(),
  gender: z.enum(['men', 'women', 'unisex', 'kids']).optional(),
  condition: z.enum(['new', 'like_new', 'good', 'fair']).optional(),
  priceMin: z.number().min(0).max(100000).optional(),
  priceMax: z.number().min(0).max(100000).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'trending', 'relevance']).optional(),
  releaseYearMin: z.number().min(1980).max(2030).optional(),
  releaseYearMax: z.number().min(1980).max(2030).optional(),
  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(20),
}).refine(
  (data) => !data.priceMin || !data.priceMax || data.priceMin <= data.priceMax,
  { message: 'Minimum price must be less than maximum price' }
);

// ============================================
// PRODUCT/SHOE SCHEMAS
// ============================================

export const shoeSchema = z.object({
  id: uuidSchema.optional(), // Optional for creation
  brand: safeStringSchema.min(1).max(100),
  name: safeStringSchema.min(1).max(200),
  fullName: safeStringSchema.max(300).optional(),
  colorway: safeStringSchema.max(100).optional(),
  sku: safeStringSchema.max(50).optional(),
  styleCode: safeStringSchema.max(50).optional(),
  releaseDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  retailPrice: priceSchema.optional(),
  category: z.enum(['sneakers', 'running', 'basketball', 'lifestyle', 'skateboarding', 'training']).optional(),
  gender: z.enum(['men', 'women', 'unisex', 'kids']),
  styleTags: z.array(safeStringSchema.max(50)).max(20).default([]),
  amazonUrl: amazonUrlSchema,
  imageUrl: urlSchema.optional(),
  images: z.array(urlSchema).max(10).optional(),
  materials: z.array(safeStringSchema.max(100)).max(10).optional(),
  sizesAvailable: z.array(z.string().max(10)).max(30).optional(),
  description: safeStringSchema.max(2000).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

// ============================================
// LISTING SCHEMAS
// ============================================

export const listingSchema = z.object({
  productId: uuidSchema,
  condition: z.enum(['new', 'like_new', 'good', 'fair']),
  sizeLabel: z.string().min(1).max(10),
  priceCents: priceSchema,
  description: safeStringSchema.max(1000).optional(),
  images: z.array(urlSchema).min(1, 'At least one image is required').max(10),
  featured: z.boolean().default(false),
});

export const listingUpdateSchema = listingSchema.partial().extend({
  id: uuidSchema,
  status: z.enum(['available', 'sold', 'cancelled']).optional(),
});

// ============================================
// NFT SCHEMAS
// ============================================

export const mintNFTSchema = z.object({
  sneakerId: uuidSchema,
  rarity: z.enum(['common', 'rare', 'legendary', 'grail']),
  proofImages: z.array(urlSchema).min(1).max(5),
  priceEth: z.number().min(0).max(1000).optional(),
});

export const listNFTForSaleSchema = z.object({
  nftId: uuidSchema,
  priceEth: z.number().min(0.001, 'Minimum price is 0.001 ETH').max(1000, 'Maximum price is 1000 ETH'),
});

export const buyNFTSchema = z.object({
  nftId: uuidSchema,
});

// ============================================
// REFERRAL SCHEMAS
// ============================================

export const referralCodeSchema = z
  .string()
  .min(8, 'Referral code is too short')
  .max(20, 'Referral code is too long')
  .regex(/^[A-Z0-9]+$/, 'Referral code can only contain uppercase letters and numbers');

// ============================================
// PUSH SUBSCRIPTION SCHEMA
// ============================================

export const pushSubscriptionSchema = z.object({
  endpoint: urlSchema,
  p256dhKey: z.string().min(1).max(500),
  authKey: z.string().min(1).max(500),
  userAgent: safeStringSchema.max(500).optional(),
});

// ============================================
// ANALYTICS EVENT SCHEMA
// ============================================

export const analyticsEventSchema = z.object({
  eventType: z.enum([
    'shoe_view',
    'shoe_click',
    'music_click',
    'panel_open',
    'share',
    'favorite',
    'swipe',
    'search',
    'filter',
    'affiliate_click',
    'nft_view',
    'nft_mint',
    'nft_buy',
    'signup',
    'login',
    'logout',
  ]),
  eventData: z.record(z.unknown()).optional(),
  sessionId: z.string().max(100).optional(),
});

// ============================================
// ADMIN SCHEMAS
// ============================================

export const adminProductCreateSchema = shoeSchema;

export const adminProductUpdateSchema = shoeSchema.partial().extend({
  id: uuidSchema,
});

export const adminUserActionSchema = z.object({
  userId: uuidSchema,
  action: z.enum(['ban', 'unban', 'verify', 'unverify', 'delete']),
  reason: safeStringSchema.max(500).optional(),
});

// ============================================
// CONTACT/SUPPORT SCHEMAS
// ============================================

export const contactFormSchema = z.object({
  name: safeStringSchema.min(2).max(100),
  email: emailSchema,
  subject: safeStringSchema.min(5).max(200),
  message: safeStringSchema.min(20).max(5000),
  category: z.enum(['general', 'support', 'bug', 'feature', 'business']).default('general'),
});

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate input and return typed result or throw error
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    
    throw new ValidationError('Validation failed', errors);
  }
  
  return result.data;
}

/**
 * Validate input and return result object (no throw)
 */
export function safeValidateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
  }
  
  return { success: true, data: result.data };
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  public errors: Array<{ field: string; message: string }>;
  
  constructor(message: string, errors: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// ============================================
// REACT HOOK FOR FORM VALIDATION
// ============================================

import { useState, useCallback } from 'react';

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => void | Promise<void>;
}

export function useFormValidation<T>({ schema, onSubmit }: UseFormValidationOptions<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validate = useCallback((data: unknown): T | null => {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        const field = e.path.join('.');
        if (!newErrors[field]) {
          newErrors[field] = e.message;
        }
      });
      setErrors(newErrors);
      return null;
    }
    
    setErrors({});
    return result.data;
  }, [schema]);
  
  const handleSubmit = useCallback(async (data: unknown) => {
    setIsSubmitting(true);
    
    try {
      const validData = validate(data);
      if (validData) {
        await onSubmit(validData);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, onSubmit]);
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  const setFieldError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);
  
  return {
    errors,
    isSubmitting,
    validate,
    handleSubmit,
    clearErrors,
    setFieldError,
  };
}

// ============================================
// SANITIZATION UTILITIES
// ============================================

/**
 * Sanitize string for database storage
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  
  return result as T;
}

// ============================================
// EXPORT ALL SCHEMAS
// ============================================

export const schemas = {
  // Common
  email: emailSchema,
  password: passwordSchema,
  uuid: uuidSchema,
  safeString: safeStringSchema,
  url: urlSchema,
  amazonUrl: amazonUrlSchema,
  price: priceSchema,
  priceDollars: priceDollarsSchema,
  
  // User
  emailCapture: emailCaptureSchema,
  priceAlert: priceAlertSchema,
  profileUpdate: profileUpdateSchema,
  
  // Search
  searchFilters: searchFiltersSchema,
  
  // Products
  shoe: shoeSchema,
  listing: listingSchema,
  listingUpdate: listingUpdateSchema,
  
  // NFT
  mintNFT: mintNFTSchema,
  listNFTForSale: listNFTForSaleSchema,
  buyNFT: buyNFTSchema,
  
  // Referral
  referralCode: referralCodeSchema,
  
  // Push
  pushSubscription: pushSubscriptionSchema,
  
  // Analytics
  analyticsEvent: analyticsEventSchema,
  
  // Admin
  adminProductCreate: adminProductCreateSchema,
  adminProductUpdate: adminProductUpdateSchema,
  adminUserAction: adminUserActionSchema,
  
  // Contact
  contactForm: contactFormSchema,
};

export default schemas;
