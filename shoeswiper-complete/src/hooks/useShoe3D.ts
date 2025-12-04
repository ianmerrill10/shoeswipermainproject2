import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// ============================================
// TYPES
// ============================================

export interface Model3DStatus {
  has_model: boolean;
  model_url: string | null;
  task_id: string | null;
  status: 'none' | 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error: string | null;
}

interface Generate3DResponse {
  success: boolean;
  task_id?: string;
  status?: string;
  model_url?: string;
  error?: string;
  demo_model_url?: string;
}

// ============================================
// LOCAL STORAGE CACHE
// ============================================

const CACHE_KEY = 'shoeswiper_3d_models';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  model_url: string;
  timestamp: number;
}

function getFromCache(shoeId: string): string | null {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const entry: CacheEntry = cache[shoeId];

    if (entry && Date.now() - entry.timestamp < CACHE_EXPIRY) {
      return entry.model_url;
    }
  } catch (e) {
    console.warn('Error reading 3D model cache:', e);
  }
  return null;
}

function saveToCache(shoeId: string, modelUrl: string): void {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[shoeId] = { model_url: modelUrl, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Error saving to 3D model cache:', e);
  }
}

// ============================================
// HOOK: useShoe3D
// Manages 3D model state and generation for a shoe
// ============================================

export function useShoe3D(shoeId: string, imageUrl: string, shoeName: string) {
  const [status, setStatus] = useState<Model3DStatus>({
    has_model: false,
    model_url: null,
    task_id: null,
    status: 'none',
    progress: 0,
    error: null,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Check cache on mount
  useEffect(() => {
    const cachedUrl = getFromCache(shoeId);
    if (cachedUrl) {
      setStatus({
        has_model: true,
        model_url: cachedUrl,
        task_id: null,
        status: 'completed',
        progress: 100,
        error: null,
      });
    }
  }, [shoeId]);

  // Generate 3D model from image
  const generate3DModel = useCallback(async () => {
    if (isGenerating || status.has_model) return;

    setIsGenerating(true);
    setStatus((prev) => ({
      ...prev,
      status: 'pending',
      progress: 0,
      error: null,
    }));

    try {
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('generate-3d-model', {
        body: {
          image_url: imageUrl,
          shoe_id: shoeId,
          shoe_name: shoeName,
        },
      });

      if (error) throw error;

      const response = data as Generate3DResponse;

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate 3D model');
      }

      // Handle demo mode
      if (response.demo_model_url) {
        setStatus({
          has_model: true,
          model_url: response.demo_model_url,
          task_id: response.task_id || null,
          status: 'completed',
          progress: 100,
          error: null,
        });
        saveToCache(shoeId, response.demo_model_url);
        return;
      }

      // Handle real task
      setStatus((prev) => ({
        ...prev,
        task_id: response.task_id || null,
        status: 'processing',
        progress: 10,
      }));

      // If model URL is immediately available
      if (response.model_url) {
        setStatus({
          has_model: true,
          model_url: response.model_url,
          task_id: response.task_id || null,
          status: 'completed',
          progress: 100,
          error: null,
        });
        saveToCache(shoeId, response.model_url);
      } else if (response.task_id) {
        // Start polling for task completion
        pollTaskStatus(response.task_id);
      }

    } catch (err) {
      console.error('3D generation error:', err);
      setStatus((prev) => ({
        ...prev,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Failed to generate 3D model',
      }));
    } finally {
      setIsGenerating(false);
    }
  }, [shoeId, imageUrl, shoeName, isGenerating, status.has_model]);

  // Poll for task status
  const pollTaskStatus = useCallback(async (taskId: string) => {
    const maxAttempts = 60; // 5 minutes with 5s intervals
    let attempts = 0;

    const poll = async () => {
      attempts++;

      try {
        const { data, error } = await supabase.functions.invoke('generate-3d-model', {
          body: { task_id: taskId, action: 'status' },
        });

        if (error) throw error;

        const response = data as Generate3DResponse;

        if (response.model_url) {
          setStatus({
            has_model: true,
            model_url: response.model_url,
            task_id: taskId,
            status: 'completed',
            progress: 100,
            error: null,
          });
          saveToCache(shoeId, response.model_url);
          return;
        }

        // Update progress
        const progress = Math.min(10 + (attempts / maxAttempts) * 80, 90);
        setStatus((prev) => ({ ...prev, progress }));

        // Continue polling
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setStatus((prev) => ({
            ...prev,
            status: 'failed',
            error: 'Timeout waiting for 3D model generation',
          }));
        }

      } catch (err) {
        console.error('Polling error:', err);
        setStatus((prev) => ({
          ...prev,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Failed to check status',
        }));
      }
    };

    // Start polling after initial delay
    setTimeout(poll, 5000);
  }, [shoeId]);

  // Clear cached model
  const clearModel = useCallback(() => {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      delete cache[shoeId];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.warn('Error clearing cache:', e);
    }

    setStatus({
      has_model: false,
      model_url: null,
      task_id: null,
      status: 'none',
      progress: 0,
      error: null,
    });
  }, [shoeId]);

  return {
    status,
    isGenerating,
    generate3DModel,
    clearModel,
    hasModel: status.has_model,
    modelUrl: status.model_url,
  };
}

// ============================================
// HOOK: useBatch3DGeneration
// Generate 3D models for multiple shoes
// ============================================

export function useBatch3DGeneration() {
  const [queue, setQueue] = useState<string[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState<Map<string, string>>(new Map());

  const addToQueue = useCallback((shoeIds: string[]) => {
    setQueue((prev) => [...prev, ...shoeIds.filter((id) => !prev.includes(id))]);
  }, []);

  const removeFromQueue = useCallback((shoeId: string) => {
    setQueue((prev) => prev.filter((id) => id !== shoeId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setProcessing(null);
  }, []);

  return {
    queue,
    processing,
    completed,
    failed,
    addToQueue,
    removeFromQueue,
    clearQueue,
    queueLength: queue.length,
    completedCount: completed.size,
    failedCount: failed.size,
  };
}

export default useShoe3D;
