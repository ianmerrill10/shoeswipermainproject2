// ============================================
// INPUT VALIDATION UTILITIES
// Security hardening for ShoeSwiper
// ============================================
//
// SECURITY NOTE: HTML sanitization functions in this module use regex-based
// approaches which have inherent limitations. While they provide defense-in-depth,
// for the most robust XSS protection in production, consider using a dedicated
// HTML sanitization library like DOMPurify.
//
// Key security measures:
// - sanitizeSearchQuery: Removes HTML tags AND escapes all < > characters as final defense
// - sanitizeHtml: Uses loop-based removal with multiple passes for nested content
// - validateUrl: Blocks dangerous protocols (javascript:, data:, vbscript:)
//
// ============================================

// ============================================
// TYPES
// ============================================

export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  error?: string;
}

export interface PriceValidationResult {
  valid: boolean;
  cents: number;
  error?: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================
// EMAIL VALIDATION
// ============================================

// RFC 5322 compliant regex (simplified but comprehensive)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates and sanitizes an email address
 * @param email - The email address to validate
 * @returns Validation result with sanitized email
 */
export function validateEmail(email: string): ValidationResult {
  if (typeof email !== 'string') {
    return { valid: false, sanitized: '', error: 'Email must be a string' };
  }

  const sanitized = email.trim().toLowerCase();

  if (!sanitized) {
    return { valid: false, sanitized: '', error: 'Email is required' };
  }

  if (sanitized.length > 254) {
    return { valid: false, sanitized, error: 'Email is too long (max 254 characters)' };
  }

  if (!EMAIL_REGEX.test(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid email format' };
  }

  return { valid: true, sanitized };
}

// ============================================
// URL VALIDATION
// ============================================

// Allowed affiliate domains
const ALLOWED_AFFILIATE_DOMAINS = [
  'amazon.com',
  'stockx.com',
  'goat.com',
  'nike.com',
  'footlocker.com',
];

// Dangerous URL protocols that should be blocked
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

/**
 * Validates and sanitizes a URL
 * @param url - The URL to validate
 * @returns Validation result with sanitized URL
 */
export function validateUrl(url: string): ValidationResult {
  if (typeof url !== 'string') {
    return { valid: false, sanitized: '', error: 'URL must be a string' };
  }

  const sanitized = url.trim();

  if (!sanitized) {
    return { valid: false, sanitized: '', error: 'URL is required' };
  }

  // Check for dangerous protocols
  const lowerUrl = sanitized.toLowerCase();
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (lowerUrl.startsWith(protocol)) {
      return { valid: false, sanitized: '', error: `Dangerous protocol: ${protocol} URLs are not allowed` };
    }
  }

  try {
    const parsed = new URL(sanitized);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, sanitized, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    return { valid: true, sanitized: parsed.href };
  } catch {
    return { valid: false, sanitized, error: 'Invalid URL format' };
  }
}

/**
 * Checks if a URL is from an allowed affiliate domain
 * @param url - The URL to check
 * @returns True if the URL is from an allowed domain
 */
export function isAllowedAffiliateDomain(url: string): boolean {
  if (typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.toLowerCase();

    // Check if hostname ends with any allowed domain (handles subdomains)
    return ALLOWED_AFFILIATE_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

// ============================================
// PRICE VALIDATION
// ============================================

// Price limits in cents
const MIN_PRICE_CENTS = 0;
const MAX_PRICE_CENTS = 10000000; // 100k dollars

// Regex to extract numeric value from price string
const PRICE_REGEX = /^[^0-9]*(-?\d+(?:[.,]\d{1,2})?)[^0-9]*$/;

/**
 * Validates and converts price input to cents
 * @param input - Price as string or number
 * @returns Validation result with price in cents
 */
export function validatePrice(input: string | number): PriceValidationResult {
  let cents: number;

  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      return { valid: false, cents: 0, error: 'Price must be a finite number' };
    }
    // Assume input is in dollars, convert to cents
    cents = Math.round(input * 100);
  } else if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return { valid: false, cents: 0, error: 'Price is required' };
    }

    // Remove thousands separators (commas) and extract numeric value
    const withoutCommas = trimmed.replace(/,/g, '');
    const match = withoutCommas.match(PRICE_REGEX);
    if (!match) {
      return { valid: false, cents: 0, error: 'Invalid price format' };
    }

    const numericValue = parseFloat(match[1]);
    if (!Number.isFinite(numericValue)) {
      return { valid: false, cents: 0, error: 'Invalid price value' };
    }

    // Convert to cents
    cents = Math.round(numericValue * 100);
  } else {
    return { valid: false, cents: 0, error: 'Price must be a string or number' };
  }

  if (cents < MIN_PRICE_CENTS) {
    return { valid: false, cents: 0, error: 'Price cannot be negative' };
  }

  if (cents > MAX_PRICE_CENTS) {
    return { valid: false, cents: 0, error: `Price cannot exceed $${MAX_PRICE_CENTS / 100}` };
  }

  return { valid: true, cents };
}

// ============================================
// SEARCH QUERY SANITIZATION
// ============================================

const MAX_SEARCH_QUERY_LENGTH = 200;

// Common SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|FETCH|DECLARE|CAST)\b)/gi,
  /(--|;|\/\*|\*\/|@@|@)/g,
  /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
  /(\bAND\b\s+\d+\s*=\s*\d+)/gi,
  /(1\s*=\s*1|'1'\s*=\s*'1')/gi,
];

/**
 * Sanitizes a search query by removing dangerous content
 * @param query - The search query to sanitize
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }

  let sanitized = query.trim();
  let previousLength: number;
  let iterations = 0;
  const maxIterations = 100; // Prevent infinite loops

  // Loop until no more changes are made
  do {
    previousLength = sanitized.length;
    iterations++;
    
    // Remove all HTML-like tags aggressively
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    sanitized = sanitized.replace(/<[^>]*$/g, ''); // Remove incomplete opening tags
    sanitized = sanitized.replace(/^[^<]*>/g, ''); // Remove incomplete closing tags
    
  } while (sanitized.length !== previousLength && iterations < maxIterations);

  // Remove SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Escape special characters that could be used in XSS or injection
  // This is the final line of defense - even if tags slip through, they'll be escaped
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Limit length
  if (sanitized.length > MAX_SEARCH_QUERY_LENGTH) {
    sanitized = sanitized.substring(0, MAX_SEARCH_QUERY_LENGTH);
  }

  return sanitized;
}

// ============================================
// FILE UPLOAD VALIDATION
// ============================================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Magic bytes for image types
const IMAGE_MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header, followed by WEBP at offset 8
};

// WebP signature bytes at offset 8: 'WEBP' in ASCII
const WEBP_SIGNATURE = {
  offset: 8,
  bytes: [0x57, 0x45, 0x42, 0x50], // 'W', 'E', 'B', 'P'
};

/**
 * Checks if array buffer starts with given magic bytes
 */
function checkMagicBytes(buffer: ArrayBuffer, expected: number[]): boolean {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < expected.length) {
    return false;
  }
  return expected.every((byte, index) => bytes[index] === byte);
}

/**
 * Validates an image file upload
 * @param file - The file to validate
 * @returns Validation result
 */
export async function validateImageUpload(file: File): Promise<FileValidationResult> {
  // Check for file-like object (duck typing for better test compatibility)
  if (!file || typeof file !== 'object' || typeof file.type !== 'string' || typeof file.size !== 'number') {
    return { valid: false, error: 'Invalid file object' };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
    };
  }

  // Check magic bytes for actual file type
  try {
    // Read first 12 bytes using slice then arrayBuffer
    const slicedBlob = file.slice(0, 12);
    const buffer = await slicedBlob.arrayBuffer();
    const expectedMagicBytes = IMAGE_MAGIC_BYTES[file.type];

    if (!expectedMagicBytes) {
      return { valid: false, error: 'Unknown file type' };
    }

    const isValidMagic = expectedMagicBytes.some((magic) =>
      checkMagicBytes(buffer, magic)
    );

    if (!isValidMagic) {
      return {
        valid: false,
        error: 'File content does not match declared file type',
      };
    }

    // For WebP, also check for WEBP signature at offset 8
    if (file.type === 'image/webp') {
      const webpBytes = new Uint8Array(buffer);
      const requiredLength = WEBP_SIGNATURE.offset + WEBP_SIGNATURE.bytes.length;
      
      if (webpBytes.length < requiredLength) {
        return {
          valid: false,
          error: 'Invalid WebP file format',
        };
      }

      const isValidWebP = WEBP_SIGNATURE.bytes.every(
        (byte, index) => webpBytes[WEBP_SIGNATURE.offset + index] === byte
      );

      if (!isValidWebP) {
        return {
          valid: false,
          error: 'Invalid WebP file format',
        };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Failed to read file' };
  }
}

// ============================================
// TEXT SANITIZATION
// ============================================

const DEFAULT_MAX_TEXT_LENGTH = 5000;

/**
 * Sanitizes text by escaping special characters and enforcing length limits
 * @param text - The text to sanitize
 * @param maxLength - Maximum allowed length (default: 5000)
 * @returns Sanitized text
 */
export function sanitizeText(text: string, maxLength: number = DEFAULT_MAX_TEXT_LENGTH): string {
  if (typeof text !== 'string') {
    return '';
  }

  let sanitized = text.trim();

  // Escape HTML special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  // Enforce length limit
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitizes HTML by removing dangerous tags and attributes.
 * Note: For the most secure HTML sanitization, consider using a library
 * like DOMPurify. This implementation removes dangerous patterns but
 * cannot guarantee complete protection against all XSS vectors.
 * @param html - The HTML to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  let sanitized = html.trim();
  
  // First pass: completely remove script and style tags with their content
  // Use non-greedy matching and handle various closing tag formats
  let previousLength: number;
  let iterations = 0;
  const maxIterations = 100; // Prevent infinite loops

  // Loop until no more changes are made (handles nested content)
  do {
    previousLength = sanitized.length;
    iterations++;

    // Remove script tags and content - handle any whitespace in tags
    sanitized = sanitized.replace(/<\s*script[^]*?<\s*\/\s*script[^>]*>/gi, '');
    sanitized = sanitized.replace(/<\s*script[^>]*>/gi, '');
    sanitized = sanitized.replace(/<\s*\/\s*script[^>]*>/gi, '');

    // Remove style tags and content
    sanitized = sanitized.replace(/<\s*style[^]*?<\s*\/\s*style[^>]*>/gi, '');
    sanitized = sanitized.replace(/<\s*style[^>]*>/gi, '');
    sanitized = sanitized.replace(/<\s*\/\s*style[^>]*>/gi, '');

    // Remove event handlers - be more aggressive
    sanitized = sanitized.replace(/\bon\w+\s*=/gi, 'data-removed=');

    // Remove javascript:, data:, vbscript: URLs everywhere
    sanitized = sanitized.replace(/javascript\s*:/gi, 'removed:');
    sanitized = sanitized.replace(/data\s*:/gi, 'removed:');
    sanitized = sanitized.replace(/vbscript\s*:/gi, 'removed:');

  } while (sanitized.length !== previousLength && iterations < maxIterations);

  // Remove dangerous tags (keep content)
  const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'button', 'meta', 'link', 'base', 'svg', 'math', 'template'];
  for (const tag of dangerousTags) {
    // Handle opening tags with any attributes and potential spaces
    const openTagRegex = new RegExp(`<\\s*${tag}\\b[^>]*>`, 'gi');
    // Handle closing tags with potential spaces
    const closeTagRegex = new RegExp(`<\\s*/\\s*${tag}[^>]*>`, 'gi');
    sanitized = sanitized.replace(openTagRegex, '');
    sanitized = sanitized.replace(closeTagRegex, '');
  }

  return sanitized;
}

// ============================================
// DISPLAY NAME VALIDATION
// ============================================

const MIN_DISPLAY_NAME_LENGTH = 2;
const MAX_DISPLAY_NAME_LENGTH = 30;

// Allowed characters: alphanumeric, spaces, underscores, hyphens
const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9 _-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]{1,2}$/;

// No consecutive special characters
const CONSECUTIVE_SPECIAL_REGEX = /[ _-]{2,}/;

// Basic profanity filter (expandable list)
const PROFANITY_LIST = [
  'fuck',
  'shit',
  'ass',
  'bitch',
  'dick',
  'cock',
  'pussy',
  'cunt',
  'nigger',
  'faggot',
  'retard',
];

/**
 * Validates and sanitizes a display name
 * @param name - The display name to validate
 * @returns Validation result with sanitized name
 */
export function validateDisplayName(name: string): ValidationResult {
  if (typeof name !== 'string') {
    return { valid: false, sanitized: '', error: 'Display name must be a string' };
  }

  const sanitized = name.trim();

  if (!sanitized) {
    return { valid: false, sanitized: '', error: 'Display name is required' };
  }

  if (sanitized.length < MIN_DISPLAY_NAME_LENGTH) {
    return {
      valid: false,
      sanitized,
      error: `Display name must be at least ${MIN_DISPLAY_NAME_LENGTH} characters`,
    };
  }

  if (sanitized.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      valid: false,
      sanitized,
      error: `Display name cannot exceed ${MAX_DISPLAY_NAME_LENGTH} characters`,
    };
  }

  // Check for allowed characters
  if (!DISPLAY_NAME_REGEX.test(sanitized)) {
    return {
      valid: false,
      sanitized,
      error: 'Display name can only contain letters, numbers, spaces, underscores, and hyphens',
    };
  }

  // Check for consecutive special characters
  if (CONSECUTIVE_SPECIAL_REGEX.test(sanitized)) {
    return {
      valid: false,
      sanitized,
      error: 'Display name cannot contain consecutive special characters',
    };
  }

  // Check profanity filter
  const lowerName = sanitized.toLowerCase();
  for (const word of PROFANITY_LIST) {
    if (lowerName.includes(word)) {
      return {
        valid: false,
        sanitized,
        error: 'Display name contains inappropriate content',
      };
    }
  }

  return { valid: true, sanitized };
}

// ============================================
// UUID VALIDATION
// ============================================

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates a UUID v4 format string
 * Note: Only validates UUID v4 format (version 4, variant 1)
 * @param id - The UUID string to validate
 * @returns Validation result with sanitized UUID (lowercase)
 */
export function validateUUID(id: string): ValidationResult {
  if (typeof id !== 'string') {
    return { valid: false, sanitized: '', error: 'ID must be a string' };
  }

  const sanitized = id.trim().toLowerCase();

  if (!sanitized) {
    return { valid: false, sanitized: '', error: 'ID is required' };
  }

  if (!UUID_REGEX.test(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid UUID format' };
  }

  return { valid: true, sanitized };
}

// ============================================
// AMAZON ASIN VALIDATION
// ============================================

// Amazon ASIN format: 10 alphanumeric characters
const ASIN_REGEX = /^[A-Z0-9]{10}$/i;

/**
 * Validates an Amazon ASIN (Standard Identification Number)
 * @param asin - The ASIN string to validate
 * @returns Validation result with sanitized ASIN (uppercase)
 */
export function validateASIN(asin: string): ValidationResult {
  if (typeof asin !== 'string') {
    return { valid: false, sanitized: '', error: 'ASIN must be a string' };
  }

  const sanitized = asin.trim().toUpperCase();

  if (!sanitized) {
    return { valid: false, sanitized: '', error: 'ASIN is required' };
  }

  if (!ASIN_REGEX.test(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid ASIN format (must be 10 alphanumeric characters)' };
  }

  return { valid: true, sanitized };
}

// ============================================
// AFFILIATE URL VALIDATION
// ============================================

import { AFFILIATE_TAG } from './config';

/**
 * Validates an Amazon affiliate URL and ensures it has the correct affiliate tag
 * @param url - The Amazon URL to validate
 * @returns Validation result with sanitized URL including affiliate tag
 */
export function validateAffiliateUrl(url: string): ValidationResult {
  const urlResult = validateUrl(url);
  
  if (!urlResult.valid) {
    return urlResult;
  }

  try {
    const parsed = new URL(urlResult.sanitized);
    const hostname = parsed.hostname.toLowerCase();

    // Must be an Amazon domain
    if (!hostname.includes('amazon.')) {
      return { valid: false, sanitized: url, error: 'URL must be from Amazon domain' };
    }

    // Ensure affiliate tag is present
    if (!parsed.searchParams.has('tag')) {
      parsed.searchParams.set('tag', AFFILIATE_TAG);
    } else {
      // Verify it's our affiliate tag
      const existingTag = parsed.searchParams.get('tag');
      if (existingTag !== AFFILIATE_TAG) {
        parsed.searchParams.set('tag', AFFILIATE_TAG);
      }
    }

    return { valid: true, sanitized: parsed.href };
  } catch {
    return { valid: false, sanitized: url, error: 'Invalid URL format' };
  }
}

// ============================================
// SECURE STORAGE UTILITIES
// ============================================

/**
 * Obfuscates data for localStorage storage using Base64 encoding.
 * WARNING: This is NOT encryption - it only provides basic obfuscation.
 * Do NOT use for sensitive data (passwords, tokens, PII).
 * For truly sensitive data, use server-side storage with proper encryption.
 * @param data - The data to obfuscate
 * @returns Base64 encoded string
 */
export function obfuscateForStorage(data: string): string {
  if (typeof data !== 'string') {
    return '';
  }
  try {
    return btoa(encodeURIComponent(data));
  } catch {
    return '';
  }
}

/**
 * Decodes obfuscated data from localStorage
 * Companion to obfuscateForStorage()
 * @param encoded - The obfuscated string to decode
 * @returns Decoded string
 */
export function deobfuscateFromStorage(encoded: string): string {
  if (typeof encoded !== 'string') {
    return '';
  }
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return '';
  }
}

/**
 * List of approved storage keys for non-sensitive UI state only.
 * WARNING: Do NOT store PII, passwords, tokens, or sensitive data in localStorage.
 * Email addresses should be stored server-side with proper encryption.
 * These keys are for UI preferences and non-sensitive feature states only.
 */
export const SAFE_STORAGE_KEYS = [
  'shoeswiper_favorites',           // Shoe IDs only, no PII
  'shoeswiper_onboarding',          // UI state (completed steps)
  'shoeswiper_preferences',         // UI preferences (theme, etc.)
  'shoeswiper_price_alerts',        // Price thresholds, no PII
  'shoeswiper_price_notifications', // Notification preferences
  'shoeswiper_referral',            // Referral code (public)
  'shoeswiper_my_referral_code',    // User's own referral code
  'shoeswiper_referral_stats',      // Count statistics only
  'shoeswiper_email_capture',       // Boolean flag only (captured yes/no)
  'shoeswiper_email_list',          // DEPRECATED: emails should be server-side
] as const;

/**
 * Checks if a storage key is in the approved safe list
 * @param key - The localStorage key to check
 * @returns True if the key is in the safe list
 */
export function isSafeStorageKey(key: string): boolean {
  return SAFE_STORAGE_KEYS.includes(key as typeof SAFE_STORAGE_KEYS[number]);
}
