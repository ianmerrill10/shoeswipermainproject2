import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaUpload, FaMagic } from 'react-icons/fa';
import { useOutfitAnalysis } from '../hooks/useOutfitAnalysis';
import { ShareResults } from '../components/check-fit/ShareResults';
import { ManualStyleSelector } from '../components/check-fit/ManualStyleSelector';

export const CheckMyFit: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { analyzeImage, manualAnalyze, isAnalyzing, analysis, recommendations, error } = useOutfitAnalysis();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      analyzeImage(file);
    }
  };

  const reset = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 overflow-y-auto">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-zinc-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-800">
        <h1 className="font-black text-xl italic tracking-tighter">CHECK MY FIT <span className="text-orange-500">AI</span></h1>
        {imagePreview && (
          <button onClick={reset} className="text-zinc-400 text-sm">Reset</button>
        )}
      </header>

      <main className="p-4 max-w-md mx-auto">
        
        {/* State 1: Upload / Capture */}
        {!imagePreview && (
          <div className="flex flex-col items-center justify-center h-[70vh] border-2 border-dashed border-zinc-700 rounded-3xl bg-zinc-900/30">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
              className="text-center space-y-6"
            >
              <div className="bg-gradient-to-br from-orange-500 to-pink-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/20" aria-hidden="true">
                <FaMagic className="text-4xl text-white" />
              </div>
              <h2 className="text-2xl font-bold">Rate My Outfit</h2>
              <p className="text-zinc-400 max-w-xs px-4">Upload a full body shot. Our AI will rate your fit and recommend sneaker upgrades.</p>
              
              <div className="flex gap-4 justify-center mt-8">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload an image"
                  className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                >
                  <FaUpload aria-hidden="true" /> Upload
                </button>
                <div className="relative">
                  <label htmlFor="camera-input" className="sr-only">Take a photo of your outfit for AI analysis</label>
                  <input 
                    id="camera-input"
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  />
                  <span aria-hidden="true" className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/30 pointer-events-none">
                    <FaCamera aria-hidden="true" /> Take Photo
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* State 2: Preview & Analyzing */}
        {imagePreview && (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
            <img src={imagePreview} alt="Your uploaded outfit for analysis" className="w-full h-auto object-cover max-h-[60vh]" />
            
            {/* Scanning Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center" role="status" aria-live="polite">
                <motion.div 
                  className="absolute top-0 left-0 w-full h-1 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                  aria-hidden="true"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
                  aria-hidden="true"
                />
                <p className="mt-4 font-bold text-lg">Analyzing your fit...</p>
                <p className="text-zinc-400 text-sm">AI magic in progress</p>
              </div>
            )}
          </div>
        )}

        {/* State 3: Results */}
        {analysis && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-6"
          >
             {/* Score Card */}
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Drip Score</h3>
                    <div className="text-5xl font-black italic flex items-baseline gap-2">
                      {analysis.rating}<span className="text-xl text-zinc-500 not-italic">/10</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-wrap gap-2 justify-end max-w-[150px]">
                      {analysis.style_tags.map(tag => (
                        <span key={tag} className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300 capitalize">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-zinc-800/50 p-3 rounded-xl">
                  <p className="text-sm italic text-zinc-300">"{analysis.feedback}"</p>
                </div>
             </div>

             {/* Results Component */}
             <ShareResults outfitImage={imagePreview!} analysis={analysis} recommendations={recommendations} />
          </motion.div>
        )}
        
        {error && (
          <div className="mt-4 space-y-4">
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-xl text-center text-sm" role="alert">
              {error}
            </div>
            {/* Show Manual Selector if AI fails */}
            <ManualStyleSelector onSelect={manualAnalyze} />
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckMyFit;
