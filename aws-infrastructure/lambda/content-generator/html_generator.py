"""
HTML Generator Lambda for ShoeSwiper Blogs
Generates SEO-optimized static HTML pages from DynamoDB posts
"""

import json
import boto3
import os
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import html
import hashlib
import re
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

# Configuration
DYNAMODB_TABLE = os.environ.get('BLOG_POSTS_TABLE', 'shoeswiper-blog-posts')
S3_BUCKET = os.environ.get('BLOG_BUCKET', 'shoeswiper-blogs')
DOMAIN = os.environ.get('DOMAIN', 'https://shoeswiper.com')
AFFILIATE_TAG = os.environ.get('AFFILIATE_TAG', 'shoeswiper-20')

# Blog configurations
BLOG_CONFIGS = {
    'sneaker': {
        'name': 'Sneaker Blog',
        'description': 'Latest sneaker news, releases, and reviews',
        'path': 'blog/sneaker',
        'color': '#FF6B35',
        'icon': '👟'
    },
    'shoes': {
        'name': 'Shoe Blog',
        'description': 'Comprehensive shoe guides and fashion tips',
        'path': 'blog/shoes',
        'color': '#4A90D9',
        'icon': '👞'
    },
    'workwear': {
        'name': 'Workwear & Boots Blog',
        'description': 'Work boots, safety gear, and workwear reviews',
        'path': 'blog/workwear',
        'color': '#8B4513',
        'icon': '🥾'
    },
    'music': {
        'name': 'Music & Artists Blog',
        'description': 'Music fashion, artist style, and culture',
        'path': 'blog/music',
        'color': '#9B59B6',
        'icon': '🎵'
    }
}


def escape_html(text: str) -> str:
    """Safely escape HTML content"""
    if not text:
        return ''
    return html.escape(str(text))


def generate_meta_tags(post: Dict[str, Any], config: Dict[str, Any]) -> str:
    """Generate comprehensive meta tags for SEO"""
    title = escape_html(post.get('title', 'ShoeSwiper Blog'))
    description = escape_html(post.get('meta_description', post.get('excerpt', '')))[:160]
    image = post.get('featured_image', post.get('image_url', f'{DOMAIN}/og-image.jpg'))
    url = f"{DOMAIN}/{config['path']}/{post.get('slug', post.get('id'))}"
    published = post.get('published_at', datetime.now(timezone.utc).isoformat())
    author = post.get('author', {}).get('name', 'ShoeSwiper Team')
    keywords = post.get('keywords', post.get('tags', []))
    if isinstance(keywords, list):
        keywords = ', '.join(keywords)
    
    return f'''
    <!-- Primary Meta Tags -->
    <title>{title} | {config['name']}</title>
    <meta name="title" content="{title}">
    <meta name="description" content="{description}">
    <meta name="keywords" content="{escape_html(keywords)}">
    <meta name="author" content="{escape_html(author)}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="{url}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="{url}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="{image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="ShoeSwiper">
    <meta property="article:published_time" content="{published}">
    <meta property="article:author" content="{escape_html(author)}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{url}">
    <meta property="twitter:title" content="{title}">
    <meta property="twitter:description" content="{description}">
    <meta property="twitter:image" content="{image}">
    <meta name="twitter:creator" content="@shoeswiper">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "{title}",
      "image": "{image}",
      "datePublished": "{published}",
      "dateModified": "{post.get('updated_at', published)}",
      "author": {{
        "@type": "Person",
        "name": "{escape_html(author)}"
      }},
      "publisher": {{
        "@type": "Organization",
        "name": "ShoeSwiper",
        "logo": {{
          "@type": "ImageObject",
          "url": "{DOMAIN}/logo.png"
        }}
      }},
      "description": "{description}",
      "mainEntityOfPage": {{
        "@type": "WebPage",
        "@id": "{url}"
      }}
    }}
    </script>
    '''


def generate_header(config: Dict[str, Any]) -> str:
    """Generate site header HTML"""
    return f'''
    <header class="site-header">
        <nav class="nav-container">
            <a href="{DOMAIN}" class="logo">
                <span class="logo-icon">👟</span>
                <span class="logo-text">ShoeSwiper</span>
            </a>
            <div class="nav-links">
                <a href="{DOMAIN}/blog/sneaker" class="{'active' if config.get('path') == 'blog/sneaker' else ''}">Sneakers</a>
                <a href="{DOMAIN}/blog/shoes" class="{'active' if config.get('path') == 'blog/shoes' else ''}">Shoes</a>
                <a href="{DOMAIN}/blog/workwear" class="{'active' if config.get('path') == 'blog/workwear' else ''}">Workwear</a>
                <a href="{DOMAIN}/blog/music" class="{'active' if config.get('path') == 'blog/music' else ''}">Music</a>
            </div>
            <a href="{DOMAIN}/app" class="cta-button">Get the App</a>
        </nav>
    </header>
    '''


def generate_footer() -> str:
    """Generate site footer HTML"""
    year = datetime.now().year
    return f'''
    <footer class="site-footer">
        <div class="footer-container">
            <div class="footer-section">
                <h4>ShoeSwiper</h4>
                <p>Your destination for sneaker news, shoe reviews, and fashion trends.</p>
                <div class="social-links">
                    <a href="https://twitter.com/shoeswiper" aria-label="Twitter">𝕏</a>
                    <a href="https://instagram.com/shoeswiper" aria-label="Instagram">📷</a>
                    <a href="https://tiktok.com/@shoeswiper" aria-label="TikTok">🎵</a>
                </div>
            </div>
            <div class="footer-section">
                <h4>Blogs</h4>
                <ul>
                    <li><a href="{DOMAIN}/blog/sneaker">Sneaker Blog</a></li>
                    <li><a href="{DOMAIN}/blog/shoes">Shoe Blog</a></li>
                    <li><a href="{DOMAIN}/blog/workwear">Workwear Blog</a></li>
                    <li><a href="{DOMAIN}/blog/music">Music Blog</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Resources</h4>
                <ul>
                    <li><a href="{DOMAIN}/about">About Us</a></li>
                    <li><a href="{DOMAIN}/contact">Contact</a></li>
                    <li><a href="{DOMAIN}/privacy">Privacy Policy</a></li>
                    <li><a href="{DOMAIN}/terms">Terms of Service</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Newsletter</h4>
                <p>Get the latest updates delivered to your inbox.</p>
                <form class="newsletter-form" action="{DOMAIN}/api/newsletter" method="POST">
                    <input type="email" name="email" placeholder="Enter your email" required>
                    <button type="submit">Subscribe</button>
                </form>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; {year} ShoeSwiper. All rights reserved.</p>
            <p class="affiliate-disclosure">As an Amazon Associate, we earn from qualifying purchases.</p>
        </div>
    </footer>
    '''


def generate_affiliate_product_html(product: Dict[str, Any]) -> str:
    """Generate HTML for affiliate product card"""
    name = escape_html(product.get('name', 'Product'))
    price = product.get('price', product.get('current_price', ''))
    original_price = product.get('original_price', '')
    image = product.get('image_url', product.get('image', ''))
    asin = product.get('asin', '')
    
    # Build affiliate link
    if asin:
        affiliate_link = f"https://www.amazon.com/dp/{asin}?tag={AFFILIATE_TAG}"
    else:
        affiliate_link = product.get('affiliate_link', product.get('url', '#'))
        if 'amazon.com' in affiliate_link and AFFILIATE_TAG not in affiliate_link:
            separator = '&' if '?' in affiliate_link else '?'
            affiliate_link = f"{affiliate_link}{separator}tag={AFFILIATE_TAG}"
    
    rating = product.get('rating', '')
    reviews = product.get('review_count', '')
    
    price_html = ''
    if price:
        price_html = f'<span class="current-price">${price}</span>'
        if original_price and float(str(original_price).replace('$', '')) > float(str(price).replace('$', '')):
            discount = int((1 - float(str(price).replace('$', '')) / float(str(original_price).replace('$', ''))) * 100)
            price_html += f' <span class="original-price">${original_price}</span>'
            price_html += f' <span class="discount-badge">-{discount}%</span>'
    
    rating_html = ''
    if rating:
        stars = '★' * int(float(rating)) + '☆' * (5 - int(float(rating)))
        rating_html = f'<div class="rating"><span class="stars">{stars}</span>'
        if reviews:
            rating_html += f' <span class="review-count">({reviews} reviews)</span>'
        rating_html += '</div>'
    
    return f'''
    <div class="affiliate-product-card">
        <a href="{affiliate_link}" target="_blank" rel="nofollow sponsored noopener" class="product-link" data-asin="{asin}">
            <div class="product-image">
                <img src="{image}" alt="{name}" loading="lazy">
            </div>
            <div class="product-info">
                <h4 class="product-name">{name}</h4>
                {rating_html}
                <div class="product-price">{price_html}</div>
                <span class="buy-button">🛒 Buy Now</span>
            </div>
        </a>
    </div>
    '''


def generate_article_html(post: Dict[str, Any], config: Dict[str, Any]) -> str:
    """Generate the main article HTML"""
    title = escape_html(post.get('title', 'Untitled'))
    content = post.get('content', post.get('body', ''))
    author = post.get('author', {})
    author_name = escape_html(author.get('name', 'ShoeSwiper Team'))
    author_avatar = author.get('avatar', f'{DOMAIN}/default-avatar.png')
    published = post.get('published_at', datetime.now(timezone.utc).isoformat())
    
    # Format date
    try:
        if isinstance(published, str):
            pub_dt = datetime.fromisoformat(published.replace('Z', '+00:00'))
        else:
            pub_dt = published
        formatted_date = pub_dt.strftime('%B %d, %Y')
    except:
        formatted_date = 'Recently'
    
    # Reading time estimate
    word_count = len(content.split())
    reading_time = max(1, word_count // 200)
    
    # Featured image
    featured_image = post.get('featured_image', post.get('image_url', ''))
    featured_image_html = ''
    if featured_image:
        image_alt = escape_html(post.get('image_alt', title))
        featured_image_html = f'''
        <figure class="featured-image">
            <img src="{featured_image}" alt="{image_alt}" loading="eager">
            <figcaption>{escape_html(post.get('image_caption', ''))}</figcaption>
        </figure>
        '''
    
    # Tags
    tags = post.get('tags', [])
    tags_html = ''
    if tags:
        tags_html = '<div class="post-tags">'
        for tag in tags[:5]:
            tag_slug = tag.lower().replace(' ', '-')
            tags_html += f'<a href="{DOMAIN}/{config["path"]}/tag/{tag_slug}" class="tag">#{escape_html(tag)}</a>'
        tags_html += '</div>'
    
    # Affiliate products
    products = post.get('affiliate_products', post.get('products', []))
    products_html = ''
    if products:
        products_html = '<div class="affiliate-products"><h3>Featured Products</h3><div class="products-grid">'
        for product in products[:6]:
            products_html += generate_affiliate_product_html(product)
        products_html += '</div></div>'
    
    return f'''
    <article class="blog-post" itemscope itemtype="https://schema.org/BlogPosting">
        <header class="post-header">
            <div class="post-meta">
                <span class="category-badge" style="background-color: {config['color']}">{config['icon']} {config['name']}</span>
                <time datetime="{published}" itemprop="datePublished">{formatted_date}</time>
                <span class="reading-time">{reading_time} min read</span>
            </div>
            <h1 itemprop="headline">{title}</h1>
            <div class="author-info" itemprop="author" itemscope itemtype="https://schema.org/Person">
                <img src="{author_avatar}" alt="{author_name}" class="author-avatar">
                <span itemprop="name">{author_name}</span>
            </div>
        </header>
        
        {featured_image_html}
        
        <div class="post-content" itemprop="articleBody">
            {content}
        </div>
        
        {products_html}
        
        {tags_html}
        
        <div class="share-buttons">
            <span>Share:</span>
            <a href="https://twitter.com/intent/tweet?url={DOMAIN}/{config['path']}/{post.get('slug')}&text={title}" target="_blank" rel="noopener" class="share-twitter">Twitter</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u={DOMAIN}/{config['path']}/{post.get('slug')}" target="_blank" rel="noopener" class="share-facebook">Facebook</a>
            <a href="https://pinterest.com/pin/create/button/?url={DOMAIN}/{config['path']}/{post.get('slug')}&media={featured_image}&description={title}" target="_blank" rel="noopener" class="share-pinterest">Pinterest</a>
        </div>
    </article>
    '''


def generate_styles() -> str:
    """Generate CSS styles"""
    return '''
    <style>
        :root {
            --primary-color: #FF6B35;
            --secondary-color: #1a1a2e;
            --text-color: #333;
            --text-light: #666;
            --bg-color: #fff;
            --bg-light: #f8f9fa;
            --border-color: #e0e0e0;
            --shadow: 0 2px 8px rgba(0,0,0,0.1);
            --radius: 12px;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background: var(--bg-color);
        }
        
        .site-header {
            position: sticky;
            top: 0;
            background: var(--bg-color);
            box-shadow: var(--shadow);
            z-index: 100;
        }
        
        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--secondary-color);
        }
        
        .logo-icon { font-size: 2rem; }
        
        .nav-links {
            display: flex;
            gap: 1.5rem;
        }
        
        .nav-links a {
            text-decoration: none;
            color: var(--text-color);
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: var(--radius);
            transition: all 0.2s;
        }
        
        .nav-links a:hover, .nav-links a.active {
            background: var(--primary-color);
            color: white;
        }
        
        .cta-button {
            background: var(--primary-color);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius);
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.2s;
        }
        
        .cta-button:hover { transform: translateY(-2px); }
        
        main {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .blog-post { padding: 2rem 0; }
        
        .post-header { margin-bottom: 2rem; }
        
        .post-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            color: var(--text-light);
        }
        
        .category-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            color: white;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .post-header h1 {
            font-size: 2.5rem;
            line-height: 1.2;
            margin-bottom: 1rem;
            color: var(--secondary-color);
        }
        
        .author-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .author-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }
        
        .featured-image {
            margin: 2rem 0;
            border-radius: var(--radius);
            overflow: hidden;
        }
        
        .featured-image img {
            width: 100%;
            height: auto;
            display: block;
        }
        
        .featured-image figcaption {
            padding: 0.75rem;
            background: var(--bg-light);
            font-size: 0.85rem;
            color: var(--text-light);
            text-align: center;
        }
        
        .post-content {
            font-size: 1.1rem;
            line-height: 1.8;
        }
        
        .post-content h2 {
            font-size: 1.75rem;
            margin: 2rem 0 1rem;
            color: var(--secondary-color);
        }
        
        .post-content h3 {
            font-size: 1.4rem;
            margin: 1.5rem 0 0.75rem;
        }
        
        .post-content p { margin-bottom: 1.25rem; }
        
        .post-content img {
            max-width: 100%;
            height: auto;
            border-radius: var(--radius);
            margin: 1.5rem 0;
        }
        
        .post-content ul, .post-content ol {
            margin: 1rem 0 1.5rem 2rem;
        }
        
        .post-content li { margin-bottom: 0.5rem; }
        
        .post-content blockquote {
            border-left: 4px solid var(--primary-color);
            padding-left: 1.5rem;
            margin: 1.5rem 0;
            font-style: italic;
            color: var(--text-light);
        }
        
        .affiliate-products {
            margin: 3rem 0;
            padding: 2rem;
            background: var(--bg-light);
            border-radius: var(--radius);
        }
        
        .affiliate-products h3 {
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1.5rem;
        }
        
        .affiliate-product-card {
            background: white;
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: var(--shadow);
            transition: transform 0.2s;
        }
        
        .affiliate-product-card:hover { transform: translateY(-4px); }
        
        .product-link {
            text-decoration: none;
            color: inherit;
        }
        
        .product-image {
            aspect-ratio: 1;
            overflow: hidden;
            background: var(--bg-light);
        }
        
        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .product-info { padding: 1rem; }
        
        .product-name {
            font-size: 0.95rem;
            margin-bottom: 0.5rem;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .rating {
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
        }
        
        .stars { color: #f59e0b; }
        .review-count { color: var(--text-light); }
        
        .product-price { margin-bottom: 0.75rem; }
        
        .current-price {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--primary-color);
        }
        
        .original-price {
            text-decoration: line-through;
            color: var(--text-light);
            font-size: 0.9rem;
        }
        
        .discount-badge {
            background: #dc2626;
            color: white;
            padding: 0.1rem 0.4rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .buy-button {
            display: block;
            background: linear-gradient(to right, #f97316, #ea580c);
            color: white;
            text-align: center;
            padding: 0.75rem;
            border-radius: 8px;
            font-weight: 700;
            font-size: 1rem;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .affiliate-product-card:hover .buy-button {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
        }
        
        .post-tags {
            margin: 2rem 0;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .tag {
            background: var(--bg-light);
            color: var(--text-light);
            padding: 0.35rem 0.75rem;
            border-radius: 20px;
            text-decoration: none;
            font-size: 0.85rem;
            transition: all 0.2s;
        }
        
        .tag:hover {
            background: var(--primary-color);
            color: white;
        }
        
        .share-buttons {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem 0;
            border-top: 1px solid var(--border-color);
        }
        
        .share-buttons a {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
        }
        
        .share-twitter { background: #1da1f2; color: white; }
        .share-facebook { background: #4267b2; color: white; }
        .share-pinterest { background: #e60023; color: white; }
        
        .site-footer {
            background: var(--secondary-color);
            color: white;
            padding: 4rem 2rem 2rem;
            margin-top: 4rem;
        }
        
        .footer-container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
        }
        
        .footer-section h4 {
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .footer-section ul {
            list-style: none;
        }
        
        .footer-section a {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
        }
        
        .footer-section a:hover { color: white; }
        
        .footer-section li { margin-bottom: 0.5rem; }
        
        .social-links {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .social-links a {
            font-size: 1.5rem;
        }
        
        .newsletter-form {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .newsletter-form input {
            flex: 1;
            padding: 0.75rem;
            border: none;
            border-radius: 6px;
        }
        
        .newsletter-form button {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.75rem 1.25rem;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
        }
        
        .footer-bottom {
            max-width: 1200px;
            margin: 3rem auto 0;
            padding-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            text-align: center;
            font-size: 0.9rem;
            color: rgba(255,255,255,0.6);
        }
        
        .affiliate-disclosure {
            font-size: 0.8rem;
            margin-top: 0.5rem;
        }
        
        @media (max-width: 768px) {
            .nav-links { display: none; }
            .post-header h1 { font-size: 1.75rem; }
            main { padding: 1rem; }
            .products-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
    '''


def generate_full_html_page(post: Dict[str, Any], category: str) -> str:
    """Generate complete HTML page for a blog post"""
    config = BLOG_CONFIGS[category]
    
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    {generate_meta_tags(post, config)}
    <link rel="icon" href="{DOMAIN}/favicon.ico">
    <link rel="apple-touch-icon" href="{DOMAIN}/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    {generate_styles()}
</head>
<body>
    {generate_header(config)}
    <main>
        {generate_article_html(post, config)}
    </main>
    {generate_footer()}
    
    <script>
        // Affiliate click tracking
        document.querySelectorAll('.affiliate-product-card .product-link').forEach(link => {{
            link.addEventListener('click', function(e) {{
                const asin = this.dataset.asin;
                if (asin) {{
                    fetch('/api/track-click', {{
                        method: 'POST',
                        headers: {{ 'Content-Type': 'application/json' }},
                        body: JSON.stringify({{ asin, source: 'blog', postId: '{post.get("id")}' }})
                    }}).catch(() => {{}});
                }}
            }});
        }});
    </script>
    
    <!-- Analytics placeholder -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
</body>
</html>'''


def generate_index_page(posts: List[Dict[str, Any]], category: str) -> str:
    """Generate index/listing page for a blog category"""
    config = BLOG_CONFIGS[category]
    
    posts_html = ''
    for post in posts[:20]:
        title = escape_html(post.get('title', 'Untitled'))
        excerpt = escape_html(post.get('excerpt', ''))[:200]
        slug = post.get('slug', post.get('id'))
        image = post.get('featured_image', post.get('image_url', f'{DOMAIN}/placeholder.jpg'))
        
        try:
            published = post.get('published_at', '')
            if isinstance(published, str):
                pub_dt = datetime.fromisoformat(published.replace('Z', '+00:00'))
            else:
                pub_dt = published
            formatted_date = pub_dt.strftime('%B %d, %Y')
        except:
            formatted_date = 'Recently'
        
        posts_html += f'''
        <article class="post-card">
            <a href="{DOMAIN}/{config['path']}/{slug}">
                <div class="post-card-image">
                    <img src="{image}" alt="{title}" loading="lazy">
                </div>
                <div class="post-card-content">
                    <time>{formatted_date}</time>
                    <h2>{title}</h2>
                    <p>{excerpt}...</p>
                    <span class="read-more">Read More →</span>
                </div>
            </a>
        </article>
        '''
    
    index_styles = '''
    <style>
        .blog-index {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .blog-header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .blog-header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .posts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .post-card {
            background: white;
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: var(--shadow);
            transition: transform 0.2s;
        }
        
        .post-card:hover { transform: translateY(-4px); }
        
        .post-card a {
            text-decoration: none;
            color: inherit;
        }
        
        .post-card-image {
            aspect-ratio: 16/9;
            overflow: hidden;
        }
        
        .post-card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
        }
        
        .post-card:hover .post-card-image img {
            transform: scale(1.05);
        }
        
        .post-card-content {
            padding: 1.5rem;
        }
        
        .post-card-content time {
            font-size: 0.85rem;
            color: var(--text-light);
        }
        
        .post-card-content h2 {
            font-size: 1.25rem;
            margin: 0.5rem 0;
            line-height: 1.3;
        }
        
        .post-card-content p {
            font-size: 0.95rem;
            color: var(--text-light);
            margin-bottom: 1rem;
        }
        
        .read-more {
            color: var(--primary-color);
            font-weight: 600;
        }
    </style>
    '''
    
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{config['name']} | ShoeSwiper</title>
    <meta name="description" content="{config['description']}">
    <link rel="canonical" href="{DOMAIN}/{config['path']}">
    {generate_styles()}
    {index_styles}
</head>
<body>
    {generate_header(config)}
    <main class="blog-index">
        <header class="blog-header">
            <span style="font-size: 3rem;">{config['icon']}</span>
            <h1>{config['name']}</h1>
            <p>{config['description']}</p>
        </header>
        <div class="posts-grid">
            {posts_html}
        </div>
    </main>
    {generate_footer()}
</body>
</html>'''


def upload_to_s3(content: str, key: str, content_type: str = 'text/html') -> bool:
    """Upload HTML to S3"""
    try:
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=content.encode('utf-8'),
            ContentType=content_type,
            CacheControl='public, max-age=3600',
            ACL='public-read'
        )
        logger.info(f"Successfully uploaded {key}")
        return True
    except Exception as e:
        logger.error(f"Error uploading {key}: {str(e)}")
        return False


def fetch_posts(category: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Fetch posts from DynamoDB"""
    table = dynamodb.Table(DYNAMODB_TABLE)
    
    try:
        response = table.query(
            IndexName='category-published_at-index',
            KeyConditionExpression='category = :cat',
            ExpressionAttributeValues={':cat': category},
            ScanIndexForward=False,
            Limit=limit
        )
        return response.get('Items', [])
    except Exception as e:
        logger.error(f"Error fetching posts: {str(e)}")
        return []


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for HTML generation
    
    Event types:
    - Generate single: {"post_id": "xxx", "category": "sneaker"}
    - Generate all: {"category": "sneaker"} or {"generate_all": true}
    - Generate index: {"generate_index": true, "category": "sneaker"}
    """
    logger.info(f"Event received: {json.dumps(event)}")
    
    results = {
        'generated': [],
        'errors': [],
        'timestamp': datetime.now(timezone.utc).isoformat()
    }
    
    # Handle SNS messages
    if 'Records' in event:
        for record in event['Records']:
            if 'Sns' in record:
                event = json.loads(record['Sns']['Message'])
    
    # Determine what to generate
    categories = list(BLOG_CONFIGS.keys()) if event.get('generate_all') else [event.get('category', 'sneaker')]
    
    for category in categories:
        if category not in BLOG_CONFIGS:
            continue
        
        config = BLOG_CONFIGS[category]
        posts = fetch_posts(category)
        
        # Generate index page
        if event.get('generate_index', True):
            try:
                index_html = generate_index_page(posts, category)
                index_key = f"{config['path']}/index.html"
                if upload_to_s3(index_html, index_key):
                    results['generated'].append({
                        'type': 'index',
                        'category': category,
                        'url': f"{DOMAIN}/{index_key}"
                    })
            except Exception as e:
                logger.error(f"Error generating index for {category}: {str(e)}")
                results['errors'].append({'type': 'index', 'category': category, 'error': str(e)})
        
        # Generate individual posts
        if event.get('post_id'):
            # Generate specific post
            table = dynamodb.Table(DYNAMODB_TABLE)
            try:
                response = table.get_item(Key={'id': event['post_id']})
                posts = [response.get('Item')] if response.get('Item') else []
            except Exception as e:
                logger.error(f"Error fetching post {event['post_id']}: {str(e)}")
                posts = []
        
        for post in posts:
            try:
                post_html = generate_full_html_page(post, category)
                slug = post.get('slug', post.get('id'))
                post_key = f"{config['path']}/{slug}/index.html"
                
                if upload_to_s3(post_html, post_key):
                    results['generated'].append({
                        'type': 'post',
                        'category': category,
                        'slug': slug,
                        'url': f"{DOMAIN}/{config['path']}/{slug}"
                    })
            except Exception as e:
                logger.error(f"Error generating post {post.get('id')}: {str(e)}")
                results['errors'].append({
                    'type': 'post',
                    'post_id': post.get('id'),
                    'error': str(e)
                })
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(results)
    }


if __name__ == '__main__':
    test_post = {
        'id': 'test-123',
        'title': 'Test Blog Post',
        'slug': 'test-blog-post',
        'excerpt': 'This is a test blog post excerpt.',
        'content': '<p>This is the full content of the test blog post.</p>',
        'published_at': datetime.now(timezone.utc).isoformat(),
        'author': {'name': 'Test Author'},
        'tags': ['test', 'sample']
    }
    
    html = generate_full_html_page(test_post, 'sneaker')
    print(html[:1000])
