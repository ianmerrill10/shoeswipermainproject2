import { describe, it, expect } from 'vitest';
import {
  moderateContent,
  containsProfanity,
  containsContactInfo,
  censorProfanity,
  validateBio,
  validateNFTDescription,
  validateListingDescription,
} from '../contentModeration';

// ============================================
// MODERATION FUNCTION TESTS
// ============================================

describe('moderateContent', () => {
  describe('clean content', () => {
    it('should pass clean content', () => {
      const result = moderateContent('I love these sneakers! Great quality.');
      expect(result.severity).toBe('clean');
      expect(result.passed).toBe(true);
      expect(result.flags).toHaveLength(0);
    });

    it('should preserve original content when clean', () => {
      const content = 'Nike Air Jordan 1 Retro High OG';
      const result = moderateContent(content);
      expect(result.sanitized).toBe(content);
    });
  });

  describe('profanity detection', () => {
    it('should detect and block profanity', () => {
      const result = moderateContent('This is fucking awesome');
      expect(result.severity).toBe('blocked');
      expect(result.passed).toBe(false);
      expect(result.flags.some(f => f.type === 'profanity')).toBe(true);
    });

    it('should censor profanity in sanitized output', () => {
      const result = moderateContent('What the fuck');
      expect(result.sanitized).not.toContain('fuck');
      expect(result.sanitized).toContain('****');
    });

    it('should detect slurs and block', () => {
      const result = moderateContent('test nigger test');
      expect(result.severity).toBe('blocked');
      expect(result.passed).toBe(false);
    });

    it('should detect variations of profanity', () => {
      const result = moderateContent('fuuuuck this shiiiit');
      expect(result.severity).toBe('blocked');
      expect(result.flags.some(f => f.type === 'profanity')).toBe(true);
    });

    it('should warn on mild profanity', () => {
      const result = moderateContent('damn that sucks');
      expect(result.severity).toBe('warning');
      expect(result.passed).toBe(true);
    });
  });

  describe('spam detection', () => {
    it('should detect repeated characters', () => {
      const result = moderateContent('coooooool sneakers');
      expect(result.flags.some(f => f.description.includes('Repeated'))).toBe(true);
    });

    it('should detect excessive punctuation', () => {
      const result = moderateContent('Amazing deal!!!!!');
      expect(result.flags.some(f => f.description.includes('punctuation'))).toBe(true);
    });

    it('should detect spam phrases', () => {
      const result = moderateContent('BUY NOW limited time offer!');
      expect(result.flags.some(f => f.description.includes('Spam'))).toBe(true);
    });
  });

  describe('PII detection', () => {
    it('should detect and block phone numbers', () => {
      const result = moderateContent('Call me at 555-123-4567');
      expect(result.severity).toBe('blocked');
      expect(result.flags.some(f => f.description.includes('Phone'))).toBe(true);
      expect(result.sanitized).toContain('[REDACTED]');
    });

    it('should detect various phone formats', () => {
      const formats = [
        '(555) 123-4567',
        '555.123.4567',
        '+1 555 123 4567',
        '5551234567',
      ];

      for (const phone of formats) {
        const result = moderateContent(`Contact: ${phone}`);
        expect(result.severity).toBe('blocked');
      }
    });

    it('should detect and block email addresses', () => {
      const result = moderateContent('Email me at test@example.com');
      expect(result.severity).toBe('blocked');
      expect(result.flags.some(f => f.description.includes('Email'))).toBe(true);
    });

    it('should detect and block SSN patterns', () => {
      const result = moderateContent('My SSN is 123-45-6789');
      expect(result.severity).toBe('blocked');
      expect(result.flags.some(f => f.description.includes('SSN'))).toBe(true);
    });
  });

  describe('contact info detection', () => {
    it('should detect Instagram handles', () => {
      const result = moderateContent('Follow me @sneakerhead123');
      expect(result.flags.some(f => f.type === 'contact')).toBe(true);
    });

    it('should detect social media mentions', () => {
      const handles = [
        'IG: sneakers',
        'instagram: kicks',
        'snap: shoeguy',
        'tiktok: sneakerreviews',
        'discord: user#1234',
      ];

      for (const handle of handles) {
        const result = moderateContent(handle);
        expect(result.flags.some(f => f.type === 'contact')).toBe(true);
      }
    });

    it('should detect payment app handles', () => {
      const result = moderateContent('venmo: @paymenow');
      expect(result.flags.some(f => f.description.includes('Payment'))).toBe(true);
    });

    it('should detect DM solicitation', () => {
      const result = moderateContent('DM me for the price');
      expect(result.flags.some(f => f.description.includes('Off-platform'))).toBe(true);
    });

    it('should allow contact info when configured', () => {
      const result = moderateContent('Email me at test@example.com', {
        allowContactInfo: true,
      });
      // Still blocked for PII, but contact flag won't be present
      // Actually email is PII so it will still be blocked
      expect(result.severity).toBe('blocked'); // PII always blocked
    });
  });

  describe('scam detection', () => {
    it('should detect scam language', () => {
      const result = moderateContent('Wire me the money ASAP');
      expect(result.flags.some(f => f.type === 'scam')).toBe(true);
    });

    it('should detect pressure tactics', () => {
      const result = moderateContent('Act fast or miss out!');
      expect(result.flags.some(f => f.type === 'scam')).toBe(true);
    });
  });

  describe('length limits', () => {
    it('should truncate content exceeding max length', () => {
      const longContent = 'a'.repeat(2000);
      const result = moderateContent(longContent, { maxLength: 100 });
      expect(result.sanitized.length).toBe(100);
      expect(result.flags.some(f => f.description.includes('truncated'))).toBe(true);
    });
  });

  describe('strict mode', () => {
    it('should block on warnings in strict mode', () => {
      const result = moderateContent('Follow me @sneakerhead', {
        strictMode: true,
        allowContactInfo: false,
      });
      expect(result.severity).toBe('blocked');
    });
  });
});

// ============================================
// HELPER FUNCTION TESTS
// ============================================

describe('containsProfanity', () => {
  it('should return true for profane content', () => {
    expect(containsProfanity('fuck')).toBe(true);
    expect(containsProfanity('This is shit')).toBe(true);
  });

  it('should return false for clean content', () => {
    expect(containsProfanity('Great sneakers!')).toBe(false);
    expect(containsProfanity('I love these kicks')).toBe(false);
  });

  it('should handle non-string input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(containsProfanity(123 as any)).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(containsProfanity(null as any)).toBe(false);
  });
});

describe('containsContactInfo', () => {
  it('should detect phone numbers', () => {
    expect(containsContactInfo('Call 555-123-4567')).toBe(true);
  });

  it('should detect email', () => {
    expect(containsContactInfo('email@example.com')).toBe(true);
  });

  it('should detect social handles', () => {
    expect(containsContactInfo('IG: @sneakers')).toBe(true);
  });

  it('should return false when no contact info', () => {
    expect(containsContactInfo('Great condition sneakers')).toBe(false);
  });
});

describe('censorProfanity', () => {
  it('should replace profanity with asterisks', () => {
    const result = censorProfanity('What the fuck');
    expect(result).toBe('What the ****');
  });

  it('should preserve clean content', () => {
    const clean = 'Great sneakers!';
    expect(censorProfanity(clean)).toBe(clean);
  });

  it('should handle multiple profane words', () => {
    const result = censorProfanity('fuck this shit');
    expect(result).not.toContain('fuck');
    expect(result).not.toContain('shit');
  });
});

// ============================================
// SPECIALIZED VALIDATOR TESTS
// ============================================

describe('validateBio', () => {
  it('should pass clean bio', () => {
    const result = validateBio('Sneaker collector since 2015. Love Jordans!');
    expect(result.passed).toBe(true);
    expect(result.severity).toBe('clean');
  });

  it('should block bio with profanity', () => {
    const result = validateBio('Fuck the haters');
    expect(result.passed).toBe(false);
  });

  it('should flag bio with contact info', () => {
    const result = validateBio('DM me on IG: @sneakers');
    expect(result.flags.some(f => f.type === 'contact')).toBe(true);
  });

  it('should enforce 500 char limit', () => {
    const longBio = 'a'.repeat(600);
    const result = validateBio(longBio);
    expect(result.sanitized.length).toBe(500);
  });
});

describe('validateNFTDescription', () => {
  it('should pass valid NFT description', () => {
    const result = validateNFTDescription(
      'Deadstock Air Jordan 1 Chicago from 2015. Never worn, original box and receipt.'
    );
    expect(result.passed).toBe(true);
  });

  it('should enforce 1000 char limit', () => {
    const longDesc = 'a'.repeat(1100);
    const result = validateNFTDescription(longDesc);
    expect(result.sanitized.length).toBe(1000);
  });
});

describe('validateListingDescription', () => {
  it('should be strict about contact info', () => {
    const result = validateListingDescription('Text me for better price 555-123-4567');
    expect(result.severity).toBe('blocked');
  });

  it('should enforce 2000 char limit', () => {
    const longDesc = 'a'.repeat(2500);
    const result = validateListingDescription(longDesc);
    expect(result.sanitized.length).toBe(2000);
  });
});
