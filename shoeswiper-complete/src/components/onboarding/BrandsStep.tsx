import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';

interface BrandsStepProps {
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const BRAND_OPTIONS = [
  { id: 'nike', label: 'Nike', logo: '✓' },
  { id: 'adidas', label: 'Adidas', logo: '△' },
  { id: 'jordan', label: 'Jordan', logo: '🏀' },
  { id: 'new-balance', label: 'New Balance', logo: 'NB' },
  { id: 'yeezy', label: 'Yeezy', logo: 'YZY' },
  { id: 'converse', label: 'Converse', logo: '★' },
  { id: 'vans', label: 'Vans', logo: 'V' },
  { id: 'puma', label: 'Puma', logo: '🐆' },
  { id: 'asics', label: 'ASICS', logo: 'A' },
  { id: 'reebok', label: 'Reebok', logo: 'R' },
  { id: 'salomon', label: 'Salomon', logo: 'S' },
  { id: 'on-running', label: 'On Running', logo: 'O' },
];

const BrandsStep: React.FC<BrandsStepProps> = ({
  selectedBrands,
  onBrandsChange,
  onNext,
  onBack,
}) => {
  const [brands, setBrands] = useState<string[]>(selectedBrands);

  const toggleBrand = (brandId: string) => {
    const newBrands = brands.includes(brandId)
      ? brands.filter(b => b !== brandId)
      : brands.length < 5 ? [...brands, brandId] : brands;
    setBrands(newBrands);
    onBrandsChange(newBrands);
  };

  const canContinue = brands.length >= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-full px-6 py-8"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-black text-white mb-2"
        >
          Pick Your Favorite{' '}
          <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
            Brands
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 text-sm"
        >
          Select 3-5 brands you love
        </motion.p>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-3 gap-3 flex-1 mb-6 overflow-y-auto">
        {BRAND_OPTIONS.map((brand, index) => {
          const isSelected = brands.includes(brand.id);
          return (
            <motion.button
              key={brand.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleBrand(brand.id)}
              className={`relative rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all aspect-square ${
                isSelected
                  ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-500 shadow-lg shadow-purple-500/20'
                  : 'bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600'
              }`}
            >
              {/* Selected Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                >
                  <FaCheck className="text-[10px] text-white" />
                </motion.div>
              )}

              {/* Logo/Placeholder */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                isSelected
                  ? 'bg-white/10 text-white'
                  : 'bg-zinc-700/50 text-zinc-400'
              }`}>
                {brand.logo}
              </div>

              {/* Label */}
              <span className={`text-xs font-medium text-center ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                {brand.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Selection Counter */}
      <div className="text-center mb-4">
        <span className={`text-sm ${canContinue ? 'text-green-400' : 'text-zinc-500'}`}>
          {brands.length} of 3-5 selected
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="flex-1 bg-zinc-800 text-white font-bold py-4 rounded-xl"
        >
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: canContinue ? 1.02 : 1 }}
          whileTap={{ scale: canContinue ? 0.98 : 1 }}
          onClick={onNext}
          disabled={!canContinue}
          className={`flex-1 font-bold py-4 rounded-xl transition-all ${
            canContinue
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BrandsStep;
