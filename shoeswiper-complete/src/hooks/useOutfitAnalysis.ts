import { useState } from 'react';
import { Shoe } from '../lib/types';
import { DEMO_MODE, MOCK_SHOES } from '../lib/mockData';
import { supabase } from '../lib/supabaseClient';
import { analyzeOutfit as analyzeOutfitApi, matchShoesForOutfit } from '../lib/edgeFunctionsApi';

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

    // PRODUCTION MODE: Use Edge Functions API
    try {
      const result = await matchShoesForOutfit(styles, colors, 5);
      
      if (result.success) {
        // Transform to Shoe type with required fields
        const shoesWithDefaults = result.data.map((shoe: OutfitAnalysisShoeResult) => ({
          ...shoe,
          favorite_count: 0,
          view_count: 0,
          click_count: 0,
          is_active: true,
          is_featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          amazon_asin: '',
        }));
        setRecommendations(shoesWithDefaults as Shoe[]);
      } else {
        throw new Error(result.error);
      }
    } catch (dbErr) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('Recommendation fetch failed:', dbErr);
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

    // PRODUCTION MODE: Use Edge Functions API
    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          // Extract base64 data after the comma
          const base64Data = result.split(',')[1];
          if (base64Data) {
            resolve(base64Data);
          } else {
            reject(new Error('Failed to read image file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
      });

      const apiResult = await analyzeOutfitApi(base64Image);

      if (!apiResult.success) {
        throw new Error(apiResult.error || 'AI Service Unavailable');
      }

      const result: OutfitAnalysis = {
        rating: apiResult.data.rating,
        style_tags: apiResult.data.style_tags,
        dominant_colors: apiResult.data.dominant_colors,
        detected_shoe: apiResult.data.detected_shoe || 'Not detected',
        feedback: apiResult.data.feedback,
      };
      
      setAnalysis(result);

      // Perform the smart match
      await fetchRecommendations(result.style_tags, result.dominant_colors);

    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('Outfit analysis error:', err);
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
