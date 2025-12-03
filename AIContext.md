# ShoeSwiper AI Context File
**Last Updated:** 2024-12-03
**Current Branch:** `claude/organize-project-review-017XdUugVActQYqDf6tCpkWK`
**Project Status:** Active Development - Pre-Launch

---

## SECTION 1: CORE AI OPERATIONAL RULES

### Priority Order (NEVER VIOLATE)
1. **SECURITY** - Highest priority in all tasks. Never sacrifice for cost savings.
2. **MAXIMUM PROFITABILITY & USER GROWTH** - Prioritize adoption + monetization.
3. **MAXIMUM WORK OUTPUT** - Complete as much as possible per response. Speed to launch is critical.

### Strict Operational Rules
- **NO UNAUTHORIZED CHANGES** - Never add/delete/modify features unless specifically instructed
- **SELF-VERIFICATION** - Before every response ask: "Did I do exactly as told or did I change something without informing the user?"
- **PUSH TO GITHUB EVERY 5 PROMPTS** - Mandatory
- **UPDATE THIS FILE** - At the end of every prompt, update this AIContext.md with current state
- **PRIORITY LIST** - Always end responses with priority-sorted incomplete features list

### Repetitive Task Protocol
1. Calculate total items required
2. Estimate work/tokens per item
3. Divide into manageable chunks
4. Report: "This job will take X responses. Shall I begin?"
5. Execute iteratively when prompted with "next"
6. Provide running tally (e.g., "X/1000 items completed")

---

## SECTION 2: PROJECT OVERVIEW

### What is ShoeSwiper?
A TikTok-style sneaker discovery app with vertical scroll feed, allowing users to discover, save, and purchase sneakers through Amazon affiliate links. Think "Tinder for Sneakers" with music integration like TikTok.

### Target Audience
- Sneakerheads aged 16-35
- Fashion-conscious consumers
- Impulse buyers who respond to visual discovery

### Business Model
- **Primary Revenue:** Amazon Associates affiliate commissions (4-10% per sale)
- **Secondary Revenue:** Email marketing, push notifications for re-engagement
- **Growth Strategy:** Referral program, viral sharing, social features

---

## SECTION 3: TECH STACK

### Frontend
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Icons:** react-icons (Font Awesome)
- **Routing:** react-router-dom v6

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth with Google OAuth
- **Storage:** Supabase Storage
- **Mode:** DEMO_MODE=true for local testing (localStorage), false for production (Supabase)

### Key Configuration
```typescript
// src/lib/config.ts
DEMO_MODE = true  // Toggle for local vs production
AFFILIATE_TAG = 'shoeswiper-20'  // Amazon affiliate tag
SHOW_PRICES = false  // Enable when Amazon PA-API connected
ADMIN_EMAIL = 'dadsellsgadgets@gmail.com'
ALLOWED_EMAILS = ['ianmerrill10@gmail.com', ADMIN_EMAIL]
```

---

## SECTION 4: COMPLETE FILE STRUCTURE

```
shoeswiper-complete/
├── public/
│   ├── favicon.svg
│   └── sw.js                    # Service Worker for push notifications
├── src/
│   ├── components/
│   │   ├── BottomNavigation.tsx # Tab bar: Feed, Search, Check Fit, Closet, Profile
│   │   ├── EmailCaptureModal.tsx # Email collection for marketing
│   │   ├── MusicPanel.tsx       # Apple Music + Spotify integration
│   │   ├── NotificationsPanel.tsx # Price drop notifications UI
│   │   ├── NotificationSettings.tsx # Push notification preferences
│   │   ├── PriceAlertButton.tsx # Set price alerts + email capture
│   │   ├── ReferralCard.tsx     # Referral program UI
│   │   ├── ShoePanel.tsx        # Shoe details slide-up panel
│   │   ├── SneakerCard.tsx      # Grid/list shoe card component
│   │   └── nft/                 # NFT marketplace components
│   ├── hooks/
│   │   ├── useAdmin.ts          # Admin functionality
│   │   ├── useAnalytics.ts      # Event tracking
│   │   ├── useAuthGuard.ts      # Route protection
│   │   ├── useEmailCapture.ts   # Email subscription management
│   │   ├── useFavorites.ts      # Save/unsave shoes
│   │   ├── useNFTMarketplace.ts # NFT features
│   │   ├── useOutfitAnalysis.ts # AI outfit analysis
│   │   ├── usePriceAlerts.ts    # Price drop alert system
│   │   ├── usePushNotifications.ts # Push notification management
│   │   ├── useReferral.ts       # Referral program logic
│   │   ├── useSneakers.ts       # Shoe data fetching
│   │   └── useSneakerSearch.ts  # Search with filters
│   ├── lib/
│   │   ├── config.ts            # App configuration (SINGLE SOURCE OF TRUTH)
│   │   ├── deepLinks.ts         # Share URL generation with tracking
│   │   ├── supabaseClient.ts    # Supabase initialization + helpers
│   │   └── types.ts             # TypeScript interfaces
│   ├── pages/
│   │   ├── AuthPage.tsx         # Login/signup
│   │   ├── ClosetPage.tsx       # Saved shoes grid view
│   │   ├── FeedPage.tsx         # Main TikTok-style vertical feed
│   │   ├── ProfilePage.tsx      # User profile + settings
│   │   ├── SearchPage.tsx       # Search with brand/style filters
│   │   ├── Unauthorized.tsx     # Access denied page
│   │   └── admin/               # Admin dashboard pages
│   ├── App.tsx                  # Router configuration
│   ├── index.css                # Global styles + animations
│   └── main.tsx                 # App entry point
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## SECTION 5: IMPLEMENTED FEATURES (COMPLETE)

### Core Experience
1. **TikTok-Style Vertical Feed** - Full-screen cards with snap scrolling
2. **Keyboard Navigation** - Arrow keys for scroll, left/right for panels
3. **Touch Gestures** - Swipe left/right for panels on mobile
4. **Infinite Scroll** - Auto-loads more shoes when near end

### User Features
5. **Google OAuth Login** - With email allowlist protection
6. **Favorites/Save System** - Heart + bookmark to closet
7. **Closet Page** - Grid view of saved shoes with actions
8. **Profile Page** - Stats, settings, admin access

### Monetization Features
9. **Amazon Affiliate Integration** - All buy links include `?tag=shoeswiper-20`
10. **Price Alert System** - Set target price, get notified on drops
11. **Push Notifications** - Service worker + permission management
12. **Email Capture System** - Collect emails for marketing campaigns
13. **Referral Program** - Tiered rewards (Starter→Bronze→Silver→Gold→Diamond)

### Discovery Features
14. **Search with Filters** - Brand, style, gender, price, sort options
15. **Music Integration** - Apple Music + Spotify links per shoe
16. **Deep Links** - Smart share URLs with UTM + referral tracking

### Notification System
17. **Notifications Panel** - Price drops tab + active alerts tab
18. **Notification Bell** - In feed header with unread badge
19. **Notification Settings** - Toggle price drops, releases, restocks, promos

### Admin Features
20. **Admin Dashboard** - User management, analytics
21. **Email Allowlist** - Controlled access during beta

---

## SECTION 6: DATA MODELS

### Shoe Interface
```typescript
interface Shoe {
  id: string;
  name: string;
  brand: string;
  image_url: string;
  amazon_url: string;
  price?: number;
  style_tags?: string[];
  gender?: 'men' | 'women' | 'unisex' | 'kids';
  is_featured?: boolean;
  favorite_count?: number;
  music?: {
    song: string;
    artist: string;
    apple_music_url?: string;
    spotify_url?: string;
  };
}
```

### Price Alert Interface
```typescript
interface PriceAlert {
  shoeId: string;
  shoeName: string;
  shoeBrand: string;
  shoeImage: string;
  amazonUrl: string;
  targetPrice: number;
  currentPrice?: number;
  originalPrice?: number;
  createdAt: string;
  triggered?: boolean;
  triggeredAt?: string;
}
```

### Email Capture Interface
```typescript
interface CapturedEmail {
  email: string;
  source: 'price_alert' | 'newsletter' | 'exit_intent' | 'referral';
  shoeId?: string;
  shoeName?: string;
  createdAt: string;
  preferences: {
    priceAlerts: boolean;
    newReleases: boolean;
    weeklyDigest: boolean;
    promotions: boolean;
  };
}
```

---

## SECTION 7: PRIORITY INCOMPLETE FEATURES

| Priority | Feature | Status | Revenue Impact | Notes |
|----------|---------|--------|----------------|-------|
| 1 | Trending Feed Tab | Ready | MEDIUM | For You vs Trending toggle |
| 2 | Exit Intent Popup | Ready | HIGH | Last-chance email capture |
| 3 | Social Features | Needs Design | MEDIUM | Follow users, feed of friends |
| 4 | 3D Model Viewer | Blocked | MEDIUM | Needs .glb shoe models |
| 5 | AR Try-On | Needs WebXR | HIGH | Camera-based shoe preview |
| 6 | Onboarding Flow | Ready | MEDIUM | First-time user experience |
| 7 | Weekly Digest Email | Backend Needed | MEDIUM | Requires email service |

---

## SECTION 8: AFFILIATE CONFIGURATION

### Amazon Associates
- **Affiliate Tag:** `shoeswiper-20`
- **Link Format:** `https://amazon.com/dp/{ASIN}?tag=shoeswiper-20`
- **Commission:** 4-10% depending on category

### Apple Music
- **Affiliate Token:** `1000lJFj`
- **Link Format:** `https://music.apple.com/...?at=1000lJFj`

### Deep Link Structure
```
https://shoeswiper.com/shoe/{id}?ref={referralCode}&utm_source=share&utm_medium={platform}
```

---

## SECTION 9: DEMO MODE vs PRODUCTION

### DEMO_MODE = true (Current)
- All data stored in localStorage
- No Supabase calls
- Perfect for development/testing
- Keys: `shoeswiper_favorites`, `shoeswiper_price_alerts`, etc.

### DEMO_MODE = false (Production)
- Full Supabase integration
- Real authentication
- Persistent data
- Required tables: profiles, favorites, price_alerts, email_subscriptions, etc.

---

## SECTION 10: DEPLOYMENT CHECKLIST

### Before Launch
- [ ] Set DEMO_MODE = false in config.ts
- [ ] Configure Supabase production project
- [ ] Set up Amazon PA-API for real-time prices
- [ ] Enable SHOW_PRICES = true
- [ ] Set up email service (SendGrid/AWS SES)
- [ ] Configure push notification VAPID keys
- [ ] Set up analytics (GA4, Mixpanel)
- [ ] Configure CDN for images
- [ ] SSL certificate
- [ ] Domain: shoeswiper.com

---

## SECTION 11: USER BACKGROUND

- **Experience:** 10 years IT at Toyota dealership (F&I operations)
- **Ventures:** ShoeSwiper, FreeAutoCRM, RateGarage, others
- **AWS Budget:** Comfortable with $200-1600/month
- **Strategy:** Multi-AI development, speed-to-market focused
- **Premium Domains:** Owner of shoeswiper.com

---

## SECTION 12: GIT STATUS

### Current Branch
`claude/organize-project-review-017XdUugVActQYqDf6tCpkWK`

### Recent Commits
```
6ad3e8e feat: Add email capture system for lead generation
e06f7b1 feat: Add push notifications for price drop alerts
2729b85 feat: Add notifications panel for price drop alerts
b9beacd feat: Add price drop alerts for saved shoes
ef8ffda feat: Add referral program for viral user growth
bc835ac feat: Add Closet page to view saved/favorited sneakers
f7f019b feat: Add deep link system for share-driven app installs
```

### Push Protocol
- Push every 5 prompts (MANDATORY)
- Use: `git push -u origin claude/organize-project-review-017XdUugVActQYqDf6tCpkWK`

---

## SECTION 13: CRITICAL REMINDERS

1. **Security First** - Validate all inputs, sanitize data
2. **Affiliate Links** - ALWAYS include tag on Amazon URLs
3. **No Unauthorized Changes** - Follow instructions exactly
4. **Update This File** - Every prompt ends with AIContext update
5. **Priority List** - Every response ends with incomplete features
6. **Self-Verify** - Check work before delivering
7. **Maximum Output** - Don't conserve tokens, user is comfortable

---

## SECTION 14: CONTINUATION INSTRUCTIONS

If starting fresh from this file:

1. Clone repo: `git clone [repo-url]`
2. Checkout branch: `git checkout claude/organize-project-review-017XdUugVActQYqDf6tCpkWK`
3. Install deps: `cd shoeswiper-complete && npm install`
4. Run dev: `npm run dev`
5. Read this file completely
6. Ask user what to work on next
7. Follow all rules in Section 1

---

*This file is the single source of truth for AI agents working on ShoeSwiper.*
