# ShoeSwiper Architecture

This document provides a comprehensive overview of the ShoeSwiper system architecture, including frontend and backend components, data flow, and integration patterns.

## Table of Contents

- [System Overview](#system-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Component Hierarchy](#component-hierarchy)
- [State Management](#state-management)
- [API Integration Patterns](#api-integration-patterns)
- [Security Architecture](#security-architecture)

---

## System Overview

ShoeSwiper is a TikTok-style sneaker discovery marketplace built with a modern React frontend and Supabase backend-as-a-service.

```mermaid
graph TB
    subgraph "Client Layer"
        A[React 18 App]
        B[Tailwind CSS]
        C[Framer Motion]
    end
    
    subgraph "State Layer"
        D[React Query]
        E[Zustand Stores]
        F[Local Storage]
    end
    
    subgraph "Backend Layer"
        G[Supabase Auth]
        H[Supabase Database]
        I[Supabase Storage]
        J[Edge Functions]
    end
    
    subgraph "External Services"
        K[Google Gemini AI]
        L[Amazon Associates]
        M[Stripe Connect]
    end
    
    A --> D
    A --> E
    A --> F
    D --> G
    D --> H
    I --> A
    J --> K
    A --> L
    A --> M
```

### Key Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | UI components and interactivity |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Animation | Framer Motion | Smooth animations and gestures |
| Data Fetching | React Query | Server state management and caching |
| Global State | Zustand | Client state management |
| Backend | Supabase | Auth, Database, Storage, Edge Functions |
| AI | Google Gemini | Outfit analysis and recommendations |
| Payments | Stripe Connect | Marketplace payments |
| Affiliate | Amazon Associates | Product monetization |

---

## Frontend Architecture

### Application Structure

```mermaid
graph LR
    subgraph "Entry Point"
        A[main.tsx]
    end
    
    subgraph "Root Components"
        B[App.tsx]
        C[Router]
    end
    
    subgraph "Pages"
        D[FeedPage]
        E[SearchPage]
        F[ProfilePage]
        G[CheckMyFit]
        H[AdminDashboard]
    end
    
    subgraph "Shared Components"
        I[BottomNavigation]
        J[SneakerCard]
        K[EmailCaptureModal]
        L[NotificationsPanel]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G
    C --> H
    D --> I
    D --> J
    E --> J
```

### Component Categories

```
src/components/
├── admin/              # Admin dashboard components
│   └── AdminLayout.tsx
├── blog/               # Blog system components
├── check-fit/          # AI outfit analysis
├── nft/                # NFT marketplace
│   ├── NFTMarketplace.tsx
│   ├── NFTMintFlow.tsx
│   └── NFTDetailModal.tsx
├── onboarding/         # User onboarding flow
├── BottomNavigation.tsx
├── SneakerCard.tsx
├── ShoePanel.tsx
├── MusicPanel.tsx
├── EmailCaptureModal.tsx
├── NotificationSettings.tsx
├── NotificationsPanel.tsx
├── PriceAlertButton.tsx
├── ReferralCard.tsx
└── OnboardingFlow.tsx
```

### Page Structure

```
src/pages/
├── admin/              # Admin pages
│   ├── ProductsPage.tsx
│   ├── UsersPage.tsx
│   └── AnalyticsPage.tsx
├── AuthPage.tsx        # Login/signup
├── CheckMyFit.tsx      # AI outfit match
├── FeedPage.tsx        # Main swipe feed
├── ProfilePage.tsx     # User profile
├── SearchPage.tsx      # Search & filter
├── NFTMarketplace.tsx  # NFT browsing
└── BlogPage.tsx        # Blog content
```

---

## Backend Architecture

### Supabase Services

```mermaid
graph TB
    subgraph "Supabase Platform"
        A[Auth Service]
        B[PostgreSQL Database]
        C[Storage Buckets]
        D[Edge Functions]
        E[Realtime]
    end
    
    subgraph "Database Tables"
        F[profiles]
        G[shoes]
        H[nfts]
        I[favorites]
        J[affiliate_clicks]
        K[price_alerts]
    end
    
    subgraph "Storage"
        L[nft-proofs bucket]
        M[avatars bucket]
    end
    
    subgraph "Edge Functions"
        N[analyze-outfit]
        O[check-prices]
    end
    
    A --> F
    B --> F
    B --> G
    B --> H
    B --> I
    B --> J
    B --> K
    C --> L
    C --> M
    D --> N
    D --> O
    N --> P[Gemini AI]
```

### Database Schema

```mermaid
erDiagram
    profiles ||--o{ user_sneakers : has
    profiles ||--o{ nfts : owns
    profiles ||--o{ favorites : has
    profiles ||--o{ price_alerts : sets
    
    shoes ||--o{ user_sneakers : contains
    shoes ||--o{ nfts : has
    shoes ||--o{ favorites : in
    shoes ||--o{ affiliate_clicks : tracks
    shoes ||--o{ price_alerts : monitors
    
    nfts ||--o{ nft_ownership_history : records
    
    brands ||--o{ shoes : has
    
    profiles {
        uuid id PK
        string email
        string username
        string avatar_url
        boolean is_banned
        timestamp created_at
    }
    
    shoes {
        uuid id PK
        string name
        string brand
        decimal price
        string image_url
        string amazon_url
        string amazon_asin
        array style_tags
        array color_tags
        integer favorite_count
        integer view_count
        boolean is_active
        boolean is_featured
    }
    
    nfts {
        uuid id PK
        uuid sneaker_id FK
        uuid owner_id FK
        string token_id
        enum rarity
        boolean for_sale
        decimal price_eth
        timestamp minted_at
    }
    
    favorites {
        uuid id PK
        uuid user_id FK
        uuid shoe_id FK
        timestamp added_at
    }
    
    price_alerts {
        uuid id PK
        uuid user_id FK
        uuid shoe_id FK
        decimal target_price
        boolean triggered
    }
```

### Row Level Security (RLS)

All tables have RLS policies enforcing access control:

```sql
-- Example: Users can only read/write their own data
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Data Flow

### User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant S as Supabase Auth
    participant D as Database
    
    U->>A: Click Login
    A->>S: signInWithGoogle()
    S->>U: OAuth Redirect
    U->>S: Authenticate
    S->>A: Return session
    A->>D: Check ALLOWED_EMAILS
    alt Email Allowed
        A->>U: Show App
    else Email Not Allowed
        A->>U: Show Access Denied
    end
```

### Sneaker Feed Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant RQ as React Query
    participant S as Supabase
    
    U->>A: Open Feed
    A->>RQ: useQuery(['sneakers'])
    RQ->>S: SELECT * FROM shoes
    S->>RQ: Return shoes[]
    RQ->>A: Cached data
    A->>U: Render feed
    
    U->>A: Swipe to next
    A->>S: trackView(shoeId)
    Note over S: Increment view_count
    
    U->>A: Click Buy
    A->>S: trackClick(shoeId)
    A->>U: Open Amazon (with affiliate tag)
```

### AI Outfit Analysis Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant E as Edge Function
    participant G as Gemini AI
    participant D as Database
    
    U->>A: Upload outfit photo
    A->>E: invoke('analyze-outfit', {image})
    E->>G: Analyze image
    G->>E: {styles, colors, rating}
    E->>A: Return analysis
    A->>D: match_shoes_for_outfit(styles, colors)
    D->>A: Return matching shoes
    A->>U: Show recommendations
```

### NFT Minting Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant ST as Storage
    participant D as Database
    
    U->>A: Select shoe & upload proofs
    A->>ST: Upload proof images
    ST->>A: Return URLs
    A->>D: INSERT nfts (sneaker_id, owner_id, rarity)
    D->>D: Generate token_id
    D->>A: Return NFT record
    A->>D: INSERT nft_ownership_history
    A->>U: Show minted NFT
```

---

## Component Hierarchy

### Main Application Structure

```mermaid
graph TB
    subgraph "App Root"
        A[App.tsx]
        B[QueryClientProvider]
        C[Router]
    end
    
    subgraph "Layout Components"
        D[BottomNavigation]
        E[Header]
    end
    
    subgraph "Page Components"
        F[FeedPage]
        G[SearchPage]
        H[ProfilePage]
    end
    
    subgraph "Feature Components"
        I[SneakerCard]
        J[ShoePanel]
        K[MusicPanel]
        L[NFTMarketplace]
    end
    
    subgraph "Utility Components"
        M[EmailCaptureModal]
        N[NotificationsPanel]
        O[PriceAlertButton]
    end
    
    A --> B
    B --> C
    C --> F
    C --> G
    C --> H
    F --> D
    F --> I
    I --> J
    I --> K
    I --> O
    G --> I
    H --> L
```

### SneakerCard Component Tree

```mermaid
graph TB
    A[SneakerCard]
    B[Image Container]
    C[Shoe Info Overlay]
    D[Action Buttons]
    E[ShoePanel]
    F[MusicPanel]
    G[Favorite Button]
    H[Share Button]
    I[Buy Button]
    J[Price Alert Button]
    
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    D --> G
    D --> H
    D --> I
    D --> J
```

---

## State Management

### State Architecture

```mermaid
graph LR
    subgraph "Server State"
        A[React Query Cache]
        B[Sneakers Data]
        C[User Profile]
        D[NFTs]
    end
    
    subgraph "Client State"
        E[Zustand Stores]
        F[UI State]
        G[Cart State]
    end
    
    subgraph "Persistent State"
        H[Local Storage]
        I[Favorites Demo]
        J[Preferences]
        K[Onboarding]
    end
    
    A --> B
    A --> C
    A --> D
    E --> F
    E --> G
    H --> I
    H --> J
    H --> K
```

### React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 30 * 60 * 1000,       // 30 minutes (cache time)
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});
```

### Key Query Keys

```typescript
// Query key structure for caching
const queryKeys = {
  sneakers: ['sneakers'] as const,
  sneaker: (id: string) => ['sneakers', id] as const,
  favorites: (userId: string) => ['favorites', userId] as const,
  nfts: (filter?: string) => ['nfts', filter] as const,
  blog: {
    posts: (type: string, page: number) => ['blog', type, 'posts', page],
    post: (type: string, slug: string) => ['blog', type, 'post', slug],
  },
};
```

### Zustand Store Example

```typescript
// stores/uiStore.ts
import { create } from 'zustand';

interface UIStore {
  isMenuOpen: boolean;
  activePanel: 'shoe' | 'music' | null;
  setMenuOpen: (open: boolean) => void;
  setActivePanel: (panel: 'shoe' | 'music' | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMenuOpen: false,
  activePanel: null,
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  setActivePanel: (panel) => set({ activePanel: panel }),
}));
```

---

## API Integration Patterns

### Supabase Client Setup

```typescript
// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Hook Pattern for Data Fetching

```typescript
// Standardized hook pattern
export const useResource = () => {
  const [data, setData] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (DEMO_MODE) {
      // Return mock data
      setData(MOCK_DATA);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*');
      
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
};
```

### Edge Function Invocation

```typescript
// Calling Supabase Edge Functions
const analyzeOutfit = async (imageBase64: string) => {
  const { data, error } = await supabase.functions.invoke('analyze-outfit', {
    body: { image: imageBase64 }
  });
  
  if (error) throw error;
  return data;
};
```

### Amazon Affiliate URL Handling

```typescript
// Ensure affiliate tag on all Amazon URLs
const formatAmazonUrl = (url: string): string => {
  if (!url.includes('amazon.com')) return url;
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('tag', 'shoeswiper-20');
    return urlObj.toString();
  } catch {
    return url;
  }
};
```

---

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Supabase Auth
    participant D as Database
    
    C->>A: Login Request
    A->>A: Verify Credentials
    A->>C: JWT Token
    C->>D: API Request + JWT
    D->>D: Verify JWT
    D->>D: Apply RLS Policies
    D->>C: Filtered Response
```

### Security Layers

```mermaid
graph TB
    subgraph "Client Security"
        A[HTTPS Only]
        B[No Secrets in Code]
        C[Input Validation]
    end
    
    subgraph "Auth Security"
        D[Supabase Auth]
        E[JWT Tokens]
        F[Email Whitelist]
    end
    
    subgraph "Database Security"
        G[RLS Policies]
        H[Parameterized Queries]
        I[Audit Logging]
    end
    
    subgraph "API Security"
        J[Edge Function Secrets]
        K[Rate Limiting]
        L[CORS Configuration]
    end
    
    A --> D
    B --> D
    C --> G
    D --> E
    E --> G
    F --> D
    G --> H
    H --> I
    J --> K
```

### Environment Variable Security

```
┌─────────────────────────────────────────────────────────┐
│ CLIENT-SIDE (VITE_ prefix)                              │
│ ✓ Safe to expose in browser                             │
│ ─────────────────────────────────────────────────────── │
│ VITE_SUPABASE_URL                                       │
│ VITE_SUPABASE_ANON_KEY                                  │
│ VITE_STRIPE_PUBLIC_KEY                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SERVER-SIDE ONLY (No VITE_ prefix)                      │
│ ✗ Never expose to browser                               │
│ ─────────────────────────────────────────────────────── │
│ SUPABASE_SERVICE_KEY                                    │
│ STRIPE_SECRET_KEY                                       │
│ STRIPE_WEBHOOK_SECRET                                   │
│ GEMINI_API_KEY                                          │
│ JWT_SECRET                                              │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

```mermaid
graph TB
    subgraph "CI/CD Pipeline"
        A[GitHub Repository]
        B[GitHub Actions]
    end
    
    subgraph "Hosting"
        C[Vercel]
        D[CDN Edge]
    end
    
    subgraph "Backend Services"
        E[Supabase Project]
        F[PostgreSQL]
        G[Edge Functions]
        H[Storage]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
```

---

## Performance Considerations

### Optimization Strategies

1. **React Query Caching** - Reduces API calls with configurable stale times
2. **Image Optimization** - Lazy loading with blur placeholders
3. **Code Splitting** - Route-based code splitting with React.lazy()
4. **Bundle Optimization** - Tree shaking and minification via Vite
5. **Edge Functions** - Server-side processing close to users

### Caching Strategy

| Data Type | Cache Duration | Invalidation Trigger |
|-----------|---------------|---------------------|
| Sneakers List | 5 minutes | Manual refresh |
| Single Sneaker | 10 minutes | Edit/update |
| User Favorites | Until mutation | Add/remove |
| Blog Posts | 5 minutes | New publish |
| NFTs | 5 minutes | Mint/transfer |
