import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlay, FaPause, FaExpand } from 'react-icons/fa';

// ============================================
// TYPES
// ============================================

export interface ViewAngle {
  label: string;
  url: string;
}

interface MultiAngleViewerProps {
  angles: ViewAngle[];
  shoeName: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showThumbnails?: boolean;
  onAngleChange?: (index: number) => void;
}

// ============================================
// DEFAULT ANGLE LABELS
// ============================================

export const DEFAULT_ANGLE_LABELS = ['Side', 'Front', 'Back', 'Top', 'Sole'];

// ============================================
// GENERATE ANGLES FROM SINGLE IMAGE
// Uses Unsplash source variations for demo
// In production, these would be actual multi-angle photos
// ============================================

export function generateViewAngles(baseImageUrl: string, shoeName: string): ViewAngle[] {
  // If it's an Unsplash image, we can generate variations
  if (baseImageUrl.includes('unsplash.com')) {
    const baseId = baseImageUrl.split('/').pop()?.split('?')[0] || '';
    return DEFAULT_ANGLE_LABELS.map((label, index) => ({
      label,
      // Add rotation parameter to simulate different angles (Unsplash doesn't actually support this,
      // but this demonstrates the structure for real multi-angle images)
      url: `${baseImageUrl}&angle=${index}`,
    }));
  }

  // For non-Unsplash images, use the same image for all angles
  return DEFAULT_ANGLE_LABELS.map((label) => ({
    label,
    url: baseImageUrl,
  }));
}

// ============================================
// MULTI-ANGLE VIEWER COMPONENT
// Simulates 360° view with multiple images
// ============================================

export function MultiAngleViewer({
  angles,
  shoeName,
  autoPlay = false,
  autoPlayInterval = 2000,
  showThumbnails = true,
  onAngleChange,
}: MultiAngleViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isDragging) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % angles.length);
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlaying, isDragging, angles.length, autoPlayInterval]);

  // Notify parent of angle changes
  useEffect(() => {
    onAngleChange?.(currentIndex);
  }, [currentIndex, onAngleChange]);

  // Navigation functions
  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? angles.length - 1 : prev - 1));
  }, [angles.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % angles.length);
  }, [angles.length]);

  // Drag/swipe handling for 360° rotation effect
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStartX(clientX);
    setIsPlaying(false);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;

    const diff = clientX - dragStartX;
    const threshold = 50; // pixels to trigger angle change

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToPrev();
      } else {
        goToNext();
      }
      setDragStartX(clientX);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => handleDragEnd();

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleDragEnd();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext]);

  return (
    <div className="relative w-full h-full select-none">
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Shoe Image */}
        <img
          src={angles[currentIndex].url}
          alt={`${shoeName} - ${angles[currentIndex].label}`}
          className="max-w-[80%] max-h-[80%] object-contain drop-shadow-2xl transition-opacity duration-200 pointer-events-none"
          draggable={false}
        />

        {/* 360° Indicator Ring */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
              strokeDasharray="4 2"
            />
            {/* Progress indicator */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#f97316"
              strokeWidth="1"
              strokeDasharray={`${(currentIndex / (angles.length - 1)) * 283} 283`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              className="transition-all duration-300"
            />
          </svg>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
        >
          <FaChevronRight />
        </button>

        {/* 360° Badge */}
        <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-3 h-3 border-2 border-white rounded-full" />
          360° VIEW
        </div>

        {/* Auto-play Control */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying((prev) => !prev);
          }}
          className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          {isPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
        </button>

        {/* Angle Label */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full">
          <p className="text-white text-sm font-medium">
            {angles[currentIndex].label} View
          </p>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {showThumbnails && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex justify-center gap-2">
            {angles.map((angle, index) => (
              <button
                key={angle.label}
                onClick={() => setCurrentIndex(index)}
                className={`
                  w-14 h-14 rounded-lg overflow-hidden border-2 transition-all
                  ${currentIndex === index
                    ? 'border-orange-500 scale-110'
                    : 'border-zinc-700 hover:border-zinc-500 opacity-70 hover:opacity-100'
                  }
                `}
              >
                <img
                  src={angle.url}
                  alt={angle.label}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {angles.map((angle, index) => (
              <span
                key={angle.label}
                className={`text-xs transition-colors ${
                  currentIndex === index ? 'text-orange-500 font-medium' : 'text-zinc-600'
                }`}
              >
                {angle.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Drag instruction */}
      {!showThumbnails && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <p className="text-white/70 text-xs">Drag to rotate</p>
        </div>
      )}
    </div>
  );
}

export default MultiAngleViewer;
