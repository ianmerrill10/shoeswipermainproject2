// ============================================
// GENERATE 3D MODEL EDGE FUNCTION
// Uses Meshy AI API to generate 3D models from images
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ============================================
// TYPES
// ============================================

interface GenerateRequest {
  image_url: string;
  shoe_id: string;
  shoe_name: string;
}

interface MeshyTaskResponse {
  result: string;
  task_id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  model_url?: string;
  thumbnail_url?: string;
  progress?: number;
}

interface GenerateResponse {
  success: boolean;
  task_id?: string;
  status?: string;
  model_url?: string;
  error?: string;
}

// ============================================
// MESHY AI API INTEGRATION
// https://docs.meshy.ai/
// ============================================

const MESHY_API_URL = 'https://api.meshy.ai/v1';

async function createMeshyTask(imageUrl: string, shoeName: string): Promise<MeshyTaskResponse> {
  const meshyApiKey = Deno.env.get('MESHY_API_KEY');

  if (!meshyApiKey) {
    throw new Error('MESHY_API_KEY not configured');
  }

  const response = await fetch(`${MESHY_API_URL}/image-to-3d`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${meshyApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      enable_pbr: true, // Enable physically-based rendering materials
      topology: 'quad', // Better for shoe models
      target_polycount: 30000, // Good balance of detail and performance
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meshy API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function getMeshyTaskStatus(taskId: string): Promise<MeshyTaskResponse> {
  const meshyApiKey = Deno.env.get('MESHY_API_KEY');

  if (!meshyApiKey) {
    throw new Error('MESHY_API_KEY not configured');
  }

  const response = await fetch(`${MESHY_API_URL}/image-to-3d/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${meshyApiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meshy API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// ============================================
// ALTERNATIVE: LUMA AI INTEGRATION
// https://lumalabs.ai/
// ============================================

async function createLumaTask(imageUrl: string): Promise<{ task_id: string }> {
  const lumaApiKey = Deno.env.get('LUMA_API_KEY');

  if (!lumaApiKey) {
    throw new Error('LUMA_API_KEY not configured');
  }

  const response = await fetch('https://api.lumalabs.ai/api/v2/capture', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lumaApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      output_format: 'glb',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Luma API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// ============================================
// RATE LIMITING
// ============================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimit.count++;
  return true;
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get user ID from auth header for rate limiting
    const authHeader = req.headers.get('Authorization');
    const userId = authHeader?.split(' ')[1] || req.headers.get('x-forwarded-for') || 'anonymous';

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please wait before generating another model.',
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body: GenerateRequest = await req.json();
    const { image_url, shoe_id, shoe_name } = body;

    if (!image_url) {
      return new Response(
        JSON.stringify({ success: false, error: 'image_url is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check which API is configured
    const meshyKey = Deno.env.get('MESHY_API_KEY');
    const lumaKey = Deno.env.get('LUMA_API_KEY');

    if (!meshyKey && !lumaKey) {
      // Return mock response for demo mode
      console.log('No 3D API configured, returning demo response');
      return new Response(
        JSON.stringify({
          success: true,
          task_id: `demo_${Date.now()}`,
          status: 'DEMO_MODE',
          message: 'No 3D API configured. Add MESHY_API_KEY or LUMA_API_KEY to enable AI 3D generation.',
          demo_model_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Meshy by default, fall back to Luma
    let taskResponse: MeshyTaskResponse;

    if (meshyKey) {
      console.log(`Creating Meshy 3D task for shoe: ${shoe_name}`);
      taskResponse = await createMeshyTask(image_url, shoe_name);
    } else {
      console.log(`Creating Luma 3D task for shoe: ${shoe_name}`);
      const lumaResponse = await createLumaTask(image_url);
      taskResponse = {
        result: 'created',
        task_id: lumaResponse.task_id,
        status: 'PENDING',
      };
    }

    const response: GenerateResponse = {
      success: true,
      task_id: taskResponse.task_id,
      status: taskResponse.status,
      model_url: taskResponse.model_url,
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('3D generation error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
