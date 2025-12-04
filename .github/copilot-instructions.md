# ShoeSwiper Copilot Instructions

## Project Context

ShoeSwiper is a **TikTok-style sneaker discovery marketplace** combining AI-powered features, outfit analysis, and social commerce. The goal is to capture 3-5% of the $30B US sneaker resale market by 2030.

**Tech Stack:**
- React 18 + TypeScript + Tailwind CSS + Framer Motion
- Supabase backend (Auth, Database, Storage, Edge Functions)
- Vite build tool
- Pre-launch status, targeting sneaker resale market

## Core Principles (Priority Order)

1. **SECURITY** - Highest priority. Never sacrifice security. A data breach would destroy the brand.
2. **MAXIMUM PROFITABILITY & USER GROWTH** - Optimize for adoption + monetization
3. **MAXIMUM WORK OUTPUT** - Speed to launch is critical

## Critical Requirements

### Affiliate Tag
**ALL Amazon links MUST include `?tag=shoeswiper-20`**

This is non-negotiable. Every Amazon URL must have this affiliate tag.

### Admin Email
```
dadsellsgadgets@gmail.com
```

### Allowed Emails for Auth
```typescript
// From src/lib/config.ts - SINGLE SOURCE OF TRUTH
const ALLOWED_EMAILS = [
  'ianmerrill10@gmail.com',
  'dadsellsgadgets@gmail.com'  // ADMIN_EMAIL
];
```

## Security Rules

- **Never expose API keys in client-side code**
- All sensitive keys must use server-side Edge Functions
- Use `VITE_` prefix ONLY for safe public environment variables
- Implement input validation on all user inputs
- Always use RLS (Row Level Security) on Supabase tables
- Use HTTPS everywhere
- No sensitive data in localStorage
- Guard console.log with `import.meta.env.DEV`

### Environment Variables

```env
# Client-side (VITE_ prefix) - Safe to expose
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-key

# Server-side ONLY (NEVER expose in client code)
SUPABASE_SERVICE_KEY=your-service-key
STRIPE_SECRET_KEY=sk_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
JWT_SECRET=your-jwt-secret
```

## Code Standards

### TypeScript
- Use TypeScript strict mode
- **No `any` types** - always use proper type definitions
- Define interfaces in `src/lib/types.ts`

### React
- Use functional components with hooks
- Use `useCallback` and `useMemo` appropriately for performance
- Use React Query (`@tanstack/react-query`) for data fetching
- Use Zustand for global state management

### Styling
- Use Tailwind CSS for all styling
- Dark theme with `zinc-950` base
- Use Framer Motion for animations

### Logging
```typescript
// Always guard console.log statements
if (import.meta.env.DEV) {
  console.log('Debug info');
}
```

## File Structure

```
shoeswiper-complete/
├── src/
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities, config, types
│   │   ├── config.ts  # SINGLE SOURCE OF TRUTH for config
│   │   ├── supabaseClient.ts
│   │   └── types.ts
│   ├── pages/         # Page components
│   └── stores/        # Zustand stores
├── supabase/
│   └── functions/     # Edge Functions (server-side)
└── database/          # SQL migrations
```

## Key Libraries

| Library | Purpose |
|---------|---------|
| `@tanstack/react-query` | Data fetching and caching |
| `zustand` | Global state management |
| `@supabase/supabase-js` | Auth and database |
| `framer-motion` | Animations |
| `tailwindcss` | Styling |

## Build, Test & Validation

All commands should be run from the `shoeswiper-complete/` directory.

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Testing Guidelines
- Use Vitest for unit tests
- Test files go in `src/__tests__/` or `src/hooks/__tests__/`
- Always run `npm run lint` and `npm test -- --run` before submitting changes
- Note: `--run` flag runs tests once (CI mode); omit it for watch mode during development

## Configuration Reference

Key configuration values from `src/lib/config.ts`:

```typescript
DEMO_MODE = true          // Toggle for local vs production
AFFILIATE_TAG = 'shoeswiper-20'
SHOW_PRICES = false       // Enable when Amazon PA-API connected
ADMIN_EMAIL = 'dadsellsgadgets@gmail.com'
ALLOWED_EMAILS = ['ianmerrill10@gmail.com', ADMIN_EMAIL]
```

## Don't Do

- ❌ Don't add features without explicit instruction
- ❌ Don't delete or modify existing features without instruction
- ❌ Don't expose secrets in client code
- ❌ Don't use `any` types in TypeScript
- ❌ Don't skip affiliate tags on Amazon links
- ❌ Don't store sensitive data in localStorage
- ❌ Don't skip input validation
- ❌ Don't leave console.log unguarded in production code
