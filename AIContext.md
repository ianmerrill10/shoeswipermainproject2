# ShoeSwiper AI Context File
**Last Updated:** 2024-12-03
**Current Branch:** `claude/organize-project-review-017XdUugVActQYqDf6tCpkWK`
**Project Status:** Active Development - Pre-Launch
**Sprint:** 9 (Completed)

---

## SECTION 1: USER PROFILE

**Name:** Ian (43 years old)
**Background:** 10 years IT at Toyota dealership specializing in F&I (Finance & Insurance) operations
**Family:** Married with two children
**Interests:** Dirt bikes, Camaros
**Social:** TikTok @dadsellsgadgets (~2,000 followers)

**Development Strategy:** Multi-AI approach using Claude, Gemini, ChatGPT, and Devin AI in parallel
**AWS Budget:** $200-1600/month comfortable for enterprise-grade infrastructure
**Approach:** Speed-to-market with aggressive scaling, targeting first sales within 24 hours of launch

**Active Ventures:**
- ShoeSwiper (PRIMARY)
- FreeAutoCRM (Automotive dealership management)
- RateGarage.com (Auto loan comparison)
- WaitingTheLongest.com (Dog adoption aggregator)
- InviteGenerator.com (AI invitations)
- BitRewards (Bitcoin rewards app)
- Premium domains: AIconcentrator.com

---

## SECTION 2: CORE AI OPERATIONAL RULES (NEVER VIOLATE)

### Priority Order
1. **SECURITY** - Highest priority. A data breach would destroy the brand forever. Never sacrifice security for cost savings.
2. **MAXIMUM PROFITABILITY & USER GROWTH** - Prioritize adoption + monetization. Optimize for maximum net profit.
3. **MAXIMUM WORK OUTPUT** - Complete as much as possible per response. Speed to launch is critical. Do not conserve tokens.

### Strict Operational Rules
- **NO UNAUTHORIZED CHANGES** - Never add/delete/modify features unless specifically instructed. No creative deviations.
- **SELF-VERIFICATION** - Before EVERY response ask: "Did I do exactly as told or did I change something?" If any unauthorized change: explain, cease operation, await instructions.
- **PUSH TO GITHUB EVERY 5 PROMPTS** - Mandatory
- **UPDATE THIS FILE** - At the end of every prompt, update AIContext.md with current state
- **PRIORITY LIST** - Always end responses with priority-sorted incomplete features list

### Repetitive Task Protocol
1. Calculate total items required
2. Estimate work/tokens per item
3. Divide into manageable chunks
4. Report: "This job will take X responses. Shall I begin?"
5. Execute when user prompts with "next"
6. Provide running tally (e.g., "247/1000 items collected")

---

## SECTION 3: PROJECT OVERVIEW

### What is ShoeSwiper?
TikTok-style sneaker discovery marketplace combining AI-powered features, outfit analysis, and social commerce. Goal: capture 3-5% of the $30B US sneaker resale market by 2030.

### Competitive Advantages
- Discovery-first experience (swipe interface like TikTok/Tinder)
- Lowest-in-market fees (5-8% vs competitors 8-20%)
- Instant local transactions
- Autonomous AI-powered growth engine

### Business Model
- **Primary Revenue:** Marketplace commissions (8% standard, 12% featured)
- **Secondary Revenue:** Amazon Associates affiliate (tag: shoeswiper-20), subscriptions, ads
- **Affiliate Tag:** `shoeswiper-20` - ALL Amazon links MUST include `?tag=shoeswiper-20`
- **Admin Email:** dadsellsgadgets@gmail.com

---

## SECTION 4: TECH STACK

### Frontend
- React 18 + TypeScript
- Tailwind CSS + Framer Motion
- Vite build tool
- React Query for data fetching
- Zustand for state management

### Backend
- Supabase (Auth, Database, Storage, Edge Functions)
- Express/TypeScript API
- PostgreSQL with Row Level Security (RLS)

### AI/ML
- Google Gemini Vision API (outfit analysis)
- Amazon Bedrock Claude (content generation)
- AWS SageMaker (price prediction, recommendations)

### Infrastructure (AWS)
- Lambda (serverless functions)
- DynamoDB (high-throughput analytics)
- S3 + CloudFront (image CDN)
- API Gateway, Cognito, SES, SNS
- Step Functions, EventBridge
- WAF, CloudWatch

### Payments
- Stripe Connect for marketplace transactions

---

## SECTION 5: DATABASE SCHEMA

### Core Tables
```sql
profiles (extends auth.users)
- id, email, display_name, profile_image, bio, style_tags
- total_likes, rank, stripe_account_id, consents
- created_at, updated_at

shoes/products
- id, sku, brand, name, full_name, colorway
- release_date, retail_price_cents, images, materials
- category, style_tags, amazon_url (WITH AFFILIATE TAG)
- created_at, updated_at

listings
- id, seller_id, product_id
- condition (new/like_new/good/fair), size_label
- price_cents, status (available/sold/cancelled)
- featured, images, description
- views_count, likes_count, created_at, updated_at

transactions
- id, listing_id, seller_id, buyer_id
- amount_cents, commission_cents
- stripe_payment_intent_id
- status (pending/completed/cancelled/refunded)
- shipping_tracking, created_at, completed_at

orders
- id, buyer_id, seller_id, listing_id
- status (pending/paid/shipped/delivered/cancelled/refunded)
- total_cents, platform_fee_cents
- stripe_payment_intent, shipping_address, tracking_number

fit_checks/fit_history
- id, user_id, image_url
- fit_score (1-10), style_tags, feedback
- dominant_colors, detected_shoe, created_at

analytics_events
- id, user_id, event_type (affiliate_click/view/search)
- metadata (JSONB), created_at
```

---

## SECTION 6: CORE FEATURES

### TikTok-Style Feed
- Infinite scroll with full-screen sneaker cards
- Tap left/right to navigate
- Gradient overlays, automatic view tracking
- Pre-fetches next batch, affiliate click handling

### Smart Search
- PostgreSQL full-text + Fuse.js fuzzy matching
- Filters: brand, style, price, gender, condition, release year
- Sort: price, newest, trending
- Saved searches and history

### AI "Check My Fit" Outfit Analysis
- Upload photo → base64 → Edge Function → Gemini Vision
- Returns: rating (1-10), feedback, style_tags, dominant_colors, detected_shoe
- Database matches shoes to outfit
- 5 free/month, $1.99 per additional for free users, unlimited for Pro

### NFT Marketplace
- Tiers: Common (Silver), Rare (Blue), Legendary (Purple), Grail (Gold)
- Operations: mintNFT, listForSale, buyNFT, listNFTs
- Proof uploads in Supabase Storage

### Social Features
- Like, save, share (native API)
- Comments with threaded replies
- Follow creators, DM (premium)
- Activity feed, referral system ($10 credit each)

### Creator Marketplace
- Onboarding: verify identity, connect Stripe Express
- Dashboard: sales, orders, inventory, analytics, payouts
- Creator Cohort: First 50 sales at 0% commission, then 5%

### Admin Dashboard
- Restricted to dadsellsgadgets@gmail.com only
- Analytics, Product CRUD, User management
- Audit logging on all actions

---

## SECTION 7: FEED ALGORITHM

- 60% Personalized (Style DNA, history, similar users)
- 20% New/Trending
- 10% Sponsored/Featured
- 10% Followed Creators

---

## SECTION 8: MONETIZATION

### Marketplace Commission
- Standard: 8% (beats StockX 9-9.5%, GOAT 9.5-20%, Poshmark 20%)
- Featured: 12%
- Bundle Deals: 10%
- Minimum: $2/transaction
- Volume tiers: 7% at 50-200/quarter, 6% at 200-500, 5% at 500+

### Subscriptions
- **Pro ($9.99/mo or $99/yr):** 0% on first 5 sales/month, unlimited AI analysis, early access, verified badge, priority support, analytics, ad-free
- **Pro+ ($19.99/mo):** + AI pricing, auto-repricing, bulk uploads, market insights, API access

### Affiliate Revenue
- Amazon: shoeswiper-20
- Also: StockX (8-10%), GOAT Partner, Nike, Foot Locker, Farfetch

### Revenue Projections
- Year 1: $85K-$600K
- Year 3: $6M (at $50M GMV)
- Year 5: $25M (at $200M GMV)
- Acquisition Target: $75-125M (3-5x multiple on $25M revenue)

---

## SECTION 9: SECURITY REQUIREMENTS (CRITICAL)

- [x] Move Gemini API key server-side (Edge Function - COMPLETED)
- [x] Rate limiting on Edge Function (10 req/min per IP - in-memory)
- [x] CORS origin allowlist (localhost + shoeswiper.com)
- [x] Security headers (X-Frame-Options, X-XSS-Protection, Cache-Control)
- [x] Input validation (10MB max, base64 format check)
- [x] Output sanitization (XSS prevention on AI responses)
- [ ] Proper JWT authentication with refresh tokens
- [ ] RLS policies on all Supabase tables
- [ ] Encrypted storage (no sensitive data in localStorage)
- [ ] HTTPS everywhere
- [ ] PCI-DSS compliance for payments
- [ ] GDPR/CCPA compliance
- [ ] Content moderation (AI + manual review + community reporting)
- [ ] Seller verification (ID + phone)
- [ ] Escrow payment system

---

## SECTION 10: CURRENT FILE STRUCTURE

```
shoeswiper-complete/
├── public/
│   ├── favicon.svg
│   └── sw.js                    # Service Worker for push notifications
├── src/
│   ├── components/
│   │   ├── BottomNavigation.tsx
│   │   ├── EmailCaptureModal.tsx
│   │   ├── MusicPanel.tsx
│   │   ├── NotificationsPanel.tsx
│   │   ├── NotificationSettings.tsx
│   │   ├── PriceAlertButton.tsx
│   │   ├── ReferralCard.tsx
│   │   ├── ShoePanel.tsx
│   │   ├── SneakerCard.tsx
│   │   └── nft/
│   ├── hooks/
│   │   ├── useAdmin.ts
│   │   ├── useAnalytics.ts
│   │   ├── useAuthGuard.ts
│   │   ├── useEmailCapture.ts
│   │   ├── useFavorites.ts
│   │   ├── useNFTMarketplace.ts
│   │   ├── useOutfitAnalysis.ts
│   │   ├── usePriceAlerts.ts
│   │   ├── usePushNotifications.ts
│   │   ├── useReferral.ts
│   │   ├── useSneakers.ts
│   │   └── useSneakerSearch.ts
│   ├── lib/
│   │   ├── config.ts            # SINGLE SOURCE OF TRUTH
│   │   ├── deepLinks.ts
│   │   ├── supabaseClient.ts
│   │   └── types.ts
│   ├── pages/
│   │   ├── AuthPage.tsx
│   │   ├── ClosetPage.tsx
│   │   ├── FeedPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── Unauthorized.tsx
│   │   └── admin/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── AIContext.md                 # THIS FILE
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## SECTION 11: IMPLEMENTED FEATURES (22 Total)

### Core Experience
1. TikTok-Style Vertical Feed with snap scrolling
2. Keyboard Navigation (arrows, escape)
3. Touch Gestures (swipe for panels)
4. Infinite Scroll with pre-loading

### User Features
5. Google OAuth with email allowlist
6. Favorites/Save System
7. Closet Page (grid view)
8. Profile Page with settings

### Monetization
9. Amazon Affiliate Integration (tag: shoeswiper-20)
10. Price Alert System
11. Push Notifications (service worker)
12. Email Capture System
13. Referral Program (tiered rewards)

### Discovery
14. Search with multi-filters
15. Music Integration (Apple Music + Spotify)
16. Deep Links with UTM/referral tracking

### Notifications
17. Notifications Panel (tabs)
18. Notification Bell with badge
19. Notification Settings (toggles)

### Admin
20. Admin Dashboard
21. Email Allowlist protection

---

## SECTION 12: PRIORITY INCOMPLETE FEATURES

| Priority | Feature | Status | Revenue Impact |
|----------|---------|--------|----------------|
| 1 | **Deploy to Production** | Ready | CRITICAL |
| 2 | Switch DEMO_MODE to false | Ready | CRITICAL |
| 3 | Configure Supabase + Stripe | Setup needed | CRITICAL |
| 4 | Trending Feed Tab | Ready to build | MEDIUM |
| 5 | Onboarding Flow | Hook exists, needs UI | MEDIUM |
| 6 | Social Features | Needs Design | MEDIUM |
| 7 | 3D Model Viewer | Blocked (needs .glb) | MEDIUM |
| 8 | AR Try-On | Needs WebXR | HIGH |

### RECENTLY COMPLETED (via Copilot PRs):
- [x] Security Hardening (rate limiting, CORS, validation, sanitization)
- [x] Amazon PA-API Integration (live prices from Edge Function)
- [x] Autonomous Blog Generation (ContentGeneratorAgent)
- [x] Price Drop Monitoring (check-prices Edge Function)
- [x] Social Media Syndication (useSocialSyndication hook)
- [x] SEO Structured Data
- [x] Vercel Deployment Config
- [x] TypeScript/ESLint Fixes
- [x] Exit Intent Popup (10% off offer, email capture)

---

## SECTION 13: ENVIRONMENT VARIABLES

```env
# Client-side (VITE_ prefix)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-key

# Server-side ONLY (NEVER expose)
# GEMINI_API_KEY - Set via: supabase secrets set GEMINI_API_KEY=your-key
# (Used by analyze-outfit Edge Function - NEVER expose to client)
SUPABASE_SERVICE_KEY=your-service-key
STRIPE_SECRET_KEY=sk_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
JWT_SECRET=your-jwt-secret
AWS_REGION=us-east-1
```

---

## SECTION 14: CONFIG (src/lib/config.ts)

```typescript
DEMO_MODE = true  // Toggle for local vs production
AFFILIATE_TAG = 'shoeswiper-20'
SHOW_PRICES = false  // Enable when Amazon PA-API connected
ADMIN_EMAIL = 'dadsellsgadgets@gmail.com'
ALLOWED_EMAILS = ['ianmerrill10@gmail.com', ADMIN_EMAIL]
```

---

## SECTION 15: GIT STATUS

**Branch:** `claude/organize-project-review-017XdUugVActQYqDf6tCpkWK`
**Push Command:** `git push -u origin claude/organize-project-review-017XdUugVActQYqDf6tCpkWK`
**Push Frequency:** Every 5 prompts (MANDATORY)

**Recent Commits:**
```
e5b4292 docs: Add AIContext.md for complete project continuity
6ad3e8e feat: Add email capture system for lead generation
e06f7b1 feat: Add push notifications for price drop alerts
2729b85 feat: Add notifications panel for price drop alerts
b9beacd feat: Add price drop alerts for saved shoes
ef8ffda feat: Add referral program for viral user growth
bc835ac feat: Add Closet page to view saved/favorited sneakers
f7f019b feat: Add deep link system for share-driven app installs
```

---

## SECTION 16: CONTINUATION INSTRUCTIONS

If starting fresh from this file:

1. Clone repo and checkout branch: `git checkout claude/organize-project-review-017XdUugVActQYqDf6tCpkWK`
2. Install: `cd shoeswiper-complete && npm install`
3. Run: `npm run dev`
4. **READ THIS ENTIRE FILE**
5. Ask user what to work on next
6. Follow ALL rules in Section 2
7. Update this file after EVERY prompt

---

## SECTION 17: ACQUISITION TARGETS

- Foot Locker, Nike, Dick's Sporting Goods
- LVMH, Authentic Brands Group
- Target: $10M+ acquisition at $75-125M valuation

---

*This file is the SINGLE SOURCE OF TRUTH for AI agents working on ShoeSwiper.*
*Last AI: Claude (Opus 4) | Last Task: Created DEPLOYMENT.md guide*
*Session: Exit Intent Popup + Deployment preparation*
