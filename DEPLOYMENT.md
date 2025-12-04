# ShoeSwiper Production Deployment Guide

## Pre-Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Edge Functions deployed
- [ ] Supabase secrets configured
- [ ] Vercel project connected
- [ ] Environment variables set
- [ ] Domain configured (optional)
- [ ] DEMO_MODE set to false

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note these values (Settings > API):
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: `eyJ...` (public key)
   - **Service Role Key**: `eyJ...` (secret - never expose)

---

## Step 2: Apply Database Schema

Run these SQL files **in order** in Supabase SQL Editor:

```bash
# Order matters!
1. database/001_schema.sql          # Core tables
2. database/002_seed_data.sql       # Sample shoes (optional)
3. database/003_missing_tables.sql  # Additional tables
4. database/004_blog_schema.sql     # Blog system
5. database/005_supabase_optimizations.sql
6. database/006_rls_security_audit_fixes.sql
7. database/007_price_monitoring.sql
8. database/007_amazon_pa_api_integration.sql
9. database/007_social_syndication.sql
```

---

## Step 3: Deploy Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all Edge Functions
cd shoeswiper-complete
supabase functions deploy analyze-outfit
supabase functions deploy shoes
supabase functions deploy check-prices
supabase functions deploy price-alerts
supabase functions deploy send-price-alerts
supabase functions deploy shoe-detail
supabase functions deploy user-favorites
supabase functions deploy user-preferences
supabase functions deploy affiliate-track
```

---

## Step 4: Set Supabase Secrets

```bash
# REQUIRED: Gemini API Key for outfit analysis
supabase secrets set GEMINI_API_KEY=your-gemini-api-key

# OPTIONAL: Amazon PA-API for live prices
supabase secrets set AMAZON_ACCESS_KEY=your-access-key
supabase secrets set AMAZON_SECRET_KEY=your-secret-key
supabase secrets set AMAZON_PARTNER_TAG=shoeswiper-20
```

---

## Step 5: Deploy to Vercel

### Option A: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository: `ianmerrill10/shoeswipermainproject2`
3. Vercel will auto-detect `vercel.json` settings
4. Add environment variables (see below)
5. Deploy!

### Option B: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Step 6: Set Vercel Environment Variables

In Vercel Dashboard > Settings > Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your anon key | Yes |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_...` | For payments |
| `VITE_AMAZON_API_ENABLED` | `true` | For live prices |
| `VITE_SHOW_PRICES` | `true` | Show prices in UI |

---

## Step 7: Switch to Production Mode

Edit `shoeswiper-complete/src/lib/config.ts`:

```typescript
// Change from:
export const DEMO_MODE = true;

// To:
export const DEMO_MODE = false;
```

Commit and push - Vercel will auto-deploy.

---

## Step 8: Configure Google OAuth (Optional)

In Supabase Dashboard > Authentication > Providers:

1. Enable Google provider
2. Add OAuth credentials from Google Cloud Console
3. Add allowed redirect URLs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `https://your-vercel-domain.vercel.app`
   - `https://shoeswiper.com` (if using custom domain)

---

## Step 9: Custom Domain (Optional)

### Vercel:
1. Vercel Dashboard > Settings > Domains
2. Add `shoeswiper.com`
3. Update DNS records as instructed

### Update CORS:
Edit `supabase/functions/_shared/cors.ts` to add your domain:

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://shoeswiper.com',
  'https://www.shoeswiper.com',
  'https://your-app.vercel.app', // Add your Vercel URL
];
```

Redeploy Edge Functions after updating.

---

## Verification Checklist

After deployment, verify:

- [ ] App loads at your Vercel URL
- [ ] Feed shows sneakers
- [ ] Can save favorites
- [ ] "Check My Fit" AI analysis works
- [ ] Price alerts can be set
- [ ] Exit intent popup appears (after 10s, move mouse to top)
- [ ] Affiliate links have `?tag=shoeswiper-20`

---

## Troubleshooting

### "Supabase not configured" error
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel

### AI outfit analysis fails
- Verify `GEMINI_API_KEY` is set in Supabase secrets
- Check Edge Function logs: `supabase functions logs analyze-outfit`

### 404 errors on page refresh
- Verify `vercel.json` has the SPA rewrite rule

### CORS errors
- Add your domain to `ALLOWED_ORIGINS` in `cors.ts`
- Redeploy Edge Functions

---

## Security Reminders

1. **NEVER** commit `.env` files with real secrets
2. **NEVER** expose service role key to client
3. **ALWAYS** use `VITE_` prefix for client-safe variables only
4. **ALWAYS** keep `GEMINI_API_KEY` server-side only

---

## Quick Reference

| Service | Dashboard URL |
|---------|---------------|
| Supabase | https://supabase.com/dashboard |
| Vercel | https://vercel.com/dashboard |
| Stripe | https://dashboard.stripe.com |
| Google Cloud | https://console.cloud.google.com |

---

*Last Updated: 2024-12-04*
*Affiliate Tag: shoeswiper-20 (NON-NEGOTIABLE)*
