// ============================================
// INPUT VALIDATION UTILITIES
// Security hardening for ShoeSwiper
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

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Escape special characters that could be used in XSS or injection
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
 * Sanitizes HTML by removing dangerous tags and attributes
 * @param html - The HTML to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  let sanitized = html.trim();

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove event handlers (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: and data: URLs from href/src attributes
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, '$1=""');
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']?\s*data:[^"'\s>]*/gi, '$1=""');

  // Remove dangerous tags (keep content)
  const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'button', 'meta', 'link', 'base'];
  for (const tag of dangerousTags) {
    const openTagRegex = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
    const closeTagRegex = new RegExp(`</${tag}>`, 'gi');
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
