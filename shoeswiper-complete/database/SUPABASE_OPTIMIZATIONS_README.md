# Supabase Optimizations Guide

This document describes the database optimizations implemented in migration `005_supabase_optimizations.sql`.

## Table of Contents

1. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
2. [Database Indexes](#database-indexes)
3. [Connection Pooling](#connection-pooling)
4. [Cursor-Based Pagination](#cursor-based-pagination)
5. [Analytics Triggers](#analytics-triggers)
6. [Stored Procedures](#stored-procedures)
7. [Usage Examples](#usage-examples)

---

## Row Level Security (RLS) Policies

All tables have RLS enabled with appropriate policies:

### Core Tables
- **profiles**: Users can view all profiles, but only update their own
- **shoes**: Public can view active shoes; admin-only for insert/update/delete
- **favorites**: Users can only view/manage their own favorites
- **user_sneakers**: Users can only view/manage their own closet

### Additional Policies Added
- **categories**: Public read access, admin-only management
- **price_history**: Public read, admin-only insert

### Admin Bypass
The `is_admin()` function checks if the user's email matches `dadsellsgadgets@gmail.com`.

---

## Database Indexes

### Pagination Indexes
```sql
-- For cursor-based pagination on created_at
idx_shoes_pagination_cursor ON shoes (created_at DESC, id DESC) WHERE is_active = true

-- For trending shoes pagination
idx_shoes_pagination_trending ON shoes (view_count DESC, created_at DESC, id DESC) WHERE is_active = true

-- For popular shoes pagination
idx_shoes_pagination_popular ON shoes (favorite_count DESC, created_at DESC, id DESC) WHERE is_active = true
```

### Filtering Indexes
```sql
-- Active shoe filters
idx_shoes_active_brand ON shoes (brand) WHERE is_active = true
idx_shoes_active_gender ON shoes (gender) WHERE is_active = true
idx_shoes_active_category ON shoes (category_slug) WHERE is_active = true
idx_shoes_active_price_range ON shoes (price) WHERE is_active = true
```

### Compound Indexes for Common Queries
```sql
-- Brand + pagination
idx_shoes_brand_pagination ON shoes (brand, created_at DESC, id DESC) WHERE is_active = true

-- Gender + pagination
idx_shoes_gender_pagination ON shoes (gender, created_at DESC, id DESC) WHERE is_active = true
```

---

## Connection Pooling

Connection pooling is configured at the Supabase infrastructure level using PgBouncer.

### Recommended Configuration (Supabase Dashboard)

1. Navigate to **Database → Connection Pooling** in your Supabase dashboard
2. Configure:
   - **Pool Mode**: Transaction (recommended for serverless)
   - **Pool Size**: 15 (adjust based on your plan)
   - **Statement Timeout**: 30s

### Application Connection String Parameters

```
?connection_limit=5&pool_timeout=30
```

### TypeScript Configuration

In `src/lib/supabaseClient.ts`, the client is already configured with optimal settings.

---

## Cursor-Based Pagination

Cursor-based pagination is more efficient than offset-based pagination for large datasets.

### Available Functions

#### `get_shoes_paginated`
Paginated shoe listing with full filtering support.

```sql
SELECT * FROM get_shoes_paginated(
    p_limit := 20,
    p_cursor_created_at := NULL,
    p_cursor_id := NULL,
    p_brand := 'Nike',
    p_gender := 'unisex',
    p_min_price := 50,
    p_max_price := 200
);
```

#### `get_trending_shoes_paginated`
Paginated trending shoes ordered by view count.

```sql
SELECT * FROM get_trending_shoes_paginated(
    p_limit := 20,
    p_cursor_view_count := NULL,
    p_cursor_created_at := NULL,
    p_cursor_id := NULL
);
```

#### `get_popular_shoes_paginated`
Paginated popular shoes ordered by favorite count.

### TypeScript Usage

```typescript
import { fetchShoesPaginated } from './lib/databaseUtils';

// First page
const result = await fetchShoesPaginated({
  limit: 20,
  brand: 'Nike',
  gender: 'unisex'
});

// Next page using cursor
const nextResult = await fetchShoesPaginated({
  limit: 20,
  cursor: result.nextCursor,
  brand: 'Nike',
  gender: 'unisex'
});
```

---

## Analytics Triggers

### Automatic Event Logging

| Event | Trigger | Logged Data |
|-------|---------|-------------|
| View milestone | When view_count reaches 100, 500, 1000, 5000, 10000 | shoe_id, milestone |
| Favorite added | When favorite is created | shoe_id, user_id, shoe details |
| Affiliate click | When affiliate click is logged | shoe_id, user_id, price |
| Closet addition | When shoe added to closet | shoe_id, user_id, shoe details |

### Automatic Count Updates

- **favorite_count**: Automatically updated when favorites are added/removed
- **updated_at**: Automatically updated on profile and shoe changes

---

## Stored Procedures

### User Actions

#### `toggle_favorite(user_id, shoe_id)`
Atomically toggle favorite status.

```typescript
const result = await toggleFavorite(userId, shoeId);
// { action: 'added', isFavorited: true, newFavoriteCount: 42 }
```

#### `add_to_closet(user_id, shoe_id)`
Add shoe to closet with validation.

```typescript
const result = await addToCloset(userId, shoeId);
// { success: true, message: 'Added to closet', closetCount: 15 }
```

#### `track_shoe_engagement(shoe_id, user_id, engagement_type)`
Track view or click engagement.

```typescript
await trackShoeEngagement(shoeId, 'view', userId);
await trackShoeEngagement(shoeId, 'click', userId);
```

### Dashboard & Analytics

#### `get_user_dashboard(user_id)`
Get aggregated user dashboard data.

```typescript
const dashboard = await getUserDashboard(userId);
// {
//   favoritesCount: 10,
//   closetCount: 5,
//   recentFavorites: [...],
//   recentCloset: [...],
//   priceAlertsCount: 3
// }
```

#### `get_analytics_summary(days)`
Get admin analytics summary (admin only).

### Search

#### `search_shoes_ranked(query, limit, offset, ...filters)`
Full-text search with relevance ranking.

```typescript
const { results, totalCount } = await searchShoesRanked('air jordan', {
  limit: 20,
  brand: 'Jordan'
});
```

#### `get_similar_shoes(shoe_id, limit)`
Get similar shoes based on style/color tags.

```typescript
const similar = await getSimilarShoes(shoeId, 5);
```

### Price Management

#### `create_price_alert(user_id, shoe_id, target_price)`
Create or update a price alert with validation.

#### `batch_update_prices(price_updates)`
Batch update prices from Amazon API (admin only).

### Maintenance

#### `cleanup_old_analytics(days_to_keep)`
Clean up old analytics data (admin only).

---

## Usage Examples

### Infinite Scroll Feed

```typescript
import { fetchShoesPaginated, PaginationCursor } from './lib/databaseUtils';

function useShoeFeed() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [cursor, setCursor] = useState<PaginationCursor | undefined>();
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    const result = await fetchShoesPaginated({
      limit: 20,
      cursor,
    });

    setShoes(prev => [...prev, ...result.shoes]);
    setCursor(result.nextCursor);
    setHasMore(result.hasMore);
  };

  return { shoes, loadMore, hasMore };
}
```

### Similar Products Section

```typescript
import { getSimilarShoes } from './lib/databaseUtils';

function SimilarProducts({ shoeId }: { shoeId: string }) {
  const [similar, setSimilar] = useState<SimilarShoe[]>([]);

  useEffect(() => {
    getSimilarShoes(shoeId, 4).then(setSimilar);
  }, [shoeId]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {similar.map(shoe => (
        <ProductCard key={shoe.id} {...shoe} />
      ))}
    </div>
  );
}
```

---

## Performance Considerations

1. **Always use pagination** for listing queries
2. **Use indexed columns** in WHERE clauses
3. **Avoid SELECT *** when you only need specific columns
4. **Monitor slow queries** in Supabase dashboard
5. **Consider materialized views** for complex aggregations

---

## Security Notes

1. All RLS policies are enforced at the database level
2. Admin functions check `is_admin()` before execution
3. User-specific data is always filtered by `auth.uid()`
4. No sensitive data is logged in analytics events
