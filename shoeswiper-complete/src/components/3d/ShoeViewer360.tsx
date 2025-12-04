import React, { useState, useCallback } from 'react';
import { ShoeModel3D } from './ShoeModel3D';
import { MultiAngleViewer, ViewAngle, generateViewAngles } from './MultiAngleViewer';
import { Shoe } from '../../lib/types';

// ============================================
// TYPES
// ============================================

interface ShoeViewer360Props {
  shoe: Shoe;
  className?: string;
  preferRealModel?: boolean;
}

type ViewMode = '3d' | 'images';

// ============================================
// UNIFIED SHOE VIEWER COMPONENT
// Automatically switches between 3D model and image fallback
// ============================================

export function ShoeViewer360({
  shoe,
  className = '',
  preferRealModel = true
}: ShoeViewer360Props) {
  const [viewMode, setViewMode] = useState<ViewMode>(
    shoe.media?.has_3d_model && shoe.media?.model_url && preferRealModel ? '3d' : 'images'
  );
  const [modelError, setModelError] = useState(false);

  // Generate view angles from shoe data or fallback to single image
  const viewAngles: ViewAngle[] = shoe.media?.thumbnail_angles?.length
    ? shoe.media.thumbnail_angles.map((url, i) => ({
        label: ['Side', 'Front', 'Back', 'Top', 'Sole'][i] || `Angle ${i + 1}`,
        url,
      }))
    : generateViewAngles(shoe.image_url, shoe.name);

  const handleModelError = useCallback(() => {
    console.warn('3D model failed to load, falling back to images');
    setModelError(true);
    setViewMode('images');
  }, []);

  const handleModelLoad = useCallback(() => {
    console.log('3D model loaded successfully');
  }, []);

  // Check if we can show 3D
  const has3DModel = shoe.media?.has_3d_model && shoe.media?.model_url && !modelError;

  return (
    <div className={`relative w-full aspect-square ${className}`}>
      {/* View Mode Toggle (only show if 3D is available) */}
      {has3DModel && (
        <div className="absolute top-4 right-14 z-20 flex bg-black/50 backdrop-blur-sm rounded-full p-1">
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              viewMode === '3d'
                ? 'bg-orange-500 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            3D
          </button>
          <button
            onClick={() => setViewMode('images')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              viewMode === 'images'
                ? 'bg-orange-500 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Photos
          </button>
        </div>
      )}

      {/* 3D Model Viewer */}
      {viewMode === '3d' && has3DModel && shoe.media?.model_url && (
        <ShoeModel3D
          modelUrl={shoe.media.model_url}
          autoRotate={true}
          enableZoom={true}
          showShadow={true}
          onLoad={handleModelLoad}
          onError={handleModelError}
        />
      )}

      {/* Multi-Angle Image Viewer (Fallback) */}
      {(viewMode === 'images' || !has3DModel) && (
        <MultiAngleViewer
          angles={viewAngles}
          shoeName={shoe.name}
          autoPlay={false}
          showThumbnails={true}
        />
      )}

      {/* 3D Badge Overlay (when in 3D mode) */}
      {viewMode === '3d' && (
        <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 z-10">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          3D MODEL
        </div>
      )}
    </div>
  );
}

export default ShoeViewer360;
