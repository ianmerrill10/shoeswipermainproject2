import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { useSneakerSearch, SearchFilters } from '../hooks/useSneakerSearch';
import { SneakerCard } from '../components/SneakerCard';

const BRANDS = ['Nike', 'Jordan', 'Adidas', 'New Balance', 'ASICS', 'Puma', 'Converse', 'Vans', 'HOKA', 'Salomon'];
const STYLES = ['streetwear', 'retro', 'casual', 'hype', 'running', 'athletic', 'classic', 'gorpcore'];
const GENDERS = ['men', 'women', 'unisex', 'kids'] as const;

const SearchPage: React.FC = () => {
  const { searchSneakers, results, isSearching } = useSneakerSearch();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  useEffect(() => {
    // Load initial results
    searchSneakers('', {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchSneakers(query, filters);
  };

  const toggleBrand = (brand: string) => {
    const brands = filters.brands || [];
    const newBrands = brands.includes(brand)
      ? brands.filter(b => b !== brand)
      : [...brands, brand];
    setFilters({ ...filters, brands: newBrands.length ? newBrands : undefined });
  };

  const toggleStyle = (style: string) => {
    const styles = filters.styleTags || [];
    const newStyles = styles.includes(style)
      ? styles.filter(s => s !== style)
      : [...styles, style];
    setFilters({ ...filters, styleTags: newStyles.length ? newStyles : undefined });
  };

  const applyFilters = () => {
    searchSneakers(query, filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
    searchSneakers(query, {});
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-lg border-b border-zinc-800 p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sneakers..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:border-orange-500 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-orange-500 transition-colors"
          >
            <FaFilter />
          </button>
        </form>

        {/* Active Filters */}
        {(filters.brands?.length || filters.styleTags?.length || filters.gender) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.brands?.map(brand => (
              <span key={brand} className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                {brand}
                <button onClick={() => toggleBrand(brand)}><FaTimes className="text-[10px]" /></button>
              </span>
            ))}
            {filters.styleTags?.map(style => (
              <span key={style} className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                #{style}
                <button onClick={() => toggleStyle(style)}><FaTimes className="text-[10px]" /></button>
              </span>
            ))}
            {filters.gender && (
              <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                {filters.gender}
              </span>
            )}
            <button onClick={clearFilters} className="text-zinc-500 text-xs hover:text-white">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="p-4">
        {isSearching ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-zinc-400">No sneakers found</p>
            <p className="text-zinc-500 text-sm mt-1">Try different keywords or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {results.map(shoe => (
              <SneakerCard key={shoe.id} shoe={shoe} variant="grid" />
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end">
          <div className="bg-zinc-900 w-full max-h-[80vh] rounded-t-3xl overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-zinc-400 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Brands */}
              <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase mb-3">Brands</h3>
                <div className="flex flex-wrap gap-2">
                  {BRANDS.map(brand => (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.brands?.includes(brand)
                          ? 'bg-orange-500 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase mb-3">Gender</h3>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map(gender => (
                    <button
                      key={gender}
                      onClick={() => setFilters({ ...filters, gender: filters.gender === gender ? undefined : gender })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                        filters.gender === gender
                          ? 'bg-orange-500 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Styles */}
              <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase mb-3">Style</h3>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => toggleStyle(style)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.styleTags?.includes(style)
                          ? 'bg-orange-500 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      #{style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase mb-3">Price Range</h3>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase mb-3">Sort By</h3>
                <select
                  value={filters.sortBy || ''}
                  onChange={(e) => setFilters({ ...filters, sortBy: (e.target.value || undefined) as SearchFilters['sortBy'] })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 bg-zinc-900 p-4 border-t border-zinc-800 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 border border-zinc-700 rounded-xl text-zinc-300 font-medium"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-3 bg-orange-500 rounded-xl text-white font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
