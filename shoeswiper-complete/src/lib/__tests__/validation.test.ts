import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateUrl,
  isAllowedAffiliateDomain,
  validatePrice,
  sanitizeSearchQuery,
  validateImageUpload,
  sanitizeText,
  sanitizeHtml,
  validateDisplayName,
  validateUUID,
  validateASIN,
  validateAffiliateUrl,
  obfuscateForStorage,
  deobfuscateFromStorage,
  isSafeStorageKey,
} from '../validation';

// ============================================
// EMAIL VALIDATION TESTS
// ============================================

describe('validateEmail', () => {
  describe('valid emails', () => {
    it('should accept simple valid email', () => {
      const result = validateEmail('test@example.com');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('test@example.com');
      expect(result.error).toBeUndefined();
    });

    it('should accept email with subdomain', () => {
      const result = validateEmail('user@mail.example.com');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('user@mail.example.com');
    });

    it('should accept email with plus sign', () => {
      const result = validateEmail('test+label@example.com');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('test+label@example.com');
    });

    it('should accept email with dots in local part', () => {
      const result = validateEmail('first.last@example.com');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('first.last@example.com');
    });

    it('should trim and lowercase email', () => {
      const result = validateEmail('  TEST@EXAMPLE.COM  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('test@example.com');
    });
  });

  describe('invalid emails', () => {
    it('should reject empty string', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should reject email without @', () => {
      const result = validateEmail('testexample.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject email without domain', () => {
      const result = validateEmail('test@');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject email without local part', () => {
      const result = validateEmail('@example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject email that is too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmail(longEmail);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email is too long (max 254 characters)');
    });

    it('should reject non-string input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = validateEmail(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email must be a string');
    });
  });

  describe('XSS attempts', () => {
    it('should reject email with script tag', () => {
      const result = validateEmail('<script>alert("xss")</script>@example.com');
      expect(result.valid).toBe(false);
    });

    it('should reject email with javascript protocol', () => {
      const result = validateEmail('javascript:alert(1)@example.com');
      expect(result.valid).toBe(false);
    });
  });
});

// ============================================
// URL VALIDATION TESTS
// ============================================

describe('validateUrl', () => {
  describe('valid URLs', () => {
    it('should accept valid HTTPS URL', () => {
      const result = validateUrl('https://www.example.com');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('https://www.example.com/');
    });

    it('should accept valid HTTP URL', () => {
      const result = validateUrl('http://example.com/path');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('http://example.com/path');
    });

    it('should accept URL with query parameters', () => {
      const result = validateUrl('https://example.com?param=value');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toContain('param=value');
    });

    it('should trim whitespace', () => {
      const result = validateUrl('  https://example.com  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('https://example.com/');
    });
  });

  describe('invalid URLs', () => {
    it('should reject empty string', () => {
      const result = validateUrl('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL is required');
    });

    it('should reject invalid URL format', () => {
      const result = validateUrl('not-a-url');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid URL format');
    });

    it('should reject non-string input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = validateUrl(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL must be a string');
    });
  });

  describe('dangerous protocols', () => {
    it('should reject javascript: protocol', () => {
      const result = validateUrl('javascript:alert(1)');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Dangerous protocol');
    });

    it('should reject data: protocol', () => {
      const result = validateUrl('data:text/html,<script>alert(1)</script>');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Dangerous protocol');
    });

    it('should reject vbscript: protocol', () => {
      const result = validateUrl('vbscript:msgbox(1)');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Dangerous protocol');
    });

    it('should reject file: protocol', () => {
      const result = validateUrl('file:///etc/passwd');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Dangerous protocol');
    });

    it('should reject ftp: protocol', () => {
      const result = validateUrl('ftp://example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Only HTTP and HTTPS URLs are allowed');
    });
  });
});

describe('isAllowedAffiliateDomain', () => {
  describe('allowed domains', () => {
    it('should allow amazon.com', () => {
      expect(isAllowedAffiliateDomain('https://www.amazon.com/dp/B123456')).toBe(true);
    });

    it('should allow stockx.com', () => {
      expect(isAllowedAffiliateDomain('https://stockx.com/product')).toBe(true);
    });

    it('should allow goat.com', () => {
      expect(isAllowedAffiliateDomain('https://www.goat.com/sneakers')).toBe(true);
    });

    it('should allow nike.com', () => {
      expect(isAllowedAffiliateDomain('https://nike.com/shoes')).toBe(true);
    });

    it('should allow footlocker.com', () => {
      expect(isAllowedAffiliateDomain('https://footlocker.com/product')).toBe(true);
    });

    it('should allow subdomains of allowed domains', () => {
      expect(isAllowedAffiliateDomain('https://smile.amazon.com/dp/B123')).toBe(true);
    });
  });

  describe('disallowed domains', () => {
    it('should reject unknown domains', () => {
      expect(isAllowedAffiliateDomain('https://example.com')).toBe(false);
    });

    it('should reject similar but different domains', () => {
      expect(isAllowedAffiliateDomain('https://amazon.com.fake.com')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isAllowedAffiliateDomain('not-a-url')).toBe(false);
    });

    it('should reject non-string input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isAllowedAffiliateDomain(123 as any)).toBe(false);
    });
  });
});

// ============================================
// PRICE VALIDATION TESTS
// ============================================

describe('validatePrice', () => {
  describe('valid prices', () => {
    it('should convert number to cents', () => {
      const result = validatePrice(99.99);
      expect(result.valid).toBe(true);
      expect(result.cents).toBe(9999);
    });

    it('should handle whole numbers', () => {
      const result = validatePrice(100);
      expect(result.valid).toBe(true);
      expect(result.cents).toBe(10000);
    });

    it('should handle zero', () => {
      const result = validatePrice(0);
      expect(result.valid).toBe(true);
      expect(result.cents).toBe(0);
    });

    it('should parse price string', () => {
      const result = validatePrice('99.99');
      expect(result.valid).toBe(true);
      expect(result.cents).toBe(9999);
    });

    it('should parse price string with dollar sign', () => {
      const result = validatePrice('$99.99');
      expect(result.valid).toBe(true);
      expect(result.cents).toBe(9999);
    });

    it('should parse price string with USD suffix', () => {
      const result = validatePrice('99.99 USD');
      expect(result.valid).toBe(true);
      expect(result.cents).toBe(9999);
    });

    it('should handle maximum valid price', () => {
      const result = validatePrice(100000);
      expect(result.valid).toBe(true);
      expect(result.cents).toBe(10000000);
    });

    it('should correctly handle thousands separator', () => {
      const result = validatePrice('1,000.00');
      expect(result.valid).toBe(true);
      expect(result.cents).toBe(100000); // 1000 dollars = 100000 cents
    });

    it('should handle price with multiple thousands separators', () => {
      const result = validatePrice('$10,000.50');
      expect(result.valid).toBe(true);
      expect(result.cents).toBe(1000050);
    });
  });

  describe('invalid prices', () => {
    it('should reject empty string', () => {
      const result = validatePrice('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Price is required');
    });

    it('should reject negative numbers', () => {
      const result = validatePrice(-10);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Price cannot be negative');
    });

    it('should reject prices over maximum', () => {
      const result = validatePrice(100001);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot exceed');
    });

    it('should reject invalid string format', () => {
      const result = validatePrice('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid price format');
    });

    it('should reject NaN', () => {
      const result = validatePrice(NaN);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Price must be a finite number');
    });

    it('should reject Infinity', () => {
      const result = validatePrice(Infinity);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Price must be a finite number');
    });
  });

  describe('edge cases', () => {
    it('should round floating point correctly', () => {
      const result = validatePrice(99.999);
      expect(result.valid).toBe(true);
      expect(result.cents).toBe(10000);
    });

    it('should handle single decimal place', () => {
      const result = validatePrice('99.9');
      expect(result.valid).toBe(true);
      expect(result.cents).toBe(9990);
    });
  });
});

// ============================================
// SEARCH QUERY SANITIZATION TESTS
// ============================================

describe('sanitizeSearchQuery', () => {
  describe('basic sanitization', () => {
    it('should return empty string for non-string input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(sanitizeSearchQuery(123 as any)).toBe('');
    });

    it('should trim whitespace', () => {
      const result = sanitizeSearchQuery('  test  ');
      expect(result).not.toBe('  test  ');
      expect(result).toContain('test');
    });

    it('should limit length to 200 characters', () => {
      const longQuery = 'a'.repeat(300);
      const result = sanitizeSearchQuery(longQuery);
      expect(result.length).toBeLessThanOrEqual(200);
    });
  });

  describe('XSS prevention', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeSearchQuery('<script>alert("xss")</script>sneakers');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('should escape HTML special characters', () => {
      const result = sanitizeSearchQuery('test<div>"\' search');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).toContain('&quot;');
      expect(result).toContain('&#x27;');
    });

    it('should escape ampersand', () => {
      const result = sanitizeSearchQuery('nike & adidas');
      expect(result).toContain('&amp;');
    });
  });

  describe('SQL injection prevention', () => {
    it('should remove SELECT statement', () => {
      const result = sanitizeSearchQuery('nike SELECT * FROM users');
      expect(result.toLowerCase()).not.toContain('select');
    });

    it('should remove UNION statement', () => {
      const result = sanitizeSearchQuery('nike UNION SELECT password');
      expect(result.toLowerCase()).not.toContain('union');
    });

    it('should remove DROP statement', () => {
      const result = sanitizeSearchQuery('nike; DROP TABLE users;');
      expect(result.toLowerCase()).not.toContain('drop');
    });

    it('should remove OR 1=1 pattern', () => {
      const result = sanitizeSearchQuery("' OR 1=1 --");
      expect(result).not.toContain('1=1');
    });

    it('should remove SQL comment patterns', () => {
      const result = sanitizeSearchQuery('nike -- comment');
      expect(result).not.toContain('--');
    });
  });
});

// ============================================
// FILE UPLOAD VALIDATION TESTS
// ============================================

describe('validateImageUpload', () => {
  // Create a proper mock File that works with jsdom
  function createMockFileWithMagicBytes(
    name: string,
    type: string,
    size: number,
    magicBytes: number[]
  ): File {
    const buffer = new Uint8Array(magicBytes);
    const mockBlob = {
      size: size,
      type: type,
      arrayBuffer: async () => buffer.buffer,
    } as Blob;

    // Create a mock file that has proper slice behavior
    const file = {
      name,
      type,
      size,
      slice: () => mockBlob,
    } as unknown as File;

    return file;
  }

  // JPEG magic bytes (first 3 bytes are required)
  const JPEG_MAGIC = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01];
  // PNG magic bytes
  const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  // WebP magic bytes (RIFF + WEBP)
  const WEBP_MAGIC = [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50];

  describe('valid uploads', () => {
    it('should accept valid JPEG file', async () => {
      const file = createMockFileWithMagicBytes('test.jpg', 'image/jpeg', 1024, JPEG_MAGIC);
      const result = await validateImageUpload(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid PNG file', async () => {
      const file = createMockFileWithMagicBytes('test.png', 'image/png', 1024, PNG_MAGIC);
      const result = await validateImageUpload(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid WebP file', async () => {
      const file = createMockFileWithMagicBytes('test.webp', 'image/webp', 1024, WEBP_MAGIC);
      const result = await validateImageUpload(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('invalid file types', () => {
    it('should reject unsupported file type', async () => {
      const file = createMockFileWithMagicBytes('test.gif', 'image/gif', 1024, [0x47, 0x49, 0x46, 0x38]);
      const result = await validateImageUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject non-image files', async () => {
      const file = createMockFileWithMagicBytes('test.txt', 'text/plain', 1024, [0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const result = await validateImageUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });
  });

  describe('file size limits', () => {
    it('should reject files larger than 5MB', async () => {
      const file = createMockFileWithMagicBytes('large.jpg', 'image/jpeg', 6 * 1024 * 1024, JPEG_MAGIC);
      const result = await validateImageUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File too large');
    });
  });

  describe('magic bytes validation', () => {
    it('should reject file with mismatched magic bytes', async () => {
      // Create JPEG file with PNG magic bytes
      const file = createMockFileWithMagicBytes('fake.jpg', 'image/jpeg', 1024, PNG_MAGIC);
      const result = await validateImageUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not match');
    });

    it('should reject invalid file object', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await validateImageUpload('not a file' as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid file object');
    });

    it('should reject null input', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await validateImageUpload(null as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid file object');
    });
  });
});

// ============================================
// TEXT SANITIZATION TESTS
// ============================================

describe('sanitizeText', () => {
  describe('basic sanitization', () => {
    it('should return empty string for non-string input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(sanitizeText(123 as any)).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeText('  hello  ')).toBe('hello');
    });

    it('should escape HTML characters', () => {
      const result = sanitizeText('<div>test</div>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should escape quotes', () => {
      const result = sanitizeText('test "quoted" text');
      expect(result).toContain('&quot;');
    });

    it('should escape single quotes', () => {
      const result = sanitizeText("test 'quoted' text");
      expect(result).toContain('&#x27;');
    });
  });

  describe('length limits', () => {
    it('should enforce default max length of 5000', () => {
      const longText = 'a'.repeat(6000);
      const result = sanitizeText(longText);
      expect(result.length).toBe(5000);
    });

    it('should enforce custom max length', () => {
      const longText = 'a'.repeat(200);
      const result = sanitizeText(longText, 100);
      expect(result.length).toBe(100);
    });
  });
});

describe('sanitizeHtml', () => {
  describe('dangerous content removal', () => {
    it('should remove script tags', () => {
      const result = sanitizeHtml('<script>alert("xss")</script>');
      expect(result).not.toContain('script');
      expect(result).not.toContain('alert');
    });

    it('should remove style tags', () => {
      const result = sanitizeHtml('<style>body { display: none; }</style>');
      expect(result).not.toContain('style');
      expect(result).not.toContain('display');
    });

    it('should neutralize onclick handlers', () => {
      const result = sanitizeHtml('<div onclick="alert(1)">click</div>');
      expect(result).not.toContain('onclick');
      // The handler content may be preserved but the event attribute is neutralized
    });

    it('should neutralize onerror handlers', () => {
      const result = sanitizeHtml('<img src="x" onerror="alert(1)">');
      expect(result).not.toContain('onerror');
    });

    it('should remove javascript: URLs', () => {
      const result = sanitizeHtml('<a href="javascript:alert(1)">link</a>');
      expect(result).not.toContain('javascript:');
    });

    it('should remove data: URLs', () => {
      const result = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">link</a>');
      expect(result).not.toContain('data:');
    });

    it('should remove iframe tags', () => {
      const result = sanitizeHtml('<iframe src="https://evil.com"></iframe>');
      expect(result).not.toContain('iframe');
    });

    it('should remove form tags', () => {
      const result = sanitizeHtml('<form action="https://evil.com"><input type="submit"></form>');
      expect(result).not.toContain('form');
      expect(result).not.toContain('input');
    });
  });

  describe('safe content preservation', () => {
    it('should keep text content', () => {
      const result = sanitizeHtml('<p>Hello World</p>');
      expect(result).toContain('Hello World');
    });

    it('should keep safe HTML tags', () => {
      const result = sanitizeHtml('<p>Hello <strong>World</strong></p>');
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
    });
  });

  describe('edge cases', () => {
    it('should return empty string for non-string input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(sanitizeHtml(123 as any)).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeHtml('  <p>test</p>  ')).toBe('<p>test</p>');
    });
  });
});

// ============================================
// DISPLAY NAME VALIDATION TESTS
// ============================================

describe('validateDisplayName', () => {
  describe('valid names', () => {
    it('should accept simple name', () => {
      const result = validateDisplayName('JohnDoe');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('JohnDoe');
    });

    it('should accept name with space', () => {
      const result = validateDisplayName('John Doe');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('John Doe');
    });

    it('should accept name with underscore', () => {
      const result = validateDisplayName('John_Doe');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('John_Doe');
    });

    it('should accept name with hyphen', () => {
      const result = validateDisplayName('John-Doe');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('John-Doe');
    });

    it('should accept name with numbers', () => {
      const result = validateDisplayName('John123');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('John123');
    });

    it('should accept minimum length name', () => {
      const result = validateDisplayName('Jo');
      expect(result.valid).toBe(true);
    });

    it('should accept maximum length name', () => {
      const result = validateDisplayName('a'.repeat(30));
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid names', () => {
    it('should reject empty string', () => {
      const result = validateDisplayName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Display name is required');
    });

    it('should reject too short name', () => {
      const result = validateDisplayName('J');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 2 characters');
    });

    it('should reject too long name', () => {
      const result = validateDisplayName('a'.repeat(31));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot exceed 30 characters');
    });

    it('should reject name with special characters', () => {
      const result = validateDisplayName('John@Doe');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('can only contain');
    });

    it('should reject name starting with special character', () => {
      const result = validateDisplayName('_John');
      expect(result.valid).toBe(false);
    });

    it('should reject name ending with special character', () => {
      const result = validateDisplayName('John_');
      expect(result.valid).toBe(false);
    });

    it('should reject consecutive special characters', () => {
      const result = validateDisplayName('John--Doe');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('consecutive special characters');
    });

    it('should reject non-string input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = validateDisplayName(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Display name must be a string');
    });
  });

  describe('profanity filter', () => {
    it('should reject names containing profanity', () => {
      const result = validateDisplayName('testfucktest');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Display name contains inappropriate content');
    });

    it('should be case insensitive for profanity', () => {
      const result = validateDisplayName('TestFUCKTest');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Display name contains inappropriate content');
    });
  });

  describe('XSS attempts', () => {
    it('should reject name with HTML tags', () => {
      const result = validateDisplayName('<script>alert</script>');
      expect(result.valid).toBe(false);
    });

    it('should reject name with angle brackets', () => {
      const result = validateDisplayName('John<>Doe');
      expect(result.valid).toBe(false);
    });
  });

  describe('SQL injection attempts', () => {
    it('should reject name with SQL syntax', () => {
      const result = validateDisplayName("John'; DROP TABLE--");
      expect(result.valid).toBe(false);
    });

    it('should reject name with semicolon', () => {
      const result = validateDisplayName('John;Doe');
      expect(result.valid).toBe(false);
    });
  });
});

// ============================================
// UUID VALIDATION TESTS
// ============================================

describe('validateUUID', () => {
  describe('valid UUIDs', () => {
    it('should accept valid UUID v4', () => {
      const result = validateUUID('550e8400-e29b-41d4-a716-446655440000');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should accept uppercase UUID and convert to lowercase', () => {
      const result = validateUUID('550E8400-E29B-41D4-A716-446655440000');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should accept mixed case UUID', () => {
      const result = validateUUID('550e8400-E29b-41d4-A716-446655440000');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should trim whitespace', () => {
      const result = validateUUID('  550e8400-e29b-41d4-a716-446655440000  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('invalid UUIDs', () => {
    it('should reject empty string', () => {
      const result = validateUUID('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ID is required');
    });

    it('should reject non-string input', () => {
      const result = validateUUID(123 as unknown as string);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ID must be a string');
    });

    it('should reject UUID with wrong version number', () => {
      // Version should be 4, this has 5
      const result = validateUUID('550e8400-e29b-51d4-a716-446655440000');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid UUID format');
    });

    it('should reject UUID with invalid characters', () => {
      const result = validateUUID('550e8400-e29b-41d4-a716-44665544000g');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid UUID format');
    });

    it('should reject UUID with wrong length', () => {
      const result = validateUUID('550e8400-e29b-41d4-a716-44665544000');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid UUID format');
    });

    it('should reject random string', () => {
      const result = validateUUID('not-a-uuid');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid UUID format');
    });
  });
});

// ============================================
// AMAZON ASIN VALIDATION TESTS
// ============================================

describe('validateASIN', () => {
  describe('valid ASINs', () => {
    it('should accept valid ASIN', () => {
      const result = validateASIN('B08N5WRWNW');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('B08N5WRWNW');
    });

    it('should accept lowercase ASIN and convert to uppercase', () => {
      const result = validateASIN('b08n5wrwnw');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('B08N5WRWNW');
    });

    it('should trim whitespace', () => {
      const result = validateASIN('  B08N5WRWNW  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('B08N5WRWNW');
    });

    it('should accept numeric only ASIN', () => {
      const result = validateASIN('0123456789');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('0123456789');
    });
  });

  describe('invalid ASINs', () => {
    it('should reject empty string', () => {
      const result = validateASIN('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ASIN is required');
    });

    it('should reject non-string input', () => {
      const result = validateASIN(123 as unknown as string);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ASIN must be a string');
    });

    it('should reject ASIN with wrong length (too short)', () => {
      const result = validateASIN('B08N5WRW');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid ASIN format (must be 10 alphanumeric characters)');
    });

    it('should reject ASIN with wrong length (too long)', () => {
      const result = validateASIN('B08N5WRWNWABC');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid ASIN format (must be 10 alphanumeric characters)');
    });

    it('should reject ASIN with special characters', () => {
      const result = validateASIN('B08N5WRW-W');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid ASIN format (must be 10 alphanumeric characters)');
    });
  });
});

// ============================================
// AFFILIATE URL VALIDATION TESTS
// ============================================

describe('validateAffiliateUrl', () => {
  describe('valid Amazon URLs', () => {
    it('should accept valid Amazon URL and add affiliate tag', () => {
      const result = validateAffiliateUrl('https://www.amazon.com/dp/B08N5WRWNW');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toContain('tag=shoeswiper-20');
    });

    it('should keep existing correct affiliate tag', () => {
      const result = validateAffiliateUrl('https://www.amazon.com/dp/B08N5WRWNW?tag=shoeswiper-20');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toContain('tag=shoeswiper-20');
      // Should only have one tag parameter
      expect(result.sanitized.split('tag=').length).toBe(2);
    });

    it('should replace incorrect affiliate tag', () => {
      const result = validateAffiliateUrl('https://www.amazon.com/dp/B08N5WRWNW?tag=other-tag-20');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toContain('tag=shoeswiper-20');
      expect(result.sanitized).not.toContain('tag=other-tag-20');
    });

    it('should work with amazon.co.uk', () => {
      const result = validateAffiliateUrl('https://www.amazon.co.uk/dp/B08N5WRWNW');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toContain('tag=shoeswiper-20');
    });
  });

  describe('invalid URLs', () => {
    it('should reject non-Amazon URL', () => {
      const result = validateAffiliateUrl('https://www.google.com/search?q=shoes');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL must be from Amazon domain');
    });

    it('should reject empty URL', () => {
      const result = validateAffiliateUrl('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL is required');
    });

    it('should reject invalid URL format', () => {
      const result = validateAffiliateUrl('not-a-url');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid URL format');
    });

    it('should reject javascript: protocol', () => {
      const result = validateAffiliateUrl('javascript:alert(1)');
      expect(result.valid).toBe(false);
    });
  });
});

// ============================================
// STORAGE UTILITY TESTS
// ============================================

describe('obfuscateForStorage and deobfuscateFromStorage', () => {
  it('should obfuscate and deobfuscate basic strings', () => {
    const original = 'Hello, World!';
    const encoded = obfuscateForStorage(original);
    const decoded = deobfuscateFromStorage(encoded);
    expect(decoded).toBe(original);
  });

  it('should handle special characters', () => {
    const original = 'Test with émojis 🎉 and ñ characters';
    const encoded = obfuscateForStorage(original);
    const decoded = deobfuscateFromStorage(encoded);
    expect(decoded).toBe(original);
  });

  it('should handle empty string', () => {
    const encoded = obfuscateForStorage('');
    const decoded = deobfuscateFromStorage(encoded);
    expect(decoded).toBe('');
  });

  it('should return empty string for non-string input to obfuscate', () => {
    const result = obfuscateForStorage(123 as unknown as string);
    expect(result).toBe('');
  });

  it('should return empty string for non-string input to deobfuscate', () => {
    const result = deobfuscateFromStorage(123 as unknown as string);
    expect(result).toBe('');
  });

  it('should return empty string for invalid base64', () => {
    const result = deobfuscateFromStorage('not-valid-base64!!!');
    expect(result).toBe('');
  });
});

describe('isSafeStorageKey', () => {
  it('should return true for allowed keys', () => {
    expect(isSafeStorageKey('shoeswiper_favorites')).toBe(true);
    expect(isSafeStorageKey('shoeswiper_onboarding')).toBe(true);
    expect(isSafeStorageKey('shoeswiper_preferences')).toBe(true);
    expect(isSafeStorageKey('shoeswiper_price_alerts')).toBe(true);
  });

  it('should return false for unknown keys', () => {
    expect(isSafeStorageKey('unknown_key')).toBe(false);
    expect(isSafeStorageKey('shoeswiper_sensitive_data')).toBe(false);
    expect(isSafeStorageKey('')).toBe(false);
  });
});
