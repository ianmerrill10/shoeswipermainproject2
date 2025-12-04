import React, { useState } from 'react';
import { BlogType, BLOG_CONFIGS } from '../../lib/blogTypes';
import { useSubscribeToBlog } from '../../hooks/useBlog';

interface NewsletterSignupProps {
  blogType?: BlogType;
  category?: BlogType;  // alias for blogType
  source?: string;  // tracking source (used for analytics)
  variant?: 'default' | 'compact' | 'banner';
  className?: string;
}

export default function NewsletterSignup({
  blogType,
  category,
  source: _source,  // underscore prefix to indicate intentionally unused
  variant = 'default',
  className = '',
}: NewsletterSignupProps) {
  const effectiveBlogType: BlogType = blogType || category || 'sneaker';
  const config = BLOG_CONFIGS[effectiveBlogType];
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const subscribeMutation = useSubscribeToBlog(effectiveBlogType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      const result = await subscribeMutation.mutateAsync(email);
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Thanks for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again later.');
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`p-4 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          📬 Newsletter
        </h4>
        {status === 'success' ? (
          <p className="text-green-600 text-sm">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-3 py-2 rounded-lg text-sm border-0 focus:ring-2 focus:ring-orange-500"
              disabled={subscribeMutation.isPending}
            />
            <button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {subscribeMutation.isPending ? '...' : 'Join'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="text-red-500 text-xs mt-1">{message}</p>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl ${className}`}
        style={{ backgroundColor: config.primaryColor }}
      >
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative px-6 py-8 md:py-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">
            Don't Miss a Thing
          </h3>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Get exclusive content, early access to deals, and the latest
            updates delivered straight to your inbox.
          </p>
          {status === 'success' ? (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 max-w-md mx-auto">
              <p className="text-white font-medium">✓ {message}</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
                disabled={subscribeMutation.isPending}
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe Free'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-red-200 text-sm mt-2">{message}</p>
          )}
          <p className="text-white/60 text-xs mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`p-6 md:p-8 rounded-2xl text-white ${className}`}
      style={{ backgroundColor: config.primaryColor }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📬</span>
            <h3 className="text-xl font-bold">Join Our Newsletter</h3>
          </div>
          <p className="text-white/80">
            Be the first to know about new releases, exclusive deals, and trending content.
          </p>
        </div>
        <div className="flex-1">
          {status === 'success' ? (
            <div className="bg-white/20 rounded-lg px-4 py-3 text-center">
              <p className="font-medium">✓ {message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
                disabled={subscribeMutation.isPending}
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {subscribeMutation.isPending ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-red-200 text-sm mt-2">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
