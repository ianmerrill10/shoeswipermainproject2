# ShoeSwiper 👟

[![CI](https://github.com/ianmerrill10/shoeswipermainproject2/actions/workflows/ci.yml/badge.svg)](https://github.com/ianmerrill10/shoeswipermainproject2/actions/workflows/ci.yml)
[![Production Deployment](https://github.com/ianmerrill10/shoeswipermainproject2/actions/workflows/production.yml/badge.svg)](https://github.com/ianmerrill10/shoeswipermainproject2/actions/workflows/production.yml)
[![Security Scanning](https://github.com/ianmerrill10/shoeswipermainproject2/actions/workflows/security.yml/badge.svg)](https://github.com/ianmerrill10/shoeswipermainproject2/actions/workflows/security.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**TikTok-style sneaker discovery marketplace with AI outfit matching and NFT authenticity.**

![ShoeSwiper](https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=400&fit=crop)

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [Testing](#-testing)
- [Building for Production](#-building-for-production)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### Core Features
- **📱 TikTok-Style Feed** - Swipe through sneakers with full-screen cards and smooth animations
- **🔍 Smart Search** - Full-text search with filters (brand, price, style, gender)
- **🤖 AI Outfit Match** - Upload an outfit photo and get AI-powered sneaker recommendations using Gemini Vision
- **💎 NFT Marketplace** - Mint sneaker authenticity NFTs with rarity tiers (Common, Rare, Legendary, Grail)
- **👤 User Profiles** - Favorites, closet management, and activity tracking
- **🛡️ Admin Dashboard** - Product management, user oversight, analytics
- **🔔 Push Notifications** - Price drop alerts and new release notifications
- **📧 Email Capture** - Newsletter subscriptions with preference management
- **🎵 Music Integration** - Spotify, Apple Music, and Amazon Music links per sneaker
- **📊 Blog System** - Content marketing with multiple blog types
- **👥 Referral Program** - Share and earn rewards

### Monetization
- **Amazon Affiliate Integration** - All product links include `?tag=shoeswiper-20`
- **Click Tracking** - Analytics for affiliate performance
- **Price Alerts** - Users can set target prices for sneakers

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion |
| **State Management** | Zustand, React Query (@tanstack/react-query) |
| **Backend** | Supabase (Auth, Database, Storage, Edge Functions) |
| **AI** | Google Gemini Vision API |
| **Build Tool** | Vite |
| **Testing** | Vitest, React Testing Library |
| **Linting** | ESLint with TypeScript support |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0 (check with `node --version`)
- **npm** >= 9.0.0 (comes with Node.js)
- **Git** for version control

We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions:

```bash
# Install the correct Node.js version
nvm install 20
nvm use 20
```

Or using the project's `.nvmrc` file:

```bash
nvm use
```

## 📦 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ianmerrill10/shoeswipermainproject2.git
cd shoeswipermainproject2
```

### 2. Install Dependencies

Navigate to the main application directory and install:

```bash
cd shoeswiper-complete
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Setup](#-environment-setup) below).

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔧 Environment Setup

### Client-Side Variables (Safe for Browser)

These variables are prefixed with `VITE_` and are exposed to the browser:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe Public Key (for payments)
VITE_STRIPE_PUBLIC_KEY=pk_test_your-stripe-public-key

# Optional Feature Flags
VITE_DEMO_MODE=true
VITE_SHOW_PRICES=false
```

### Server-Side Variables (Never Expose to Client)

These should ONLY be used in Edge Functions or backend services:

```env
# Supabase Service Key (full admin access)
SUPABASE_SERVICE_KEY=your-service-key

# Stripe Secret Keys
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Google Gemini API (for AI outfit analysis)
GEMINI_API_KEY=your-gemini-api-key

# JWT Secret
JWT_SECRET=your-jwt-secret-at-least-32-characters
```

> ⚠️ **Security Warning**: Never prefix server-side secrets with `VITE_` as they will be exposed to the browser.

## 💾 Database Setup

### Using Supabase

1. Create a new project at [supabase.com](https://supabase.com)

2. Run the schema migrations in your Supabase SQL Editor (in order):
   ```sql
   -- 1. Run database/001_schema.sql first
   -- 2. Run database/002_seed_data.sql for sample data
   ```

3. Create a storage bucket for NFT proofs:
   - Go to Supabase Dashboard → Storage
   - Create bucket: `nft-proofs` (private)

### Setting Up Edge Functions

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set the Gemini API key secret
supabase secrets set GEMINI_API_KEY=your-gemini-api-key

# Deploy the outfit analysis function
supabase functions deploy analyze-outfit
```

## 🖥️ Development

### Available Scripts

All commands should be run from the `shoeswiper-complete/` directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run test` | Run tests in watch mode |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run test:coverage` | Run tests with coverage report |

### Demo Mode

By default, the application runs in **Demo Mode** (`DEMO_MODE = true` in `src/lib/config.ts`). This allows you to test the app without setting up Supabase:

- Authentication is bypassed
- Mock data is used for sneakers
- Data is stored in localStorage

To enable production mode with Supabase:
1. Set up your Supabase project
2. Configure environment variables
3. Set `DEMO_MODE = false` in `src/lib/config.ts`

## 🧪 Testing

### Running Tests

```bash
# Run tests once (CI mode)
npm test -- --run

# Run tests in watch mode (development)
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

Tests are located in:
- `src/__tests__/` - General tests
- `src/hooks/__tests__/` - Hook tests
- `src/hooks/tests/` - Additional hook tests

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Preview the build locally
npm run preview
```

The build output will be in the `dist/` directory.

## 📁 Project Structure

```
shoeswipermainproject2/
├── .nvmrc                      # Node.js version (20)
├── .env.example                # Environment variables template
├── README.md                   # This file
├── SECURITY.md                 # Security policy
├── CONTRIBUTING.md             # Contribution guidelines
├── docs/                       # Documentation
│   ├── API.md                  # API documentation
│   ├── ARCHITECTURE.md         # System architecture
│   └── DEPLOYMENT.md           # Deployment guide
├── database/                   # SQL migrations
│   ├── 001_schema.sql
│   └── 002_seed_data.sql
├── supabase/
│   └── functions/              # Supabase Edge Functions
│       └── analyze-outfit/
└── shoeswiper-complete/        # Main application
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── public/                 # Static assets
    └── src/
        ├── main.tsx            # Entry point
        ├── App.tsx             # Main router
        ├── index.css           # Global styles
        ├── components/         # React components
        │   ├── admin/          # Admin dashboard
        │   ├── blog/           # Blog components
        │   ├── check-fit/      # AI outfit match
        │   ├── nft/            # NFT marketplace
        │   └── onboarding/     # User onboarding
        ├── hooks/              # Custom React hooks
        ├── pages/              # Page components
        ├── stores/             # Zustand stores
        └── lib/                # Utilities & types
            ├── config.ts       # App configuration
            ├── types.ts        # TypeScript types
            └── supabaseClient.ts
```

## ⚙️ Configuration

Key configuration values in `src/lib/config.ts`:

```typescript
DEMO_MODE = true          // Toggle demo vs production mode
AFFILIATE_TAG = 'shoeswiper-20'  // Amazon affiliate tag
SHOW_PRICES = false       // Enable when Amazon PA-API is connected
ADMIN_EMAIL = 'dadsellsgadgets@gmail.com'
ALLOWED_EMAILS = ['ianmerrill10@gmail.com', ADMIN_EMAIL]
```

### Admin Access

Only users with emails in `ALLOWED_EMAILS` can access the application in production mode. The admin dashboard is restricted to `ADMIN_EMAIL`.

## 📚 Documentation

- [API Documentation](docs/API.md) - Hooks and component documentation
- [Architecture Overview](docs/ARCHITECTURE.md) - System design and data flow
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [Agent Orchestration](docs/AGENT-ORCHESTRATION.md) - AI agent automation system
- [Security Policy](SECURITY.md) - Security practices and vulnerability reporting
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of conduct
- Development workflow
- Coding standards
- Pull request process

Quick start for contributors:

```bash
# Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/shoeswipermainproject2.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m 'feat: add amazing feature'

# Push and create a Pull Request
git push origin feature/amazing-feature
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by [@dadsellsgadgets](https://github.com/dadsellsgadgets)**

*Affiliate Disclosure: ShoeSwiper earns commission from qualifying Amazon purchases.*
