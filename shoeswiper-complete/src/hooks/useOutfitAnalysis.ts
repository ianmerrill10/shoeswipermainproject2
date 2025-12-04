import { useEffect, useState } from 'react';
import { Shoe } from '../lib/types';
import { DEMO_MODE, MOCK_SHOES } from '../lib/mockData';
import { supabase } from '../lib/supabaseClient';

/**
 * AI-powered outfit analysis hook for sneaker recommendations.
 * Analyzes uploaded outfit images using Google Gemini Vision API
 * and returns matching sneaker recommendations based on style and color.
 * 
 * In DEMO_MODE, returns mock analysis results.
 * In production, calls Supabase Edge Function 'analyze-outfit'.
 * 
 * @returns Object containing analysis methods, results, and recommendations
 * @example
 * const { analyzeImage, manualAnalyze, analysis, recommendations } = useOutfitAnalysis();
 * 
 * // Analyze an uploaded outfit image
 * await analyzeImage(file);
 * 
 * // Get recommendations after analysis
 * console.log(analysis?.style_tags, recommendations);
 * 
 * // Manual fallback if AI is unavailable
 * await manualAnalyze('streetwear');
 */

export interface OutfitAnalysis {
  rating: number;
  style_tags: string[];
  dominant_colors: string[];
  detected_shoe: string;
  feedback: string;
}

export interface UsageSummary {
  monthly_limit: number;
  remaining: number;
}

interface OutfitAnalysisShoeResult {
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  amazon_url: string;
  style_tags: string[];
  color_tags: string[];
  match_score?: number;
}

export const useOutfitAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<OutfitAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Shoe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  const DEFAULT_MONTHLY_LIMIT = 10;
  const DEMO_MONTHLY_LIMIT = 5;

  const getCurrentPeriodStart = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  };

  const computeRemaining = (monthlyLimit: number, usedThisMonth: number, periodStart?: string | null) => {
    if (!periodStart) return Math.max(monthlyLimit - usedThisMonth, 0);

    const currentPeriod = getCurrentPeriodStart();
    const start = new Date(periodStart);

    if (start.getUTCFullYear() !== currentPeriod.getUTCFullYear() || start.getUTCMonth() !== currentPeriod.getUTCMonth()) {
      return monthlyLimit;
    }

    return Math.max(monthlyLimit - usedThisMonth, 0);
  };

  // Helper to fetch recommendations using our SQL function
  const fetchRecommendations = async (styles: string[], colors: string[]) => {
    // DEMO MODE: Use mock data
    if (DEMO_MODE) {
      const matches = MOCK_SHOES.filter(shoe =>
        shoe.style_tags.some(tag => styles.includes(tag.toLowerCase()))
      ).slice(0, 5);
      setRecommendations(matches.length > 0 ? matches : MOCK_SHOES.slice(0, 5));
      return;
    }

    // PRODUCTION MODE: Use Supabase
    try {
      // Call the RPC function we created in SQL
      const { data, error } = await supabase.rpc('match_shoes_for_outfit', {
        query_styles: styles,
        query_colors: colors
      });

      if (error) throw error;

      // Ensure affiliate tags exist on returned data
      const taggedData = (data || []).map((shoe: OutfitAnalysisShoeResult) => ({
        ...shoe,
        media: { has_3d_model: false },
        amazon_url: shoe.amazon_url.includes('shoeswiper-20')
          ? shoe.amazon_url
          : `${shoe.amazon_url}${shoe.amazon_url.includes('?') ? '&' : '?'}tag=shoeswiper-20`
      }));

      setRecommendations(taggedData);
    } catch (dbErr) {
      console.error('Recommendation fetch failed:', dbErr);
      // Fallback: Just get popular shoes if matching fails
      const { data: fallback } = await supabase
        .from('shoes')
        .select('*')
        .order('favorite_count', { ascending: false })
        .limit(5);
      setRecommendations(fallback as Shoe[] || []);
    }
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);

    // DEMO MODE: Show demo analysis
    if (DEMO_MODE) {
      const mockResult: OutfitAnalysis = {
        rating: 8,
        style_tags: ['streetwear', 'casual'],
        dominant_colors: ['black', 'white'],
        detected_shoe: 'Demo Analysis',
        feedback: 'Great style! Here are some sneakers that would match perfectly.'
      };
      setAnalysis(mockResult);
      setUsage(prev => {
        const monthlyLimit = prev?.monthly_limit ?? DEMO_MONTHLY_LIMIT;
        const remaining = Math.max((prev?.remaining ?? monthlyLimit) - 1, 0);
        return { monthly_limit: monthlyLimit, remaining };
      });
      await fetchRecommendations(mockResult.style_tags, mockResult.dominant_colors);
      setIsAnalyzing(false);
      return;
    }

    // PRODUCTION MODE: Use Supabase AI
    try {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
      });

      const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-outfit', {
        body: { image: base64Image }
      });

      if (aiData?.usage) {
        setUsage(aiData.usage as UsageSummary);
      }

      if (aiError) {
        const errorMessage = (aiData as { error?: string })?.error || aiError.message || 'AI Service Unavailable';
        throw new Error(errorMessage);
      }

      if (aiData?.error) {
        throw new Error(aiData.error as string);
      }

      const result: OutfitAnalysis = (aiData as { analysis?: OutfitAnalysis })?.analysis ?? (aiData as OutfitAnalysis);
      setAnalysis(result);

      // Perform the smart match
      await fetchRecommendations(result.style_tags, result.dominant_colors);

    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "AI Analysis unavailable. Select your style manually.";
      setError(errorMessage);
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Manual Override for Fallback UI
  const manualAnalyze = async (selectedStyle: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    const mockAnalysis: OutfitAnalysis = {
      rating: 8,
      style_tags: [selectedStyle.toLowerCase()],
      dominant_colors: ['black', 'neutral'],
      detected_shoe: 'Manual Selection',
      feedback: `Here are the best ${selectedStyle} kicks for your rotation.`
    };
    
    setAnalysis(mockAnalysis);
    await fetchRecommendations([selectedStyle.toLowerCase()], []);
    setIsAnalyzing(false);
  };

  // Initial usage fetch (non-blocking)
  useEffect(() => {
    const loadUsage = async () => {
      if (DEMO_MODE) {
        setUsage({ monthly_limit: DEMO_MONTHLY_LIMIT, remaining: DEMO_MONTHLY_LIMIT });
        return;
      }

      const { data, error: usageError } = await supabase
        .from('ai_usage_limits')
        .select('monthly_limit, used_this_month, period_start')
        .maybeSingle();

      if (usageError) {
        console.error('Failed to fetch AI usage limits', usageError);
        return;
      }

      const monthlyLimit = data?.monthly_limit ?? DEFAULT_MONTHLY_LIMIT;
      const usedThisMonth = data?.used_this_month ?? 0;
      const remaining = computeRemaining(monthlyLimit, usedThisMonth, data?.period_start as string | null);

      setUsage({ monthly_limit: monthlyLimit, remaining });
    };

    loadUsage();
  }, []);

  return { analyzeImage, manualAnalyze, isAnalyzing, analysis, recommendations, error, usage };
};
