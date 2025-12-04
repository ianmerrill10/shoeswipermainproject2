import { Link } from 'react-router-dom';
import { BlogType, BLOG_CONFIGS, DEFAULT_CATEGORIES } from '../../lib/blogTypes';
import { useFeaturedPosts } from '../../hooks/useBlog';
import BlogCard from './BlogCard';

interface BlogSidebarProps {
  category: BlogType;
  currentPostId?: string;
}

export default function BlogSidebar({ category, currentPostId }: BlogSidebarProps) {
  const blogType = category;
  const config = BLOG_CONFIGS[blogType];
  const { data: featuredPosts } = useFeaturedPosts(blogType, 5);

  // Filter out current post from featured
  const sidebarPosts = featuredPosts?.filter((p) => p.id !== currentPostId) || [];

  return (
    <aside className="space-y-8">
      {/* Newsletter Signup */}
      <div
        className="p-6 rounded-2xl text-white"
        style={{ backgroundColor: config.primaryColor }}
      >
        <h3 className="text-lg font-bold mb-2">📬 Stay Updated</h3>
        <p className="text-sm opacity-90 mb-4">
          Get the latest {config.name.toLowerCase()} content delivered to your inbox.
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full px-4 py-2 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-white focus:outline-none"
          />
          <button
            type="submit"
            className="w-full py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Subscribe Free
          </button>
        </form>
        <p className="text-xs opacity-75 mt-2 text-center">
          No spam. Unsubscribe anytime.
        </p>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Categories
        </h3>
        <div className="space-y-2">
          {DEFAULT_CATEGORIES.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              to={`/blog/${blogType}/category/${category.slug}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <span className="text-xl">{category.icon}</span>
              <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Posts */}
      {sidebarPosts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            🔥 Popular Posts
          </h3>
          <div className="space-y-2">
            {sidebarPosts.slice(0, 4).map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                blogType={blogType}
                variant="compact"
                showAuthor={false}
                showCategory={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tags Cloud */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            'sneakers',
            'nike',
            'adidas',
            'jordan',
            'yeezy',
            'new-balance',
            'running',
            'basketball',
            'lifestyle',
            'limited-edition',
          ].map((tag) => (
            <Link
              key={tag}
              to={`/blog/${blogType}/tag/${tag}`}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900 hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* App Promo */}
      <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-2">📱 Get the App</h3>
        <p className="text-sm opacity-90 mb-4">
          Swipe through sneakers like dating apps. Find your perfect pair!
        </p>
        <Link
          to="/"
          className="block w-full py-2 bg-white text-orange-600 font-semibold rounded-lg text-center hover:bg-gray-100 transition-colors"
        >
          Try ShoeSwiper Free
        </Link>
      </div>

      {/* Affiliate Disclosure */}
      <div className="text-xs text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="font-medium mb-1">Affiliate Disclosure</p>
        <p>
          ShoeSwiper is a participant in the Amazon Services LLC Associates
          Program. We earn from qualifying purchases made through links on this
          site.
        </p>
      </div>
    </aside>
  );
}
