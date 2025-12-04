import { Link } from 'react-router-dom';
import { BlogPost, BlogType, BLOG_CONFIGS } from '../../lib/blogTypes';
import { formatDistanceToNow } from 'date-fns';

interface BlogCardProps {
  post: BlogPost;
  blogType: BlogType;
  variant?: 'default' | 'featured' | 'compact';
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showCategory?: boolean;
}

export default function BlogCard({
  post,
  blogType,
  variant = 'default',
  showExcerpt = true,
  showAuthor = true,
  showCategory = true,
}: BlogCardProps) {
  const config = BLOG_CONFIGS[blogType];
  const postUrl = `/blog/${blogType}/${post.slug}`;

  const formattedDate = formatDistanceToNow(new Date(post.publishedAt), {
    addSuffix: true,
  });

  if (variant === 'compact') {
    return (
      <article className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <Link to={postUrl} className="flex-shrink-0">
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt}
            className="w-20 h-20 object-cover rounded-lg"
            loading="lazy"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={postUrl}>
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 hover:text-orange-500 transition-colors">
              {post.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formattedDate} · {post.readingTime} min read
          </p>
        </div>
      </article>
    );
  }

  if (variant === 'featured') {
    return (
      <article className="relative group overflow-hidden rounded-2xl">
        <Link to={postUrl}>
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {showCategory && (
              <span
                className="inline-block px-3 py-1 text-xs font-semibold text-white rounded-full mb-3"
                style={{ backgroundColor: config.primaryColor }}
              >
                {post.category.name}
              </span>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
              {post.title}
            </h2>
            {showExcerpt && (
              <p className="text-gray-200 line-clamp-2 mb-4">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-4">
              {showAuthor && (
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-gray-300">
                    {post.author.name}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-400">
                {formattedDate} · {post.readingTime} min read
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Default variant
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      <Link to={postUrl} className="block">
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-5">
        {showCategory && (
          <Link
            to={`/blog/${blogType}/category/${post.category.slug}`}
            className="inline-block"
          >
            <span
              className="inline-block px-3 py-1 text-xs font-semibold text-white rounded-full mb-3 hover:opacity-80 transition-opacity"
              style={{ backgroundColor: post.category.color }}
            >
              {post.category.icon} {post.category.name}
            </span>
          </Link>
        )}
        <Link to={postUrl}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-orange-500 transition-colors">
            {post.title}
          </h3>
        </Link>
        {showExcerpt && (
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between">
          {showAuthor && (
            <div className="flex items-center gap-2">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {post.author.name}
              </span>
            </div>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {post.readingTime} min read
          </div>
        </div>
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                to={`/blog/${blogType}/tag/${tag}`}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
