import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useBlogPost, useRelatedPosts, useRecordView } from '../../hooks/useBlog';
import { 
  BlogHeader, 
  BlogSidebar, 
  AffiliateProductCard, 
  ShareButtons,
  BlogCard,
  NewsletterSignup 
} from '../../components/blog';
import { BLOG_CONFIGS, BlogType } from '../../lib/blogTypes';

/**
 * BlogPost - Individual blog post view
 * Displays full post content with affiliate products, sharing, and related posts
 */
export default function BlogPost() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const blogType = (category as BlogType) || 'sneaker';
  const { data: post, isLoading, error } = useBlogPost(blogType, slug || '');
  const { data: relatedPosts } = useRelatedPosts(blogType, post?.id || '', 3);
  const recordView = useRecordView();

  const blogConfig = BLOG_CONFIGS[category as BlogType] || BLOG_CONFIGS.sneaker;

  // Update document title
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | ${blogConfig.name} | ShoeSwiper`;
      
      // Record view
      recordView.mutate({ blogType, postId: post.id });
    }
    // Note: recordView is intentionally excluded from deps as we only want to record view once per post change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, blogConfig.name, blogType]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate reading time
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlogHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
            <div className="aspect-video bg-gray-200 rounded-xl mb-8" />
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlogHeader />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to={`/blog/${category || ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition"
          >
            ← Back to {blogConfig.name}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/blog" className="hover:text-gray-900">Blog</Link>
            <span>/</span>
            <Link to={`/blog/${category}`} className="hover:text-gray-900" style={{ color: blogConfig.primaryColor }}>
              {blogConfig.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-xs">{post.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-2">
            {/* Post Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: blogConfig.primaryColor }}
                >
                  {blogConfig.name}
                </span>
                <span className="text-gray-500 text-sm">
                  {formatDate(post.publishedAt)}
                </span>
                <span className="text-gray-500 text-sm">
                  {getReadingTime(post.content)} min read
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
              )}

              {/* Author */}
              {post.author && (
                <div className="flex items-center gap-3">
                  {post.author.avatar ? (
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg">
                        {post.author.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{post.author.name}</p>
                    {post.author.bio && (
                      <p className="text-sm text-gray-500 line-clamp-1">{post.author.bio}</p>
                    )}
                  </div>
                </div>
              )}
            </header>

            {/* Featured Image */}
            {post.featuredImage && (
              <figure className="mb-8">
                <img
                  src={post.featuredImage}
                  alt={post.featuredImageAlt || post.title}
                  className="w-full rounded-xl shadow-lg"
                />
              </figure>
            )}

            {/* Post Content */}
            <div 
              className="prose prose-lg max-w-none mb-8
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg
                prose-blockquote:border-l-orange-500 prose-blockquote:italic
                prose-ul:list-disc prose-ol:list-decimal"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Affiliate Products */}
            {post.affiliateProducts && post.affiliateProducts.length > 0 && (
              <section className="bg-gray-100 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Featured Products
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {post.affiliateProducts.map((product) => (
                    <AffiliateProductCard
                      key={product.id}
                      product={product}
                      blogType={blogType}
                      postId={post.id}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  As an Amazon Associate, we earn from qualifying purchases.
                </p>
              </section>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog/${category}/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Share Buttons */}
            <div className="border-t border-b py-6 mb-8">
              <ShareButtons
                url={window.location.href}
                title={post.title}
                image={post.featuredImage}
              />
            </div>

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Related Posts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedPosts.map((relatedPost) => (
                    <BlogCard key={relatedPost.id} post={relatedPost} blogType={blogType} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {/* Newsletter CTA */}
            <section className="bg-gray-900 text-white rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Enjoyed this post?</h3>
              <p className="text-gray-400 mb-6">
                Subscribe to get more great content delivered to your inbox.
              </p>
              <NewsletterSignup source={`post-${post.id}`} />
            </section>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <BlogSidebar category={category as BlogType} currentPostId={post.id} />
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👟</span>
            <span className="font-bold">ShoeSwiper</span>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} ShoeSwiper. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
