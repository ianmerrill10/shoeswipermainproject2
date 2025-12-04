import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBlogPosts, useBlogSearch } from '../../hooks/useBlog';
import { BlogCard, BlogHeader, BlogSidebar, NewsletterSignup } from '../../components/blog';
import { BLOG_CONFIGS, BlogType, BlogPost } from '../../lib/blogTypes';

/**
 * BlogList - Category listing page with pagination and search
 * Shows all posts for a specific blog category
 */
export default function BlogList() {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const postsPerPage = 12;

  const blogType = category as BlogType;
  const blogConfig = BLOG_CONFIGS[blogType] || BLOG_CONFIGS.sneaker;

  // Fetch posts
  const { 
    data: postsData, 
    isLoading, 
    error 
  } = useBlogPosts(blogType, { page: currentPage, pageSize: postsPerPage });

  // Search posts
  const { 
    data: searchResults, 
    isLoading: searchLoading 
  } = useBlogSearch(blogType, searchQuery, currentPage);

  const isSearching = searchQuery.length >= 2;
  const posts: BlogPost[] = isSearching ? (searchResults?.posts || []) : (postsData?.posts || []);
  const totalPages = isSearching ? 1 : Math.ceil((postsData?.total || 0) / postsPerPage);

  // Update document title
  useEffect(() => {
    document.title = `${blogConfig.name} | ShoeSwiper Blog`;
  }, [blogConfig.name]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      setSearchParams({ q: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  // Handle pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: page.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Validate category
  if (!BLOG_CONFIGS[blogType]) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlogHeader />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-8">
            The blog category you're looking for doesn't exist.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader />

      {/* Category Hero */}
      <section 
        className="py-16 px-4 text-white"
        style={{ 
          background: `linear-gradient(135deg, ${blogConfig.primaryColor} 0%, ${blogConfig.primaryColor}dd 100%)`
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{blogConfig.name}</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            {blogConfig.tagline}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="flex rounded-full overflow-hidden bg-white/20 backdrop-blur-sm">
              <input
                type="text"
                placeholder={`Search posts...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-6 py-3 bg-transparent text-white placeholder-white/70 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-gray-900 font-semibold hover:bg-gray-100 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/blog" className="hover:text-gray-900">Blog</Link>
            <span>/</span>
            <span className="text-gray-900">{blogConfig.name}</span>
            {isSearching && (
              <>
                <span>/</span>
                <span className="text-gray-900">Search: "{searchQuery}"</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts Grid */}
          <main className="lg:col-span-2">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isSearching 
                  ? `Search Results (${posts.length})` 
                  : `Latest Posts ${postsData?.total ? `(${postsData.total})` : ''}`
                }
              </h2>
              {isSearching && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Loading State */}
            {(isLoading || searchLoading) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-200" />
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600">Failed to load posts. Please try again.</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !searchLoading && posts.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {isSearching ? 'No results found' : 'No posts yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isSearching 
                    ? `Try a different search term or browse all posts.`
                    : 'Check back soon for new content!'
                  }
                </p>
                {isSearching && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchParams({});
                    }}
                    className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition"
                  >
                    View all posts
                  </button>
                )}
              </div>
            )}

            {/* Posts Grid */}
            {!isLoading && !searchLoading && posts.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} blogType={blogType} />
                  ))}
                </div>

                {/* Pagination */}
                {!isSearching && totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium transition ${
                              currentPage === pageNum
                                ? 'text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                            style={currentPage === pageNum ? { backgroundColor: blogConfig.primaryColor } : {}}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <BlogSidebar category={blogType} />
            </div>
          </aside>
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Never Miss a Post</h2>
          <p className="text-gray-400 mb-8">
            Subscribe to our {blogConfig.name.toLowerCase()} newsletter for weekly updates.
          </p>
          <NewsletterSignup source={`blog-list-${category}`} category={blogType} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👟</span>
            <span className="font-bold">ShoeSwiper</span>
          </div>
          <p className="text-gray-400 text-sm">
            As an Amazon Associate, we earn from qualifying purchases.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm">Terms</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
