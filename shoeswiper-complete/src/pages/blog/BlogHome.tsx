import { Link } from 'react-router-dom';
import { useLatestPosts, useBlogPosts } from '../../hooks/useBlog';
import { BlogCard, BlogHeader, NewsletterSignup } from '../../components/blog';
import { BLOG_CONFIGS, BlogType } from '../../lib/blogTypes';
import { useEffect } from 'react';

/**
 * BlogHome - Main landing page for all ShoeSwiper blogs
 * Shows featured posts from each of the 4 blog categories
 */
export default function BlogHome() {
  // Use latest posts across all blogs for featured section
  const { data: latestPosts, isLoading: featuredLoading } = useLatestPosts(8);
  // latestPosts is { blogType, post }[] - extract posts with their blogType for rendering
  const featuredItems = latestPosts || [];
  
  // Fetch latest posts from each category with correct params
  const sneakerPosts = useBlogPosts('sneaker', { pageSize: 3 });
  const shoesPosts = useBlogPosts('shoes', { pageSize: 3 });
  const workwearPosts = useBlogPosts('workwear', { pageSize: 3 });
  const musicPosts = useBlogPosts('music', { pageSize: 3 });

  useEffect(() => {
    document.title = 'Blog | ShoeSwiper - Sneakers, Shoes, Workwear & Music';
  }, []);

  const categories = Object.entries(BLOG_CONFIGS) as [BlogType, typeof BLOG_CONFIGS[BlogType]][];

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ShoeSwiper Blog
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Your destination for sneaker news, shoe reviews, workwear guides, and music fashion
          </p>
          
          {/* Category Quick Links */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(([type, config]) => (
              <Link
                key={type}
                to={`/blog/${type}`}
                className="flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:scale-105"
                style={{ backgroundColor: config.primaryColor }}
              >
                <span className="font-semibold">{config.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
        
        {featuredLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.slice(0, 4).map((item) => (
              <BlogCard key={item.post.id} post={item.post} blogType={item.blogType} variant="compact" />
            ))}
          </div>
        )}
      </section>

      {/* Category Sections */}
      {categories.map(([type, config]) => {
        const postsQuery = type === 'sneaker' ? sneakerPosts 
          : type === 'shoes' ? shoesPosts 
          : type === 'workwear' ? workwearPosts 
          : musicPosts;
        
        const posts = postsQuery.data?.posts || [];

        return (
          <section key={type} className="py-12 border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${config.primaryColor}20` }}
                  >
                    👟
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{config.name}</h2>
                    <p className="text-gray-500 text-sm">{config.tagline}</p>
                  </div>
                </div>
                <Link
                  to={`/blog/${type}`}
                  className="text-sm font-semibold hover:underline"
                  style={{ color: config.primaryColor }}
                >
                  View All →
                </Link>
              </div>

              {postsQuery.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                      <div className="aspect-video bg-gray-200" />
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} blogType={type} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <p className="text-gray-500">No posts yet. Check back soon!</p>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Newsletter Section */}
      <section className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-gray-400 mb-8">
            Get the latest posts delivered straight to your inbox. No spam, just great content.
          </p>
          <NewsletterSignup source="blog-home" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👟</span>
            <span className="font-bold">ShoeSwiper</span>
          </div>
          <p className="text-gray-400 text-sm text-center">
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
