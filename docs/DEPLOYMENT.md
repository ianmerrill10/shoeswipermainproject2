# ShoeSwiper Deployment Guide

This guide covers deploying ShoeSwiper to production, including Vercel hosting, Supabase configuration, environment setup, and CI/CD pipeline configuration.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Edge Functions Deployment](#edge-functions-deployment)
- [Domain Configuration](#domain-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Logging](#monitoring-and-logging)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Node.js >= 20.0.0 installed
- [ ] Vercel account ([vercel.com](https://vercel.com))
- [ ] Supabase account ([supabase.com](https://supabase.com))
- [ ] Amazon Associates account (affiliate tag: `shoeswiper-20`)
- [ ] Google Cloud account (for Gemini AI API)
- [ ] Stripe account (for payments, optional)
- [ ] Domain name (optional, but recommended)

---

## Vercel Deployment

### Option 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**

2. **Import project in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your GitHub repository
   - Vercel will auto-detect the Vite framework

3. **Configure project settings**
   ```
   Root Directory: shoeswiper-complete
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add environment variables** (see [Environment Variables](#environment-variables))

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project directory
cd shoeswiper-complete

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Vercel Configuration

Create `vercel.json` in the root directory for custom configuration:

```json
{
  "buildCommand": "cd shoeswiper-complete && npm run build",
  "outputDirectory": "shoeswiper-complete/dist",
  "installCommand": "cd shoeswiper-complete && npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## Supabase Setup

### 1. Create a New Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name:** shoeswiper
   - **Database Password:** Use a strong password
   - **Region:** Choose closest to your users

### 2. Run Database Migrations

Navigate to SQL Editor in Supabase Dashboard and run migrations in order:

```bash
# Order of execution:
1. database/001_schema.sql  # Tables, indexes, functions
2. database/002_seed_data.sql  # Sample data
```

### 3. Configure Authentication

1. **Enable Google OAuth:**
   - Go to Authentication → Providers → Google
   - Enable Google provider
   - Add Google OAuth credentials from Google Cloud Console

2. **Configure Redirect URLs:**
   - Add your Vercel domain: `https://your-app.vercel.app`
   - Add localhost for development: `http://localhost:5173`

3. **Set up Auth Settings:**
   ```
   Site URL: https://your-app.vercel.app
   Redirect URLs:
     - https://your-app.vercel.app/*
     - http://localhost:5173/*
   ```

### 4. Create Storage Buckets

1. **nft-proofs bucket:**
   ```
   Name: nft-proofs
   Public: false
   File size limit: 5MB
   Allowed mime types: image/*
   ```

2. **avatars bucket (optional):**
   ```
   Name: avatars
   Public: true
   File size limit: 2MB
   Allowed mime types: image/*
   ```

### 5. Configure Storage Policies

```sql
-- Policy for nft-proofs bucket
CREATE POLICY "Users can upload own proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'nft-proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'nft-proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Environment Variables

### Vercel Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Environment | Description |
|----------|-------------|-------------|
| `VITE_SUPABASE_URL` | All | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | All | Supabase anon/public key |
| `VITE_STRIPE_PUBLIC_KEY` | All | Stripe publishable key |
| `VITE_DEMO_MODE` | Production: `false` | Disable demo mode |
| `VITE_SHOW_PRICES` | Production: `true` | Show prices when API connected |

### Getting Supabase Keys

1. Go to Supabase Dashboard → Settings → API
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Setting Environment Variables

**Via Vercel Dashboard:**
1. Go to Project → Settings → Environment Variables
2. Add each variable with appropriate environment (Production, Preview, Development)

**Via CLI:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

---

## Edge Functions Deployment

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref in Supabase Dashboard → Settings → General → Reference ID

### 3. Set Edge Function Secrets

```bash
# Gemini API key for outfit analysis
supabase secrets set GEMINI_API_KEY=your-gemini-api-key

# Optional: Other secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 4. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy analyze-outfit
```

### 5. Verify Deployment

```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs analyze-outfit
```

---

## Domain Configuration

### Custom Domain on Vercel

1. **Add domain in Vercel:**
   - Go to Project → Settings → Domains
   - Add your domain (e.g., `shoeswiper.com`)

2. **Configure DNS:**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or use Vercel Nameservers for full management

3. **SSL Certificate:**
   - Vercel automatically provisions SSL
   - Wait for certificate to be issued (usually < 5 minutes)

### Update Supabase Auth Redirect

After adding a custom domain:

1. Go to Supabase → Authentication → URL Configuration
2. Update Site URL to your custom domain
3. Add custom domain to Redirect URLs

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: shoeswiper-complete/package-lock.json
      
      - name: Install dependencies
        run: |
          cd shoeswiper-complete
          npm ci
      
      - name: Run linting
        run: |
          cd shoeswiper-complete
          npm run lint
      
      - name: Run tests
        run: |
          cd shoeswiper-complete
          npm test -- --run

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./shoeswiper-complete
```

### Required GitHub Secrets

Add these to your repository (Settings → Secrets → Actions):

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token (from vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

Get Vercel IDs from `.vercel/project.json` after running `vercel link`.

---

## Monitoring and Logging

### Vercel Analytics

1. Enable in Vercel Dashboard → Project → Analytics
2. Add tracking (automatically included with deployment)

### Supabase Monitoring

1. **Database Metrics:**
   - Go to Dashboard → Database → Health
   - Monitor connection count, query performance

2. **Auth Monitoring:**
   - Dashboard → Authentication → Logs
   - Monitor sign-in attempts, errors

3. **Edge Function Logs:**
   ```bash
   # Stream logs in real-time
   supabase functions logs analyze-outfit --follow
   ```

### Error Tracking (Optional)

Integrate Sentry for error tracking:

```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

### Health Checks

Create a simple health check endpoint:

```typescript
// In your app, add a health check route
// Or use Supabase Edge Function for health monitoring
```

---

## Troubleshooting

### Common Issues

#### Build Fails on Vercel

```
Error: Cannot find module '@/lib/supabaseClient'
```

**Solution:** Ensure path aliases are configured in `vite.config.ts` and `tsconfig.json`.

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### Supabase Auth Not Working

**Symptoms:** OAuth redirects fail, session not persisting

**Checklist:**
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
2. Check Redirect URLs in Supabase Auth settings
3. Ensure Site URL matches your deployment domain

#### Edge Function Timeout

**Symptoms:** analyze-outfit function times out

**Solutions:**
1. Increase function timeout in `supabase/config.toml`
2. Optimize image processing
3. Check Gemini API response time

#### Environment Variables Not Loading

**Symptoms:** `undefined` values in production

**Solutions:**
1. Ensure variables are prefixed with `VITE_` for client-side
2. Redeploy after adding environment variables
3. Check for typos in variable names

### Debugging Commands

```bash
# Check Vercel deployment logs
vercel logs

# Check Supabase function logs
supabase functions logs analyze-outfit

# Verify environment variables
vercel env ls

# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
  "https://YOUR_PROJECT.supabase.co/rest/v1/shoes?limit=1"
```

### Performance Issues

1. **Slow Initial Load:**
   - Enable Vercel Edge caching
   - Optimize bundle size with code splitting

2. **Database Slowness:**
   - Add indexes for frequently queried columns
   - Use connection pooling

3. **Image Loading:**
   - Use image CDN (Vercel Image Optimization)
   - Implement lazy loading

---

## Post-Deployment Checklist

- [ ] Verify authentication works (login/logout)
- [ ] Test affiliate links include `?tag=shoeswiper-20`
- [ ] Check admin dashboard access for ADMIN_EMAIL
- [ ] Verify Edge Functions are accessible
- [ ] Test NFT minting flow
- [ ] Check push notifications work
- [ ] Monitor error rates in first 24 hours
- [ ] Set up alerts for critical errors
- [ ] Verify SSL certificate is active
- [ ] Test on mobile devices

---

## Security Checklist

- [ ] `DEMO_MODE` is `false` in production
- [ ] All server-side secrets are in Edge Functions only
- [ ] RLS policies are enabled on all tables
- [ ] CORS is properly configured
- [ ] Rate limiting is in place
- [ ] No sensitive data in client-side logs
- [ ] HTTPS is enforced
- [ ] Security headers are configured

---

## Scaling Considerations

As your app grows:

1. **Database:**
   - Upgrade Supabase plan for more connections
   - Add read replicas for heavy read loads

2. **Edge Functions:**
   - Monitor execution times
   - Consider caching Gemini responses

3. **CDN:**
   - Leverage Vercel Edge Network
   - Configure caching headers

4. **Analytics:**
   - Move to dedicated analytics service at scale
   - Consider BigQuery for large datasets
