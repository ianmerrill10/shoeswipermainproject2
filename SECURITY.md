# Security Policy

## About ShoeSwiper

ShoeSwiper is a sneaker discovery marketplace that handles sensitive user data, payment processing via Stripe Connect, and NFT authenticity verification. Security is our highest priority—a data breach would be catastrophic for our brand and users.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

We actively maintain security for the latest version of ShoeSwiper. Users are encouraged to always use the most recent release.

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Email:** dadsellsgadgets@gmail.com

**Please include:**
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes (optional)

### What to Expect

| Timeline | Action |
| -------- | ------ |
| 24 hours | Initial acknowledgment of your report |
| 72 hours | Preliminary assessment and severity classification |
| 7 days   | Detailed response with remediation plan |
| 30 days  | Target resolution for critical vulnerabilities |

### Responsible Disclosure

- Please do not publicly disclose the vulnerability until we've had a chance to address it
- We will credit security researchers who report valid vulnerabilities (unless you prefer to remain anonymous)
- We do not pursue legal action against researchers who follow responsible disclosure practices

## Security Best Practices for Contributors

### Environment Variables
- **NEVER** commit `.env` files with actual secrets
- Use `.env.example` as a template (contains only placeholder values)
- Server-side secrets (API keys, service keys) must **NOT** have the `VITE_` prefix
- Client-side variables (with `VITE_` prefix) are exposed to browsers—only use for public keys

### API Keys & Secrets
- All API keys (Gemini, Stripe secret, Supabase service key) must be server-side only
- Use Supabase Edge Functions or a backend server for sensitive operations
- Rotate compromised credentials immediately

### Authentication & Authorization
- Use proper JWT authentication with refresh tokens
- Implement Row Level Security (RLS) on all Supabase tables
- Validate and sanitize all user inputs

### Code Security
- Keep dependencies updated and audit regularly (`npm audit`)
- Review pull requests for security implications
- Never log sensitive data (passwords, tokens, payment info)

## Compliance Goals

ShoeSwiper is working toward compliance with:

### PCI-DSS (Payment Card Industry Data Security Standard)
- All payment processing is handled through Stripe Connect
- We do not store credit card numbers directly
- Secure transmission of payment data (HTTPS only)

### GDPR (General Data Protection Regulation)
- User consent management for data collection
- Right to data portability and deletion
- Privacy-by-design principles

### CCPA (California Consumer Privacy Act)
- Transparent data collection practices
- User rights to know, delete, and opt-out
- No sale of personal information without consent

## Security Features

- **HTTPS Everywhere:** All communications are encrypted in transit
- **Supabase RLS:** Database-level access control policies
- **Escrow Payments:** Buyer protection through Stripe Connect
- **Seller Verification:** Identity and phone verification for marketplace sellers
- **Content Moderation:** AI-assisted and manual review of listings
- **Audit Logging:** All admin actions are logged for accountability

## Contact

For security concerns: dadsellsgadgets@gmail.com

For general inquiries, please use the appropriate channels in our repository.

---

*Last updated: 2025*
