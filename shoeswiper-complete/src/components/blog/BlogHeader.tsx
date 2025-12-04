import React from 'react';
import { Link } from 'react-router-dom';
import { BlogType, BLOG_CONFIGS } from '../../lib/blogTypes';

export interface BlogHeaderProps {
  blogType?: BlogType;
  showSearch?: boolean;
  transparent?: boolean;
}

export default function BlogHeader({
  blogType = 'sneaker',
  showSearch = true,
  transparent = false,
}: BlogHeaderProps) {
  const config = BLOG_CONFIGS[blogType];
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/blog/${blogType}/search?q=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 ${
        transparent
          ? 'bg-transparent'
          : 'bg-white dark:bg-gray-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={`/blog/${blogType}`} className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: config.primaryColor }}
            >
              {config.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-gray-900 dark:text-white">
                {config.name}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {config.tagline}
              </p>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to={`/blog/${blogType}`}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to={`/blog/${blogType}/category/releases`}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              New Releases
            </Link>
            <Link
              to={`/blog/${blogType}/category/reviews`}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Reviews
            </Link>
            <Link
              to={`/blog/${blogType}/category/deals`}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Deals
            </Link>
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              App
            </Link>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            {showSearch && (
              <form onSubmit={handleSearch} className="hidden sm:block">
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </form>
            )}

            {/* Social Links */}
            <div className="hidden lg:flex items-center gap-2">
              {config.socialLinks.twitter && (
                <a
                  href={config.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {config.socialLinks.instagram && (
                <a
                  href={config.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {config.socialLinks.tiktok && (
                <a
                  href={config.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                  </svg>
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800">
            <nav className="flex flex-col gap-4">
              <Link
                to={`/blog/${blogType}`}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to={`/blog/${blogType}/category/releases`}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                New Releases
              </Link>
              <Link
                to={`/blog/${blogType}/category/reviews`}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link
                to={`/blog/${blogType}/category/deals`}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Deals
              </Link>
              <Link
                to="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Back to App
              </Link>
            </nav>
            {showSearch && (
              <form onSubmit={handleSearch} className="mt-4">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </form>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
