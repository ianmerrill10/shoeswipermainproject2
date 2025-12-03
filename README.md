# ShoeSwiper 👟

**TikTok-style sneaker discovery marketplace with AI outfit matching and NFT authenticity.**

![ShoeSwiper](https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=400&fit=crop)

## 🚀 Features

### Core Features
- **📱 TikTok-Style Feed** - Swipe through sneakers with full-screen cards
- **🔍 Smart Search** - Full-text search with filters (brand, price, style, gender)
- **🤖 AI Outfit Match** - Upload an outfit photo and get AI-powered sneaker recommendations using Gemini Vision
- **💎 NFT Marketplace** - Mint sneaker authenticity NFTs with rarity tiers (Common, Rare, Legendary, Grail)
- **👤 User Profiles** - Favorites, closet management, and activity tracking
- **🛡️ Admin Dashboard** - Product management, user oversight, analytics

### Monetization
- **Amazon Affiliate Integration** - All product links include `?tag=shoeswiper-20`
- **Click Tracking** - Analytics for affiliate performance

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **AI**: Google Gemini Vision API
- **Styling**: Tailwind CSS with custom dark theme

## 📦 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/ianmerrill10/shoeswipermainproject2.git
cd shoeswipermainproject2
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup

Run these SQL files in your Supabase SQL Editor (in order):

1. `database/001_schema.sql` - Tables, indexes, functions, RLS policies
2. `database/002_seed_data.sql` - Sample sneakers with affiliate links

### 4. Supabase Storage

Create a storage bucket for NFT proofs:
- Go to Supabase Dashboard → Storage
- Create bucket: `nft-proofs` (private)

### 5. Edge Function (AI Outfit Match)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set Gemini API key
supabase secrets set GEMINI_API_KEY=your-gemini-api-key

# Deploy edge function
supabase functions deploy analyze-outfit
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
shoeswiper/
├── public/                     # Static assets
├── database/
│   ├── 001_schema.sql          # Full database schema
│   └── 002_seed_data.sql       # Seed data (30+ sneakers)
├── supabase/
│   └── functions/
│       └── analyze-outfit/     # Gemini Vision edge function
├── src/
│   ├── components/
│   │   ├── admin/              # Admin dashboard components
│   │   ├── check-fit/          # AI outfit match components
│   │   ├── nft/                # NFT marketplace components
│   │   ├── BottomNavigation.tsx
│   │   └── SneakerCard.tsx
│   ├── hooks/
│   │   ├── useAdmin.ts         # Admin CRUD operations
│   │   ├── useNFTMarketplace.ts# NFT minting/trading
│   │   ├── useOutfitAnalysis.ts# AI outfit analysis
│   │   ├── useSneakers.ts      # Feed data fetching
│   │   └── useSneakerSearch.ts # Search with filters
│   ├── pages/
│   │   ├── admin/              # Admin pages
│   │   ├── AuthPage.tsx        # Login/signup
│   │   ├── CheckMyFit.tsx      # AI outfit match
│   │   ├── FeedPage.tsx        # Main swipe feed
│   │   ├── ProfilePage.tsx     # User profile
│   │   └── SearchPage.tsx      # Search & filter
│   ├── lib/
│   │   ├── supabaseClient.ts   # Supabase client & helpers
│   │   └── types.ts            # TypeScript interfaces
│   ├── App.tsx                 # Main router
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind + custom styles
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🔐 Admin Access

Only `dadsellsgadgets@gmail.com` has admin privileges:
- Product management (CRUD)
- User management (ban/unban)
- Analytics dashboard

## 📊 Database Schema

### Core Tables
- `profiles` - User profiles (extends auth.users)
- `shoes` - Product catalog
- `brands` - Brand metadata
- `favorites` - User favorites
- `user_sneakers` - User's closet (for NFT minting)
- `affiliate_clicks` - Click tracking

### NFT Tables
- `nfts` - Minted NFTs
- `nft_ownership_history` - Provenance tracking

### Admin Tables
- `audit_logs` - Admin action logging

## 🎨 UI Components

### SneakerCard
Two variants:
- `grid` - For search results (compact)
- `feed` - For TikTok-style swipe (full-screen)

### NFT Rarity Tiers
| Tier | Badge Color | Description |
|------|-------------|-------------|
| Common | Silver | Everyday heat |
| Rare | Blue | Limited release |
| Legendary | Purple | Hyped collab |
| Grail | Gold | Once-in-a-lifetime |

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Environment Variables for Production
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Supabase Edge Function Secrets
- `GEMINI_API_KEY`

## 📱 Mobile Considerations

- Safe area insets for notched devices
- Touch-friendly navigation
- Pull-to-refresh disabled (use snap scroll instead)
- 100svh for proper mobile viewport

## 🔗 API Keys Needed

1. **Supabase** - [supabase.com](https://supabase.com)
2. **Google Gemini** - [makersuite.google.com](https://makersuite.google.com)
3. **Amazon Associates** - Tag: `shoeswiper-20`

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

**Built with ❤️ by @dadsellsgadgets**

*Affiliate Disclosure: ShoeSwiper earns commission from qualifying Amazon purchases.*
