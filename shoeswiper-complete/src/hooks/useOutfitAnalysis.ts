import { useState } from 'react';
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
      if (import.meta.env.DEV) {
        console.error('Recommendation fetch failed:', dbErr);
      }
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

      if (aiError) throw new Error('AI Service Unavailable');

      const result: OutfitAnalysis = aiData;
      setAnalysis(result);

      // Perform the smart match
      await fetchRecommendations(result.style_tags, result.dominant_colors);

    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        console.error(err);
      }
      const errorMessage = err instanceof Error ? err.message : "AI Analysis unavailable. Select your style manually.";
      setError(errorMessage);
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

  return { analyzeImage, manualAnalyze, isAnalyzing, analysis, recommendations, error };
};
