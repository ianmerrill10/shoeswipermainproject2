// ============================================
// CONTENT MODERATION SYSTEM
// Security hardening for ShoeSwiper
// ============================================
//
// This module provides content moderation for user-generated content:
// - Profanity/inappropriate language detection
// - Spam pattern detection
// - PII (Personal Identifiable Information) detection
// - Contact information detection (to prevent off-platform transactions)
//
// ============================================

// ============================================
// TYPES
// ============================================

export type ModerationSeverity = 'clean' | 'warning' | 'blocked';

export interface ModerationResult {
  severity: ModerationSeverity;
  passed: boolean;
  flags: ModerationFlag[];
  sanitized: string;
}

export interface ModerationFlag {
  type: 'profanity' | 'spam' | 'pii' | 'contact' | 'scam' | 'hate';
  description: string;
  matched?: string;
}

export interface ModerationConfig {
  allowContactInfo?: boolean;  // Allow phone/email in content
  allowUrls?: boolean;         // Allow URLs in content
  maxLength?: number;          // Maximum content length
  strictMode?: boolean;        // Block on warnings instead of just flagging
}

// ============================================
// PROFANITY DETECTION
// ============================================

// Expanded profanity list with common variations
// Note: This is intentionally comprehensive for security
const PROFANITY_PATTERNS = [
  // Severe profanity
  /\bf+u+c+k+(?:ing|er|ed|s)?\b/gi,
  /\bs+h+i+t+(?:ty|s|ting)?\b/gi,
  /\bc+u+n+t+s?\b/gi,
  /\bc+o+c+k+s?\b/gi,
  /\bd+i+c+k+(?:s|head)?\b/gi,
  /\bp+u+s+s+(?:y|ies)\b/gi,
  /\ba+s+s+(?:hole|wipe)?\b/gi,
  /\bb+i+t+c+h+(?:es|ing)?\b/gi,

  // Slurs (always blocked)
  /\bn+[i1]+g+(?:g+[e3a]+r?|a)+s?\b/gi,
  /\bf+[a4]+g+(?:g+[o0]+t+)?s?\b/gi,
  /\br+[e3]+t+[a4]+r+d+(?:ed|s)?\b/gi,
  /\bk+[i1]+k+[e3]+s?\b/gi,
  /\bsp+[i1]+c+s?\b/gi,
  /\bch+[i1]+n+k+s?\b/gi,
  /\bw+[e3]+tb+[a4]+ck+s?\b/gi,

  // Sexual content
  /\bp+[o0]+r+n+(?:o|ography)?\b/gi,
  /\bx+x+x+\b/gi,
  /\bn+[u]+d+[e3]+s?\b/gi,
];

// Words that should trigger warning but not block
const WARNING_WORDS = [
  /\bdamn+(?:ed|it)?\b/gi,
  /\bhell+\b/gi,
  /\bcrap+(?:py)?\b/gi,
  /\bsuck+(?:s|ed|ing)?\b/gi,
];

// ============================================
// SPAM DETECTION
// ============================================

const SPAM_PATTERNS = [
  // Excessive caps (more than 50% caps in text longer than 10 chars)
  { pattern: /^[^a-z]*$/, minLength: 10, description: 'Excessive capitalization' },

  // Repeated characters (4+ of the same char)
  { pattern: /(.)\1{3,}/g, description: 'Repeated characters' },

  // Common spam phrases
  { pattern: /\b(?:buy now|act now|limited time|click here|free money|earn \$|make \$\d+)\b/gi, description: 'Spam phrase detected' },

  // Excessive punctuation
  { pattern: /[!?]{3,}/g, description: 'Excessive punctuation' },

  // Emoji spam (10+ emojis)
  { pattern: /(?:[\u{1F300}-\u{1F9FF}][\u{FE00}-\u{FE0F}]?){10,}/gu, description: 'Excessive emojis' },
];

// ============================================
// PII DETECTION
// ============================================

const PII_PATTERNS = [
  // Phone numbers (various formats)
  {
    pattern: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    type: 'pii' as const,
    description: 'Phone number detected'
  },

  // Email addresses
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    type: 'pii' as const,
    description: 'Email address detected'
  },

  // SSN patterns
  {
    pattern: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
    type: 'pii' as const,
    description: 'Possible SSN detected'
  },

  // Credit card patterns
  {
    pattern: /\b(?:\d{4}[-.\s]?){3}\d{4}\b/g,
    type: 'pii' as const,
    description: 'Possible credit card number detected'
  },
];

// ============================================
// CONTACT INFO DETECTION
// ============================================

const CONTACT_PATTERNS = [
  // Social media handles
  {
    pattern: /(?:@|instagram|ig|insta|snap(?:chat)?|twitter|tiktok|discord|telegram|whatsapp|signal)[:\s]*[@]?[\w.]+/gi,
    type: 'contact' as const,
    description: 'Social media handle detected'
  },

  // Venmo/PayPal/CashApp
  {
    pattern: /(?:venmo|paypal|cashapp|cash\s?app|zelle)[:\s]*[@]?[\w.]+/gi,
    type: 'contact' as const,
    description: 'Payment app handle detected'
  },

  // Website URLs
  {
    pattern: /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&/=]*/gi,
    type: 'contact' as const,
    description: 'URL detected'
  },

  // "DM me", "text me", etc.
  {
    pattern: /\b(?:dm|text|call|message|hit up|hmu)\s+(?:me|us)\b/gi,
    type: 'contact' as const,
    description: 'Off-platform contact solicitation'
  },
];

// ============================================
// SCAM DETECTION
// ============================================

const SCAM_PATTERNS = [
  // Common scam phrases
  { pattern: /\b(?:send me|wire|western union|moneygram)\b/gi, description: 'Potential scam language' },
  { pattern: /\b(?:guaranteed|100%|no risk|double your)\b/gi, description: 'Suspicious guarantees' },
  { pattern: /\b(?:nigerian prince|inheritance|lottery winner)\b/gi, description: 'Known scam phrases' },
  { pattern: /\b(?:act fast|urgent|immediately|asap)\s+(?:or|before)\b/gi, description: 'Pressure tactics' },
];

// ============================================
// MAIN MODERATION FUNCTION
// ============================================

const DEFAULT_CONFIG: ModerationConfig = {
  allowContactInfo: false,
  allowUrls: false,
  maxLength: 1000,
  strictMode: false,
};

/**
 * Moderates text content for inappropriate, spam, or policy-violating content
 * @param content - The text content to moderate
 * @param config - Optional configuration for moderation rules
 * @returns ModerationResult with severity, flags, and sanitized content
 */
export function moderateContent(
  content: string,
  config: ModerationConfig = {}
): ModerationResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const flags: ModerationFlag[] = [];
  let sanitized = content.trim();
  let severity: ModerationSeverity = 'clean';

  if (typeof content !== 'string') {
    return {
      severity: 'blocked',
      passed: false,
      flags: [{ type: 'spam', description: 'Invalid content type' }],
      sanitized: '',
    };
  }

  // Check length
  if (mergedConfig.maxLength && sanitized.length > mergedConfig.maxLength) {
    sanitized = sanitized.substring(0, mergedConfig.maxLength);
    flags.push({ type: 'spam', description: `Content truncated to ${mergedConfig.maxLength} characters` });
    severity = 'warning';
  }

  // Check for profanity (always blocked)
  for (const pattern of PROFANITY_PATTERNS) {
    const matches = sanitized.match(pattern);
    if (matches) {
      flags.push({
        type: 'profanity',
        description: 'Profanity or slur detected',
        matched: matches[0],
      });
      severity = 'blocked';
      // Censor the profanity
      sanitized = sanitized.replace(pattern, (match) => '*'.repeat(match.length));
    }
  }

  // Check for warning words
  for (const pattern of WARNING_WORDS) {
    const matches = sanitized.match(pattern);
    if (matches && severity !== 'blocked') {
      flags.push({
        type: 'profanity',
        description: 'Mild profanity detected',
        matched: matches[0],
      });
      if (severity === 'clean') severity = 'warning';
    }
  }

  // Check for spam patterns
  for (const spam of SPAM_PATTERNS) {
    if ('minLength' in spam && sanitized.length < (spam.minLength || 0)) continue;

    const matches = sanitized.match(spam.pattern);
    if (matches) {
      flags.push({
        type: 'spam',
        description: spam.description,
        matched: matches[0],
      });
      if (severity === 'clean') severity = 'warning';
    }
  }

  // Check for PII
  for (const pii of PII_PATTERNS) {
    const matches = sanitized.match(pii.pattern);
    if (matches) {
      flags.push({
        type: pii.type,
        description: pii.description,
        matched: '[REDACTED]', // Don't include actual PII in flags
      });
      severity = 'blocked'; // PII always blocked
      // Redact the PII
      sanitized = sanitized.replace(pii.pattern, '[REDACTED]');
    }
  }

  // Check for contact info (if not allowed)
  if (!mergedConfig.allowContactInfo) {
    for (const contact of CONTACT_PATTERNS) {
      // Skip URL check if URLs are allowed
      if (mergedConfig.allowUrls && contact.description.includes('URL')) continue;

      const matches = sanitized.match(contact.pattern);
      if (matches) {
        flags.push({
          type: contact.type,
          description: contact.description,
          matched: matches[0],
        });
        if (severity === 'clean') severity = 'warning';
        if (mergedConfig.strictMode) severity = 'blocked';
      }
    }
  }

  // Check for scam patterns
  for (const scam of SCAM_PATTERNS) {
    const matches = sanitized.match(scam.pattern);
    if (matches) {
      flags.push({
        type: 'scam',
        description: scam.description,
        matched: matches[0],
      });
      if (severity !== 'blocked') severity = 'warning';
    }
  }

  return {
    severity,
    passed: severity !== 'blocked',
    flags,
    sanitized,
  };
}

/**
 * Quick check if content contains profanity
 * @param content - The text to check
 * @returns true if profanity detected
 */
export function containsProfanity(content: string): boolean {
  if (typeof content !== 'string') return false;

  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(content)) return true;
  }
  return false;
}

/**
 * Quick check if content contains contact information
 * @param content - The text to check
 * @returns true if contact info detected
 */
export function containsContactInfo(content: string): boolean {
  if (typeof content !== 'string') return false;

  for (const contact of CONTACT_PATTERNS) {
    // Use match instead of test to avoid global regex lastIndex issues
    if (content.match(contact.pattern)) return true;
  }
  for (const pii of PII_PATTERNS) {
    if (content.match(pii.pattern)) return true;
  }
  return false;
}

/**
 * Censor profanity in content by replacing with asterisks
 * @param content - The text to censor
 * @returns Censored text
 */
export function censorProfanity(content: string): string {
  if (typeof content !== 'string') return '';

  let censored = content;
  for (const pattern of PROFANITY_PATTERNS) {
    censored = censored.replace(pattern, (match) => '*'.repeat(match.length));
  }
  return censored;
}

/**
 * Validate user bio content
 * Combines moderation with length and format checks
 * @param bio - The bio text to validate
 * @returns ModerationResult
 */
export function validateBio(bio: string): ModerationResult {
  return moderateContent(bio, {
    maxLength: 500,
    allowContactInfo: false,
    allowUrls: false,
    strictMode: false,
  });
}

/**
 * Validate NFT description content
 * Slightly more permissive than bio
 * @param description - The description text to validate
 * @returns ModerationResult
 */
export function validateNFTDescription(description: string): ModerationResult {
  return moderateContent(description, {
    maxLength: 1000,
    allowContactInfo: false,
    allowUrls: false,
    strictMode: false,
  });
}

/**
 * Validate listing description (for future marketplace)
 * @param description - The listing description to validate
 * @returns ModerationResult
 */
export function validateListingDescription(description: string): ModerationResult {
  return moderateContent(description, {
    maxLength: 2000,
    allowContactInfo: false, // Force users to use in-app messaging
    allowUrls: false,
    strictMode: true, // Block on contact info attempts
  });
}
