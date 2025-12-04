# Social Syndication Edge Function

This document contains the Edge Function code for automated social media syndication.

## Deployment Instructions

1. Create the function directory:
```bash
mkdir -p shoeswiper-complete/supabase/functions/social-syndication
```

2. Create the `index.ts` file in that directory with the code below

3. Create `deno.json` in the same directory:
```json
{
  "compilerOptions": {
    "allowJs": true,
    "lib": ["deno.window"],
    "strict": true
  }
}
```

4. Set the required secrets:
```bash
supabase secrets set TWITTER_API_KEY=your-key
supabase secrets set TWITTER_API_SECRET=your-secret
supabase secrets set TWITTER_ACCESS_TOKEN=your-token
supabase secrets set TWITTER_ACCESS_SECRET=your-secret
supabase secrets set META_ACCESS_TOKEN=your-token
supabase secrets set FACEBOOK_PAGE_ID=your-page-id
supabase secrets set INSTAGRAM_BUSINESS_ACCOUNT_ID=your-account-id
supabase secrets set TIKTOK_ACCESS_TOKEN=your-token
```

5. Deploy the function:
```bash
supabase functions deploy social-syndication
```

## Edge Function Code (index.ts)

```typescript
// Supabase Edge Function: supabase/functions/social-syndication/index.ts
// Deploy with: supabase functions deploy social-syndication

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// ============================================
// TYPES
// ============================================

type SocialPlatform = "twitter" | "instagram" | "tiktok" | "facebook";
type PostStatus = "draft" | "scheduled" | "processing" | "posted" | "failed";
type ContentType = "product" | "blog" | "promotion" | "engagement" | "user_generated";

interface SocialPostContent {
  text: string;
  hashtags: string[];
  mediaUrls: string[];
  linkUrl?: string;
  callToAction?: string;
  mentions?: string[];
}

interface ScheduledPost {
  id: string;
  platform: SocialPlatform;
  content: SocialPostContent;
  contentType: ContentType;
  scheduledAt: string;
  status: PostStatus;
  sourceType: "product" | "blog" | "manual";
  sourceId?: string;
  createdAt: string;
  updatedAt: string;
  postedAt?: string;
  errorMessage?: string;
  retryCount: number;
  externalPostId?: string;
}

interface QueueOptions {
  platform?: SocialPlatform;
  status?: PostStatus;
  contentType?: ContentType;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

interface SyndicationRequest {
  action: "schedule" | "post" | "cancel" | "retry" | "get_queue" | "get_analytics" | "process_queue";
  platform?: SocialPlatform;
  postId?: string;
  content?: SocialPostContent;
  scheduledAt?: string;
  contentType?: ContentType;
  sourceType?: "product" | "blog" | "manual";
  sourceId?: string;
  queueOptions?: QueueOptions;
}

interface RateLimitConfig {
  platform: SocialPlatform;
  requestsPerHour: number;
  requestsPerDay: number;
}

// Rate limits per platform (conservative estimates)
const RATE_LIMITS: Record<SocialPlatform, RateLimitConfig> = {
  twitter: { platform: "twitter", requestsPerHour: 50, requestsPerDay: 500 },
  instagram: { platform: "instagram", requestsPerHour: 25, requestsPerDay: 200 },
  tiktok: { platform: "tiktok", requestsPerHour: 30, requestsPerDay: 300 },
  facebook: { platform: "facebook", requestsPerHour: 40, requestsPerDay: 400 },
};

// ============================================
// SUPABASE CLIENT
// ============================================

const getSupabaseClient = (authHeader?: string) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
};

// ============================================
// PLATFORM API HANDLERS
// ============================================

/**
 * Post to Twitter/X using API v2
 */
async function postToTwitter(content: SocialPostContent): Promise<{ success: boolean; postId?: string; error?: string }> {
  const apiKey = Deno.env.get("TWITTER_API_KEY");
  const apiSecret = Deno.env.get("TWITTER_API_SECRET");
  const accessToken = Deno.env.get("TWITTER_ACCESS_TOKEN");
  const accessSecret = Deno.env.get("TWITTER_ACCESS_SECRET");

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return { success: false, error: "Twitter API credentials not configured" };
  }

  try {
    // For actual implementation, use OAuth 1.0a signing
    const tweetText = content.text;
    
    // Twitter API v2 endpoint
    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text: tweetText }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.detail || `Twitter API error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, postId: data.data?.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Post to Facebook using Graph API
 */
async function postToFacebook(content: SocialPostContent): Promise<{ success: boolean; postId?: string; error?: string }> {
  const accessToken = Deno.env.get("META_ACCESS_TOKEN");
  const pageId = Deno.env.get("FACEBOOK_PAGE_ID");

  if (!accessToken || !pageId) {
    return { success: false, error: "Facebook API credentials not configured" };
  }

  try {
    const message = content.text;
    const link = content.linkUrl;

    const params = new URLSearchParams({
      message,
      access_token: accessToken,
    });

    if (link) {
      params.append("link", link);
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: "POST",
        body: params,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error?.message || `Facebook API error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, postId: data.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Post to Instagram using Graph API (requires Business account)
 */
async function postToInstagram(content: SocialPostContent): Promise<{ success: boolean; postId?: string; error?: string }> {
  const accessToken = Deno.env.get("META_ACCESS_TOKEN");
  const instagramAccountId = Deno.env.get("INSTAGRAM_BUSINESS_ACCOUNT_ID");

  if (!accessToken || !instagramAccountId) {
    return { success: false, error: "Instagram API credentials not configured" };
  }

  try {
    // Instagram requires media to be posted
    if (content.mediaUrls.length === 0) {
      return { success: false, error: "Instagram posts require at least one image" };
    }

    const imageUrl = content.mediaUrls[0];
    const caption = content.text;

    // Step 1: Create media container
    const createParams = new URLSearchParams({
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    });

    const createResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
      {
        method: "POST",
        body: createParams,
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      return { success: false, error: errorData.error?.message || `Instagram media creation error` };
    }

    const createData = await createResponse.json();
    const creationId = createData.id;

    // Step 2: Publish the media
    const publishParams = new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    });

    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
      {
        method: "POST",
        body: publishParams,
      }
    );

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      return { success: false, error: errorData.error?.message || `Instagram publish error` };
    }

    const publishData = await publishResponse.json();
    return { success: true, postId: publishData.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Post to TikTok using Content Posting API
 */
async function postToTikTok(content: SocialPostContent): Promise<{ success: boolean; postId?: string; error?: string }> {
  const accessToken = Deno.env.get("TIKTOK_ACCESS_TOKEN");

  if (!accessToken) {
    return { success: false, error: "TikTok API credentials not configured" };
  }

  // TikTok Content Posting API requires video content
  return { 
    success: false, 
    error: "TikTok posting requires video content and is handled separately" 
  };
}

/**
 * Route post to appropriate platform handler
 */
async function postToPlatform(
  platform: SocialPlatform,
  content: SocialPostContent
): Promise<{ success: boolean; postId?: string; error?: string }> {
  switch (platform) {
    case "twitter":
      return postToTwitter(content);
    case "facebook":
      return postToFacebook(content);
    case "instagram":
      return postToInstagram(content);
    case "tiktok":
      return postToTikTok(content);
    default:
      return { success: false, error: `Unknown platform: ${platform}` };
  }
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Save a scheduled post to the database
 */
async function saveScheduledPost(
  supabase: ReturnType<typeof createClient>,
  post: Omit<ScheduledPost, "id" | "createdAt" | "updatedAt" | "retryCount">
): Promise<{ success: boolean; postId?: string; error?: string }> {
  const { data, error } = await supabase
    .from("social_syndication_queue")
    .insert({
      platform: post.platform,
      content: post.content,
      content_type: post.contentType,
      scheduled_at: post.scheduledAt,
      status: post.status,
      source_type: post.sourceType,
      source_id: post.sourceId,
      retry_count: 0,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error saving scheduled post:", error);
    return { success: false, error: error.message };
  }

  return { success: true, postId: data.id };
}

/**
 * Update a post's status
 */
async function updatePostStatus(
  supabase: ReturnType<typeof createClient>,
  postId: string,
  status: PostStatus,
  additionalFields?: Partial<ScheduledPost>
): Promise<{ success: boolean; error?: string }> {
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
    ...additionalFields,
  };

  const { error } = await supabase
    .from("social_syndication_queue")
    .update(updateData)
    .eq("id", postId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get posts from the queue
 */
async function getQueuedPosts(
  supabase: ReturnType<typeof createClient>,
  options: QueueOptions
): Promise<{ posts: ScheduledPost[]; error?: string }> {
  let query = supabase
    .from("social_syndication_queue")
    .select("*")
    .order("scheduled_at", { ascending: true });

  if (options.platform) {
    query = query.eq("platform", options.platform);
  }
  if (options.status) {
    query = query.eq("status", options.status);
  }
  if (options.contentType) {
    query = query.eq("content_type", options.contentType);
  }
  if (options.fromDate) {
    query = query.gte("scheduled_at", options.fromDate);
  }
  if (options.toDate) {
    query = query.lte("scheduled_at", options.toDate);
  }

  const limit = options.limit || 50;
  const offset = options.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    return { posts: [], error: error.message };
  }

  // Transform snake_case to camelCase
  const posts: ScheduledPost[] = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    platform: row.platform as SocialPlatform,
    content: row.content as SocialPostContent,
    contentType: row.content_type as ContentType,
    scheduledAt: row.scheduled_at as string,
    status: row.status as PostStatus,
    sourceType: row.source_type as "product" | "blog" | "manual",
    sourceId: row.source_id as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    postedAt: row.posted_at as string | undefined,
    errorMessage: row.error_message as string | undefined,
    retryCount: row.retry_count as number,
    externalPostId: row.external_post_id as string | undefined,
  }));

  return { posts };
}

/**
 * Get posts that are due to be published
 */
async function getDuePosts(
  supabase: ReturnType<typeof createClient>
): Promise<{ posts: ScheduledPost[]; error?: string }> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("social_syndication_queue")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(10);

  if (error) {
    return { posts: [], error: error.message };
  }

  const posts: ScheduledPost[] = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    platform: row.platform as SocialPlatform,
    content: row.content as SocialPostContent,
    contentType: row.content_type as ContentType,
    scheduledAt: row.scheduled_at as string,
    status: row.status as PostStatus,
    sourceType: row.source_type as "product" | "blog" | "manual",
    sourceId: row.source_id as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    postedAt: row.posted_at as string | undefined,
    errorMessage: row.error_message as string | undefined,
    retryCount: row.retry_count as number,
    externalPostId: row.external_post_id as string | undefined,
  }));

  return { posts };
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request
    let body: SyndicationRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate action
    const validActions = ["schedule", "post", "cancel", "retry", "get_queue", "get_analytics", "process_queue"];
    if (!body.action || !validActions.includes(body.action)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid or missing action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const supabase = getSupabaseClient(authHeader || undefined);

    // Handle different actions
    switch (body.action) {
      case "schedule": {
        if (!body.platform || !body.content || !body.scheduledAt) {
          return new Response(
            JSON.stringify({ success: false, message: "Missing required fields: platform, content, scheduledAt" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const result = await saveScheduledPost(supabase, {
          platform: body.platform,
          content: body.content,
          contentType: body.contentType || "product",
          scheduledAt: body.scheduledAt,
          status: "scheduled",
          sourceType: body.sourceType || "manual",
          sourceId: body.sourceId,
        });

        return new Response(
          JSON.stringify({
            success: result.success,
            message: result.success ? "Post scheduled successfully" : result.error,
            data: result.success ? { postId: result.postId, scheduledAt: body.scheduledAt } : undefined,
            error: result.error,
          }),
          { status: result.success ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "post": {
        if (!body.platform || !body.content) {
          return new Response(
            JSON.stringify({ success: false, message: "Missing required fields: platform, content" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const result = await postToPlatform(body.platform, body.content);
        
        await supabase.from("social_syndication_log").insert({
          platform: body.platform,
          content_type: body.contentType || "product",
          success: result.success,
          external_post_id: result.postId,
          error_message: result.error,
        });

        return new Response(
          JSON.stringify({
            success: result.success,
            message: result.success ? "Post published successfully" : result.error,
            data: result.success ? { postId: result.postId } : undefined,
            error: result.error,
          }),
          { status: result.success ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancel": {
        if (!body.postId) {
          return new Response(
            JSON.stringify({ success: false, message: "Missing required field: postId" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const result = await updatePostStatus(supabase, body.postId, "failed", {
          errorMessage: "Cancelled by user",
        });

        return new Response(
          JSON.stringify({
            success: result.success,
            message: result.success ? "Post cancelled" : result.error,
            error: result.error,
          }),
          { status: result.success ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "retry": {
        if (!body.postId) {
          return new Response(
            JSON.stringify({ success: false, message: "Missing required field: postId" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: post } = await supabase
          .from("social_syndication_queue")
          .select("*")
          .eq("id", body.postId)
          .single();

        if (!post) {
          return new Response(
            JSON.stringify({ success: false, message: "Post not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const result = await updatePostStatus(supabase, body.postId, "scheduled", {
          retryCount: (post.retry_count || 0) + 1,
          errorMessage: undefined,
        });

        return new Response(
          JSON.stringify({
            success: result.success,
            message: result.success ? "Post rescheduled for retry" : result.error,
            error: result.error,
          }),
          { status: result.success ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_queue": {
        const result = await getQueuedPosts(supabase, body.queueOptions || {});

        return new Response(
          JSON.stringify({
            success: !result.error,
            message: result.error ? result.error : "Queue fetched",
            data: { queue: result.posts },
            error: result.error,
          }),
          { status: result.error ? 500 : 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_analytics": {
        if (!body.postId) {
          return new Response(
            JSON.stringify({ success: false, message: "Missing required field: postId" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: post } = await supabase
          .from("social_syndication_queue")
          .select("analytics")
          .eq("id", body.postId)
          .single();

        return new Response(
          JSON.stringify({
            success: true,
            message: "Analytics fetched",
            data: {
              analytics: post?.analytics || {
                impressions: 0,
                engagements: 0,
                clicks: 0,
                shares: 0,
                saves: 0,
                comments: 0,
                likes: 0,
                reach: 0,
                updatedAt: new Date().toISOString(),
              },
            },
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "process_queue": {
        const { posts, error: fetchError } = await getDuePosts(supabase);

        if (fetchError) {
          return new Response(
            JSON.stringify({ success: false, message: fetchError }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const results = [];
        for (const post of posts) {
          await updatePostStatus(supabase, post.id, "processing");

          const result = await postToPlatform(post.platform, post.content);

          if (result.success) {
            await updatePostStatus(supabase, post.id, "posted", {
              postedAt: new Date().toISOString(),
              externalPostId: result.postId,
            });
          } else {
            const newRetryCount = post.retryCount + 1;
            const maxRetries = 3;
            
            await updatePostStatus(supabase, post.id, newRetryCount >= maxRetries ? "failed" : "scheduled", {
              errorMessage: result.error,
              retryCount: newRetryCount,
              scheduledAt: newRetryCount < maxRetries 
                ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
                : undefined,
            });
          }

          results.push({
            postId: post.id,
            platform: post.platform,
            success: result.success,
            error: result.error,
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Processed ${posts.length} posts`,
            data: { results },
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, message: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Social syndication error:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

## Setting Up a Cron Job for Queue Processing

To automatically process scheduled posts, set up a cron job in Supabase:

1. Go to Supabase Dashboard → Database → Extensions
2. Enable `pg_cron` extension
3. Create a cron job:

```sql
SELECT cron.schedule(
  'process-social-syndication-queue',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/social-syndication',
    body := '{"action": "process_queue"}'::jsonb,
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

Note: Replace `your-project` and `YOUR_SERVICE_ROLE_KEY` with your actual values.

## API Reference

### Actions

| Action | Description | Required Fields |
|--------|-------------|-----------------|
| `schedule` | Schedule a post for later | platform, content, scheduledAt |
| `post` | Post immediately | platform, content |
| `cancel` | Cancel a scheduled post | postId |
| `retry` | Retry a failed post | postId |
| `get_queue` | Get posts from queue | queueOptions (optional) |
| `get_analytics` | Get post analytics | postId |
| `process_queue` | Process due posts | none |

### Example Request

```json
{
  "action": "schedule",
  "platform": "twitter",
  "content": {
    "text": "Check out these new kicks! 🔥 #ShoeSwiper #Sneakers",
    "hashtags": ["ShoeSwiper", "Sneakers"],
    "mediaUrls": ["https://example.com/image.jpg"]
  },
  "scheduledAt": "2024-01-15T12:00:00Z",
  "contentType": "product",
  "sourceType": "product",
  "sourceId": "product-uuid"
}
```
